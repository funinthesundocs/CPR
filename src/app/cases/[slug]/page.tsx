import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PlaintiffPageClient } from './client'
import { readFile, readdir } from 'fs/promises'
import { join } from 'path'

export const revalidate = 0  // Fetch fresh data every time during development

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: caseData } = await supabase
    .from('cases')
    .select('*, defendants(full_name)')
    .eq('case_number', slug)
    .single()

  if (!caseData) return { title: 'Case Not Found' }

  const defendant = (caseData.defendants as any)?.full_name || 'Unknown'
  const story = (caseData.story_narrative as any) || {}
  const summary = story.one_line_summary || ''

  // Get plaintiff name from user_profiles
  const plaintiffId = caseData.plaintiff_id
  let plaintiffName = 'Plaintiff'
  if (plaintiffId) {
    const { data: plaintiffProfile } = await supabase
      .from('user_profiles')
      .select('display_name')
      .eq('id', plaintiffId)
      .single()
    plaintiffName = plaintiffProfile?.display_name || 'Plaintiff'
  }

  return {
    title: `${plaintiffName} vs ${defendant} | Court of Public Record`,
    description: summary.slice(0, 155),
    openGraph: {
      title: `${plaintiffName} vs ${defendant}`,
      description: summary.slice(0, 155),
      type: 'article',
    },
  }
}

export default async function CaseDetailPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch case + defendant
  const { data: caseData, error } = await supabase
    .from('cases')
    .select('*, defendants(*)')
    .eq('case_number', slug)
    .single()

  if (error || !caseData) notFound()

  const plaintiffId = caseData.plaintiff_id

  // Parallel queries
  const [
    { data: timeline },
    { data: evidence },
    { data: witnesses },
    { data: financialImpacts },
    { data: plaintiffProfile },
  ] = await Promise.all([
    supabase.from('timeline_events').select('*').eq('case_id', caseData.id).order('created_at'),
    supabase.from('evidence').select('*').eq('case_id', caseData.id).order('created_at'),
    supabase.from('witnesses').select('*').eq('case_id', caseData.id),
    supabase.from('financial_impacts').select('*').eq('case_id', caseData.id).maybeSingle(),
    plaintiffId
      ? supabase.from('user_profiles').select('display_name, avatar_url').eq('id', plaintiffId).maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const defendant = caseData.defendants as any
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

  // Timeline: sort by date_or_year
  const sortedTimeline = (timeline || []).sort((a: any, b: any) => {
    const yearA = parseInt(a.date_or_year) || 0
    const yearB = parseInt(b.date_or_year) || 0
    return yearA - yearB
  })

  // Years active
  const years = sortedTimeline.map((t: any) => parseInt(t.date_or_year)).filter((y: number) => !isNaN(y))
  const minYear = years.length > 0 ? Math.min(...years) : null
  const maxYear = years.length > 0 ? Math.max(...years) : null

  // Extract all locations from timeline — preserve each event location even if same city name
  // (different coordinates represent different specific locations within that city)
  // CRITICAL: timeline_events MUST have city field populated for map to work
  const locations = sortedTimeline
    .filter((t: any) => t.city)
    .map((t: any) => ({
      name: t.city,
      date: t.date_or_year,
      description: t.description,
      coordinates: t.latitude && t.longitude ? [t.longitude, t.latitude] : undefined,
    }))

  // DIAGNOSTIC: Log timeline events that are missing city field
  if (sortedTimeline.length > 0) {
    const missingCity = sortedTimeline.filter((t: any) => !t.city)
    if (missingCity.length > 0) {
      console.warn(`[Case] ${missingCity.length}/${sortedTimeline.length} timeline events missing city field — map will be incomplete`)
    }
  }

  // Build testimony fields for the modal
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

  // Info boxes
  const infoBoxes = [
    {
      label: 'Known Aliases',
      value: defendant.aliases?.length > 0 ? defendant.aliases.join(', ') : 'None on record',
    },
    {
      label: 'Business Name(s)',
      value: story.business_name || defendant.business_names?.[0] || 'See case details',
    },
    {
      label: 'Years Active',
      value: minYear && maxYear ? `${minYear} \u2013 ${maxYear}` : 'See timeline',
    },
    {
      label: 'Witnesses',
      value: `${(witnesses || []).length} on record`,
    },
  ]

  // Evidence inventory from story_narrative
  const evidenceInventory = story.evidence_inventory || []

  // Voting open check
  const votingOpen = ['judgment', 'investigation', 'pending_convergence'].includes(caseData.status)

  // Plaintiff name
  const plaintiffName = plaintiffProfile?.display_name || 'Plaintiff'

  // Artifact slug — derived from plaintiff display name (e.g. "Matt Campbell" → "matt-campbell")
  // This is the folder name under .agent/artifacts/ and public/artifacts/
  const artifactSlug = plaintiffName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

  // Notebook summary — load from per-plaintiff artifact folder, fall back to DB
  let notebookSummary = story.one_line_summary || ''
  try {
    const summaryPath = join(process.cwd(), '.agent', 'artifacts', artifactSlug, 'notebook-summary.txt')
    notebookSummary = await readFile(summaryPath, 'utf-8')
  } catch {
    // File not yet generated for this case — use DB fallback
  }

  // Briefing doc — load from per-plaintiff artifact folder, fall back to DB story body
  let briefingContent = story.body || ''
  try {
    const briefingPath = join(process.cwd(), '.agent', 'artifacts', artifactSlug, 'briefing.md')
    briefingContent = await readFile(briefingPath, 'utf-8')
  } catch {
    // File not yet generated for this case — use DB fallback
  }

  // Tagline — load from per-plaintiff artifact folder, fall back to DB one_line_summary
  let tagline = story.one_line_summary || ''
  try {
    const taglinePath = join(process.cwd(), '.agent', 'artifacts', artifactSlug, 'tagline.txt')
    tagline = (await readFile(taglinePath, 'utf-8')).trim()
  } catch {
    // File not yet generated for this case — use DB fallback
  }

  // Random summary images — pick 2 different images from the pool folder
  const POOL_DIR = join(process.cwd(), 'public', 'case-summary-pool')
  const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp'])
  let summaryImage1Url = '/case-summary-pool/case-summary-1.png'
  let summaryImage2Url = '/case-summary-pool/case-summary-2.png'
  try {
    const files = (await readdir(POOL_DIR)).filter(f =>
      IMAGE_EXTENSIONS.has(f.slice(f.lastIndexOf('.')).toLowerCase())
    )
    if (files.length >= 2) {
      // Fisher-Yates shuffle, take first two
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
  } catch {
    // Pool folder missing — keep defaults
  }

  // Public artifact base URL — convention: /artifacts/{plaintiff-slug}/
  const artifactBase = `/artifacts/${artifactSlug}`

  // Bundle all narrative JSONB data for the read-only testimony form
  const caseNarratives = {
    // Step 1 — Defendant
    defendant_name: defendant.full_name,
    defendant_location: defendant.location,
    defendant_aliases: defendant.aliases,
    // Step 2 — Connection
    relationship_type: caseData.relationship_type,
    relationship_duration: caseData.relationship_duration,
    first_interaction: relationship.first_interaction,
    early_warnings: relationship.early_warnings,
    // Step 3 — Trust
    agreement_terms: promise.agreement_terms,
    reasonable_expectation: promise.reasonable_expectation,
    evidence_of_trust: promise.evidence_of_trust,
    others_vouch: promise.others_vouch,
    // Step 4 — Incident
    what_happened: betrayal.what_happened,
    primary_incident: betrayal.primary_incident,
    when_realized: betrayal.when_realized,
    is_ongoing: betrayal.is_ongoing,
    // Step 6 — Summary
    one_line_summary: story.one_line_summary,
    case_summary: story.case_summary,
    // Step 7 — Impact
    emotional_impact: impact.emotional,
    physical_impact: impact.physical,
    wish_understood: impact.wish_understood,
    // Step 10 — Legal
    police_report_filed: legal.police_report_filed,
    lawyer_consulted: legal.lawyer_consulted,
    court_case_filed: legal.court_case_filed,
    why_filing: legal.why_filing,
    other_victims: legal.other_victims,
  }

  // Pass everything to the client layout
  // Format defendant name — first and last only (no middle names in hero section)
  const getDisplayName = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean)
    if (parts.length <= 2) return fullName
    return `${parts[0]} ${parts[parts.length - 1]}`
  }

  // Convert avatar_url to public URL if it's just a path
  const buildPublicUrl = (url: string | null | undefined): string | null => {
    if (!url) return null
    if (url.startsWith('http')) return url
    // If it's a path, construct public URL
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${url}`
  }

  return (
    <PlaintiffPageClient
      caseNumber={caseData.case_number}
      status={caseData.status}
      filedAt={caseData.created_at}
      plaintiffName={plaintiffName}
      plaintiffPhoto={buildPublicUrl(plaintiffProfile?.avatar_url) || null}
      defendantName={getDisplayName(defendant.full_name)}
      defendantPhoto={defendant.photo_url || null}
      tagline={tagline}
      notebookSummary={notebookSummary}
      briefingContent={briefingContent}
      testimonyFields={testimonyFields}
      infographicUrl={`${artifactBase}/infographic-landscape.jpg`}
      audioUrl={`${artifactBase}/podcast.mp3`}
      pdfUrl={`${artifactBase}/slides.pdf`}
      summaryImage1Url={summaryImage1Url}
      summaryImage2Url={summaryImage2Url}
      infoBoxes={infoBoxes}
      timeline={sortedTimeline}
      locations={locations}
      evidence={evidence || []}
      evidenceInventory={evidenceInventory}
      financialTotal={financialTotal}
      caseId={caseData.id}
      votingOpen={votingOpen}
      caseNarratives={caseNarratives}
    />
  )
}
