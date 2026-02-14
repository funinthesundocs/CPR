'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    HandThumbUpIcon,
    FlagIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    EyeIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline'
import { FlagIcon as FlagSolidIcon } from '@heroicons/react/24/solid'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Vote = {
    id: string
    case_id: string
    voter_id: string
    guilt_score: number
    nominal_approved: boolean
    punitive_amount: number | null
    justification: string | null
    flagged: boolean
    created_at: string
    updated_at: string | null
    voter_email: string
    voter_name: string | null
    cases: {
        case_number: string
        defendants: { full_name: string } | null
    } | null
}

type Stats = {
    totalVotes: number
    flaggedVotes: number
    uniqueVoters: number
    avgGuilt: number
}

export default function AdminVotesPage() {
    const [votes, setVotes] = useState<Vote[]>([])
    const [stats, setStats] = useState<Stats>({ totalVotes: 0, flaggedVotes: 0, uniqueVoters: 0, avgGuilt: 0 })
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [flaggedOnly, setFlaggedOnly] = useState(false)
    const [selectedVote, setSelectedVote] = useState<Vote | null>(null)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const fetchVotes = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (search) params.set('search', search)
            if (flaggedOnly) params.set('flagged', 'true')

            const res = await fetch(`/api/admin/votes?${params}`)
            const data = await res.json()

            if (res.ok) {
                setVotes(data.votes || [])
                setStats(data.stats || { totalVotes: 0, flaggedVotes: 0, uniqueVoters: 0, avgGuilt: 0 })
            }
        } catch (err) {
            console.error('Failed to fetch votes:', err)
        } finally {
            setLoading(false)
        }
    }, [search, flaggedOnly])

    useEffect(() => {
        fetchVotes()
    }, [fetchVotes])

    const handleFlag = async (voteId: string, flagged: boolean) => {
        setActionLoading(voteId)
        try {
            const res = await fetch('/api/admin/votes', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vote_id: voteId, flagged }),
            })
            if (res.ok) {
                setVotes(prev => prev.map(v => v.id === voteId ? { ...v, flagged } : v))
                setStats(prev => ({
                    ...prev,
                    flaggedVotes: flagged ? prev.flaggedVotes + 1 : prev.flaggedVotes - 1,
                }))
            }
        } catch (err) {
            console.error('Failed to flag vote:', err)
        } finally {
            setActionLoading(null)
        }
    }

    const handleDelete = async (voteId: string) => {
        if (!confirm('Are you sure you want to delete this vote? This action cannot be undone.')) return
        setActionLoading(voteId)
        try {
            const res = await fetch('/api/admin/votes', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vote_id: voteId }),
            })
            if (res.ok) {
                setVotes(prev => prev.filter(v => v.id !== voteId))
                setStats(prev => ({ ...prev, totalVotes: prev.totalVotes - 1 }))
                if (selectedVote?.id === voteId) setSelectedVote(null)
            }
        } catch (err) {
            console.error('Failed to delete vote:', err)
        } finally {
            setActionLoading(null)
        }
    }

    const guiltColor = (score: number) => {
        if (score <= 2) return 'text-green-500'
        if (score <= 4) return 'text-emerald-500'
        if (score <= 6) return 'text-yellow-500'
        if (score <= 8) return 'text-orange-500'
        return 'text-red-500'
    }

    const guiltBadge = (score: number) => {
        if (score <= 3) return { label: 'Innocent', variant: 'outline' as const, className: 'border-green-500/50 text-green-600' }
        if (score <= 6) return { label: 'Uncertain', variant: 'outline' as const, className: 'border-yellow-500/50 text-yellow-600' }
        return { label: 'Guilty', variant: 'outline' as const, className: 'border-red-500/50 text-red-600' }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const days = Math.floor(hours / 24)
        if (hours < 1) return 'Just now'
        if (hours < 24) return `${hours}h ago`
        if (days < 7) return `${days}d ago`
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    return (
        <div className="space-y-4 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <HandThumbUpIcon className="h-6 w-6 text-primary" />
                        Votes & Moderation
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Review community votes, flag suspicious activity, and manage moderation
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search voters, cases..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 w-[220px]"
                        />
                    </div>
                    <Button
                        variant={flaggedOnly ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFlaggedOnly(!flaggedOnly)}
                        className="gap-1.5"
                    >
                        <FlagIcon className="h-4 w-4" />
                        Flagged
                        {stats.flaggedVotes > 0 && (
                            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                                {stats.flaggedVotes}
                            </Badge>
                        )}
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total Votes', value: stats.totalVotes.toString(), desc: 'All time' },
                    { label: 'Flagged', value: stats.flaggedVotes.toString(), desc: 'Requiring review' },
                    { label: 'Unique Voters', value: stats.uniqueVoters.toString(), desc: 'Distinct participants' },
                    { label: 'Avg Guilt', value: `${stats.avgGuilt}/10`, desc: 'Average score' },
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
                <div className="overflow-auto max-h-[calc(100vh-340px)] pb-2">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 z-40 bg-muted">
                            <tr>
                                <th className="text-left p-3 font-semibold border-b min-w-[180px] bg-muted">Voter</th>
                                <th className="text-left p-3 font-semibold border-b min-w-[140px] bg-muted">Case</th>
                                <th className="text-left p-3 font-semibold border-b min-w-[100px] bg-muted">Verdict</th>
                                <th className="text-left p-3 font-semibold border-b min-w-[100px] bg-muted">Nominal</th>
                                <th className="text-left p-3 font-semibold border-b min-w-[100px] bg-muted">Punitive</th>
                                <th className="text-left p-3 font-semibold border-b min-w-[100px] bg-muted">Date</th>
                                <th className="text-center p-3 font-semibold border-b min-w-[120px] bg-muted">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center text-muted-foreground">
                                        <div className="h-6 w-6 mx-auto animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                        <p className="mt-2">Loading votes...</p>
                                    </td>
                                </tr>
                            ) : votes.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center text-muted-foreground">
                                        <HandThumbUpIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
                                        <p className="font-medium">No votes found</p>
                                        <p className="text-sm mt-1 text-muted-foreground/60">
                                            {search || flaggedOnly
                                                ? 'Try adjusting your search or filter criteria.'
                                                : 'No community votes have been cast yet.'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                votes.map((vote) => {
                                    const badge = guiltBadge(vote.guilt_score)
                                    return (
                                        <tr
                                            key={vote.id}
                                            className={`border-b hover:bg-muted/50 transition-colors ${vote.flagged ? 'bg-red-500/5' : ''}`}
                                        >
                                            <td className="p-3">
                                                <p className="font-medium text-sm truncate max-w-[180px]">
                                                    {vote.voter_name || vote.voter_email}
                                                </p>
                                                {vote.voter_name && (
                                                    <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                                                        {vote.voter_email}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <p className="font-medium text-sm">
                                                    {vote.cases?.case_number || 'Unknown'}
                                                </p>
                                                {vote.cases?.defendants && (
                                                    <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                                                        vs. {(vote.cases.defendants as any)?.full_name}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-lg font-bold ${guiltColor(vote.guilt_score)}`}>
                                                        {vote.guilt_score}/10
                                                    </span>
                                                    <Badge variant={badge.variant} className={`text-xs ${badge.className}`}>
                                                        {badge.label}
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <span className={`font-medium ${vote.nominal_approved ? 'text-green-600' : 'text-red-500'}`}>
                                                    {vote.nominal_approved ? '✅ Approved' : '❌ Denied'}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <span className="font-medium">
                                                    {vote.punitive_amount
                                                        ? `$${vote.punitive_amount.toLocaleString()}`
                                                        : '—'
                                                    }
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <span className="text-sm text-muted-foreground">
                                                    {formatDate(vote.created_at)}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setSelectedVote(vote)}
                                                        className="h-8 w-8 p-0"
                                                        title="View details"
                                                    >
                                                        <EyeIcon className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleFlag(vote.id, !vote.flagged)}
                                                        disabled={actionLoading === vote.id}
                                                        className={`h-8 w-8 p-0 ${vote.flagged ? 'text-red-500 hover:text-red-600' : ''}`}
                                                        title={vote.flagged ? 'Unflag' : 'Flag'}
                                                    >
                                                        {vote.flagged
                                                            ? <FlagSolidIcon className="h-4 w-4" />
                                                            : <FlagIcon className="h-4 w-4" />
                                                        }
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(vote.id)}
                                                        disabled={actionLoading === vote.id}
                                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                        title="Delete vote"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Vote Detail Slideout */}
            {selectedVote && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedVote(null)} />
                    <div className="relative w-full max-w-md bg-background border-l shadow-xl flex flex-col animate-in slide-in-from-right-full duration-200">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-bold">Vote Details</h2>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedVote(null)} className="h-8 w-8 p-0">
                                <XMarkIcon className="h-5 w-5" />
                            </Button>
                        </div>
                        <div className="flex-1 overflow-auto p-4 space-y-4">
                            <div className="space-y-3">
                                <DetailRow label="Voter" value={selectedVote.voter_name || selectedVote.voter_email} />
                                {selectedVote.voter_name && (
                                    <DetailRow label="Email" value={selectedVote.voter_email} />
                                )}
                                <DetailRow label="Case" value={selectedVote.cases?.case_number || 'Unknown'} />
                                <DetailRow label="Defendant" value={(selectedVote.cases?.defendants as any)?.full_name || '—'} />
                                <div className="pt-2 border-t">
                                    <p className="text-sm text-muted-foreground">Guilt Score</p>
                                    <p className={`text-3xl font-bold ${guiltColor(selectedVote.guilt_score)}`}>
                                        {selectedVote.guilt_score}/10
                                    </p>
                                </div>
                                <DetailRow
                                    label="Nominal Damages"
                                    value={selectedVote.nominal_approved ? '✅ Approved' : '❌ Denied'}
                                />
                                <DetailRow
                                    label="Punitive Damages"
                                    value={selectedVote.punitive_amount ? `$${selectedVote.punitive_amount.toLocaleString()}` : 'None'}
                                />
                                <DetailRow
                                    label="Status"
                                    value={selectedVote.flagged ? '🚩 Flagged' : '✅ Normal'}
                                />
                                <DetailRow label="Submitted" value={new Date(selectedVote.created_at).toLocaleString()} />
                                {selectedVote.updated_at && (
                                    <DetailRow label="Updated" value={new Date(selectedVote.updated_at).toLocaleString()} />
                                )}
                            </div>
                            {selectedVote.justification && (
                                <div className="pt-2 border-t">
                                    <p className="text-sm text-muted-foreground mb-1">Justification</p>
                                    <div className="rounded-lg bg-muted/50 p-3 text-sm">
                                        {selectedVote.justification}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t flex gap-2">
                            <Button
                                variant={selectedVote.flagged ? 'outline' : 'destructive'}
                                size="sm"
                                className="flex-1 gap-1.5"
                                onClick={() => {
                                    handleFlag(selectedVote.id, !selectedVote.flagged)
                                    setSelectedVote({ ...selectedVote, flagged: !selectedVote.flagged })
                                }}
                            >
                                <FlagIcon className="h-4 w-4" />
                                {selectedVote.flagged ? 'Unflag' : 'Flag Vote'}
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="flex-1 gap-1.5"
                                onClick={() => handleDelete(selectedVote.id)}
                            >
                                <TrashIcon className="h-4 w-4" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-medium">{value}</p>
        </div>
    )
}
