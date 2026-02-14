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

const USER_ID = '83cbd72c-dd5d-405d-8ba5-5be60347e6a7'
const EMAIL = 'funinthesundocs@gmail.com'
const DISPLAY_NAME = 'Matt Campbell'

async function main() {
    // 1. Check existing profile
    console.log('=== Checking user_profiles ===')
    const { data: profile, error: profileErr } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', USER_ID)
        .single()

    if (profileErr && profileErr.code !== 'PGRST116') {
        console.error('Error checking profile:', profileErr.message)
    }

    if (profile) {
        console.log('Existing profile found:', JSON.stringify(profile, null, 2))
        // Update display_name
        const { error: updateErr } = await supabase
            .from('user_profiles')
            .update({ display_name: DISPLAY_NAME })
            .eq('id', USER_ID)
        if (updateErr) console.error('Error updating profile:', updateErr.message)
        else console.log('✅ Updated display_name to:', DISPLAY_NAME)
    } else {
        console.log('No profile found, creating one...')
        const { error: insertErr } = await supabase
            .from('user_profiles')
            .insert({ id: USER_ID, display_name: DISPLAY_NAME })
        if (insertErr) console.error('Error creating profile:', insertErr.message)
        else console.log('✅ Created profile with display_name:', DISPLAY_NAME)
    }

    // 2. Check what roles exist
    console.log('\n=== Checking roles table ===')
    const { data: roles, error: rolesErr } = await supabase
        .from('roles')
        .select('*')

    if (rolesErr) {
        console.error('Error fetching roles:', rolesErr.message)
    } else {
        console.log('Available roles:', JSON.stringify(roles, null, 2))
    }

    // 3. Check existing user_roles
    console.log('\n=== Checking user_roles for this user ===')
    const { data: userRoles, error: urErr } = await supabase
        .from('user_roles')
        .select('*, roles(*)')
        .eq('user_id', USER_ID)

    if (urErr) {
        console.error('Error fetching user_roles:', urErr.message)
    } else {
        console.log('Current roles:', JSON.stringify(userRoles, null, 2))
    }

    // 4. Check profiles table too (used by admin API)
    console.log('\n=== Checking profiles table ===')
    const { data: adminProfile, error: apErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', USER_ID)
        .single()

    if (apErr && apErr.code !== 'PGRST116') {
        console.error('Error checking profiles:', apErr.message)
    } else if (adminProfile) {
        console.log('Admin profile:', JSON.stringify(adminProfile, null, 2))
    } else {
        console.log('No admin profile found')
    }

    // 5. Also update the auth user metadata to set role as superadmin
    console.log('\n=== Setting auth user metadata ===')
    const { data: updatedUser, error: authErr } = await supabase.auth.admin.updateUserById(USER_ID, {
        user_metadata: { display_name: DISPLAY_NAME, role: 'superadmin' }
    })
    if (authErr) console.error('Error updating auth metadata:', authErr.message)
    else console.log('✅ Updated auth user_metadata with role superadmin')
}

main().catch(console.error)
