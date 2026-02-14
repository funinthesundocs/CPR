import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    UserGroupIcon,
    ShieldCheckIcon,
    FolderOpenIcon,
    ChartBarIcon,
    ExclamationTriangleIcon,
    FlagIcon,
} from '@heroicons/react/24/outline'

export const revalidate = 30

export default async function AdminDashboard() {
    const supabase = await createClient()

    // Fetch platform stats
    const [
        { count: userCount },
        { count: caseCount },
        { count: defendantCount },
        { count: pendingCases },
        { count: flaggedComments },
        { count: voteCount },
    ] = await Promise.all([
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('cases').select('*', { count: 'exact', head: true }),
        supabase.from('defendants').select('*', { count: 'exact', head: true }),
        supabase.from('cases').select('*', { count: 'exact', head: true }).in('status', ['admin_review', 'pending_convergence']),
        supabase.from('comments').select('*', { count: 'exact', head: true }).eq('is_flagged', true),
        supabase.from('votes').select('*', { count: 'exact', head: true }),
    ])

    // Recent cases for review
    const { data: recentCases } = await supabase
        .from('cases')
        .select('id, case_number, status, created_at, defendants(full_name)')
        .in('status', ['admin_review', 'pending_convergence', 'investigation'])
        .order('created_at', { ascending: false })
        .limit(10)

    // Flagged comments
    const { data: flaggedItems } = await supabase
        .from('comments')
        .select('id, body, flag_count, created_at, user_profiles(display_name)')
        .eq('is_flagged', true)
        .eq('is_hidden', false)
        .order('flag_count', { ascending: false })
        .limit(10)

    const stats = [
        { label: 'Users', value: userCount || 0, icon: UserGroupIcon },
        { label: 'Cases', value: caseCount || 0, icon: FolderOpenIcon },
        { label: 'Defendants', value: defendantCount || 0, icon: ShieldCheckIcon },
        { label: 'Votes Cast', value: voteCount || 0, icon: ChartBarIcon },
        { label: 'Pending Review', value: pendingCases || 0, icon: ExclamationTriangleIcon, alert: (pendingCases || 0) > 0 },
        { label: 'Flagged', value: flaggedComments || 0, icon: FlagIcon, alert: (flaggedComments || 0) > 0 },
    ]

    const statusColors: Record<string, string> = {
        pending_convergence: 'bg-yellow-500/10 text-yellow-600',
        admin_review: 'bg-blue-500/10 text-blue-600',
        investigation: 'bg-purple-500/10 text-purple-600',
        judgment: 'bg-orange-500/10 text-orange-600',
    }

    const adminNav = [
        { title: 'User Management', href: '/admin/users', icon: UserGroupIcon, desc: 'Manage users, roles, and permissions' },
        { title: 'Roles & Permissions', href: '/admin/users/roles', icon: ShieldCheckIcon, desc: 'Configure access levels' },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">Platform overview and moderation tools</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {stats.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <Card key={stat.label} className={stat.alert ? 'border-red-500/50' : ''}>
                            <CardContent className="p-4 text-center">
                                <Icon className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                                <p className="text-2xl font-bold">{stat.value}</p>
                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Case Queue */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center justify-between">
                            Case Review Queue
                            {(pendingCases || 0) > 0 && (
                                <Badge className="bg-red-500/10 text-red-600 text-xs">{pendingCases} pending</Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {(!recentCases || recentCases.length === 0) ? (
                            <p className="text-sm text-muted-foreground text-center py-6">No cases pending review</p>
                        ) : (
                            <div className="space-y-2">
                                {recentCases.map((c: any) => (
                                    <Link key={c.id} href={`/cases/${c.case_number}`}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                                        <div>
                                            <span className="font-mono text-sm font-bold">{c.case_number}</span>
                                            <p className="text-xs text-muted-foreground">vs. {c.defendants?.full_name || 'Unknown'}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className={`text-xs capitalize ${statusColors[c.status] || ''}`}>
                                                {c.status.replace(/_/g, ' ')}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(c.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Flagged Content */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center justify-between">
                            Flagged Comments
                            {(flaggedComments || 0) > 0 && (
                                <Badge className="bg-amber-500/10 text-amber-600 text-xs">{flaggedComments} flagged</Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {(!flaggedItems || flaggedItems.length === 0) ? (
                            <p className="text-sm text-muted-foreground text-center py-6">No flagged content</p>
                        ) : (
                            <div className="space-y-2">
                                {flaggedItems.map((item: any) => (
                                    <div key={item.id} className="p-3 rounded-lg border space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">{item.user_profiles?.display_name || 'Anonymous'}</span>
                                            <Badge variant="outline" className="text-xs text-red-500">
                                                🚩 {item.flag_count} flags
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">{item.body}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Nav */}
            <div className="grid sm:grid-cols-2 gap-4">
                {adminNav.map((nav) => {
                    const Icon = nav.icon
                    return (
                        <Link key={nav.href} href={nav.href}
                            className="group relative overflow-hidden rounded-lg border bg-card p-6 hover:bg-accent transition-all">
                            <div className="flex items-start gap-4">
                                <div className="rounded-lg bg-primary/10 p-3">
                                    <Icon className="h-6 w-6" style={{ color: 'hsl(var(--primary))' }} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{nav.title}</h3>
                                    <p className="text-sm text-muted-foreground">{nav.desc}</p>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
