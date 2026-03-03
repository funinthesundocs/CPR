import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'

const EVIDENCE_BUCKET = 'evidence'
const PHOTOS_BUCKET = 'defendant-photos'
const MAX_SIZE = 50 * 1024 * 1024 // 50 MB

/**
 * POST /api/cases/upload-evidence
 * Uploads a file to the `evidence` storage bucket, inserts a row into
 * the `evidence` table (with SHA-256 hash), and returns metadata.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const caseId = formData.get('case_id') as string
    const title = (formData.get('title') as string) || file?.name || 'Untitled'
    const isPhoto = title.toLowerCase().includes('photo') || file.type.startsWith('image/')

    if (!file || !caseId) {
      return NextResponse.json({ error: 'Missing file or case_id' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large (max 50 MB)' }, { status: 400 })
    }

    const admin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const buffer = Buffer.from(await file.arrayBuffer())

    // SHA-256 for tamper-proof integrity (required NOT NULL column)
    const fileHash = createHash('sha256').update(buffer).digest('hex')

    // Determine bucket and create if needed
    const bucketName = isPhoto ? PHOTOS_BUCKET : EVIDENCE_BUCKET
    const isPublicBucket = isPhoto
    const { data: bucketList } = await admin.storage.listBuckets()
    if (!bucketList?.some(b => b.name === bucketName)) {
      const { error: bErr } = await admin.storage.createBucket(bucketName, { public: isPublicBucket })
      if (bErr && !bErr.message.includes('already exists')) {
        return NextResponse.json({ error: `Storage setup failed: ${bErr.message}` }, { status: 500 })
      }
    }

    // Upload: {caseId}/{timestamp}-{filename}
    const sanitizedCaseId = caseId.toLowerCase().replace(/[^a-z0-9-]/g, '')
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 200)
    const filePath = `${sanitizedCaseId}/${Date.now()}-${sanitizedFileName}`

    const { data: uploadData, error: uploadError } = await admin.storage
      .from(bucketName)
      .upload(filePath, buffer, { contentType: file.type, upsert: false })

    if (uploadError) {
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 })
    }

    // Build public URL for photos, path for evidence
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const publicUrl = isPhoto
      ? `${supabaseUrl}/storage/v1/object/public/${bucketName}/${uploadData.path}`
      : uploadData.path

    // Insert into evidence table (skip for temp drafts)
    let evidenceId: string | null = null
    const isRealCase = !caseId.startsWith('temp-')
    if (isRealCase && !isPhoto) {
      const { data: row, error: insertError } = await admin
        .from('evidence')
        .insert({
          case_id: caseId,
          submitted_by: user.id,
          title,
          file_url: uploadData.path,
          file_type: file.type,
          file_hash: fileHash,
          category: guessCategoryFromMime(file.type),
        })
        .select('id')
        .single()

      if (insertError) {
        console.error('[upload-evidence] DB insert failed:', insertError.message)
      } else {
        evidenceId = row.id
      }
    }

    return NextResponse.json({
      success: true,
      evidence_id: evidenceId,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      file_path: publicUrl,
      file_hash: fileHash,
      bucket: bucketName,
      uploaded_at: new Date().toISOString(),
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[upload-evidence] Error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

function guessCategoryFromMime(mime: string): string {
  if (mime.startsWith('image/')) return 'photo'
  if (mime.startsWith('video/')) return 'video'
  if (mime.startsWith('audio/')) return 'audio'
  if (mime === 'application/pdf') return 'document'
  if (mime.includes('spreadsheet') || mime.includes('csv')) return 'financial'
  return 'document'
}
