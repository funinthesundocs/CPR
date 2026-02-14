'use client'

import { useState } from 'react'
import {
    FolderOpenIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
} from '@heroicons/react/24/outline'

const statuses = ['all', 'pending_convergence', 'admin_review', 'investigation', 'judgment', 'verdict_guilty', 'verdict_innocent', 'resolved']

export default function AdminCasesPage() {
    const [filter, setFilter] = useState('all')

    return (
        <div className="space-y-4 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <FolderOpenIcon className="h-6 w-6 text-primary" />
                        Case Management
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Review, moderate, and manage all cases filed on the platform
                    </p>
                </div>
            </div>

            {/* Filters & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by case number, defendant, or plaintiff..."
                        className="w-full pl-10 pr-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        disabled
                    />
                </div>
                <div className="flex items-center gap-2">
                    <FunnelIcon className="h-4 w-4 text-muted-foreground" />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        disabled
                    >
                        {statuses.map((s) => (
                            <option key={s} value={s}>
                                {s === 'all' ? 'All Statuses' : s.replace(/_/g, ' ')}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table Container */}
            <div className="flex-1 rounded-lg border bg-card overflow-hidden">
                <div className="overflow-auto max-h-[calc(100vh-240px)] pb-2">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 z-40 bg-muted">
                            <tr>
                                <th className="text-left p-3 font-semibold border-b min-w-[120px] bg-muted">Case #</th>
                                <th className="text-left p-3 font-semibold border-b min-w-[180px] bg-muted">Defendant</th>
                                <th className="text-left p-3 font-semibold border-b min-w-[180px] bg-muted">Plaintiff</th>
                                <th className="text-left p-3 font-semibold border-b min-w-[160px] bg-muted">Status</th>
                                <th className="text-left p-3 font-semibold border-b min-w-[120px] bg-muted">Filed</th>
                                <th className="text-center p-3 font-semibold border-b min-w-[100px] bg-muted">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan={6} className="p-12 text-center text-muted-foreground">
                                    <FolderOpenIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
                                    <p className="font-medium">Case management coming soon</p>
                                    <p className="text-sm mt-1 text-muted-foreground/60">
                                        Admin tools for reviewing, approving, and moderating cases will appear here.
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
