'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    FolderOpenIcon,
    MagnifyingGlassIcon,
    CheckCircleIcon,
    XCircleIcon,
    EyeIcon,
    XMarkIcon,
    UserIcon,
    ScaleIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline'

type Defendant = {
    id: string
    full_name: string
    slug: string
    photo_url: string | null
    location: string | null
}

type Plaintiff = {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
}

type Case = {
    id: string
    case_number: string
    status: string
    plaintiff_id: string
    created_at: string
    case_types: string[] | null
    nominal_damages_claimed: number | null
    story_narrative: string | null
    relationship_narrative: string | null
    promise_narrative: string | null
    betrayal_narrative: string | null
    personal_impact: string | null
    defendants: Defendant | null
    plaintiff: Plaintiff | null
}

const STATUS_TABS = [
    { id: '', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'investigation', label: 'Investigation' },
    { id: 'judgment', label: 'Judgment' },
    { id: 'verdict', label: 'Verdict' },
    { id: 'draft', label: 'Draft' },
    { id: 'rejected', label: 'Rejected' },
]

const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    admin_review: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    investigation: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    judgment: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    verdict: 'bg-green-500/10 text-green-600 border-green-500/20',
    restitution: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    draft: 'bg-muted text-muted-foreground border-border',
    rejected: 'bg-destructive/10 text-destructive border-destructive/20',
}

function StatusBadge({ status }: { status: string }) {
    const style = STATUS_STYLES[status] || 'bg-muted text-muted-foreground border-border'
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${style}`}>
            {status.replace(/_/g, ' ')}
        </span>
    )
}

function formatDate(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000)
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 30) return `${diffDays}d ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`
    return date.toLocaleDateString()
}

export default function AdminCasesPage() {
    const [cases, setCases] = useState<Case[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [searchDebounce, setSearchDebounce] = useState('')
    const [statusFilter, setStatusFilter] = useState('pending')
    const [selectedCase, setSelectedCase] = useState<Case | null>(null)
    const [confirming, setConfirming] = useState<{ caseId: string; action: 'approve' | 'reject' } | null>(null)
    const [updating, setUpdating] = useState<string | null>(null)

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => setSearchDebounce(search), 300)
        return () => clearTimeout(t)
    }, [search])

    const fetchCases = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const params = new URLSearchParams()
            if (searchDebounce) params.set('search', searchDebounce)
            if (statusFilter) params.set('status', statusFilter)
            const res = await fetch(`/api/admin/cases?${params}`)
            if (!res.ok) throw new Error('Failed to fetch cases')
            const data = await res.json()
            setCases(data.cases)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error loading cases')
        } finally {
            setLoading(false)
        }
    }, [searchDebounce, statusFilter])

    useEffect(() => { fetchCases() }, [fetchCases])

    async function updateStatus(caseId: string, status: string) {
        setUpdating(caseId)
        setConfirming(null)
        try {
            const res = await fetch('/api/admin/cases', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ caseId, status }),
            })
            if (!res.ok) throw new Error('Failed to update case')
            // Close slideout if this case was selected
            if (selectedCase?.id === caseId) setSelectedCase(null)
            await fetchCases()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update case')
        } finally {
            setUpdating(null)
        }
    }

    const isPending = (c: Case) => c.status === 'pending' || c.status === 'admin_review'

    return (
        <div className="space-y-4 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <FolderOpenIcon className="h-6 w-6" style={{ color: 'hsl(var(--primary))' }} />
                        Case Management
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Review and approve pending cases before they go live
                    </p>
                </div>
                <button
                    onClick={fetchCases}
                    className="px-3 py-1.5 rounded-md text-sm font-medium transition-all bg-muted/50 text-foreground/80 hover:bg-primary hover:text-primary-foreground flex items-center gap-1.5"
                >
                    <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* Search + Status Tabs */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search case #, defendant, plaintiff..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring h-9"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            <XMarkIcon className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <div className="flex gap-1 flex-wrap">
                    {STATUS_TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setStatusFilter(tab.id)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                                statusFilter === tab.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted/50 text-foreground/80 hover:bg-primary hover:text-primary-foreground'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 rounded-lg border bg-card overflow-hidden">
                <div className="overflow-auto max-h-[calc(100vh-300px)] pb-2">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 z-40 bg-muted">
                            <tr>
                                <th className="text-left p-3 font-semibold border-b min-w-[100px] bg-muted">Case #</th>
                                <th className="text-left p-3 font-semibold border-b min-w-[180px] bg-muted">Defendant</th>
                                <th className="text-left p-3 font-semibold border-b min-w-[180px] bg-muted">Plaintiff</th>
                                <th className="text-left p-3 font-semibold border-b min-w-[140px] bg-muted">Status</th>
                                <th className="text-left p-3 font-semibold border-b min-w-[100px] bg-muted">Filed</th>
                                <th className="text-center p-3 font-semibold border-b min-w-[200px] bg-muted">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && cases.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-muted-foreground">
                                        <ArrowPathIcon className="h-6 w-6 animate-spin mx-auto mb-2" />
                                        Loading cases...
                                    </td>
                                </tr>
                            ) : cases.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-muted-foreground">
                                        <FolderOpenIcon className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                        <p className="font-medium">No cases found</p>
                                        <p className="text-sm mt-1 opacity-60">
                                            {search || statusFilter ? 'Try adjusting your filters' : 'No cases have been filed yet'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                cases.map((c, idx) => (
                                    <tr key={c.id} className={idx % 2 === 0 ? 'bg-card' : 'bg-secondary'}>
                                        {/* Case # */}
                                        <td className="p-3 border-b">
                                            <span className="font-mono text-sm font-semibold">{c.case_number}</span>
                                        </td>

                                        {/* Defendant */}
                                        <td className="p-3 border-b">
                                            <div className="flex items-center gap-2">
                                                {c.defendants?.photo_url ? (
                                                    <img
                                                        src={c.defendants.photo_url}
                                                        alt=""
                                                        className="h-[1.925rem] w-[1.925rem] rounded-full object-cover flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className="h-[1.925rem] w-[1.925rem] rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                )}
                                                <span className="text-sm font-medium">{c.defendants?.full_name || '—'}</span>
                                            </div>
                                        </td>

                                        {/* Plaintiff */}
                                        <td className="p-3 border-b">
                                            <div className="flex items-center gap-2">
                                                {c.plaintiff?.avatar_url ? (
                                                    <img src={c.plaintiff.avatar_url} alt="" className="h-[1.925rem] w-[1.925rem] rounded-full object-cover flex-shrink-0" />
                                                ) : (
                                                    <div className="h-[1.925rem] w-[1.925rem] rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                        <ScaleIcon className="h-4 w-4 text-primary" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium leading-none">{c.plaintiff?.full_name || '—'}</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">{c.plaintiff?.email}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="p-3 border-b">
                                            <StatusBadge status={c.status} />
                                        </td>

                                        {/* Filed */}
                                        <td className="p-3 border-b">
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <ClockIcon className="h-3.5 w-3.5" />
                                                {formatDate(c.created_at)}
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="p-3 border-b">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* View button */}
                                                <button
                                                    onClick={() => setSelectedCase(c)}
                                                    className="px-2.5 py-1.5 rounded-md text-xs font-medium transition-all bg-muted/50 text-foreground/80 hover:bg-primary hover:text-primary-foreground flex items-center gap-1"
                                                >
                                                    <EyeIcon className="h-3.5 w-3.5" />
                                                    Review
                                                </button>

                                                {isPending(c) && confirming?.caseId === c.id ? (
                                                    /* Confirm row */
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs text-muted-foreground">
                                                            {confirming.action === 'approve' ? 'Approve?' : 'Reject?'}
                                                        </span>
                                                        <button
                                                            onClick={() => updateStatus(c.id, confirming.action === 'approve' ? 'investigation' : 'draft')}
                                                            disabled={updating === c.id}
                                                            className="px-2.5 py-1.5 rounded-md text-xs font-medium transition-all bg-primary text-primary-foreground disabled:opacity-50"
                                                        >
                                                            {updating === c.id ? '...' : 'Yes'}
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirming(null)}
                                                            className="px-2.5 py-1.5 rounded-md text-xs font-medium transition-all bg-muted/50 text-foreground/80 hover:bg-primary hover:text-primary-foreground"
                                                        >
                                                            No
                                                        </button>
                                                    </div>
                                                ) : isPending(c) ? (
                                                    /* Approve + Reject */
                                                    <>
                                                        <button
                                                            onClick={() => setConfirming({ caseId: c.id, action: 'approve' })}
                                                            disabled={updating === c.id}
                                                            className="px-2.5 py-1.5 rounded-md text-xs font-medium transition-all bg-green-500/10 text-green-700 hover:bg-green-500 hover:text-white border border-green-500/20 flex items-center gap-1 disabled:opacity-50"
                                                        >
                                                            <CheckCircleIcon className="h-3.5 w-3.5" />
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirming({ caseId: c.id, action: 'reject' })}
                                                            disabled={updating === c.id}
                                                            className="px-2.5 py-1.5 rounded-md text-xs font-medium transition-all bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border border-destructive/20 flex items-center gap-1 disabled:opacity-50"
                                                        >
                                                            <XCircleIcon className="h-3.5 w-3.5" />
                                                            Reject
                                                        </button>
                                                    </>
                                                ) : null}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Slideout */}
            {selectedCase && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setSelectedCase(null)}
                    />
                    {/* Panel */}
                    <div className="relative z-10 w-full max-w-xl bg-card shadow-xl flex flex-col h-full overflow-hidden">
                        {/* Panel Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b bg-muted">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold">{selectedCase.case_number}</span>
                                    <StatusBadge status={selectedCase.status} />
                                </div>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    Filed {formatDate(selectedCase.created_at)}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedCase(null)}
                                className="p-1.5 rounded-md hover:bg-background text-muted-foreground hover:text-foreground"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Panel Body */}
                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                            {/* Parties */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-lg border bg-background p-3">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Plaintiff</p>
                                    <div className="flex items-center gap-2">
                                        {selectedCase.plaintiff?.avatar_url ? (
                                            <img src={selectedCase.plaintiff.avatar_url} alt="" className="h-[2.2rem] w-[2.2rem] rounded-full object-cover flex-shrink-0" />
                                        ) : (
                                            <div className="h-[2.2rem] w-[2.2rem] rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <ScaleIcon className="h-4 w-4 text-primary" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-medium">{selectedCase.plaintiff?.full_name || '—'}</p>
                                            <p className="text-xs text-muted-foreground">{selectedCase.plaintiff?.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-lg border bg-background p-3">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Defendant</p>
                                    <div className="flex items-center gap-2">
                                        {selectedCase.defendants?.photo_url ? (
                                            <img src={selectedCase.defendants.photo_url} alt="" className="h-[2.2rem] w-[2.2rem] rounded-full object-cover flex-shrink-0" />
                                        ) : (
                                            <div className="h-[2.2rem] w-[2.2rem] rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                                <UserIcon className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-medium">{selectedCase.defendants?.full_name || '—'}</p>
                                            <p className="text-xs text-muted-foreground">{selectedCase.defendants?.location}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Case Types & Damages */}
                            {(selectedCase.case_types?.length || selectedCase.nominal_damages_claimed) && (
                                <div className="flex flex-wrap gap-3">
                                    {selectedCase.case_types?.map(t => (
                                        <span key={t} className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                            {t}
                                        </span>
                                    ))}
                                    {selectedCase.nominal_damages_claimed && (
                                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
                                            ${selectedCase.nominal_damages_claimed.toLocaleString()} claimed
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Narrative Sections */}
                            {[
                                { label: 'Relationship', text: selectedCase.relationship_narrative },
                                { label: 'Promise / Agreement', text: selectedCase.promise_narrative },
                                { label: 'Betrayal', text: selectedCase.betrayal_narrative },
                                { label: 'Personal Impact', text: selectedCase.personal_impact },
                                { label: 'Story', text: selectedCase.story_narrative },
                            ].filter(s => s.text).map(section => (
                                <div key={section.label}>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">{section.label}</p>
                                    <p className="text-sm leading-relaxed text-foreground/90 bg-muted/40 rounded-lg p-3 border">
                                        {section.text}
                                    </p>
                                </div>
                            ))}

                            {!selectedCase.story_narrative && !selectedCase.relationship_narrative && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <ExclamationTriangleIcon className="h-8 w-8 mx-auto mb-2 opacity-40" />
                                    <p className="text-sm">No narrative content available</p>
                                </div>
                            )}
                        </div>

                        {/* Panel Footer — Actions */}
                        {isPending(selectedCase) && (
                            <div className="border-t px-6 py-4 bg-muted/30">
                                <p className="text-xs text-muted-foreground mb-3">
                                    Approving moves this case to <strong>Investigation</strong> and makes it visible to the public. Rejecting returns it to <strong>Draft</strong>.
                                </p>
                                {confirming?.caseId === selectedCase.id ? (
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium">
                                            {confirming.action === 'approve' ? 'Approve this case?' : 'Reject this case?'}
                                        </span>
                                        <button
                                            onClick={() => updateStatus(selectedCase.id, confirming.action === 'approve' ? 'investigation' : 'draft')}
                                            disabled={updating === selectedCase.id}
                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all disabled:opacity-50 ${
                                                confirming.action === 'approve'
                                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                                    : 'bg-destructive text-white hover:bg-destructive/90'
                                            }`}
                                        >
                                            {updating === selectedCase.id ? 'Updating...' : 'Confirm'}
                                        </button>
                                        <button
                                            onClick={() => setConfirming(null)}
                                            className="px-4 py-2 rounded-md text-sm font-medium transition-all bg-muted/50 text-foreground/80 hover:bg-primary hover:text-primary-foreground"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setConfirming({ caseId: selectedCase.id, action: 'approve' })}
                                            disabled={updating === selectedCase.id}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all bg-green-500/10 text-green-700 hover:bg-green-500 hover:text-white border border-green-500/30 disabled:opacity-50"
                                        >
                                            <CheckCircleIcon className="h-4 w-4" />
                                            Approve — Move to Investigation
                                        </button>
                                        <button
                                            onClick={() => setConfirming({ caseId: selectedCase.id, action: 'reject' })}
                                            disabled={updating === selectedCase.id}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border border-destructive/30 disabled:opacity-50"
                                        >
                                            <XCircleIcon className="h-4 w-4" />
                                            Reject — Return to Draft
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
