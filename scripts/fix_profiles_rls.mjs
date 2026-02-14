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
    // Add RLS policy: admins can read all profiles
    console.log('Adding RLS policy for admin read-all on profiles...')

    const { error: dropErr } = await supabase.rpc('pgexec', {
        query: `DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles`
    })

    // If pgexec doesn't exist, we'll use the REST API approach - use SQL directly
    if (dropErr) {
        console.log('rpc pgexec not available, trying raw SQL via REST...')

        // Use the Supabase Management API or direct SQL
        const url = env.NEXT_PUBLIC_SUPABASE_URL
        const key = env.SUPABASE_SERVICE_ROLE_KEY

        // Execute SQL via the REST SQL endpoint
        const sqlStatements = [
            // Drop existing restrictive policy if any, and add permissive one for admins
            `DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles`,
            `CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM profiles p 
                    WHERE p.id = auth.uid() 
                    AND p.role = 'admin'
                )
            )`,
        ]

        for (const sql of sqlStatements) {
            const res = await fetch(`${url}/rest/v1/rpc/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': key,
                    'Authorization': `Bearer ${key}`
                },
                body: JSON.stringify({ query: sql })
            })
            console.log(`SQL: ${sql.substring(0, 60)}... Status: ${res.status}`)
        }
    }

    console.log('\nDone. Please run the following SQL in your Supabase SQL Editor:')
    console.log('---')
    console.log(`
-- Allow admins to view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Admins can view all profiles" ON profiles
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.id = auth.uid() 
        AND p.role = 'admin'
    )
);
    `)
    console.log('---')
}

main().catch(console.error)
