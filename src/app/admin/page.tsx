'use client'

import Link from 'next/link'
import {
    UserGroupIcon,
    ShieldCheckIcon,
    BuildingOfficeIcon,
    ChartBarIcon,
} from '@heroicons/react/24/outline'

const adminCards = [
    {
        title: 'User Management',
        description: 'Manage users, roles, and permissions',
        href: '/admin/users',
        icon: UserGroupIcon,
    },
    {
        title: 'Roles & Permissions',
        description: 'Configure access levels for each role',
        href: '/admin/users/roles',
        icon: ShieldCheckIcon,
    },
    {
        title: 'Organization Profile',
        description: 'Update organization information',
        href: '/admin/organization',
        icon: BuildingOfficeIcon,
    },
    {
        title: 'Activity Log',
        description: 'View system activity and audit logs',
        href: '/admin/activity',
        icon: ChartBarIcon,
    },
]

export default function AdminPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your organization and platform settings
                </p>
            </div>

            {/* Quick Access Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                {adminCards.map((card) => {
                    const Icon = card.icon
                    return (
                        <Link
                            key={card.href}
                            href={card.href}
                            className="group relative overflow-hidden rounded-lg border bg-card p-6 hover:bg-accent transition-all"
                        >
                            <div className="flex items-start gap-4">
                                <div className="rounded-lg bg-primary/10 p-3">
                                    <Icon
                                        className="h-6 w-6"
                                        style={{ color: 'hsl(var(--primary))' }}
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                                        {card.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {card.description}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>

            {/* Placeholder for future widgets */}
            <div className="rounded-lg border bg-card p-8">
                <div className="text-center text-muted-foreground">
                    <ChartBarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Additional dashboard widgets coming soon...</p>
                </div>
            </div>
        </div>
    )
}
