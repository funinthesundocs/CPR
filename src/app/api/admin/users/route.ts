import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()

    try {
        // Fetch all users from profiles
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })

        if (profilesError) throw profilesError

        // Fetch user roles for all users
        const { data: userRoles, error: userRolesError } = await supabase
            .from('user_roles')
            .select('user_id, role_id, roles(id, name, icon)')

        if (userRolesError) throw userRolesError

        // Build a map of user_id -> roles[]
        const rolesMap: Record<string, any[]> = {}
        userRoles?.forEach((ur) => {
            if (!rolesMap[ur.user_id]) {
                rolesMap[ur.user_id] = []
            }
            if (ur.roles) {
                rolesMap[ur.user_id].push(ur.roles)
            }
        })

        // Combine profiles with their roles
        const usersWithRoles = profiles?.map((profile) => ({
            ...profile,
            roles: rolesMap[profile.id] || []
        }))

        return NextResponse.json({ users: usersWithRoles })
    } catch (error) {
        console.error('Error fetching users:', error)
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        )
    }
}
