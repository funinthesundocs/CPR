import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PlaintiffPageClient } from './client'
import { readFile, readdir } from 'fs/promises'
import { join } from 'path'

export const revalidate = 0

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: defendant } = await supabase
    .from('defendants')
    .select('full_name, location')
    .eq('slug', slug)
    .single()

  if (!defendant) return { title: 'Defendant Not Found' }

  return {
    title: `${defendant.full_name} | Court of Public Record`,
    description: `Public record for ${defendant.full_name}. All cases filed against this defendant.`,
    openGraph: {
      title: defendant.full_name,
      description: `Public record for ${defendant.full_name}.`,
      type: 'article',
    },
  }
}

export default async function DefendantDetailPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch defendant by slug
  const { data: defendant, error: defError } = await supabase
    .from('defendants')
    .select('*')
    .eq('slug', slug)
    .single()

  if (defError || !defendant) notFound()

  // Fetch all cases for this defendant
  const { data: allCases } = await supabase
    .from('cases')
    .select('*')
    .eq('defendant_id', defendant.id)
    .order('created_at')

  const cases = allCases || []
  if (cases.length === 0) notFound()

  // Use the first case as the primary case for now
  const caseData = cases[0]

  const plaintiffId = caseData.plaintiff_id
  const caseIds = cases.map((c: any) => c.id)
  const plaintiffIds = cases.map((c: any) => c.plaintiff_id).filter(Boolean)

  // Parallel queries — primary case data + all-cases batch data
  const [
    { data: timeline },
    { data: evidence },
    { data: witnesses },
    { data: financialImpacts },
    { data: plaintiffProfile },
    { data: allFinancialImpacts },
    { data: allPlaintiffProfiles },
    { data: allTimelineEvents },
    { data: allEvidence },
  ] = await Promise.all([
    supabase.from('timeline_events').select('*').eq('case_id', caseData.id).order('created_at'),
    supabase.from('evidence').select('*').eq('case_id', caseData.id).order('created_at'),
    supabase.from('witnesses').select('*').eq('case_id', caseData.id),
    supabase.from('financial_impacts').select('*').eq('case_id', caseData.id).maybeSingle(),
    plaintiffId
      ? supabase.from('user_profiles').select('id, display_name, avatar_url').eq('id', plaintiffId).maybeSingle()
      : Promise.resolve({ data: null }),
    // All financial impacts across all cases
    supabase.from('financial_impacts').select('*').in('case_id', caseIds),
    // All plaintiff profiles across all cases
    plaintiffIds.length > 0
      ? supabase.from('user_profiles').select('id, display_name, avatar_url').in('id', plaintiffIds)
      : Promise.resolve({ data: [] }),
    // All timeline events across all cases (full select — enriched for timeline + map + country)
    supabase.from('timeline_events').select('*').in('case_id', caseIds),
    // All evidence across all cases
    supabase.from('evidence').select('*').in('case_id', caseIds).order('created_at'),
  ])

  const relationship = (caseData.relationship_narrative as any) || {}
  const promise = (caseData.promise_narrative as any) || {}
  const betrayal = (caseData.betrayal_narrative as any) || {}
  const impact = (caseData.personal_impact as any) || {}
  const legal = (caseData.legal_actions as any) || {}
  const story = (caseData.story_narrative as any) || {}

  // Financial total
  const fi = financialImpacts as any
  const financialTotal = fi
    ? (fi.direct_payments || 0) + (fi.lost_wages || 0) + (fi.property_loss || 0) +
      (fi.legal_fees || 0) + (fi.medical_costs || 0) + (fi.credit_damage || 0) + (fi.other_amount || 0)
    : (caseData.nominal_damages_claimed || 0)

  // Years active — use ALL timeline events across all cases
  const parseTs = (s: string) => {
    if (!s) return 0
    const d = new Date(s)
    if (!isNaN(d.getTime())) return d.getTime()
    const y = parseInt(s)
    return isNaN(y) ? 0 : new Date(`${y}-01-01`).getTime()
  }
  const allYears = (allTimelineEvents || [])
    .map((t: any) => parseInt(t.date_or_year))
    .filter((y: number) => !isNaN(y) && y > 1900 && y <= new Date().getFullYear() + 1)
  const minYear = allYears.length > 0 ? Math.min(...allYears) : null
  const maxYear = allYears.length > 0 ? Math.max(...allYears) : null

  // Testimony fields
  const testimonyFields = [
    relationship.first_interaction && { label: 'How They Met', value: relationship.first_interaction },
    relationship.early_warnings && { label: 'Early Warning Signs', value: relationship.early_warnings },
    promise.agreement_terms && { label: 'What Was Promised', value: promise.agreement_terms },
    promise.evidence_of_trust && { label: 'Evidence of Trust', value: promise.evidence_of_trust },
    betrayal.what_happened && { label: 'What Happened', value: betrayal.what_happened },
    betrayal.primary_incident && { label: 'The Turning Point', value: betrayal.primary_incident },
    impact.emotional && { label: 'Emotional Impact', value: impact.emotional },
    impact.wish_understood && { label: 'What They Want Understood', value: impact.wish_understood },
    legal.why_filing && { label: 'Why Filing', value: legal.why_filing },
  ].filter(Boolean) as { label: string; value: string }[]

  // Info boxes — accordion-ready: primary = first line, extras = accordion items
  // Aliases: aggregate from defendant record + all cases
  const allAliases = Array.from(new Set([
    ...(defendant.aliases || []),
    ...cases.flatMap((c: any) => {
      const s = (c.story_narrative as any) || {}
      return s.aliases ? (Array.isArray(s.aliases) ? s.aliases : [s.aliases]) : []
    }),
  ].filter(Boolean))) as string[]

  // Business names: aggregate from defendant record + all cases
  const allBusinessNames = Array.from(new Set([
    ...(defendant.business_names || []),
    ...cases.flatMap((c: any) => {
      const s = (c.story_narrative as any) || {}
      const names: string[] = []
      if (s.business_name) names.push(s.business_name)
      if (s.business_names) names.push(...(Array.isArray(s.business_names) ? s.business_names : [s.business_names]))
      return names
    }),
  ].filter(Boolean))) as string[]

  const infoBoxes = [
    {
      label: 'Known Aliases',
      primary: allAliases.length > 0 ? allAliases[0] : 'None on record',
      extras: allAliases.length > 1 ? allAliases.slice(1) : undefined,
    },
    {
      label: 'Business Name(s)',
      primary: allBusinessNames.length > 0 ? allBusinessNames[0] : 'See case details',
      extras: allBusinessNames.length > 1 ? allBusinessNames.slice(1) : undefined,
    },
    {
      label: 'Years Active',
      primary: minYear && maxYear ? `${minYear} \u2013 ${maxYear}` : 'See timeline',
    },
    {
      label: 'Victims on Record',
      primary: `${cases.length}`,
      primaryClass: 'text-[22px]',
    },
  ]

  // Aggregate declared evidence from ALL cases, tagged with case_id so client can filter per plaintiff
  const evidenceInventory = cases.flatMap((c: any) => {
    const s = (c.story_narrative as any) || {}
    return (s.evidence_inventory || []).map((item: any) => ({ ...item, case_id: c.id }))
  })

  const votingOpen = ['judgment', 'investigation', 'pending_convergence'].includes(caseData.status)

  const plaintiffName = plaintiffProfile?.display_name || 'Plaintiff'

  // Artifact slug — defendant page uses defendant slug as artifact folder
  const artifactSlug = slug

  // Notebook summary
  let notebookSummary = story.one_line_summary || ''
  try {
    const summaryPath = join(process.cwd(), '.agent', 'artifacts', artifactSlug, 'notebook-summary.txt')
    notebookSummary = await readFile(summaryPath, 'utf-8')
  } catch { /* fallback to DB */ }

  // Briefing doc
  let briefingContent = story.body || ''
  try {
    const briefingPath = join(process.cwd(), '.agent', 'artifacts', artifactSlug, 'briefing.md')
    briefingContent = await readFile(briefingPath, 'utf-8')
  } catch { /* fallback to DB */ }

  // Tagline
  let tagline = story.one_line_summary || ''
  try {
    const taglinePath = join(process.cwd(), '.agent', 'artifacts', artifactSlug, 'tagline.txt')
    tagline = (await readFile(taglinePath, 'utf-8')).trim()
  } catch { /* fallback to DB */ }

  // Random summary images
  const POOL_DIR = join(process.cwd(), 'public', 'case-summary-pool')
  const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp'])
  let summaryImage1Url = '/case-summary-pool/case-summary-1.png'
  let summaryImage2Url = '/case-summary-pool/case-summary-2.png'
  try {
    const files = (await readdir(POOL_DIR)).filter(f =>
      IMAGE_EXTENSIONS.has(f.slice(f.lastIndexOf('.')).toLowerCase())
    )
    if (files.length >= 2) {
      const shuffled = [...files]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      summaryImage1Url = `/case-summary-pool/${shuffled[0]}`
      summaryImage2Url = `/case-summary-pool/${shuffled[1]}`
    } else if (files.length === 1) {
      summaryImage1Url = `/case-summary-pool/${files[0]}`
      summaryImage2Url = `/case-summary-pool/${files[0]}`
    }
  } catch { /* pool folder missing */ }

  const artifactBase = `/artifacts/${artifactSlug}`

  const caseNarratives = {
    defendant_name: defendant.full_name,
    defendant_location: defendant.location,
    defendant_aliases: defendant.aliases,
    relationship_type: caseData.relationship_type,
    relationship_duration: caseData.relationship_duration,
    first_interaction: relationship.first_interaction,
    early_warnings: relationship.early_warnings,
    agreement_terms: promise.agreement_terms,
    reasonable_expectation: promise.reasonable_expectation,
    evidence_of_trust: promise.evidence_of_trust,
    others_vouch: promise.others_vouch,
    what_happened: betrayal.what_happened,
    primary_incident: betrayal.primary_incident,
    when_realized: betrayal.when_realized,
    is_ongoing: betrayal.is_ongoing,
    one_line_summary: story.one_line_summary,
    case_summary: story.case_summary,
    emotional_impact: impact.emotional,
    physical_impact: impact.physical,
    wish_understood: impact.wish_understood,
    police_report_filed: legal.police_report_filed,
    lawyer_consulted: legal.lawyer_consulted,
    court_case_filed: legal.court_case_filed,
    why_filing: legal.why_filing,
    other_victims: legal.other_victims,
  }

  // City → country key map
  const CITY_COUNTRY: Record<string, string> = {
    sydney: 'AU', melbourne: 'AU', brisbane: 'AU', perth: 'AU', adelaide: 'AU',
    queensland: 'AU', 'new south wales': 'AU', victoria: 'AU', australia: 'AU',
    'los angeles': 'USA', 'new york': 'USA', chicago: 'USA', houston: 'USA', miami: 'USA',
    'san francisco': 'USA', seattle: 'USA', denver: 'USA', dallas: 'USA',
    'united states': 'USA', usa: 'USA',
    london: 'UK', manchester: 'UK', birmingham: 'UK', 'united kingdom': 'UK', uk: 'UK', england: 'UK',
    toronto: 'CA', vancouver: 'CA', montreal: 'CA', calgary: 'CA', canada: 'CA',
    dubai: 'UAE', 'abu dhabi': 'UAE', 'united arab emirates': 'UAE', uae: 'UAE',
    paris: 'FR', france: 'FR', berlin: 'DE', germany: 'DE',
    singapore: 'SG', 'hong kong': 'HK', tokyo: 'JP', japan: 'JP',
    vietnam: 'VN', 'da nang': 'VN', hanoi: 'VN', 'ho chi minh': 'VN', saigon: 'VN',
    thailand: 'TH', bangkok: 'TH', phuket: 'TH', 'chiang mai': 'TH',
    china: 'CN', beijing: 'CN', shanghai: 'CN', shenzhen: 'CN',
    indonesia: 'ID', bali: 'ID', jakarta: 'ID',
    philippines: 'PH', manila: 'PH',
    malaysia: 'MY', 'kuala lumpur': 'MY',
    'new zealand': 'NZ', auckland: 'NZ',
  }
  const getCountriesForCase = (caseId: string): string[] => {
    const cities = (allTimelineEvents || [])
      .filter((e: any) => e.case_id === caseId && e.city)
      .map((e: any) => (e.city as string).toLowerCase())
    const codes = new Set<string>()
    for (const city of cities) {
      for (const [key, code] of Object.entries(CITY_COUNTRY)) {
        if (city.includes(key)) codes.add(code)
      }
    }
    return Array.from(codes)
  }

  // Build CaseCards for all cases
  const profileMap = new Map((allPlaintiffProfiles || []).map((p: any) => [p.id, p]))
  const fiMap = new Map((allFinancialImpacts || []).map((f: any) => [f.case_id, f]))

  // Maps for timeline enrichment: case_id → plaintiffName / caseNumber
  const caseToPlaintiff = new Map(
    cases.map((c: any) => [c.id, profileMap.get(c.plaintiff_id)?.display_name || 'Plaintiff'])
  )
  const caseToCaseNumber = new Map(cases.map((c: any) => [c.id, c.case_number as string]))

  // Enriched timeline — all events across all cases, sorted chronologically
  const enrichedTimeline = (allTimelineEvents || [])
    .map((e: any) => ({
      ...e,
      plaintiffName: caseToPlaintiff.get(e.case_id) || 'Plaintiff',
      caseNumber: caseToCaseNumber.get(e.case_id) || '',
    }))
    .sort((a: any, b: any) => parseTs(a.date_or_year) - parseTs(b.date_or_year))

  // Filter options for the timeline dropdown
  const caseFilterOptions = [
    { value: 'all', label: 'All Cases' },
    ...cases.map((c: any) => ({
      value: c.id,
      label: caseToPlaintiff.get(c.id) || 'Plaintiff',
      caseNumber: c.case_number as string,
    })),
  ]

  const caseCards = cases.map((c: any) => {
    const profile = profileMap.get(c.plaintiff_id)
    const fi = fiMap.get(c.id) as any
    const caseStory = (c.story_narrative as any) || {}
    const awarded = ['verdict', 'restitution'].includes(c.status)
    const damages = awarded
      ? (c.damages_awarded || c.nominal_damages_claimed || 0)
      : (c.nominal_damages_claimed || 0)
    const avatarUrl = profile?.avatar_url
      ? profile.avatar_url.startsWith('http')
        ? profile.avatar_url
        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.avatar_url}`
      : null
    return {
      caseNumber: c.case_number,
      status: c.status,
      filedAt: c.created_at,
      plaintiffName: profile?.display_name || 'Plaintiff',
      plaintiffPhoto: avatarUrl,
      synopsis: caseStory.one_line_summary || caseStory.case_summary || '',
      damages,
      damagesAwarded: awarded,
      countries: getCountriesForCase(c.id) as string[],
      caseTypes: (c.case_types || []).slice(0, 3) as string[],
    }
  })

  const getDisplayName = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean)
    if (parts.length <= 2) return fullName
    return `${parts[0]} ${parts[parts.length - 1]}`
  }

  const buildPublicUrl = (url: string | null | undefined): string | null => {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${url}`
  }

  return (
    <PlaintiffPageClient
      caseNumber={caseData.case_number}
      status={caseData.status}
      filedAt={caseData.created_at}
      plaintiffName={plaintiffName}
      plaintiffPhoto={buildPublicUrl(plaintiffProfile?.avatar_url) || null}
      defendantName={defendant.full_name}
      defendantPhoto={defendant.photo_url || null}
      tagline={tagline}
      notebookSummary={notebookSummary}
      briefingContent={briefingContent}
      testimonyFields={testimonyFields}
      infographicUrl={`${artifactBase}/infographic-landscape.png`}
      audioUrl={`${artifactBase}/podcast.mp3`}
      pdfUrl={`${artifactBase}/slides.pdf`}
      summaryImage1Url={summaryImage1Url}
      summaryImage2Url={summaryImage2Url}
      infoBoxes={infoBoxes}
      enrichedTimeline={enrichedTimeline}
      caseFilterOptions={caseFilterOptions}
      evidence={allEvidence || []}
      evidenceInventory={evidenceInventory}
      financialTotal={financialTotal}
      caseId={caseData.id}
      votingOpen={votingOpen}
      caseNarratives={caseNarratives}
      caseCards={caseCards}
    />
  )
}
