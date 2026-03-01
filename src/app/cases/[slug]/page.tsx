import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { CaseComments } from './case-comments'
import { VoteCTA } from '@/components/cases/vote-cta'
import type { Metadata } from 'next'

import { HeroHook } from './components/hero-hook'
import { CaseMetadataBar } from './components/case-metadata-bar'
import { ComparisonSlider } from './components/comparison-slider'
import { InteractiveStepper, StepperEvent } from './components/interactive-stepper'
import { ProofGallery } from './components/proof-gallery'
import { TrueImpactClimax } from './components/true-impact-climax'
import ResolutionSection from './components/resolution-section'
import PatternWarning from './components/pattern-warning'

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

    // Parallel queries
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

    // ── EXTRACTED VALUES ──
    const explicit_agreement = promise.explicit_agreement || ''
    const what_happened = betrayal.what_happened || ''

    // Create stepper events from timeline AND narrative
    const stepperEvents: StepperEvent[] = []

    if (relationship.first_interaction) {
        stepperEvents.push({ id: 'meet', title: 'How They Met', description: relationship.first_interaction, date: 'The Beginning' })
    }
    if (relationship.early_warnings) {
        stepperEvents.push({ id: 'warning', title: 'Early Warning Signs', description: relationship.early_warnings, date: 'Red Flags' })
    }
    if (betrayal.what_happened && !explicit_agreement) {
        stepperEvents.push({ id: 'incident', title: 'What Happened', description: betrayal.what_happened, date: 'The Betrayal' })
    }
    if (betrayal.primary_incident) {
        stepperEvents.push({ id: 'primary', title: 'Primary Incident', description: betrayal.primary_incident, date: 'The Turning Point' })
    }

    // Add timeline items
    if (timeline && timeline.length > 0) {
        timeline.forEach(t => {
            stepperEvents.push({
                id: t.id,
                title: t.title || 'Event',
                description: t.description || undefined,
                // Fallback to year if no date_occurred is present
                date: t.date_occurred ? new Date(t.date_occurred).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'As Part of the Timeline'
            })
        })
    }

    if (story.body) {
        stepperEvents.push({ id: 'summary', title: 'The Full Narrative', description: story.body, date: 'The Reality' })
    }

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
        (legal.other_victims && legal.other_victims !== 'no') ||
        (caseData.case_types && caseData.case_types.length > 0)

    return (
        <div className="w-full bg-[#050505] text-white selection:bg-primary/30 selection:text-white pb-32 overflow-x-hidden">

            {/* 1. HERO HOOK */}
            <HeroHook
                caseNumber={caseData.case_number}
                status={caseData.status}
                defendant={defendant}
                summary={story.one_line_summary || ''}
                financialTotal={financialTotal}
                evidenceCount={(evidence || []).length}
                witnessCount={(witnesses || []).length}
                timelineCount={(timeline || []).length}
                visibility={vis.tier || ''}
                isOngoing={betrayal.is_ongoing === 'yes'}
                verdict={verdict as any}
            />

            {/* 2. CONTEXT / METADATA */}
            <CaseMetadataBar
                caseTypes={caseData.case_types || []}
                filedDate={new Date(caseData.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                location={defendant?.location || null}
                relationshipType={relationship.type || ''}
                relationshipDuration={relationship.duration || ''}
            />

            {/* 3. THE PROMISE (Slider) */}
            {(explicit_agreement || betrayal.what_happened) && (
                <section className="relative py-24 bg-[#050505] overflow-hidden" aria-labelledby="setup-heading">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
                    <div className="relative z-10 px-6 sm:px-12 flex flex-col items-center text-center">
                        <h2 id="setup-heading" className="text-3xl font-bold tracking-tight mb-2 uppercase text-white/50">The Setup</h2>
                        <p className="text-lg font-light text-white/40 mb-12">Drag the slider to reveal the difference between the promise and the reality.</p>
                        <ComparisonSlider
                            promiseHtml={explicit_agreement || promise.agreement_terms || "No explicit promise was recorded."}
                            realityHtml={betrayal.what_happened || "The reality fell short."}
                        />
                    </div>
                </section>
            )}

            {/* 4. THE INCIDENT / TIMELINE */}
            {stepperEvents.length > 0 && (
                <section className="relative py-12 bg-gradient-to-b from-[#050505] to-[#0A0A0A]" aria-labelledby="timeline-heading">
                    <div className="px-6 sm:px-12 text-center mb-10">
                        <h2 id="timeline-heading" className="text-3xl font-bold tracking-tight mb-2 text-white">The Incident Timeline</h2>
                    </div>
                    <InteractiveStepper events={stepperEvents} />
                </section>
            )}

            {/* 5. EVIDENCE AND WITNESSES */}
            {((witnesses && witnesses.length > 0) || (evidence && evidence.length > 0)) && (
                <ProofGallery
                    witnesses={witnesses || []}
                    evidence={evidence || []}
                    caseRoles={roles || []}
                />
            )}

            {/* 6. TRUE IMPACT (CLIMAX) */}
            {(financialTotal > 0 || impact.wish_understood || impact.emotional) && (
                <TrueImpactClimax
                    financialTotal={financialTotal}
                    breakdown={breakdown}
                    pullQuote={impact.wish_understood || ''}
                    emotionalImpact={impact.emotional || ''}
                    physicalImpact={impact.physical || ''}
                    whenRealized={betrayal.when_realized || ''}
                    howConfirmed={betrayal.how_confirmed || ''}
                />
            )}

            {/* 7. PATTERN WARNING */}
            {showPatternWarning && (
                <div className="bg-[#050505] pt-12">
                    <PatternWarning
                        otherVictims={legal.other_victims}
                        count={legal.other_victims_count}
                        caseTypes={caseData.case_types || []}
                    />
                </div>
            )}

            {/* 8. RESOLUTION & LEGAL CTA */}
            <ResolutionSection
                legal={{
                    policeReport: legal.police_report || 'no',
                    lawyer: legal.lawyer || 'no',
                    courtCase: legal.court_case || 'no',
                    details: legal.description || '',
                    whyFiling: legal.why_filing || '',
                }}
                nominalDamages={caseData.nominal_damages_claimed || 0}
                responses={responses as any}
            />

            {showVoteCTA && (
                <div className="max-w-7xl w-full mx-auto px-6 sm:px-12 mt-12">
                    <VoteCTA caseId={caseData.id} />
                </div>
            )}

            <div className="max-w-7xl w-full mx-auto px-6 sm:px-12 mt-16">
                <Separator className="bg-white/10 mb-8" />
                <div className="bg-black/40 p-8 sm:p-12 rounded-3xl border border-white/5">
                    <CaseComments caseId={caseData.id} />
                </div>
            </div>

        </div>
    )
}
