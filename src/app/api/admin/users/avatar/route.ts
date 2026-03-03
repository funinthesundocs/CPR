import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const BUCKET = 'avatars'
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

function getAdminClient() {
    return createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )
}

async function requireAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data: roles } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', user.id)
        .in('role_id', ['admin', 'super_admin'])
    return roles && roles.length > 0 ? user : null
}

export async function POST(request: NextRequest) {
    const admin_user = await requireAdmin()
    if (!admin_user) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const userId = formData.get('userId') as string

        if (!file || !userId) {
            return NextResponse.json({ error: 'Missing file or userId' }, { status: 400 })
        }
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: 'File too large (max 5 MB)' }, { status: 400 })
        }
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Only image files allowed' }, { status: 400 })
        }

        const admin = getAdminClient()
        const buffer = Buffer.from(await file.arrayBuffer())
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const path = `${userId}/avatar.${ext}`

        const { error: uploadError } = await admin.storage
            .from(BUCKET)
            .upload(path, buffer, { contentType: file.type, upsert: true })

        if (uploadError) {
            return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 })
        }

        // Cache-bust with timestamp so the browser always loads the new image
        const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}?t=${Date.now()}`

        // Update both tables
        await Promise.all([
            admin.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId),
            admin.from('user_profiles').update({ avatar_url: publicUrl }).eq('id', userId),
        ])

        return NextResponse.json({ success: true, avatar_url: publicUrl })
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error)
        console.error('[admin/users/avatar] Error:', msg)
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
