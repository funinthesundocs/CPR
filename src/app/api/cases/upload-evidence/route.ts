import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/cases/upload-evidence
 * Handles file uploads for case evidence.
 * Stores files in Supabase Storage bucket organized by case ID.
 *
 * Expected: multipart/form-data with:
 * - file: File object
 * - case_id: UUID of the case
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const caseId = formData.get('case_id') as string

    if (!file || !caseId) {
      return NextResponse.json(
        { error: 'Missing file or case_id' },
        { status: 400 }
      )
    }

    // Validate file size (max 100MB)
    const MAX_SIZE = 100 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large (max 100MB)' },
        { status: 400 }
      )
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Create bucket name from case ID (lowercase, replace hyphens)
    const bucketName = `case-evidence-${caseId.replace(/-/g, '')}`

    // Ensure bucket exists (create if not)
    const { data: bucketList } = await supabase.storage.listBuckets()
    const bucketExists = bucketList?.some(b => b.name === bucketName)

    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: MAX_SIZE,
      })
    }

    // Upload file with timestamp to avoid collisions
    const timestamp = Date.now()
    const sanitizedFileName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .substring(0, 200)
    const filePath = `${timestamp}-${sanitizedFileName}`

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      return NextResponse.json(
        { error: `Upload failed: ${error.message}` },
        { status: 500 }
      )
    }

    // Return file metadata
    return NextResponse.json({
      success: true,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      file_path: data.path,
      bucket: bucketName,
      uploaded_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Evidence upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
