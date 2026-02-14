import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const envPath = resolve(process.cwd(), '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const env = {}
envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length) env[key.trim()] = valueParts.join('=').trim()
})

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
})

async function main() {
    // Check all profiles with service role (bypasses RLS)
    console.log('=== All profiles (service role, no RLS) ===')
    const { data: profiles, error: pe } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
    if (pe) console.error('Error:', pe.message)
    else profiles?.forEach(p => console.log(p))

    // Check all user_profiles
    console.log('\n=== All user_profiles (service role) ===')
    const { data: userProfiles, error: upe } = await supabase
        .from('user_profiles')
        .select('id, display_name')
    if (upe) console.error('Error:', upe.message)
    else userProfiles?.forEach(p => console.log(p))

    // Check what the admin page would see when queried as denis
    console.log('\n=== Simulating query as denis (anon key, with denis session) ===')
    const anonClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const { data: session, error: signErr } = await anonClient.auth.signInWithPassword({
        email: 'denis@crodesign.com',
        password: 'Maunakea808!'
    })
    if (signErr) {
        console.error('Sign in failed:', signErr.message)
        return
    }
    console.log('Signed in as denis')

    const { data: visibleProfiles, error: vpErr } = await anonClient
        .from('profiles')
        .select('id, email, full_name, role')
    if (vpErr) console.error('Error:', vpErr.message)
    else {
        console.log(`Denis can see ${visibleProfiles?.length} profiles:`)
        visibleProfiles?.forEach(p => console.log(p))
    }
}

main().catch(console.error)
