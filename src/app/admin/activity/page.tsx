'use client'

import {
    ChartBarIcon,
} from '@heroicons/react/24/outline'

export default function AdminActivityPage() {
    return (
        <div className="space-y-4 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <ChartBarIcon className="h-6 w-6 text-primary" />
                        Activity Log
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Track platform activity, user actions, and system events
                    </p>
                </div>
            </div>

            {/* Table Container */}
            <div className="flex-1 rounded-lg border bg-card overflow-hidden">
                <div className="overflow-auto max-h-[calc(100vh-240px)] pb-2">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 z-40 bg-muted">
                            <tr>
                                <th className="text-left p-3 font-semibold border-b min-w-[160px] bg-muted">Timestamp</th>
                                <th className="text-left p-3 font-semibold border-b min-w-[160px] bg-muted">User</th>
                                <th className="text-left p-3 font-semibold border-b min-w-[140px] bg-muted">Action</th>
                                <th className="text-left p-3 font-semibold border-b min-w-[200px] bg-muted">Details</th>
                                <th className="text-left p-3 font-semibold border-b min-w-[120px] bg-muted">IP Address</th>
                                <th className="text-center p-3 font-semibold border-b min-w-[100px] bg-muted">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan={6} className="p-12 text-center text-muted-foreground">
                                    <ChartBarIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
                                    <p className="font-medium">Activity log coming soon</p>
                                    <p className="text-sm mt-1 text-muted-foreground/60">
                                        Platform activity tracking, user action logs, and system event history will appear here.
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
