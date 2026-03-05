import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Calculate profile progress via RPC function
    const { data, error } = await supabase
      .rpc('calculate_profile_progress', { user_id: user.id })

    if (error) {
      console.error('[Profile Progress] RPC calculation failed:', {
        userId: user.id,
        error: error.message,
      })
      return NextResponse.json(
        { error: 'Profile progress calculation failed', code: 'CALC_ERROR' },
        { status: 500 }
      )
    }

    if (data === null || data === undefined) {
      console.error('[Profile Progress] RPC returned null for user:', user.id)
      return NextResponse.json(
        { error: 'User profile not found', code: 'PROFILE_NOT_FOUND' },
        { status: 404 }
      )
    }

    // Get breakdown from user_profiles
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select(
        'profile_completion, has_joined_case, last_login_at, last_vote_at, first_vote_correct'
      )
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch profile data' },
        { status: 500 }
      )
    }

    // Build breakdown object
    const breakdown = {
      profile_complete: profile?.profile_completion === 100 ? 50 : 0,
      case_joined: profile?.has_joined_case ? 20 : 0,
      login_weekly:
        profile?.last_login_at &&
        new Date().getTime() - new Date(profile.last_login_at).getTime() <
          7 * 24 * 60 * 60 * 1000
          ? 10
          : 0,
      vote_weekly:
        profile?.last_vote_at &&
        new Date().getTime() - new Date(profile.last_vote_at).getTime() <
          7 * 24 * 60 * 60 * 1000
          ? 10
          : 0,
      vote_correct: profile?.first_vote_correct ? 10 : 0,
    }

    return NextResponse.json({
      profile_progress: data || 0,
      breakdown,
    })
  } catch (error) {
    console.error('Profile progress API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
