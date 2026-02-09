import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()

    try {
        // Fetch all roles
        const { data: roles, error: rolesError } = await supabase
            .from('roles')
            .select('*')
            .order('id')

        if (rolesError) throw rolesError

        // Fetch all permissions
        const { data: permissions, error: permissionsError } = await supabase
            .from('permissions')
            .select('*')
            .order('category, id')

        if (permissionsError) throw permissionsError

        // Fetch all role-permission mappings
        const { data: rolePermissions, error: rolePermissionsError } = await supabase
            .from('role_permissions')
            .select('role_id, permission_id, granted')

        if (rolePermissionsError) throw rolePermissionsError

        // Build a map of role -> permission -> granted
        const grants: Record<string, Record<string, boolean>> = {}
        roles?.forEach((role) => {
            grants[role.id] = {}
        })

        rolePermissions?.forEach((rp) => {
            if (!grants[rp.role_id]) {
                grants[rp.role_id] = {}
            }
            grants[rp.role_id][rp.permission_id] = rp.granted
        })

        return NextResponse.json({
            roles,
            permissions,
            grants
        })
    } catch (error) {
        console.error('Error fetching permissions data:', error)
        return NextResponse.json(
            { error: 'Failed to fetch permissions data' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    const supabase = await createClient()

    try {
        const { grants } = await request.json()

        // Delete all existing role_permissions
        const { error: deleteError } = await supabase
            .from('role_permissions')
            .delete()
            .neq('role_id', '') // Delete all rows

        if (deleteError) throw deleteError

        // Insert new grants
        const insertData = []
        for (const [roleId, permissions] of Object.entries(grants)) {
            for (const [permissionId, granted] of Object.entries(permissions as Record<string, boolean>)) {
                insertData.push({
                    role_id: roleId,
                    permission_id: permissionId,
                    granted
                })
            }
        }

        if (insertData.length > 0) {
            const { error: insertError } = await supabase
                .from('role_permissions')
                .insert(insertData)

            if (insertError) throw insertError
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error saving permissions:', error)
        return NextResponse.json(
            { error: 'Failed to save permissions' },
            { status: 500 }
        )
    }
}
