import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Check if user has vote permission via DB
async function hasVotePermission(supabase: any, userId: string): Promise<boolean> {
    const { data } = await supabase
        .from('user_roles')
        .select('role_id, roles!inner(id)')
        .eq('user_id', userId)

    if (!data || data.length === 0) return false

    const roleIds = data.map((ur: any) => ur.role_id)

    // Check if any assigned role has the 'vote' permission
    const { data: grants } = await supabase
        .from('role_permissions')
        .select('role_id')
        .in('role_id', roleIds)
        .eq('permission_id', 'vote')
        .eq('granted', true)

    return (grants && grants.length > 0) || roleIds.includes('admin') || roleIds.includes('super_admin')
}

const VOTABLE_STATUSES = ['judgment', 'investigation', 'pending_convergence']

// GET /api/votes?case_id=xxx — fetch current user's vote for a case
export async function GET(request: NextRequest) {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const caseId = searchParams.get('case_id')

    if (!caseId) {
        return NextResponse.json({ error: 'case_id is required' }, { status: 400 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: vote, error } = await supabase
        .from('votes')
        .select('*')
        .eq('case_id', caseId)
        .eq('voter_id', user.id)
        .maybeSingle()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ vote })
}

// POST /api/votes — create or update a vote
export async function POST(request: NextRequest) {
    const supabase = await createClient()

    // 1. Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // 2. Permission check
    const hasPermission = await hasVotePermission(supabase, user.id)
    if (!hasPermission) {
        return NextResponse.json({ error: 'You do not have permission to vote' }, { status: 403 })
    }

    // 3. Parse body
    const body = await request.json()
    const { case_id, guilt_score, nominal_approved, punitive_amount, justification } = body

    if (!case_id) {
        return NextResponse.json({ error: 'case_id is required' }, { status: 400 })
    }

    // 4. Validate guilt_score
    if (typeof guilt_score !== 'number' || guilt_score < 0 || guilt_score > 10) {
        return NextResponse.json({ error: 'guilt_score must be between 0 and 10' }, { status: 400 })
    }

    // 5. Verify case exists and is in a votable status
    const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .select('id, status, nominal_damages_claimed')
        .eq('id', case_id)
        .single()

    if (caseError || !caseData) {
        return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    if (!VOTABLE_STATUSES.includes(caseData.status)) {
        return NextResponse.json(
            { error: `Voting is not open for cases in '${caseData.status}' status` },
            { status: 400 }
        )
    }

    // 6. Enforce punitive ≤ 2× nominal
    const maxPunitive = (caseData.nominal_damages_claimed || 0) * 2
    const punitive = punitive_amount ? parseFloat(punitive_amount) : 0
    if (punitive > maxPunitive) {
        return NextResponse.json(
            { error: `Punitive damages cannot exceed $${maxPunitive.toLocaleString()} (2x nominal)` },
            { status: 400 }
        )
    }

    // 7. Build vote data
    const voteData = {
        case_id,
        voter_id: user.id,
        guilt_score,
        nominal_approved: !!nominal_approved,
        punitive_amount: punitive || null,
        justification: justification?.trim() || null,
    }

    // 8. Check for existing vote (upsert)
    const { data: existingVote } = await supabase
        .from('votes')
        .select('id')
        .eq('case_id', case_id)
        .eq('voter_id', user.id)
        .maybeSingle()

    if (existingVote) {
        const { error: updateErr } = await supabase
            .from('votes')
            .update({ ...voteData, updated_at: new Date().toISOString() })
            .eq('id', existingVote.id)

        if (updateErr) {
            return NextResponse.json({ error: updateErr.message }, { status: 500 })
        }

        return NextResponse.json({ message: 'Vote updated', action: 'updated' })
    } else {
        const { error: insertErr } = await supabase
            .from('votes')
            .insert(voteData)

        if (insertErr) {
            return NextResponse.json({ error: insertErr.message }, { status: 500 })
        }

        return NextResponse.json({ message: 'Vote submitted', action: 'created' })
    }
}
