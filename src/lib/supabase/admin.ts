import { createClient } from '@supabase/supabase-js'

/**
 * Admin client — uses service role key, bypasses RLS.
 * Server-side only. Never import in Client Components.
 */
export function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )
}
