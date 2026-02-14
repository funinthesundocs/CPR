import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Check admin role using user_roles table
    const { data: roles } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', user.id)
        .in('role_id', ['admin', 'super_admin'])

    if (!roles || roles.length === 0) {
        redirect('/')
    }

    return <>{children}</>
}
