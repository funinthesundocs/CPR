'use client'

import {
    FlagIcon,
} from '@heroicons/react/24/outline'

export default function AdminReportsPage() {
    return (
        <div className="space-y-4 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <FlagIcon className="h-6 w-6 text-primary" />
                        Reports &amp; Flags
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Review user reports, content flags, and community moderation requests
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Open Reports', value: '—', desc: 'Awaiting review' },
                    { label: 'Resolved', value: '—', desc: 'Last 30 days' },
                    { label: 'Avg Response', value: '—', desc: 'Time to resolve' },
                ].map((stat) => (
                    <div key={stat.label} className="rounded-lg border bg-card p-4">
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                        <p className="text-xs text-muted-foreground/60 mt-0.5">{stat.desc}</p>
                    </div>
                ))}
            </div>

            {/* Table Container */}
            <div className="flex-1 rounded-lg border bg-card overflow-hidden">
                <div className="overflow-auto max-h-[calc(100vh-320px)] pb-2">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 z-40 bg-muted">
                            <tr>
                                <th className="text-left p-3 font-semibold border-b min-w-[160px] bg-muted">Reporter</th>
                                <th className="text-left p-3 font-semibold border-b min-w-[120px] bg-muted">Type</th>
                                <th className="text-left p-3 font-semibold border-b min-w-[160px] bg-muted">Target</th>
                                <th className="text-left p-3 font-semibold border-b min-w-[160px] bg-muted">Reason</th>
                                <th className="text-left p-3 font-semibold border-b min-w-[120px] bg-muted">Date</th>
                                <th className="text-center p-3 font-semibold border-b min-w-[100px] bg-muted">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan={6} className="p-12 text-center text-muted-foreground">
                                    <FlagIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
                                    <p className="font-medium">Reports management coming soon</p>
                                    <p className="text-sm mt-1 text-muted-foreground/60">
                                        Tools for reviewing content reports, handling flags, and taking moderation actions will appear here.
                                    </p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
