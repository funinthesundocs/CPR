'use client'

import {
    UserGroupIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'

export default function AdminDefendantsPage() {
    return (
        <div className="space-y-4 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <UserGroupIcon className="h-6 w-6 text-primary" />
                        Defendant Management
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Review defendant profiles, merge duplicates, and manage records
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search defendants by name, alias, or business..."
                    className="w-full pl-10 pr-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    disabled
                />
            </div>

            {/* Table Container */}
            <div className="flex-1 rounded-lg border bg-card overflow-hidden">
                <div className="overflow-auto max-h-[calc(100vh-240px)] pb-2">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 z-40 bg-muted">
                            <tr>
                                <th className="text-left p-3 font-semibold border-b min-w-[180px] bg-muted">Name</th>
                                <th className="text-left p-3 font-semibold border-b min-w-[160px] bg-muted">Aliases</th>
                                <th className="text-left p-3 font-semibold border-b min-w-[160px] bg-muted">Location</th>
                                <th className="text-left p-3 font-semibold border-b min-w-[80px] bg-muted">Cases</th>
                                <th className="text-left p-3 font-semibold border-b min-w-[120px] bg-muted">Status</th>
                                <th className="text-center p-3 font-semibold border-b min-w-[100px] bg-muted">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan={6} className="p-12 text-center text-muted-foreground">
                                    <UserGroupIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
                                    <p className="font-medium">Defendant management coming soon</p>
                                    <p className="text-sm mt-1 text-muted-foreground/60">
                                        Tools for reviewing profiles, merging duplicates, and managing defendant records will appear here.
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
