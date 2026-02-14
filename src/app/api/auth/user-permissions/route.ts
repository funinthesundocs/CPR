import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()

    try {
        // 1. Get current authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { roles: [], permissions: [], isAdmin: false },
                { status: 200 }
            )
        }

        // 2. Fetch user's assigned roles from DB
        const { data: userRoles, error: rolesError } = await supabase
            .from('user_roles')
            .select('role_id')
            .eq('user_id', user.id)

        if (rolesError) throw rolesError

        const roleIds = (userRoles || []).map(ur => ur.role_id)

        if (roleIds.length === 0) {
            return NextResponse.json({
                roles: [],
                permissions: [],
                isAdmin: false
            })
        }

        // 3. Fetch permissions granted to those roles from DB
        const { data: rolePermissions, error: permError } = await supabase
            .from('role_permissions')
            .select('permission_id')
            .in('role_id', roleIds)
            .eq('granted', true)

        if (permError) throw permError

        // 4. Deduplicate permission IDs
        const permissionIds = [...new Set(
            (rolePermissions || []).map(rp => rp.permission_id)
        )]

        // 5. Determine admin status from roles
        const isAdmin = roleIds.includes('admin') || roleIds.includes('super_admin')

        return NextResponse.json({
            roles: roleIds,
            permissions: permissionIds,
            isAdmin
        }, {
            // No caching — always fresh from DB
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Pragma': 'no-cache'
            }
        })
    } catch (error) {
        console.error('Error fetching user permissions:', error)
        return NextResponse.json(
            { error: 'Failed to fetch permissions' },
            { status: 500 }
        )
    }
}
