'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ScaleIcon } from '@heroicons/react/24/outline'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/i18n'
import { FlagIcon } from '@/components/plaintiff-page/FlagIcon'

// Same country mapping as CaseTimeline
type CountryCode = 'AU' | 'TH' | 'AE' | 'VN' | 'CN' | 'US' | 'GB' | 'EU'

const locationToCountry: Record<string, CountryCode> = {
    'australia': 'AU', 'au': 'AU', 'melbourne': 'AU', 'brisbane': 'AU',
    'gold coast': 'AU', 'queensland': 'AU', 'sydney': 'AU', 'perth': 'AU',
    'thailand': 'TH', 'th': 'TH', 'bangkok': 'TH',
    'dubai': 'AE', 'uae': 'AE', 'united arab emirates': 'AE',
    'vietnam': 'VN', 'vn': 'VN', 'da nang': 'VN', 'hanoi': 'VN', 'ho chi minh': 'VN',
    'china': 'CN', 'cn': 'CN', 'beijing': 'CN', 'shanghai': 'CN',
    'usa': 'US', 'us': 'US', 'united states': 'US', 'america': 'US',
    'uk': 'GB', 'united kingdom': 'GB', 'england': 'GB', 'london': 'GB',
    'europe': 'EU', 'european': 'EU',
}

function getCountryCode(location: string | null): CountryCode | null {
    if (!location) return null
    const lower = location.toLowerCase()
    for (const [key, code] of Object.entries(locationToCountry)) {
        if (lower.includes(key)) return code
    }
    return null
}

function getCaseFlags(c: any): CountryCode[] {
    const codes = new Set<CountryCode>()
    for (const city of (c.timeline_cities || [])) {
        const code = getCountryCode(city)
        if (code) codes.add(code)
    }
    return Array.from(codes)
}

export default function CasesPage() {
    const { t } = useTranslation()
    const [cases, setCases] = useState<any[] | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCases = async () => {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('cases')
                .select(`
                    id,
                    case_number,
                    status,
                    case_types,
                    nominal_damages_claimed,
                    created_at,
                    verdict_at,
                    plaintiff_id,
                    defendants (
                        id,
                        full_name,
                        slug,
                        photo_url,
                        location
                    )
                `)
                .not('status', 'eq', 'draft')
                .order('created_at', { ascending: false })
                .limit(50)

            if (error) {
                setError(error.message)
                setLoading(false)
                return
            }

            const caseIds = (data || []).map((c: any) => c.id)

            // Fetch plaintiff profiles and timeline events in parallel
            const [profileRes, timelineRes] = await Promise.all([
                (async () => {
                    const plaintiffIds = [...new Set((data || []).map((c: any) => c.plaintiff_id).filter(Boolean))]
                    if (plaintiffIds.length === 0) return {}
                    const { data: userProfiles } = await supabase
                        .from('user_profiles')
                        .select('id, display_name, avatar_url')
                        .in('id', plaintiffIds)
                    const map: Record<string, { full_name: string | null; avatar_url: string | null }> = {}
                    userProfiles?.forEach((p: any) => { map[p.id] = { full_name: p.display_name, avatar_url: p.avatar_url } })
                    return map
                })(),
                (async () => {
                    // No FK registered so nested select fails — fetch separately and merge
                    if (caseIds.length === 0) return {}
                    const { data: events } = await supabase
                        .from('timeline_events')
                        .select('case_id, city')
                        .in('case_id', caseIds)
                    const map: Record<string, string[]> = {}
                    events?.forEach((e: any) => {
                        if (!map[e.case_id]) map[e.case_id] = []
                        if (e.city) map[e.case_id].push(e.city)
                    })
                    return map
                })(),
            ])

            const profileMap = profileRes as Record<string, { full_name: string | null; avatar_url: string | null }>
            const timelineMap = timelineRes as Record<string, string[]>

            setCases((data || []).map((c: any) => ({
                ...c,
                plaintiff: profileMap[c.plaintiff_id] || null,
                timeline_cities: timelineMap[c.id] || [],
            })))
            setLoading(false)
        }
        fetchCases()
    }, [])

    const statusColors: Record<string, string> = {
        pending: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
        pending_convergence: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
        admin_review: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        investigation: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
        judgment: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
        verdict_guilty: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
        verdict_innocent: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
        restitution: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
        resolved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        outstanding: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
    }

    if (loading) {
        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('cases.browseTitle')}</h1>
                    <p className="text-muted-foreground mt-1">{t('cases.browseDescription')}</p>
                </div>
                <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('cases.browseTitle')}</h1>
                <p className="text-muted-foreground mt-1">
                    {t('cases.browseDescription')}
                </p>
            </div>

            {/* Cases Count */}
            <p className="text-sm text-muted-foreground">
                {(cases || []).length} {t('cases.casesOnRecord')}
            </p>

            {/* Case Cards */}
            {(!cases || cases.length === 0) ? (
                <div className="rounded-xl border border-dashed p-12 text-center">
                    <p className="text-lg font-medium text-muted-foreground">{t('cases.noCases')}</p>
                    <p className="text-sm text-muted-foreground/60 mt-1">{t('cases.beFirst')}</p>
                    <Link href="/cases/new" className="inline-block mt-4">
                        <Badge className="bg-primary text-primary-foreground px-4 py-2 text-sm cursor-pointer hover:bg-primary/90 flex items-center gap-1.5">
                            <ScaleIcon className="h-4 w-4" /> {t('cases.fileCase')}
                        </Badge>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {cases.map((c: any) => {
                        const flags = getCaseFlags(c)
                        return (
                            <Link key={c.id} href={`/cases/${c.case_number}`}>
                                <Card className="hover:shadow-md transition-all hover:border-primary/30 cursor-pointer py-0">
                                    <CardContent className="p-0 pr-[1%]">
                                        {/* 5-col grid: plaintiff(fixed) | case-info(fixed) | defendant(fixed) | spacer(fills) | right-panel(auto) */}
                                        <div className="grid items-center" style={{ gridTemplateColumns: '9.6rem 22rem 9.6rem 1fr auto' }}>
                                            {/* Col 1 — Plaintiff avatar */}
                                            {c.plaintiff?.avatar_url ? (
                                                <img src={c.plaintiff.avatar_url} alt="" className="h-[9.6rem] w-[9.6rem] rounded-lg object-cover ring-2 ring-border" />
                                            ) : (
                                                <div className="h-[9.6rem] w-[9.6rem] rounded-lg bg-muted flex items-center justify-center text-4xl font-bold text-muted-foreground">
                                                    {c.plaintiff?.full_name?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                            )}

                                            {/* Col 2 — Case info (fixed width; longer titles truncate) */}
                                            <div className="space-y-1 overflow-hidden px-4">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-mono text-sm font-bold">{c.case_number}</span>
                                                    <Badge variant="outline" className={`text-xs capitalize ${statusColors[c.status] || ''}`}>
                                                        {c.status.replace(/_/g, ' ')}
                                                    </Badge>
                                                </div>
                                                {(c.plaintiff || c.defendants) && (
                                                    <p className="text-base font-semibold truncate">
                                                        {c.plaintiff?.full_name || 'Unknown'} vs. {c.defendants?.full_name || 'Unknown'}
                                                    </p>
                                                )}
                                                {c.case_types && c.case_types.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 overflow-hidden" style={{ maxHeight: '1.75rem' }}>
                                                        {c.case_types.slice(0, 3).map((type: string, i: number) => (
                                                            <Badge key={i} variant="secondary" className="text-xs capitalize">
                                                                {type.replace(/_/g, ' ')}
                                                            </Badge>
                                                        ))}
                                                        {c.case_types.length > 3 && (
                                                            <Badge variant="secondary" className="text-xs">+{c.case_types.length - 3}</Badge>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Col 3 — Defendant avatar (always at fixed position) */}
                                            {c.defendants?.photo_url ? (
                                                <img src={c.defendants.photo_url} alt="" className="h-[9.6rem] w-[9.6rem] rounded-lg object-cover ring-2 ring-border" />
                                            ) : (
                                                <div className="h-[9.6rem] w-[9.6rem] rounded-lg bg-muted flex items-center justify-center text-4xl font-bold text-muted-foreground">
                                                    {c.defendants?.full_name?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                            )}

                                            {/* Col 4 — Spacer */}
                                            <div />

                                            {/* Col 5 — Right panel: flags top, damages/date bottom */}
                                            <div className="flex flex-col justify-center gap-3 h-[9.6rem] pl-4 pr-2 items-end">
                                                {/* Top: damages + date */}
                                                <div className="flex gap-6 text-right">
                                                    {c.nominal_damages_claimed > 0 && (
                                                        <div>
                                                            <p className="text-xl font-bold">${c.nominal_damages_claimed.toLocaleString()}</p>
                                                            <p className="text-sm text-muted-foreground">{t('cases.damages')}</p>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-xl font-medium">
                                                            {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">{t('cases.filed')}</p>
                                                    </div>
                                                </div>
                                                {/* Bottom: country flags */}
                                                <div className="flex gap-2 items-center justify-end">
                                                    {flags.length > 0 ? flags.map(code => (
                                                        <FlagIcon key={code} countryCode={code} className="h-9 w-14 rounded shadow-sm" />
                                                    )) : <div className="h-9" />}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        )
                    })}
                </div>
            )}

            {error && (
                <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
                    {t('cases.errorLabel')}: {error}
                </div>
            )}
        </div>
    )
}
