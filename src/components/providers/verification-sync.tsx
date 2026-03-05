'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * Syncs email verification status from auth.users to user_profiles
 * Runs once on app load for authenticated users
 */
export function VerificationSync() {
  useEffect(() => {
    const syncVerification = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        // Only sync if user is authenticated
        if (user) {
          await fetch('/api/profile/sync-verification', { method: 'POST' })
        }
      } catch (error) {
        // Silent fail - not critical
        console.error('Verification sync failed:', error)
      }
    }

    syncVerification()
  }, [])

  return null
}
