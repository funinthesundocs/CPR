import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refresh session - important for Server Components
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Protect admin routes — UI (/admin/*) and API (/api/admin/*)
    const { pathname } = request.nextUrl
    const isAdminUiPath = pathname.startsWith('/admin')
    const isAdminApiPath = pathname.startsWith('/api/admin')

    if (isAdminUiPath || isAdminApiPath) {
        // Authentication check
        if (!user) {
            if (isAdminApiPath) {
                return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
            }
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }

        // Authorization check — DB role check, do not trust JWT claims
        const { data: userRoles } = await supabase
            .from('user_roles')
            .select('role_id')
            .eq('user_id', user.id)
            .in('role_id', ['admin', 'super_admin'])

        const hasAdminRole = (userRoles || []).length > 0

        if (!hasAdminRole) {
            if (isAdminApiPath) {
                return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
            }
            const url = request.nextUrl.clone()
            url.pathname = '/'
            url.searchParams.set('error', 'unauthorized')
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}
