'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ScaleIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/i18n'
import { FlagIcon } from '@/components/plaintiff-page/FlagIcon'
import { JoinCaseModal } from '@/components/cases/JoinCaseModal'

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

// Statuses where the Join Case button is shown
const JOINABLE_STATUSES = new Set([
  'admin_review',
  'investigation',
  'judgment',
  'verdict_guilty',
  'verdict_innocent',
  'resolved',
])

const VALID_ROLES = [
  'jury_member', 'witness', 'expert_witness',
  'investigator', 'attorney', 'law_enforcement',
] as const

type ModalTarget = {
  caseNumber: string
  plaintiffName: string
  defendantName: string
  preselectedRole: string | null
}

const statusLabels: Record<string, string> = {
  pending_convergence: 'Pending 2nd Plaintiff',
}

const statusColors: Record<string, string> = {
  pending: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  pending_convergence: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  admin_review: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
  investigation: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  judgment: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
  verdict_guilty: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  verdict_innocent: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  resolved: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
}

function CasesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useTranslation()

  const [cases, setCases] = useState<any[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  // caseId (UUID) -> role string for current user's memberships
  const [memberships, setMemberships] = useState<Record<string, string>>({})
  const [membershipsLoading, setMembershipsLoading] = useState(false)
  const [modalTarget, setModalTarget] = useState<ModalTarget | null>(null)

  // Primary data fetch: session + cases + profiles + timeline
  useEffect(() => {
    const run = async () => {
      const supabase = createClient()

      // Get session (fast, local cookie)
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || null)

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
      const plaintiffIds = [...new Set((data || []).map((c: any) => c.plaintiff_id).filter(Boolean))]

      const [profileRes, timelineRes] = await Promise.all([
        (async () => {
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

      const enriched = (data || []).map((c: any) => ({
        ...c,
        plaintiff: profileMap[c.plaintiff_id] || null,
        timeline_cities: timelineMap[c.id] || [],
      }))

      setCases(enriched)
      setLoading(false)

      // Fetch memberships for authenticated users
      if (user && caseIds.length > 0) {
        setMembershipsLoading(true)
        try {
          const res = await fetch(`/api/cases/memberships?case_ids=${caseIds.join(',')}`)
          const map: Record<string, string> = {}
          if (res.ok) {
            const { memberships: raw } = await res.json()
            raw?.forEach((m: any) => { map[m.case_id] = m.role })
          }
          // Mark cases where the user is the plaintiff
          enriched.forEach((c: any) => {
            if (c.plaintiff_id === user.id) map[c.id] = 'plaintiff'
          })
          setMemberships(map)
        } catch {
          // non-fatal — buttons will show "Join Case" as default
        } finally {
          setMembershipsLoading(false)
        }
      }
    }

    run()
  }, [])

  // Auto-open modal when returning from login with ?join= param
  useEffect(() => {
    const joinCaseNumber = searchParams.get('join')
    const joinRole = searchParams.get('role')
    if (!joinCaseNumber || !cases || !userId) return

    const target = cases.find(c => c.case_number === joinCaseNumber)
    if (!target || !JOINABLE_STATUSES.has(target.status)) return

    // Don't open if already a member
    if (memberships[target.id]) return

    setModalTarget({
      caseNumber: target.case_number,
      plaintiffName: target.plaintiff?.full_name || 'Plaintiff',
      defendantName: target.defendants?.full_name || 'Defendant',
      preselectedRole: (VALID_ROLES as readonly string[]).includes(joinRole || '') ? joinRole : null,
    })
  }, [searchParams, cases, userId, memberships])

  const openModal = (c: any) => {
    setModalTarget({
      caseNumber: c.case_number,
      plaintiffName: c.plaintiff?.full_name || 'Plaintiff',
      defendantName: c.defendants?.full_name || 'Defendant',
      preselectedRole: null,
    })
  }

  const handleJoined = (caseNumber: string, role: string) => {
    const c = cases?.find(x => x.case_number === caseNumber)
    if (c) {
      setMemberships(prev => ({ ...prev, [c.id]: role }))
    }
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
        <p className="text-muted-foreground mt-1">{t('cases.browseDescription')}</p>
      </div>

      <p className="text-sm text-muted-foreground">
        {(cases || []).length} {t('cases.casesOnRecord')}
      </p>

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
        <div className="px-[10%]"><div className="grid gap-4">
          {cases.map((c: any) => {
            const flags = getCaseFlags(c)
            const isJoinable = JOINABLE_STATUSES.has(c.status)
            const existingRole = memberships[c.id]
            const showJoinButton = isJoinable && !membershipsLoading

            return (
              <Card
                key={c.id}
                className="hover:shadow-md transition-all hover:border-primary/30 cursor-pointer py-0"
                onClick={() => router.push(`/cases/${c.case_number}`)}
              >
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

                    {/* Col 2 — Case info */}
                    <div className="space-y-1 overflow-hidden px-4 leading-loose">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold">{c.case_number}</span>
                        <Badge variant="outline" className={`text-xs capitalize ${statusColors[c.status] || ''}`}>
                          {statusLabels[c.status] || c.status.replace(/_/g, ' ')}
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
                      {/* Damages | Filed — bottom row */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {c.nominal_damages_claimed > 0 && (
                          <>
                            <span>
                              {t('cases.damages')} <span className="font-semibold text-foreground">${c.nominal_damages_claimed.toLocaleString()}</span>
                            </span>
                            <span className="text-muted-foreground/40">|</span>
                          </>
                        )}
                        <span>
                          {t('cases.filed')} <span className="font-semibold text-foreground">{new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </span>
                      </div>
                    </div>

                    {/* Col 3 — Defendant avatar */}
                    {c.defendants?.photo_url ? (
                      <img src={c.defendants.photo_url} alt="" className="h-[9.6rem] w-[9.6rem] rounded-lg object-cover ring-2 ring-border -translate-x-[10px]" />
                    ) : (
                      <div className="h-[9.6rem] w-[9.6rem] rounded-lg bg-muted flex items-center justify-center text-4xl font-bold text-muted-foreground -translate-x-[10px]">
                        {c.defendants?.full_name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}

                    {/* Col 4 — Spacer */}
                    <div />

                    {/* Col 5 — Right panel */}
                    <div className="flex flex-col justify-between gap-2 h-[9.6rem] pl-4 pr-2 py-3 items-end">
                      {/* Top: Join button or membership badge — always visible */}
                      <div onClick={e => e.stopPropagation()}>
                        {existingRole ? (
                          // Already joined — greyed out badge with role info
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted/50 text-foreground/60 text-xs font-medium cursor-default select-none">
                            <UserGroupIcon className="h-3.5 w-3.5" />
                            <span>{t('join.alreadyMember')} <span className="capitalize">{existingRole.replace(/_/g, ' ')}</span>.</span>
                          </div>
                        ) : membershipsLoading ? (
                          // Loading skeleton
                          <div className="h-7 w-28 rounded-md bg-muted/40 animate-pulse" />
                        ) : isJoinable ? (
                          // Open case, not yet joined — active button
                          <button
                            onClick={() => openModal(c)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            <UserGroupIcon className="h-3.5 w-3.5" />
                            {t('join.joinCase')}
                          </button>
                        ) : (
                          // Case not yet open (pending, draft, etc.) — greyed out
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted/50 text-foreground/40 text-xs font-medium cursor-default select-none">
                            <UserGroupIcon className="h-3.5 w-3.5" />
                            <span>{t('join.pendingReview')}</span>
                          </div>
                        )}
                      </div>

                      {/* Center: flags */}
                      <div className="flex gap-2 items-center justify-center">
                        {flags.length > 0 ? flags.map(code => (
                          <FlagIcon key={code} countryCode={code} className="h-9 w-14 rounded shadow-sm" />
                        )) : <div className="h-9" />}
                      </div>

                      {/* Bottom spacer */}
                      <div />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div></div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          {t('cases.errorLabel')}: {error}
        </div>
      )}

      {/* Join Case Modal */}
      {modalTarget && (
        <JoinCaseModal
          caseNumber={modalTarget.caseNumber}
          plaintiffName={modalTarget.plaintiffName}
          defendantName={modalTarget.defendantName}
          isAuthenticated={!!userId}
          preselectedRole={modalTarget.preselectedRole}
          loginUrl={`/login?redirect=/cases&join=${modalTarget.caseNumber}&role=jury_member`}
          onClose={() => setModalTarget(null)}
          onJoined={handleJoined}
        />
      )}
    </div>
  )
}

export default function CasesPage() {
  return (
    <Suspense fallback={
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Case Files</h1>
          <p className="text-muted-foreground mt-1">Browse all active and resolved cases.</p>
        </div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    }>
      <CasesContent />
    </Suspense>
  )
}
