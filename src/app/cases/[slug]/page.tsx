import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { CaseComments } from './case-comments'
import { VoteCTA } from '@/components/cases/vote-cta'
import type { Metadata } from 'next'

import { HeroHook } from './components/hero-hook'
import { CaseMetadataBar } from './components/case-metadata-bar'
import { ChapterSection, FactBlock, ComparisonBlock } from './components/chapter-section'
import { FinancialImpactCard } from './components/financial-impact-card'
import { CaseTimeline } from './components/case-timeline'
import { RevealSection } from './components/reveal-section'
import WitnessGrid from './components/witness-grid'
import EvidenceSummary from './components/evidence-summary'
import PatternWarning from './components/pattern-warning'
import ResolutionSection from './components/resolution-section'

export const revalidate = 30

type PageProps = {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const supabase = await createClient()
    const { data } = await supabase
        .from('cases')
        .select('story_narrative, defendants(full_name)')
        .eq('case_number', slug)
        .single()

    if (!data) return { title: 'Case Not Found' }
    const defendant = (data.defendants as any)?.full_name || 'Unknown'
    const storyMeta = data.story_narrative as any || {}
    const summary = storyMeta.one_line_summary || (storyMeta.body as string)?.slice(0, 160) || ''

    return {
        title: `vs. ${defendant} — Court of Public Record`,
        description: summary,
        openGraph: {
            title: `vs. ${defendant} — Court of Public Record`,
            description: summary,
            type: 'article',
        },
    }
}

export default async function CaseDetailPage({ params }: PageProps) {
    const { slug } = await params
    const supabase = await createClient()

    // Fetch case with defendant
    const { data: caseData, error } = await supabase
        .from('cases')
        .select(`*, defendants (*)`)
        .eq('case_number', slug)
        .single()

    if (error || !caseData) notFound()

    // Parallel queries for all related data
    const [
        { data: timeline },
        { data: evidence },
        { data: witnesses },
        { data: financialImpacts },
        { data: verdict },
        { data: comments },
        { data: roles },
        { data: responses },
    ] = await Promise.all([
        supabase.from('timeline_events').select('*').eq('case_id', caseData.id).order('sort_order'),
        supabase.from('evidence').select('*').eq('case_id', caseData.id).order('created_at'),
        supabase.from('witnesses').select('*').eq('case_id', caseData.id),
        supabase.from('financial_impacts').select('*').eq('case_id', caseData.id).maybeSingle(),
        supabase.from('verdict_results').select('*').eq('case_id', caseData.id).maybeSingle(),
        supabase.from('comments').select('*, user_profiles(display_name, avatar_url)')
            .eq('commentable_type', 'case').eq('commentable_id', caseData.id)
            .eq('is_hidden', false).order('created_at', { ascending: false }).limit(20),
        supabase.from('case_roles').select('*, user_profiles(display_name, avatar_url)')
            .eq('case_id', caseData.id).eq('status', 'approved'),
        supabase.from('defendant_responses').select('*').in('case_id', [caseData.id]).order('created_at', { ascending: false }),
    ])

    const defendant = caseData.defendants as any

    // ── DESTRUCTURE JSONB COLUMNS ──
    const relationship = (caseData.relationship_narrative as any) || {}
    const promise = (caseData.promise_narrative as any) || {}
    const betrayal = (caseData.betrayal_narrative as any) || {}
    const impact = (caseData.personal_impact as any) || {}
    const legal = (caseData.legal_actions as any) || {}
    const story = (caseData.story_narrative as any) || {}
    const vis = (caseData.visibility_settings as any) || {}

    // Extracted flat values
    const one_line_summary = story.one_line_summary || ''
    const case_summary = story.body || ''
    const what_happened = betrayal.what_happened || ''
    const primary_incident = betrayal.primary_incident || ''
    const when_realized = betrayal.when_realized || ''
    const how_confirmed = betrayal.how_confirmed || ''
    const is_ongoing = betrayal.is_ongoing || ''
    const relationship_type = relationship.type || ''
    const relationship_duration = relationship.duration || ''
    const first_interaction = relationship.first_interaction || ''
    const early_warnings = relationship.early_warnings || ''
    const explicit_agreement = promise.explicit_agreement || ''
    const agreement_terms = promise.agreement_terms || ''
    const reasonable_expectation = promise.reasonable_expectation || ''
    const evidence_of_trust = promise.evidence_of_trust || ''
    const others_vouch = promise.others_vouch || ''
    const emotional_impact = impact.emotional || ''
    const physical_impact = impact.physical || ''
    const wish_understood = impact.wish_understood || ''
    const police_report_filed = legal.police_report || ''
    const lawyer_consulted = legal.lawyer || ''
    const court_case_filed = legal.court_case || ''
    const legal_details = legal.description || ''
    const why_filing = legal.why_filing || ''
    const other_victims = legal.other_victims || ''
    const other_victims_count = legal.other_victims_count || null
    const visibility = vis.tier || ''

    // If the ComparisonBlock in S4 already displays what_happened as the "reality" column,
    // suppress the redundant FactBlock in S6 so the same text doesn't appear twice.
    const showedComparisonBlock = !!(explicit_agreement && what_happened)

    // ── COMPUTED VALUES ──
    const fi = financialImpacts as any
    const financialTotal = fi
        ? (fi.direct_payments || 0) + (fi.lost_wages || 0) + (fi.property_loss || 0) +
        (fi.legal_fees || 0) + (fi.medical_costs || 0) + (fi.credit_damage || 0) + (fi.other_amount || 0)
        : (caseData.nominal_damages_claimed || 0)

    const breakdown = fi ? [
        { label: 'Direct Payments', amount: fi.direct_payments || 0 },
        { label: 'Lost Wages', amount: fi.lost_wages || 0 },
        { label: 'Property Loss', amount: fi.property_loss || 0 },
        { label: 'Legal Fees', amount: fi.legal_fees || 0 },
        { label: 'Medical Costs', amount: fi.medical_costs || 0 },
        { label: 'Credit Damage', amount: fi.credit_damage || 0 },
        { label: fi.other_description || 'Other', amount: fi.other_amount || 0 },
    ] : []

    const showVoteCTA = ['judgment', 'investigation', 'pending_convergence'].includes(caseData.status)

    const showPatternWarning =
        (other_victims && other_victims !== 'no') ||
        (caseData.case_types && caseData.case_types.length > 0)

    const hasRevealContent = wish_understood || emotional_impact || when_realized || how_confirmed

    const hasWitnessSection =
        (witnesses && witnesses.length > 0) || (evidence && evidence.length > 0)

    const filedDate = new Date(caseData.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    })

    return (
        <div className="space-y-0 max-w-5xl mx-auto">

            {/* S1 — HERO HOOK */}
            <HeroHook
                caseNumber={caseData.case_number}
                status={caseData.status}
                defendant={{
                    full_name: defendant?.full_name || 'Unknown',
                    slug: defendant?.slug || '',
                    photo_url: defendant?.photo_url || null,
                    location: defendant?.location || null,
                }}
                summary={one_line_summary}
                financialTotal={financialTotal}
                evidenceCount={(evidence || []).length}
                witnessCount={(witnesses || []).length}
                timelineCount={(timeline || []).length}
                visibility={visibility}
                isOngoing={is_ongoing === 'yes'}
                verdict={verdict as any}
            />

            {/* S2 — CASE METADATA BAR */}
            <CaseMetadataBar
                caseTypes={caseData.case_types || []}
                filedDate={filedDate}
                location={defendant?.location || null}
                relationshipType={relationship_type}
                relationshipDuration={relationship_duration}
            />

            {/* S3 — THE CONNECTION */}
            {(first_interaction || early_warnings) && (
                <ChapterSection title="The Connection" bg="bg-background">
                    {first_interaction && (
                        <FactBlock label="How They Met" value={first_interaction} />
                    )}
                    {early_warnings && (
                        <FactBlock label="Early Warning Signs" value={early_warnings} />
                    )}
                </ChapterSection>
            )}

            {/* S4 — THE PROMISE */}
            {(explicit_agreement || agreement_terms || reasonable_expectation || evidence_of_trust || others_vouch) && (
                <ChapterSection title="The Promise" bg="bg-muted/10">
                    {explicit_agreement && what_happened && (
                        <ComparisonBlock
                            leftLabel="What Was Promised"
                            leftValue={explicit_agreement}
                            rightLabel="What Actually Happened"
                            rightValue={what_happened}
                        />
                    )}
                    {/* Suppress "Agreement Made" FactBlock when ComparisonBlock already shows explicit_agreement */}
                    {explicit_agreement && !what_happened && (
                        <FactBlock label="Agreement Made" value={explicit_agreement} />
                    )}
                    {agreement_terms && (
                        <FactBlock label="Terms" value={agreement_terms} />
                    )}
                    {reasonable_expectation && (
                        <FactBlock label="Why It Seemed Reasonable" value={reasonable_expectation} />
                    )}
                    {evidence_of_trust && (
                        <FactBlock label="Evidence of Good Faith" value={evidence_of_trust} />
                    )}
                    {others_vouch && (
                        <FactBlock label="Third-Party Endorsement" value={others_vouch} />
                    )}
                </ChapterSection>
            )}

            {/* S5 — FINANCIAL IMPACT */}
            {financialTotal > 0 && (
                <FinancialImpactCard total={financialTotal} breakdown={breakdown} />
            )}

            {/* S6 — WHAT HAPPENED */}
            {(what_happened || primary_incident || case_summary || (timeline && timeline.length > 0)) && (
                <ChapterSection title="What Happened" bg="bg-background">
                    {what_happened && !showedComparisonBlock && (
                        <FactBlock label="What Happened" value={what_happened} />
                    )}
                    {primary_incident && (
                        <FactBlock label="Primary Incident" value={primary_incident} />
                    )}
                    {case_summary && (
                        <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed">
                            {case_summary}
                        </div>
                    )}
                    {timeline && timeline.length > 0 && (
                        <CaseTimeline events={timeline as any} />
                    )}
                </ChapterSection>
            )}

            {/* S7 — THE REVEAL (CLIMAX) */}
            {hasRevealContent && (
                <RevealSection
                    pullQuote={wish_understood}
                    emotionalImpact={emotional_impact}
                    physicalImpact={physical_impact}
                    whenRealized={when_realized}
                    howConfirmed={how_confirmed}
                />
            )}

            {/* S8 — WITNESSES & EVIDENCE */}
            {hasWitnessSection && (
                <section className="bg-muted/20 py-12" aria-label="Witnesses and Evidence">
                    {witnesses && witnesses.length > 0 && (
                        <WitnessGrid
                            witnesses={witnesses as any}
                            caseRoles={roles as any}
                        />
                    )}
                    {evidence && evidence.length > 0 && (
                        <EvidenceSummary evidence={evidence as any} />
                    )}
                </section>
            )}

            {/* S9 — PATTERN WARNING */}
            {showPatternWarning && (
                <PatternWarning
                    otherVictims={other_victims}
                    count={other_victims_count}
                    caseTypes={caseData.case_types || []}
                />
            )}

            {/* S10 — RESOLUTION */}
            <ResolutionSection
                legal={{
                    policeReport: police_report_filed,
                    lawyer: lawyer_consulted,
                    courtCase: court_case_filed,
                    details: legal_details,
                    whyFiling: why_filing,
                }}
                nominalDamages={caseData.nominal_damages_claimed || 0}
                responses={responses as any}
            />

            {/* VOTE CTA */}
            {showVoteCTA && <VoteCTA caseId={caseData.id} />}

            {/* COMMENTS */}
            <Separator />
            <CaseComments caseId={caseData.id} />

        </div>
    )
}
