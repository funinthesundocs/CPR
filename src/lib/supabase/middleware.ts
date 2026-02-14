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
                    cookiesToSet.forEach(({ name, value, options }) =>
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

    // Protect admin routes — check authentication
    if (request.nextUrl.pathname.startsWith('/admin') && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Protect admin routes — check authorization (DB role check)
    if (request.nextUrl.pathname.startsWith('/admin') && user) {
        const { data: userRoles } = await supabase
            .from('user_roles')
            .select('role_id')
            .eq('user_id', user.id)
            .in('role_id', ['admin', 'super_admin'])

        const hasAdminRole = (userRoles || []).length > 0

        if (!hasAdminRole) {
            const url = request.nextUrl.clone()
            url.pathname = '/'
            url.searchParams.set('error', 'unauthorized')
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}
