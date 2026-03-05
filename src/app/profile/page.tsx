'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { User } from '@supabase/supabase-js'
import { useTranslation } from '@/i18n'
import {
    PencilSquareIcon,
    CheckBadgeIcon,
    EnvelopeIcon,
    GlobeAltIcon,
    ClockIcon,
    CalendarDaysIcon,
    UserGroupIcon,
    ScaleIcon,
    DocumentTextIcon,
    SparklesIcon,
    UserIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon,
    ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline'

type Profile = {
    id: string
    display_name: string
    tagline: string | null
    avatar_url: string | null
    cover_photo_url: string | null
    bio: string
    language: string
    is_verified: boolean
    profile_completion: number
    profile_progress: number
    follower_count: number
    following_count: number
    case_count: number
    email: string | null
    joined_at: string
    last_active_at: string
}

type UserCase = {
    id: string
    case_number: string
    status: string
    case_types: string[] | null
    created_at: string
    nominal_damages_claimed: number | null
    defendants: { full_name: string; slug: string; photo_url: string | null } | null
}

type Membership = {
    case_id: string
    role: string
    status: string
    created_at: string | null
    cases: {
        case_number: string
        status: string
        defendants: { full_name: string } | null
    } | null
}

const LANGUAGE_LABELS: Record<string, string> = {
    en: 'English', es: 'Español', pt: 'Português',
    fr: 'Français', de: 'Deutsch', ja: '日本語', ar: 'العربية',
}

const STATUS_LABELS: Record<string, string> = {
    pending_convergence: 'Pending 2nd Plaintiff',
}

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    pending_convergence: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    admin_review: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    investigation: 'bg-green-500/10 text-green-600 border-green-500/20',
    judgment: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    verdict_guilty: 'bg-red-500/10 text-red-600 border-red-500/20',
    verdict_innocent: 'bg-green-500/10 text-green-600 border-green-500/20',
    resolved: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    draft: 'bg-muted text-muted-foreground border-border',
}

const EDITABLE_STATUSES = ['draft', 'pending', 'pending_convergence', 'admin_review', 'investigation']
const VOTING_STATUSES = ['judgment', 'investigation']

const ROLE_DESCRIPTIONS: Record<string, string> = {
    plaintiff:         'You filed this case',
    jury_member:       'Review evidence and cast your verdict',
    witness:           'Your testimony is on record',
    investigator:      'Document findings for this case',
    expert_witness:    'Provide professional expertise',
    attorney:          'Legal counsel for a party',
    law_enforcement:   'Submit official records or actions',
}

const ROLE_ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
    plaintiff:         { icon: <ScaleIcon className="h-5 w-5" />, color: 'text-red-500' },
    jury_member:       { icon: <ScaleIcon className="h-5 w-5" />, color: 'text-blue-500' },
    witness:           { icon: <UserIcon className="h-5 w-5" />, color: 'text-purple-500' },
    investigator:      { icon: <SparklesIcon className="h-5 w-5" />, color: 'text-green-500' },
    expert_witness:    { icon: <ShieldCheckIcon className="h-5 w-5" />, color: 'text-cyan-500' },
    attorney:          { icon: <ShieldCheckIcon className="h-5 w-5" />, color: 'text-indigo-500' },
    law_enforcement:   { icon: <ExclamationTriangleIcon className="h-5 w-5" />, color: 'text-orange-500' },
}

function getProgressInfo(score: number) {
    if (score >= 80) return {
        label: 'Fully engaged',
        color: 'text-green-600 dark:text-green-400',
        barColor: 'bg-green-500',
        border: 'border-green-500/20',
        bg: 'bg-green-500/5',
    }
    if (score >= 50) return {
        label: 'Active participant',
        color: 'text-yellow-600 dark:text-yellow-400',
        barColor: 'bg-yellow-500',
        border: 'border-yellow-500/20',
        bg: 'bg-yellow-500/5',
    }
    if (score >= 20) return {
        label: 'Getting started',
        color: 'text-orange-600 dark:text-orange-400',
        barColor: 'bg-orange-500',
        border: 'border-orange-500/20',
        bg: 'bg-orange-500/5',
    }
    return {
        label: 'Profile incomplete',
        color: 'text-red-600 dark:text-red-400',
        barColor: 'bg-red-500',
        border: 'border-border',
        bg: 'bg-muted/30',
    }
}

export default function ProfilePage() {
    const router = useRouter()
    const supabase = createClient()
    const { t } = useTranslation()
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [editing, setEditing] = useState(false)
    const [success, setSuccess] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [cases, setCases] = useState<UserCase[]>([])
    const [memberships, setMemberships] = useState<Membership[]>([])
    const [voteCounts, setVoteCounts] = useState<Record<string, number>>({})
    const [evidenceCounts, setEvidenceCounts] = useState<Record<string, number>>({})
    const [memberCounts, setMemberCounts] = useState<Record<string, number>>({})

    // Editable fields
    const [editName, setEditName] = useState('')
    const [editTagline, setEditTagline] = useState('')
    const [editBio, setEditBio] = useState('')
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const loadProfile = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }
        setUser(user)

        // Sync email verification status to is_verified
        try {
            await fetch('/api/profile/sync-verification', { method: 'POST' })
        } catch (err) {
            console.error('Failed to sync verification:', err)
        }

        const { data: profileData } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (profileData) {
            setProfile(profileData as Profile)
            setEditName(profileData.display_name || '')
            setEditTagline(profileData.tagline || '')
            setEditBio(profileData.bio || '')
        }

        // Load user's filed cases
        const { data: userCases } = await supabase
            .from('cases')
            .select('id, case_number, status, case_types, created_at, nominal_damages_claimed, defendants(full_name, slug, photo_url)')
            .eq('plaintiff_id', user.id)
            .order('created_at', { ascending: false })

        const typedCases = (userCases || []) as unknown as UserCase[]
        setCases(typedCases)

        // Load case memberships (joined as jury, witness, etc.)
        const { data: membershipData } = await supabase
            .from('case_roles')
            .select('case_id, role, status, created_at, cases(case_number, status, defendants(full_name))')
            .eq('user_id', user.id)
            .order('case_id', { ascending: false })

        // Synthesize plaintiff entries from filed cases and merge
        const plaintiffEntries: Membership[] = typedCases.map(c => ({
            case_id: c.id,
            role: 'plaintiff',
            status: 'approved',
            created_at: c.created_at,
            cases: {
                case_number: c.case_number,
                status: c.status,
                defendants: c.defendants ? { full_name: c.defendants.full_name } : null,
            }
        }))
        setMemberships([...plaintiffEntries, ...((membershipData || []) as unknown as Membership[])])

        // Load activity counts per case (non-fatal — show 0 on failure)
        if (typedCases.length > 0) {
            const caseIds = typedCases.map(c => c.id)
            const toCountMap = (rows: { case_id: string }[] | null) => {
                const map: Record<string, number> = {}
                rows?.forEach(r => { map[r.case_id] = (map[r.case_id] || 0) + 1 })
                return map
            }
            try {
                const [votesRes, evidenceRes, membersRes] = await Promise.all([
                    supabase.from('votes').select('case_id').in('case_id', caseIds),
                    supabase.from('evidence').select('case_id').in('case_id', caseIds),
                    supabase.from('case_roles').select('case_id').in('case_id', caseIds),
                ])
                setVoteCounts(toCountMap(votesRes.data))
                setEvidenceCounts(toCountMap(evidenceRes.data))
                // +1 per case for the original plaintiff
                const rawMembers = toCountMap(membersRes.data)
                const withPlaintiff: Record<string, number> = {}
                caseIds.forEach(id => { withPlaintiff[id] = (rawMembers[id] || 0) + 1 })
                setMemberCounts(withPlaintiff)
            } catch {
                // non-fatal — counts remain 0
            }
        }
        setLoading(false)
    }, [supabase, router])

    useEffect(() => { loadProfile() }, [loadProfile])

    const handleSave = async () => {
        if (!user || !profile) return
        setSaving(true)
        setError(null)
        setSuccess(null)

        try {
            let avatarUrl = profile.avatar_url

            if (avatarFile) {
                const uploadForm = new FormData()
                uploadForm.append('file', avatarFile)
                const res = await fetch('/api/profile/upload-avatar', {
                    method: 'POST',
                    body: uploadForm,
                })
                if (res.ok) {
                    const data = await res.json()
                    avatarUrl = data.avatar_url
                } else {
                    const err = await res.json()
                    throw new Error(err.error || 'Avatar upload failed')
                }
            }

            let completion = 0
            if (editName.trim()) completion += 20
            if (editBio.trim()) completion += 20
            if (editTagline?.trim()) completion += 10
            if (avatarUrl) completion += 20
            if (profile.is_verified) completion += 30

            const { error: updateError } = await supabase
                .from('user_profiles')
                .update({
                    display_name: editName.trim(),
                    tagline: editTagline.trim() || null,
                    bio: editBio.trim(),
                    avatar_url: avatarUrl,
                    profile_completion: completion,
                })
                .eq('id', user.id)

            if (updateError) throw new Error(updateError.message)

            setEditing(false)
            setAvatarFile(null)
            setAvatarPreview(null)
            setSuccess('Profile updated successfully.')
            await loadProfile()
        } catch (err: any) {
            setError(err.message || 'Failed to save')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        )
    }

    if (!user || !profile) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-muted-foreground">{t('profile.loginRequired')}</p>
            </div>
        )
    }

    const progress = getProgressInfo(profile.profile_progress)
    const uniqueRoles = [...new Set(memberships.map(m => m.role))]

    return (
        <div className="px-[10%] space-y-5">

            {/* ── Hero Card ── */}
            <div className="rounded-2xl border bg-card p-6">
                <div className="flex flex-col sm:flex-row items-start gap-5">

                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                        {(avatarPreview || profile.avatar_url) ? (
                            <img
                                src={avatarPreview || profile.avatar_url!}
                                alt={profile.display_name}
                                className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover ring-2 ring-border shadow-md"
                            />
                        ) : (
                            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-muted flex items-center justify-center text-3xl font-bold text-muted-foreground shadow-md">
                                {profile.display_name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                        )}
                    </div>

                    {/* Identity */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                {/* Name + Verified */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-2xl font-bold">{profile.display_name}</h1>
                                    {profile.is_verified && (
                                        <CheckBadgeIcon className="h-6 w-6 text-blue-500 flex-shrink-0" title="Verified" />
                                    )}
                                </div>

                                {/* Role badges from joined cases */}
                                {uniqueRoles.length > 0 && (
                                    <div className="flex gap-1.5 flex-wrap mt-2">
                                        {uniqueRoles.map(role => (
                                            <span key={role} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                                                {role.replace(/_/g, ' ')}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Tagline */}
                                {profile.tagline && (
                                    <p className="text-sm text-muted-foreground mt-2 italic">"{profile.tagline}"</p>
                                )}

                                {/* Join date */}
                                <p className="text-xs text-muted-foreground mt-1.5">
                                    {t('profile.joined')} {new Date(profile.joined_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </p>
                            </div>

                            {/* Edit button */}
                            {!editing && (
                                <button
                                    onClick={() => setEditing(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-muted/50 text-foreground/80 hover:bg-primary hover:text-primary-foreground transition-colors flex-shrink-0"
                                >
                                    <PencilSquareIcon className="h-3.5 w-3.5" />
                                    {t('profile.editProfile')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Feedback ── */}
            {success && (
                <div className="rounded-lg border border-green-500/50 bg-green-500/5 p-3">
                    <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
                </div>
            )}
            {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3">
                    <p className="text-sm text-destructive">{error}</p>
                </div>
            )}

            {/* ── Edit Form ── */}
            {editing && (
                <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-6">
                    <div className="flex items-center gap-2 mb-5 pb-4 border-b border-primary/20">
                        <PencilSquareIcon className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold text-primary">{t('profile.editProfile')}</span>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t('profile.displayName')} *</Label>
                            <Input value={editName} onChange={e => setEditName(e.target.value)} maxLength={50} />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('profile.tagline')}</Label>
                            <Input value={editTagline} onChange={e => setEditTagline(e.target.value)} placeholder="A short line about you" maxLength={100} />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('profile.bio')} *</Label>
                            <Textarea value={editBio} onChange={e => setEditBio(e.target.value)} rows={4} maxLength={500} />
                            <p className="text-xs text-muted-foreground">{editBio.length}/500</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Avatar</Label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={e => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                        setAvatarFile(file)
                                        setAvatarPreview(URL.createObjectURL(file))
                                    }
                                }}
                                className="hidden"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Choose Image
                            </Button>
                            {avatarFile && <p className="text-xs text-muted-foreground">{avatarFile.name}</p>}
                        </div>
                    </div>

                    {/* Actions inside card — no page-sticky tricks */}
                    <div className="flex gap-3 pt-5 mt-5 border-t border-primary/20">
                        <button
                            onClick={() => { setEditing(false); setAvatarFile(null); setAvatarPreview(null) }}
                            className="px-4 py-2 rounded-md text-sm font-medium bg-muted/50 text-foreground/80 hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                        >
                            {saving ? t('profile.saving') : t('profile.saveChanges')}
                        </button>
                    </div>
                </div>
            )}

            {/* ── Reputation & Stats ── */}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-3">
                {/* Hero stat: Participation Score */}
                <div className={`rounded-xl border p-4 ${progress.bg} ${progress.border}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('profile.progressScore')}</span>
                        <span className={`text-xl font-bold ${progress.color}`}>
                            {profile.profile_progress}
                            <span className="text-sm font-normal text-muted-foreground">/100</span>
                        </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${progress.barColor}`}
                            style={{ width: `${profile.profile_progress}%` }}
                        />
                    </div>
                    <p className={`text-xs mt-1.5 font-medium ${progress.color}`}>{progress.label}</p>
                </div>

                {/* Cases Filed */}
                <div className="rounded-xl border bg-card p-4 flex flex-col items-center justify-center min-w-[88px]">
                    <ScaleIcon className="h-4 w-4 text-muted-foreground mb-1" />
                    <p className="text-xl font-bold">{cases.length}</p>
                    <p className="text-xs text-muted-foreground text-center">{t('profile.casesFiled')}</p>
                </div>

                {/* Followers */}
                <div className="rounded-xl border bg-card p-4 flex flex-col items-center justify-center min-w-[88px]">
                    <UserGroupIcon className="h-4 w-4 text-muted-foreground mb-1" />
                    <p className="text-xl font-bold">{profile.follower_count}</p>
                    <p className="text-xs text-muted-foreground text-center">{t('profile.followers')}</p>
                </div>

                {/* Following */}
                <div className="rounded-xl border bg-card p-4 flex flex-col items-center justify-center min-w-[88px]">
                    <UserGroupIcon className="h-4 w-4 text-muted-foreground mb-1" />
                    <p className="text-xl font-bold">{profile.following_count}</p>
                    <p className="text-xs text-muted-foreground text-center">{t('profile.following')}</p>
                </div>
            </div>

            {/* ── Bio ── */}
            {!editing && profile.bio && (
                <div className="rounded-xl border bg-card px-5 py-4">
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">{profile.bio}</p>
                </div>
            )}

            {/* ── Cases & Roles & Chats Tabs ── */}
            <div className="space-y-4">
                <Tabs defaultValue="cases" className="w-full" onValueChange={(value) => {
                  if (value === 'chats') {
                    try {
                      console.log('[Profile] Navigating to messages...')
                      router.push('/messages')
                      // Reset tab after a brief delay to prevent visual confusion
                      setTimeout(() => {
                        // Tab will remain on 'chats' during navigation which is expected
                      }, 100)
                    } catch (error) {
                      console.error('[Profile] Failed to navigate to messages:', error)
                    }
                  }
                }}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="cases">{t('profile.myCases')} ({cases.length})</TabsTrigger>
                            <TabsTrigger value="roles">{t('profile.myRoles')} ({memberships.length})</TabsTrigger>
                            <TabsTrigger value="chats">{t('profile.myChats')}</TabsTrigger>
                        </TabsList>

                {/* My Cases */}
                <TabsContent value="cases" className="space-y-3">
                    {cases.length === 0 ? (
                        <EmptyCard message={t('profile.noCases')} cta={t('cases.fileCase')} href="/cases/new" />
                    ) : (
                        cases.map((c: UserCase) => {
                            const members = memberCounts[c.id] || 1
                            const evidence = evidenceCounts[c.id] || 0
                            const votes = voteCounts[c.id] || 0
                            const isVoting = VOTING_STATUSES.includes(c.status)
                            const filedDate = new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            return (
                                <Card
                                    key={c.id}
                                    className="hover:shadow-md transition-all hover:border-primary/30 cursor-pointer py-0"
                                    onClick={() => router.push(`/cases/${c.case_number}`)}
                                >
                                    <CardContent className="p-0 pr-4">
                                        {/* 7-col grid: plaintiff(fixed) | case-info(fixed) | defendant(fixed) | members-box(auto) | evidence-box(auto) | spacer(fills) | edit(auto) */}
                                        <div className="grid items-center" style={{ gridTemplateColumns: '9.6rem 22rem 9.6rem auto auto 1fr auto' }}>

                                            {/* Col 1 — Plaintiff avatar */}
                                            {profile.avatar_url ? (
                                                <img src={profile.avatar_url} alt="" className="h-[9.6rem] w-[9.6rem] rounded-tl-lg object-cover ring-2 ring-border" />
                                            ) : (
                                                <div className="h-[9.6rem] w-[9.6rem] rounded-tl-lg bg-muted flex items-center justify-center text-4xl font-bold text-muted-foreground">
                                                    {profile.display_name?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                            )}

                                            {/* Col 2 — Case info */}
                                            <div className="space-y-1 overflow-hidden px-4 leading-loose">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-mono text-sm font-bold">{c.case_number}</span>
                                                    <Badge variant="outline" className={`text-xs capitalize ${STATUS_COLORS[c.status] || ''}`}>
                                                        {STATUS_LABELS[c.status] || c.status.replace(/_/g, ' ')}
                                                    </Badge>
                                                </div>
                                                <p className="text-base font-semibold truncate">
                                                    {profile.display_name} vs. {c.defendants?.full_name || 'Unknown defendant'}
                                                </p>
                                                {c.case_types && c.case_types.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 overflow-hidden" style={{ maxHeight: '1.75rem' }}>
                                                        {c.case_types.slice(0, 3).map((type: string) => (
                                                            <Badge key={type} variant="secondary" className="text-xs capitalize">
                                                                {type.replace(/_/g, ' ')}
                                                            </Badge>
                                                        ))}
                                                        {c.case_types.length > 3 && (
                                                            <Badge variant="secondary" className="text-xs">+{c.case_types.length - 3}</Badge>
                                                        )}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    {(c.nominal_damages_claimed || 0) > 0 && (
                                                        <>
                                                            <span>Damages <span className="font-semibold text-foreground">${c.nominal_damages_claimed!.toLocaleString()}</span></span>
                                                            <span className="text-muted-foreground/40">|</span>
                                                        </>
                                                    )}
                                                    <span>Filed <span className="font-semibold text-foreground">{filedDate}</span></span>
                                                </div>
                                            </div>

                                            {/* Col 3 — Defendant avatar */}
                                            {c.defendants?.photo_url ? (
                                                <img src={c.defendants.photo_url} alt="" className="h-[9.6rem] w-[9.6rem] rounded-none object-cover ring-2 ring-border -translate-x-[10px]" />
                                            ) : (
                                                <div className="h-[9.6rem] w-[9.6rem] rounded-none bg-muted flex items-center justify-center text-4xl font-bold text-muted-foreground -translate-x-[10px]">
                                                    {c.defendants?.full_name?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                            )}

                                            {/* Col 4 — Members stat box */}
                                            <div className="rounded-xl border bg-card p-4 flex flex-col items-center justify-center min-w-[130px] ml-[15px] mr-[15px]">
                                                <UserGroupIcon className="h-5 w-5 text-muted-foreground mb-2" />
                                                <p className="text-2xl font-bold">{members}</p>
                                                <p className="text-xs text-muted-foreground text-center">{members === 1 ? 'member' : 'members'}</p>
                                            </div>

                                            {/* Col 5 — Evidence stat box */}
                                            {evidence > 0 && (
                                                <div className="rounded-xl border bg-card p-4 flex flex-col items-center justify-center min-w-[130px]">
                                                    <DocumentTextIcon className="h-5 w-5 text-muted-foreground mb-2" />
                                                    <p className="text-2xl font-bold">{evidence}</p>
                                                    <p className="text-xs text-muted-foreground text-center">evidence</p>
                                                </div>
                                            )}

                                            {/* Col 6 — Spacer */}
                                            <div />

                                            {/* Col 7 — Edit button */}
                                            {EDITABLE_STATUSES.includes(c.status) && (
                                                <Button
                                                    variant="outline"
                                                    className="justify-self-end px-10 py-2 hover:border-primary hover:ring-2 hover:ring-primary/60 hover:ring-offset-0 transition-all duration-200"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        router.push(`/cases/${c.case_number}/edit`)
                                                    }}
                                                >
                                                    <PencilSquareIcon className="h-4 w-4 mr-2" />
                                                    Edit
                                                </Button>
                                            )}
                                        </div>

                                        {/* Vote bar — own compartment, separated by divider */}
                                        {isVoting && (
                                            <div className="border-t px-4 py-3 space-y-1.5">
                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <span className="font-medium text-foreground">{votes} / 400 votes</span>
                                                    <span>{Math.round((votes / 400) * 100)}% participation</span>
                                                </div>
                                                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-primary transition-all"
                                                        style={{ width: `${Math.min((votes / 400) * 100, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )
                        })
                    )}
                </TabsContent>

                {/* My Roles (case memberships) */}
                <TabsContent value="roles" className="space-y-3">
                    {memberships.length === 0 ? (
                        <EmptyCard message="No roles yet" cta="Browse Cases" href="/cases" />
                    ) : (
                        memberships.map((m: Membership) => {
                            const joinedDate = m.created_at ? new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
                            const isActive = m.status !== 'pending'
                            const roleConfig = ROLE_ICONS[m.role] || { icon: <UserIcon className="h-5 w-5" />, color: 'text-muted-foreground' }
                            return (
                                <Card
                                    key={`${m.case_id}-${m.role}`}
                                    className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer"
                                    onClick={() => m.cases?.case_number && router.push(`/cases/${m.cases.case_number}`)}
                                >
                                    <CardContent className="p-4">
                                        {/* Desktop layout: grid, mobile: flex stack */}
                                        <div className="hidden sm:grid items-center" style={{ gridTemplateColumns: 'auto 1fr auto auto' }}>
                                            {/* Col 1 — Role icon + case header */}
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`flex-shrink-0 ${roleConfig.color}`}>
                                                    {roleConfig.icon}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold">
                                                        {m.cases?.case_number} · {(m.cases?.defendants as any)?.full_name || 'Unknown defendant'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground capitalize">
                                                        {m.role.replace(/_/g, ' ')} · Joined {joinedDate}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Col 2 — Spacer */}
                                            <div />

                                            {/* Col 3 — Status indicator */}
                                            <div className="pl-3">
                                                {!isActive ? (
                                                    <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                                                        Pending
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                                                        Active
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        {/* Mobile layout */}
                                        <div className="sm:hidden space-y-2">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-start gap-2 flex-1 min-w-0">
                                                    <div className={`flex-shrink-0 mt-0.5 ${roleConfig.color}`}>
                                                        {roleConfig.icon}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold">
                                                            {m.cases?.case_number} · {(m.cases?.defendants as any)?.full_name || 'Unknown defendant'}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground capitalize">
                                                            {m.role.replace(/_/g, ' ')} · Joined {joinedDate}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    {!isActive ? (
                                                        <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                                                            Pending
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                                                            Active
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })
                    )}
                </TabsContent>

                {/* My Chats — redirects to /messages */}
                <TabsContent value="chats" />
            </Tabs>
            </div>

            {/* ── Account & Activity (Stat Boxes) ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Email box */}
                <div className="rounded-xl border bg-card p-4 flex flex-col items-center justify-center min-w-[100px] hover:shadow-md hover:border-primary/30 transition-all">
                    <EnvelopeIcon className="h-4 w-4 text-primary mb-2" />
                    <p className="text-sm font-bold text-center overflow-hidden text-ellipsis whitespace-nowrap max-w-full" title={user.email}>
                        {user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">Account</p>
                </div>

                {/* Language box */}
                <div className="rounded-xl border bg-card p-4 flex flex-col items-center justify-center min-w-[100px] hover:shadow-md hover:border-primary/30 transition-all">
                    <GlobeAltIcon className="h-4 w-4 text-emerald-500 mb-2" />
                    <p className="text-sm font-bold text-center">
                        {LANGUAGE_LABELS[profile.language || 'en'] || profile.language?.toUpperCase() || 'English'}
                    </p>
                    <p className="text-xs text-muted-foreground">Language</p>
                </div>

                {/* Last Active box — uses live auth data, not stale profile column */}
                <div className="rounded-xl border bg-card p-4 flex flex-col items-center justify-center min-w-[100px] hover:shadow-md hover:border-primary/30 transition-all">
                    <ClockIcon className="h-4 w-4 text-sky-500 mb-2" />
                    <p className="text-sm font-bold text-center">
                        {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">Last Active</p>
                </div>

                {/* Joined box */}
                <div className="rounded-xl border bg-card p-4 flex flex-col items-center justify-center min-w-[100px] hover:shadow-md hover:border-primary/30 transition-all">
                    <CalendarDaysIcon className="h-4 w-4 text-amber-500 mb-2" />
                    <p className="text-sm font-bold text-center">
                        {new Date(profile.joined_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-xs text-muted-foreground">Member Since</p>
                </div>
            </div>

        </div>
    )
}

function EmptyCard({ message, cta, href }: { message: string; cta?: string; href?: string }) {
    return (
        <div className="rounded-xl border border-dashed p-10 text-center">
            <p className="text-sm text-muted-foreground">{message}</p>
            {cta && href && (
                <a
                    href={href}
                    className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-md text-sm font-medium bg-muted/50 text-foreground/80 hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                    {cta}
                </a>
            )}
        </div>
    )
}
