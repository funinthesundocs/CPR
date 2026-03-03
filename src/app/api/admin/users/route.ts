import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    const { data: adminRoles } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', user.id)
        .in('role_id', ['admin', 'super_admin'])
    if (!adminRoles || adminRoles.length === 0) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)

    // Query params
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortDir = (searchParams.get('sortDir') || 'desc') as 'asc' | 'desc'
    const roleFilter = searchParams.get('role') || ''

    try {
        // Use service role client to bypass RLS for all admin queries
        const { createClient: createAdminClient } = await import('@supabase/supabase-js')
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (!serviceRoleKey) {
            return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
        }
        const adminClient = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceRoleKey,
            { auth: { autoRefreshToken: false, persistSession: false } }
        )

        // Build profiles query with search and sort (service role bypasses RLS)
        let query = adminClient
            .from('profiles')
            .select('*')

        // Apply search filter (email or full_name)
        if (search) {
            query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
        }

        // Apply sort (only for columns that exist in profiles)
        if (sortBy === 'email' || sortBy === 'full_name' || sortBy === 'created_at') {
            query = query.order(sortBy, { ascending: sortDir === 'asc' })
        } else {
            query = query.order('created_at', { ascending: sortDir === 'asc' })
        }

        const { data: profiles, error: profilesError } = await query

        if (profilesError) throw profilesError

        // Fetch user_profiles for display_name and avatar_url fallback (service role bypasses RLS)
        const { data: userProfiles, error: userProfilesError } = await adminClient
            .from('user_profiles')
            .select('id, display_name, avatar_url')

        const displayNameMap: Record<string, string> = {}
        const upAvatarMap: Record<string, string> = {}
        if (!userProfilesError && userProfiles) {
            userProfiles.forEach((up) => {
                if (up.display_name) displayNameMap[up.id] = up.display_name
                if (up.avatar_url) upAvatarMap[up.id] = up.avatar_url
            })
        }

        // Fetch auth users for last_sign_in_at
        const authSignInMap: Record<string, string | null> = {}
        const { data: authData } = await adminClient.auth.admin.listUsers()
        authData?.users?.forEach((u) => {
            authSignInMap[u.id] = u.last_sign_in_at ?? null
        })

        // Fetch user roles for all users (service role bypasses RLS)
        const { data: userRoles, error: userRolesError } = await adminClient
            .from('user_roles')
            .select('user_id, role_id, roles(id, name, icon)')

        if (userRolesError) throw userRolesError

        const rolesMap: Record<string, any[]> = {}
        userRoles?.forEach((ur) => {
            if (!rolesMap[ur.user_id]) {
                rolesMap[ur.user_id] = []
            }
            if (ur.roles) {
                rolesMap[ur.user_id].push(ur.roles)
            }
        })

        // Combine all data — prefer profiles values, fall back to user_profiles
        let usersWithRoles = profiles?.map((profile) => ({
            ...profile,
            full_name: profile.full_name || displayNameMap[profile.id] || null,
            avatar_url: profile.avatar_url || upAvatarMap[profile.id] || null,
            last_sign_in_at: authSignInMap[profile.id] || null,
            roles: rolesMap[profile.id] || []
        })) || []

        // Filter by role (after merge since roles come from user_roles table)
        if (roleFilter) {
            usersWithRoles = usersWithRoles.filter(u =>
                u.roles.some((r: any) => r.id === roleFilter) ||
                (roleFilter === 'no_roles' && u.roles.length === 0)
            )
        }

        // Apply search to display_name too (since it's merged after DB query)
        if (search) {
            const lowerSearch = search.toLowerCase()
            usersWithRoles = usersWithRoles.filter(u =>
                u.email?.toLowerCase().includes(lowerSearch) ||
                u.full_name?.toLowerCase().includes(lowerSearch)
            )
        }

        // Sort by last_sign_in_at if requested (done here since it's from auth, not DB)
        if (sortBy === 'last_sign_in_at') {
            usersWithRoles.sort((a, b) => {
                const aTime = a.last_sign_in_at ? new Date(a.last_sign_in_at).getTime() : 0
                const bTime = b.last_sign_in_at ? new Date(b.last_sign_in_at).getTime() : 0
                return sortDir === 'asc' ? aTime - bTime : bTime - aTime
            })
        }

        // Sort by full_name if requested (re-sort since merged display_name may differ)
        if (sortBy === 'full_name') {
            usersWithRoles.sort((a, b) => {
                const aName = (a.full_name || '').toLowerCase()
                const bName = (b.full_name || '').toLowerCase()
                return sortDir === 'asc' ? aName.localeCompare(bName) : bName.localeCompare(aName)
            })
        }

        return NextResponse.json({ users: usersWithRoles })
    } catch (error) {
        console.error('Error fetching users:', error)
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        )
    }
}

export async function PATCH(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: adminRoles } = await supabase
        .from('user_roles').select('role_id').eq('user_id', user.id).in('role_id', ['admin', 'super_admin'])
    if (!adminRoles || adminRoles.length === 0) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    try {
        const { userId, fullName, roles } = await request.json()
        if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

        const { createClient: createAdminClient } = await import('@supabase/supabase-js')
        const admin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { autoRefreshToken: false, persistSession: false } }
        )

        // Update full_name in both tables
        if (fullName !== undefined) {
            await Promise.all([
                admin.from('profiles').update({ full_name: fullName || null }).eq('id', userId),
                admin.from('user_profiles').update({ display_name: fullName || null }).eq('id', userId),
            ])
        }

        // Sync roles: delete all existing, insert new set
        if (Array.isArray(roles)) {
            await admin.from('user_roles').delete().eq('user_id', userId)
            if (roles.length > 0) {
                await admin.from('user_roles').insert(
                    roles.map((role_id: string) => ({ user_id: userId, role_id, assigned_by: user.id }))
                )
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error updating user:', error)
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }
}
