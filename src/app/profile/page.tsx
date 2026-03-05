'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
    trust_score: number
    follower_count: number
    following_count: number
    case_count: number
    email: string | null
    joined_at: string
    last_active_at: string
}

type Membership = {
    case_id: string
    role: string
    status: string
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

function getTrustInfo(score: number) {
    if (score >= 80) return {
        label: 'Trusted contributor',
        color: 'text-green-600 dark:text-green-400',
        barColor: 'bg-green-500',
        border: 'border-green-500/20',
        bg: 'bg-green-500/5',
    }
    if (score >= 50) return {
        label: 'Active contributor',
        color: 'text-yellow-600 dark:text-yellow-400',
        barColor: 'bg-yellow-500',
        border: 'border-yellow-500/20',
        bg: 'bg-yellow-500/5',
    }
    if (score >= 20) return {
        label: 'New member',
        color: 'text-muted-foreground',
        barColor: 'bg-muted-foreground',
        border: 'border-border',
        bg: 'bg-muted/30',
    }
    return {
        label: 'Getting started',
        color: 'text-muted-foreground',
        barColor: 'bg-muted-foreground',
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
    const [cases, setCases] = useState<any[]>([])
    const [memberships, setMemberships] = useState<Membership[]>([])

    // Editable fields
    const [editName, setEditName] = useState('')
    const [editTagline, setEditTagline] = useState('')
    const [editBio, setEditBio] = useState('')
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

    const loadProfile = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }
        setUser(user)

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
            .select('id, case_number, status, case_types, created_at, defendants(full_name, slug)')
            .eq('plaintiff_id', user.id)
            .order('created_at', { ascending: false })

        setCases(userCases || [])

        // Load case memberships (joined as jury, witness, etc.)
        const { data: membershipData } = await supabase
            .from('case_roles')
            .select('case_id, role, status, cases(case_number, status, defendants(full_name))')
            .eq('user_id', user.id)
            .order('case_id', { ascending: false })

        setMemberships((membershipData || []) as Membership[])
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

    const trust = getTrustInfo(profile.trust_score)
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
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={e => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                        setAvatarFile(file)
                                        setAvatarPreview(URL.createObjectURL(file))
                                    }
                                }}
                            />
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
                {/* Hero stat: Trust Score */}
                <div className={`rounded-xl border p-4 ${trust.bg} ${trust.border}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('profile.trustScore')}</span>
                        <span className={`text-xl font-bold ${trust.color}`}>
                            {profile.trust_score}
                            <span className="text-sm font-normal text-muted-foreground">/100</span>
                        </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${trust.barColor}`}
                            style={{ width: `${profile.trust_score}%` }}
                        />
                    </div>
                    <p className={`text-xs mt-1.5 font-medium ${trust.color}`}>{trust.label}</p>
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

            {/* ── Cases & Roles Tabs ── */}
            <Tabs defaultValue="cases" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="cases">{t('profile.myCases')} ({cases.length})</TabsTrigger>
                    <TabsTrigger value="roles">{t('profile.myRoles')} ({memberships.length})</TabsTrigger>
                </TabsList>

                {/* My Cases */}
                <TabsContent value="cases" className="space-y-3">
                    {cases.length === 0 ? (
                        <EmptyCard message={t('profile.noCases')} cta={t('cases.fileCase')} href="/cases/new" />
                    ) : (
                        cases.map((c: any) => (
                            <Card
                                key={c.id}
                                className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer"
                                onClick={() => router.push(`/cases/${c.case_number}`)}
                            >
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className="font-mono text-sm font-bold">{c.case_number}</span>
                                            <Badge variant="outline" className={`text-xs capitalize ${STATUS_COLORS[c.status] || ''}`}>
                                                {STATUS_LABELS[c.status] || c.status.replace(/_/g, ' ')}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">vs. {c.defendants?.full_name || 'Unknown'}</p>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        {EDITABLE_STATUSES.includes(c.status) && (
                                            <a
                                                href={`/cases/${c.case_number}/edit`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                <PencilSquareIcon className="h-3.5 w-3.5" />
                                                Edit
                                            </a>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                {/* My Roles (case memberships) */}
                <TabsContent value="roles" className="space-y-3">
                    {memberships.length === 0 ? (
                        <EmptyCard message={t('profile.noRoles')} cta="Browse Cases" href="/cases" />
                    ) : (
                        memberships.map((m: Membership) => (
                            <Card
                                key={`${m.case_id}-${m.role}`}
                                className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer"
                                onClick={() => m.cases?.case_number && router.push(`/cases/${m.cases.case_number}`)}
                            >
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className="font-mono text-sm font-bold">{m.cases?.case_number || '—'}</span>
                                            <Badge variant="outline" className="text-xs capitalize bg-primary/10 text-primary border-primary/20">
                                                {m.role.replace(/_/g, ' ')}
                                            </Badge>
                                            {m.status === 'pending' && (
                                                <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                                                    Pending approval
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            vs. {(m.cases?.defendants as any)?.full_name || 'Unknown'}
                                        </p>
                                    </div>
                                    {m.cases?.status && (
                                        <Badge variant="outline" className={`text-xs capitalize flex-shrink-0 ${STATUS_COLORS[m.cases.status] || ''}`}>
                                            {STATUS_LABELS[m.cases.status] || m.cases.status.replace(/_/g, ' ')}
                                        </Badge>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>
            </Tabs>

            {/* ── Account & Activity ── */}
            <Card>
                <CardContent className="p-5 space-y-5">
                    {/* Account section */}
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Account</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-center gap-2.5 text-sm">
                                <EnvelopeIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-sm">
                                <GlobeAltIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span>{LANGUAGE_LABELS[profile.language || 'en'] || profile.language?.toUpperCase() || 'English'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Activity section */}
                    <div className="border-t pt-5">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Activity</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-center gap-2.5 text-sm">
                                <ClockIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span>Active {new Date(profile.last_active_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-sm">
                                <CalendarDaysIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span>Joined {new Date(profile.joined_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

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
