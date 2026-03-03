import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const VALID_STATUSES = ['draft', 'pending', 'admin_review', 'investigation', 'judgment', 'verdict', 'restitution', 'rejected']

function getAdminClient() {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!key) throw new Error('Missing service role key')
    return createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
        auth: { autoRefreshToken: false, persistSession: false }
    })
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
    if (!roles || roles.length === 0) return null
    return user
}

export async function GET(request: NextRequest) {
    const user = await requireAdmin()
    if (!user) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const statusFilter = searchParams.get('status') || ''

    try {
        const admin = getAdminClient()

        // Fetch cases with defendant join
        const { data: cases, error: casesError } = await admin
            .from('cases')
            .select('id, case_number, status, plaintiff_id, created_at, story_narrative, relationship_narrative, promise_narrative, betrayal_narrative, personal_impact, case_types, nominal_damages_claimed, defendants(id, full_name, slug, photo_url, location)')
            .order('created_at', { ascending: false })

        if (casesError) throw casesError

        // Collect unique plaintiff IDs and fetch their profiles
        const plaintiffIds = [...new Set((cases || []).map(c => c.plaintiff_id).filter(Boolean))]
        const { data: plaintiffProfiles } = await admin
            .from('profiles')
            .select('id, email, full_name')
            .in('id', plaintiffIds)

        const profileMap: Record<string, { email: string; full_name: string | null }> = {}
        plaintiffProfiles?.forEach(p => { profileMap[p.id] = p })

        // Merge plaintiff data
        let result = (cases || []).map(c => ({
            ...c,
            plaintiff: profileMap[c.plaintiff_id] || null
        }))

        // Filter by status
        if (statusFilter) {
            result = result.filter(c => c.status === statusFilter)
        }

        // Search by case number, defendant name, plaintiff name/email
        if (search) {
            const q = search.toLowerCase()
            result = result.filter(c =>
                c.case_number?.toLowerCase().includes(q) ||
                (c.defendants as any)?.full_name?.toLowerCase().includes(q) ||
                (c.plaintiff as any)?.full_name?.toLowerCase().includes(q) ||
                (c.plaintiff as any)?.email?.toLowerCase().includes(q)
            )
        }

        return NextResponse.json({ cases: result })
    } catch (error) {
        console.error('Error fetching cases:', error)
        return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    const user = await requireAdmin()
    if (!user) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    try {
        const body = await request.json()
        const { caseId, status } = body

        if (!caseId || !status) {
            return NextResponse.json({ error: 'caseId and status are required' }, { status: 400 })
        }
        if (!VALID_STATUSES.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
        }

        const admin = getAdminClient()
        const { data, error } = await admin
            .from('cases')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', caseId)
            .select('id, case_number, status')
            .single()

        if (error) throw error
        return NextResponse.json({ case: data })
    } catch (error) {
        console.error('Error updating case:', error)
        return NextResponse.json({ error: 'Failed to update case' }, { status: 500 })
    }
}
