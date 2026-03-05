import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Sync email verification status from auth.users to user_profiles
 * Called after user verifies their email
 * Sets is_verified = true if email_confirmed_at is not null
 */
export async function POST() {
  try {
    const supabase = await createClient()

    // Get current authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if email is verified in auth.users
    const isEmailVerified = !!user.email_confirmed_at

    // Update is_verified in user_profiles based on email verification
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ is_verified: isEmailVerified })
      .eq('id', user.id)

    if (updateError) {
      console.error('[Sync Verification] Update failed:', {
        userId: user.id,
        error: updateError.message,
      })
      return NextResponse.json(
        { error: 'Failed to sync verification status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      is_verified: isEmailVerified,
      message: isEmailVerified
        ? 'Email verified successfully. You are now a full member.'
        : 'Email not yet verified',
    })
  } catch (error) {
    console.error('[Sync Verification] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
