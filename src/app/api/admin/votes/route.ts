import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/admin/votes — list all votes with user/case info
export async function GET(request: NextRequest) {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Admin check
    const { data: roles } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', user.id)
        .in('role_id', ['admin', 'super_admin'])

    if (!roles || roles.length === 0) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const search = searchParams.get('search') || ''
    const caseFilter = searchParams.get('case_id') || ''
    const flaggedOnly = searchParams.get('flagged') === 'true'

    try {
        // Fetch votes with case info
        let query = supabase
            .from('votes')
            .select('*, cases(case_number, defendants(full_name))')
            .order('created_at', { ascending: false })
            .limit(100)

        if (caseFilter) {
            query = query.eq('case_id', caseFilter)
        }
        if (flaggedOnly) {
            query = query.eq('flagged', true)
        }

        const { data: votes, error: votesError } = await query
        if (votesError) throw votesError

        // Fetch voter profiles
        const voterIds = [...new Set(votes?.map(v => v.voter_id) || [])]
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, email, full_name')
            .in('id', voterIds.length > 0 ? voterIds : ['none'])

        // Fetch display names from user_profiles
        const { data: userProfiles } = await supabase
            .from('user_profiles')
            .select('id, display_name')
            .in('id', voterIds.length > 0 ? voterIds : ['none'])

        const profileMap: Record<string, any> = {}
        profiles?.forEach(p => { profileMap[p.id] = p })
        const displayNameMap: Record<string, string> = {}
        userProfiles?.forEach(up => {
            if (up.display_name) displayNameMap[up.id] = up.display_name
        })

        // Merge voter info into votes
        let enrichedVotes = votes?.map(vote => ({
            ...vote,
            voter_email: profileMap[vote.voter_id]?.email || 'Unknown',
            voter_name: profileMap[vote.voter_id]?.full_name || displayNameMap[vote.voter_id] || null,
        })) || []

        // Apply text search
        if (search) {
            const lower = search.toLowerCase()
            enrichedVotes = enrichedVotes.filter(v =>
                v.voter_email?.toLowerCase().includes(lower) ||
                v.voter_name?.toLowerCase().includes(lower) ||
                (v.cases as any)?.case_number?.toLowerCase().includes(lower)
            )
        }

        // Calculate stats
        const totalVotes = enrichedVotes.length
        const flaggedVotes = enrichedVotes.filter(v => v.flagged).length
        const uniqueVoters = new Set(enrichedVotes.map(v => v.voter_id)).size
        const avgGuilt = totalVotes > 0
            ? enrichedVotes.reduce((sum, v) => sum + (v.guilt_score || 0), 0) / totalVotes
            : 0

        return NextResponse.json({
            votes: enrichedVotes,
            stats: {
                totalVotes,
                flaggedVotes,
                uniqueVoters,
                avgGuilt: Math.round(avgGuilt * 10) / 10,
            }
        })
    } catch (error) {
        console.error('Error fetching votes:', error)
        return NextResponse.json({ error: 'Failed to fetch votes' }, { status: 500 })
    }
}

// DELETE /api/admin/votes — remove a vote
export async function DELETE(request: NextRequest) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Check moderate_content permission
    const { data: roles } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', user.id)
        .in('role_id', ['admin', 'super_admin'])

    if (!roles || roles.length === 0) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { vote_id } = await request.json()
    if (!vote_id) {
        return NextResponse.json({ error: 'vote_id is required' }, { status: 400 })
    }

    const { error } = await supabase
        .from('votes')
        .delete()
        .eq('id', vote_id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Vote deleted' })
}

// PATCH /api/admin/votes — flag/unflag a vote
export async function PATCH(request: NextRequest) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: roles } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', user.id)
        .in('role_id', ['admin', 'super_admin'])

    if (!roles || roles.length === 0) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { vote_id, flagged } = await request.json()
    if (!vote_id || typeof flagged !== 'boolean') {
        return NextResponse.json({ error: 'vote_id and flagged are required' }, { status: 400 })
    }

    const { error } = await supabase
        .from('votes')
        .update({ flagged })
        .eq('id', vote_id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: `Vote ${flagged ? 'flagged' : 'unflagged'}` })
}
