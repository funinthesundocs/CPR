import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Helper: check if user is admin
async function isAdmin(supabase: any, userId: string): Promise<boolean> {
    const { data } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', userId)

    if (!data || data.length === 0) return false

    const roleIds = data.map((ur: any) => ur.role_id)
    return roleIds.includes('admin') || roleIds.includes('super_admin')
}

// POST /api/admin/cases/seal-verdict
export async function POST(request: NextRequest) {
    const supabase = await createClient()

    // 1. Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // 2. Admin role check
    const admin = await isAdmin(supabase, user.id)
    if (!admin) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // 3. Parse request
    const { case_id } = await request.json()
    if (!case_id) {
        return NextResponse.json({ error: 'case_id is required' }, { status: 400 })
    }

    // 4. Call compute_verdict function
    const { data: verdictResult, error: computeError } = await supabase.rpc('compute_verdict', { p_case_id: case_id })

    if (computeError || !verdictResult) {
        return NextResponse.json(
            { error: verdictResult?.error || computeError?.message || 'Failed to compute verdict' },
            { status: 500 }
        )
    }

    // 5. Map verdict to status
    const newStatus = verdictResult.verdict === 'guilty' ? 'verdict_guilty' : 'verdict_innocent'

    // 6. Update case status
    const { error: updateError } = await supabase
        .from('cases')
        .update({ status: newStatus })
        .eq('id', case_id)

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // 7. Return result
    return NextResponse.json({
        success: true,
        verdict: verdictResult.verdict,
        average_guilt_score: verdictResult.average_guilt_score,
        total_votes: verdictResult.total_votes,
        total_restitution_awarded: verdictResult.total_restitution_awarded,
        case_status_updated_to: newStatus,
    })
}
