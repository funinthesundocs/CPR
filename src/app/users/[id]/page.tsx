'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/i18n'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    CheckBadgeIcon,
    ScaleIcon,
    CalendarDaysIcon,
    UserGroupIcon,
    EnvelopeIcon,
    ShieldCheckIcon,
} from '@heroicons/react/24/outline'

type PublicProfile = {
    id: string
    display_name: string
    tagline: string | null
    avatar_url: string | null
    bio: string
    profile_completion: number
    profile_progress: number
    joined_at: string
    is_verified: boolean
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

type UserRole = {
    role: string
    case_id: string
    cases: any
}

const ITEMS_PER_PAGE = 12

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

function getProgressInfo(score: number, t: (key: string) => string) {
    if (score >= 80) return { label: t('userProfile.excellent'), color: 'text-green-600', barColor: 'bg-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' }
    if (score >= 60) return { label: t('userProfile.good'), color: 'text-blue-600', barColor: 'bg-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' }
    if (score >= 40) return { label: t('userProfile.fair'), color: 'text-yellow-600', barColor: 'bg-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' }
    return { label: t('userProfile.low'), color: 'text-red-600', barColor: 'bg-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' }
}

export default function PublicUserProfile() {
    const router = useRouter()
    const params = useParams() as { id: string }
    const supabase = createClient()
    const { t } = useTranslation()
    const [profile, setProfile] = useState<PublicProfile | null>(null)
    const [userCases, setUserCases] = useState<UserCase[]>([])
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)
    const [caseOffset, setCaseOffset] = useState(0)
    const [hasMoreCases, setHasMoreCases] = useState(false)
    const [currentUser, setCurrentUser] = useState<string | null>(null)
    const [memberCounts, setMemberCounts] = useState<Record<string, number>>({})
    const [evidenceCounts, setEvidenceCounts] = useState<Record<string, number>>({})
    const [voteCounts, setVoteCounts] = useState<Record<string, number>>({})

    // Load current user for message button
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setCurrentUser(user?.id || null)
        }
        getUser()
    }, [supabase])

    // Load profile and cases
    useEffect(() => {
        const loadProfile = async () => {
            try {
                // Fetch user profile
                const { data: profileData, error: profileError } = await supabase
                    .from('user_profiles')
                    .select('id, display_name, tagline, avatar_url, bio, profile_completion, profile_progress, joined_at, is_verified')
                    .eq('id', params.id)
                    .single()

                if (profileError || !profileData) {
                    setNotFound(true)
                    setLoading(false)
                    return
                }

                setProfile(profileData as PublicProfile)

                // Fetch cases filed by user (paginated)
                const { data: filedCasesRaw } = await supabase
                    .from('cases')
                    .select('id, case_number, status, case_types, created_at, nominal_damages_claimed, defendants(full_name, slug, photo_url)')
                    .eq('plaintiff_id', params.id)
                    .order('created_at', { ascending: false })
                    .range(caseOffset, caseOffset + ITEMS_PER_PAGE - 1)

                const filedCases = (filedCasesRaw || []) as unknown as UserCase[]

                // Fetch joined roles/cases (paginated)
                const { data: joinedRolesRaw } = await supabase
                    .from('case_roles')
                    .select('role, case_id, cases(id, case_number, status, case_types, created_at, nominal_damages_claimed, defendants(full_name, slug, photo_url))')
                    .eq('user_id', params.id)
                    .order('created_at', { ascending: false })
                    .range(caseOffset, caseOffset + ITEMS_PER_PAGE - 1)

                const joinedRoles = (joinedRolesRaw || []) as unknown as UserRole[]

                // Merge cases: filed + joined (deduplicate by case_id)
                const merged = new Map<string, UserCase>()

                // Add filed cases
                filedCases?.forEach(c => {
                    merged.set(c.id, {
                        id: c.id,
                        case_number: c.case_number,
                        status: c.status,
                        case_types: c.case_types,
                        created_at: c.created_at,
                        nominal_damages_claimed: c.nominal_damages_claimed,
                        defendants: c.defendants,
                    })
                })

                // Add joined cases (only if not already in map)
                joinedRoles?.forEach(r => {
                    if (r.cases && !merged.has(r.case_id)) {
                        merged.set(r.case_id, {
                            id: r.cases.id,
                            case_number: r.cases.case_number,
                            status: r.cases.status,
                            case_types: r.cases.case_types,
                            created_at: r.cases.created_at,
                            nominal_damages_claimed: r.cases.nominal_damages_claimed,
                            defendants: r.cases.defendants,
                        })
                    }
                })

                const cases = Array.from(merged.values())

                // Fetch stat counts for all cases
                const caseIds = cases.map(c => c.id)

                if (caseIds.length > 0) {
                    const [membersRes, evidenceRes, votesRes] = await Promise.all([
                        supabase.from('case_roles').select('case_id', { count: 'exact' }).in('case_id', caseIds),
                        supabase.from('evidence').select('case_id', { count: 'exact' }).in('case_id', caseIds),
                        supabase.from('votes').select('case_id', { count: 'exact' }).in('case_id', caseIds),
                    ])

                    const newMemberCounts: Record<string, number> = {}
                    const newEvidenceCounts: Record<string, number> = {}
                    const newVoteCounts: Record<string, number> = {}

                    // Build counts from response
                    if (membersRes.data) {
                        membersRes.data.forEach((m: any) => {
                            newMemberCounts[m.case_id] = (newMemberCounts[m.case_id] || 0) + 1
                        })
                    }

                    if (evidenceRes.data) {
                        evidenceRes.data.forEach((e: any) => {
                            newEvidenceCounts[e.case_id] = (newEvidenceCounts[e.case_id] || 0) + 1
                        })
                    }

                    if (votesRes.data) {
                        votesRes.data.forEach((v: any) => {
                            newVoteCounts[v.case_id] = (newVoteCounts[v.case_id] || 0) + 1
                        })
                    }

                    // Merge with existing counts if appending
                    if (caseOffset === 0) {
                        setMemberCounts(newMemberCounts)
                        setEvidenceCounts(newEvidenceCounts)
                        setVoteCounts(newVoteCounts)
                    } else {
                        setMemberCounts(prev => ({ ...prev, ...newMemberCounts }))
                        setEvidenceCounts(prev => ({ ...prev, ...newEvidenceCounts }))
                        setVoteCounts(prev => ({ ...prev, ...newVoteCounts }))
                    }
                }

                // If loading first page (offset 0), replace cases; otherwise append
                if (caseOffset === 0) {
                    setUserCases(cases)
                } else {
                    setUserCases(prev => [...prev, ...cases])
                }

                // Has more if this page returned a full page of results
                setHasMoreCases(cases.length === ITEMS_PER_PAGE)

                if (caseOffset === 0) {
                    setLoading(false)
                }
            } catch (err) {
                console.error('Error loading profile:', err)
                if (caseOffset === 0) {
                    setNotFound(true)
                    setLoading(false)
                }
            }
        }

        loadProfile()
    }, [params.id, supabase, caseOffset])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        )
    }

    if (notFound || !profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
                <p className="text-muted-foreground mb-4">This user profile doesn't exist or is not accessible.</p>
                <Button onClick={() => router.push('/cases')}>{t('userProfile.browseCases')}</Button>
            </div>
        )
    }

    const progress = getProgressInfo(profile.profile_progress, t)
    const joinedDate = new Date(profile.joined_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    return (
        <div className="px-[10%] space-y-5">
            {/* ── Hero Card ── */}
            <div className="rounded-2xl border bg-card p-6">
                <div className="flex flex-col sm:flex-row items-start gap-5">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                        {profile.avatar_url ? (
                            <img
                                src={profile.avatar_url}
                                alt={profile.display_name}
                                className="h-24 w-24 rounded-2xl object-cover ring-2 ring-border shadow-md"
                            />
                        ) : (
                            <div className="h-24 w-24 rounded-2xl bg-muted flex items-center justify-center text-3xl font-bold text-muted-foreground shadow-md">
                                {profile.display_name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                        )}
                    </div>

                    {/* Identity */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h1 className="text-2xl font-bold">{profile.display_name}</h1>
                            {profile.is_verified && <CheckBadgeIcon className="h-6 w-6 text-blue-500 flex-shrink-0" title={t('userProfile.verified')} />}
                        </div>

                        {profile.tagline && <p className="text-sm text-muted-foreground mb-3">{profile.tagline}</p>}

                        {/* Completion Bar */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-semibold text-muted-foreground uppercase">{t('userProfile.profileLabel')}</span>
                                <span className="text-xs font-semibold text-muted-foreground">{profile.profile_completion}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-primary transition-all"
                                    style={{ width: `${profile.profile_completion}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Participation Score ── */}
            <div className={`rounded-xl border p-4 ${progress.bg} ${progress.border}`}>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">{t('userProfile.participationScore')}</span>
                    <span className={`text-xl font-bold ${progress.color}`}>
                        {profile.profile_progress}
                        <span className="text-sm font-normal text-muted-foreground">/100</span>
                    </span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${progress.barColor}`} style={{ width: `${profile.profile_progress}%` }} />
                </div>
                <p className={`text-xs mt-2 font-medium ${progress.color}`}>{progress.label}</p>
            </div>

            {/* ── Member Info ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border bg-card p-4 flex items-center gap-2.5">
                    <CalendarDaysIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div>
                        <p className="text-xs text-muted-foreground">{t('userProfile.memberSince')}</p>
                        <p className="text-sm font-bold">{joinedDate}</p>
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-4 flex items-center gap-2.5">
                    <ScaleIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div>
                        <p className="text-xs text-muted-foreground">{t('userProfile.cases')}</p>
                        <p className="text-sm font-bold">{userCases.length}</p>
                    </div>
                </div>
            </div>

            {/* ── Bio ── */}
            {profile.bio && (
                <div className="rounded-xl border bg-card px-5 py-4">
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed text-justify">{profile.bio}</p>
                </div>
            )}

            {/* ── Cases ── */}
            {userCases.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">{t('userProfile.casesInvolved')}</h2>
                    {userCases.map(c => {
                        const members = memberCounts[c.id] || 1
                        const evidence = evidenceCounts[c.id] || 0
                        const filedDate = new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        return (
                            <Card
                                key={c.id}
                                className="hover:shadow-md transition-all hover:border-primary/30 cursor-pointer py-0"
                                onClick={() => router.push(`/cases/${c.case_number}`)}
                            >
                                <CardContent className="p-0 pr-4">
                                    {/* Grid: plaintiff(fixed) | case-info(fixed) | defendant(fixed) | members-box(auto) | evidence-box(auto) | spacer(fills) */}
                                    <div className="grid items-center" style={{ gridTemplateColumns: '9.6rem 22rem 9.6rem auto auto 1fr' }}>

                                        {/* Col 1 — Plaintiff avatar */}
                                        {profile?.avatar_url ? (
                                            <img src={profile.avatar_url} alt="" className="h-[9.6rem] w-[9.6rem] rounded-tl-lg object-cover ring-2 ring-border" />
                                        ) : (
                                            <div className="h-[9.6rem] w-[9.6rem] rounded-tl-lg bg-muted flex items-center justify-center text-4xl font-bold text-muted-foreground">
                                                {profile?.display_name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                        )}

                                        {/* Col 2 — Case info */}
                                        <div className="space-y-1 overflow-hidden px-4 leading-loose">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-mono text-sm font-bold">{c.case_number}</span>
                                                <Badge variant="outline" className={`text-xs capitalize ${STATUS_COLORS[c.status] || ''}`}>
                                                    {c.status.replace(/_/g, ' ')}
                                                </Badge>
                                            </div>
                                            <p className="text-base font-semibold truncate">
                                                {profile?.display_name} vs. {c.defendants?.full_name || t('userProfile.unknownDefendant')}
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
                                                        <span>{t('userProfile.damages')} <span className="font-semibold text-foreground">${c.nominal_damages_claimed!.toLocaleString()}</span></span>
                                                        <span className="text-muted-foreground/40">|</span>
                                                    </>
                                                )}
                                                <span>{t('userProfile.filed')} <span className="font-semibold text-foreground">{filedDate}</span></span>
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
                                            <ShieldCheckIcon className="h-7 w-7 text-muted-foreground mb-2" />
                                            <p className="text-2xl font-bold">{members}</p>
                                            <p className="text-xs text-muted-foreground text-center">{members === 1 ? t('userProfile.member') : t('userProfile.members')}</p>
                                        </div>

                                        {/* Col 5 — Evidence stat box */}
                                        {evidence > 0 && (
                                            <div className="rounded-xl border bg-card p-4 flex flex-col items-center justify-center min-w-[130px]">
                                                <ScaleIcon className="h-7 w-7 text-muted-foreground mb-2" />
                                                <p className="text-2xl font-bold">{evidence}</p>
                                                <p className="text-xs text-muted-foreground text-center">{t('userProfile.evidence')}</p>
                                            </div>
                                        )}

                                        {/* Col 6 — Spacer */}
                                        <div />
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                    {hasMoreCases && (
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setCaseOffset(caseOffset + ITEMS_PER_PAGE)}
                        >
                            {t('userProfile.loadMore')}
                        </Button>
                    )}
                    {!hasMoreCases && userCases.length > 0 && (
                        <p className="text-xs text-muted-foreground text-center py-4">{t('userProfile.allCasesSeen')}</p>
                    )}
                </div>
            )}

            {userCases.length === 0 && (
                <div className="rounded-xl border border-dashed bg-muted/30 p-10 text-center">
                    <p className="text-sm text-muted-foreground">{t('userProfile.notInvolved')}</p>
                </div>
            )}

            {/* ── Message CTA ── */}
            <div className="flex gap-3">
                <Button
                    className="flex-1"
                    onClick={() => {
                        if (currentUser) {
                            router.push(`/messages?user_id=${params.id}`)
                        } else {
                            router.push(`/login?next=/users/${params.id}`)
                        }
                    }}
                >
                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                    {t('userProfile.sendMessage')}
                </Button>
            </div>
        </div>
    )
}
