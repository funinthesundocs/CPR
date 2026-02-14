import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Read .env.local
const envPath = resolve(process.cwd(), '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const env = {}
envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length) env[key.trim()] = valueParts.join('=').trim()
})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
})

async function main() {
    console.log('=== Supabase Auth Users ===\n')

    const { data: { users }, error } = await supabase.auth.admin.listUsers()

    if (error) {
        console.error('Error listing users:', error.message)
        process.exit(1)
    }

    if (!users || users.length === 0) {
        console.log('No users found in auth.users')
        return
    }

    console.log(`Found ${users.length} user(s):\n`)

    users.forEach((user, i) => {
        console.log(`--- User ${i + 1} ---`)
        console.log(`  ID:               ${user.id}`)
        console.log(`  Email:            ${user.email}`)
        console.log(`  Email Confirmed:  ${user.email_confirmed_at ? '✅ YES (' + user.email_confirmed_at + ')' : '❌ NO'}`)
        console.log(`  Created:          ${user.created_at}`)
        console.log(`  Last Sign In:     ${user.last_sign_in_at || 'never'}`)
        console.log(`  Role:             ${user.role}`)
        console.log(`  Providers:        ${user.app_metadata?.providers?.join(', ') || 'none'}`)
        console.log('')
    })
}

main().catch(console.error)
