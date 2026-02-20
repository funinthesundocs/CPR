import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { CaseComments } from './case-comments'
import { VoteCTA } from '@/components/cases/vote-cta'
import type { Metadata } from 'next'

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
    // The form writes into these 6 JSONB columns. Extract all fields from them.
    const relationship = (caseData.relationship_narrative as any) || {}
    const promise = (caseData.promise_narrative as any) || {}
    const betrayal = (caseData.betrayal_narrative as any) || {}
    const impact = (caseData.personal_impact as any) || {}
    const legal = (caseData.legal_actions as any) || {}
    const story = (caseData.story_narrative as any) || {}
    const vis = (caseData.visibility_settings as any) || {}

    // Extracted flat values for easy use in JSX
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

    // Financial totals
    const fi = financialImpacts as any
    const financialTotal = fi
        ? (fi.direct_payments || 0) + (fi.lost_wages || 0) + (fi.property_loss || 0) +
        (fi.legal_fees || 0) + (fi.medical_costs || 0) + (fi.credit_damage || 0) + (fi.other_amount || 0)
        : (caseData.nominal_damages_claimed || 0)

    const EVENT_COLORS: Record<string, string> = {
        first_contact: 'bg-green-500/10 text-green-700 dark:text-green-400',
        trust_built: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
        red_flag: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
        escalation: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
        incident: 'bg-red-500/10 text-red-700 dark:text-red-400',
        discovery: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
        aftermath: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
    }

    const WITNESS_TYPE_LABELS: Record<string, string> = {
        eyewitness: '👁 Eyewitness',
        character: '🧠 Character',
        corroborating: '🔗 Corroborating',
        expert: '🎓 Expert',
        digital: '💻 Digital',
    }

    const statusColors: Record<string, string> = {
        pending_convergence: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
        admin_review: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        investigation: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
        judgment: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
        verdict_guilty: 'bg-red-500/10 text-red-700 dark:text-red-400',
        verdict_innocent: 'bg-green-500/10 text-green-600 dark:text-green-400',
        restitution: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
        resolved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        outstanding: 'bg-red-500/10 text-red-700 dark:text-red-400',
        draft: 'bg-muted text-muted-foreground',
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">

            {/* ── CASE HEADER ── */}
            <div className="rounded-2xl border bg-gradient-to-br from-card via-card to-muted/30 p-8">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Defendant avatar → links to defendant page */}
                    <Link href={`/defendants/${defendant?.slug || ''}`}>
                        {defendant?.photo_url ? (
                            <img src={defendant.photo_url} alt={defendant.full_name}
                                className="h-20 w-20 rounded-2xl object-cover ring-4 ring-border shadow-lg hover:ring-primary/50 transition-all" />
                        ) : (
                            <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground ring-4 ring-border shadow-lg hover:ring-primary/50 transition-all">
                                {defendant?.full_name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                        )}
                    </Link>

                    <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className="font-mono text-lg font-bold">{caseData.case_number}</span>
                                    <Badge variant="outline" className={`capitalize ${statusColors[caseData.status] || ''}`}>
                                        {caseData.status.replace(/_/g, ' ')}
                                    </Badge>
                                    {visibility && visibility !== 'open' && (
                                        <Badge variant="outline" className="text-xs capitalize">
                                            {visibility === 'shielded' ? '🟡 Shielded' :
                                                visibility === 'protected' ? '🟠 Protected' :
                                                    visibility === 'proxy' ? '🔴 Proxy' : visibility}
                                        </Badge>
                                    )}
                                </div>
                                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                                    vs.{' '}
                                    <Link href={`/defendants/${defendant?.slug || ''}`} className="hover:text-primary transition-colors">
                                        {defendant?.full_name || 'Unknown'}
                                    </Link>
                                </h1>
                            </div>
                        </div>

                        {/* One-line summary */}
                        {one_line_summary && (
                            <p className="text-base text-muted-foreground italic leading-snug">
                                &ldquo;{one_line_summary}&rdquo;
                            </p>
                        )}

                        {/* Case types */}
                        {caseData.case_types && caseData.case_types.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {caseData.case_types.map((type: string, i: number) => (
                                    <Badge key={i} variant="secondary" className="text-xs capitalize">
                                        {type.replace(/_/g, ' ')}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        <p className="text-sm text-muted-foreground">
                            Filed {new Date(caseData.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            {defendant?.location && <span> · 📍 {defendant.location}</span>}
                            {is_ongoing === 'yes' && <span className="text-red-500 font-medium"> · ⚠️ Ongoing</span>}
                        </p>
                    </div>
                </div>

                {/* Stats bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                    <StatBox label="Damages Claimed" value={financialTotal > 0 ? `$${financialTotal.toLocaleString()}` : '$0'} />
                    <StatBox label="Evidence Items" value={(evidence || []).length.toString()} />
                    <StatBox label="Witnesses" value={(witnesses || []).length.toString()} />
                    <StatBox label="Timeline Events" value={(timeline || []).length.toString()} />
                </div>
            </div>

            {/* ── VERDICT BANNER ── */}
            {verdict && (
                <div className={`rounded-xl p-6 text-center space-y-2 border-2 ${verdict.verdict === 'guilty'
                    ? 'bg-red-500/5 border-red-500/30'
                    : 'bg-green-500/5 border-green-500/30'
                    }`}>
                    <p className="text-3xl font-extrabold uppercase tracking-wider">
                        {verdict.verdict === 'guilty' ? '⚠️ GUILTY' : '✅ INNOCENT'}
                    </p>
                    <p className="text-lg font-bold">
                        Average Score: {verdict.average_guilt_score?.toFixed(1)}/10
                        <span className="text-muted-foreground font-normal ml-2">({verdict.total_votes} votes)</span>
                    </p>
                    {verdict.total_restitution_awarded > 0 && (
                        <p className="text-base font-medium text-muted-foreground">
                            Restitution Awarded: ${verdict.total_restitution_awarded.toLocaleString()}
                        </p>
                    )}
                </div>
            )}

            {/* ── TABBED CONTENT ── */}
            <Tabs defaultValue="case" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="case">Case</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline ({(timeline || []).length})</TabsTrigger>
                    <TabsTrigger value="evidence">Evidence ({(evidence || []).length})</TabsTrigger>
                    <TabsTrigger value="witnesses">Witnesses ({(witnesses || []).length})</TabsTrigger>
                    <TabsTrigger value="responses">Response</TabsTrigger>
                </TabsList>

                {/* ── CASE TAB ── */}
                <TabsContent value="case" className="space-y-6">

                    {/* Case Summary — the primary narrative */}
                    {case_summary && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">📋 Case Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed">
                                    {case_summary}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* What Happened / Incident */}
                    {(what_happened || primary_incident) && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">🔴 The Incident</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {what_happened && (
                                    <FactBlock label="What Happened" value={what_happened} />
                                )}
                                {primary_incident && (
                                    <FactBlock label="Primary Incident" value={primary_incident} />
                                )}
                                {when_realized && (
                                    <FactBlock label="When Something Felt Wrong" value={when_realized} />
                                )}
                                {how_confirmed && (
                                    <FactBlock label="How It Was Confirmed" value={how_confirmed} />
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Connection */}
                    {(relationship_type || first_interaction || early_warnings) && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">🔗 The Connection</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {relationship_type && (
                                    <FactBlock label="Relationship" value={relationship_type.replace(/_/g, ' ')} />
                                )}
                                {relationship_duration && (
                                    <FactBlock label="Duration" value={relationship_duration} />
                                )}
                                {first_interaction && (
                                    <FactBlock label="How They Met" value={first_interaction} />
                                )}
                                {early_warnings && (
                                    <FactBlock label="Early Warning Signs" value={early_warnings} />
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Basis of Trust */}
                    {(explicit_agreement || agreement_terms || reasonable_expectation) && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">🤝 Basis of Trust</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {explicit_agreement && (
                                    <FactBlock label="Explicit Agreement" value={explicit_agreement} />
                                )}
                                {agreement_terms && (
                                    <FactBlock label="Terms" value={agreement_terms} />
                                )}
                                {reasonable_expectation && (
                                    <FactBlock label="Reasonable Expectation" value={reasonable_expectation} />
                                )}
                                {evidence_of_trust && (
                                    <FactBlock label="Evidence Supporting Trust" value={evidence_of_trust} />
                                )}
                                {others_vouch && (
                                    <FactBlock label="Third-Party Endorsement" value={others_vouch} />
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Damages & Impact */}
                    {(fi || emotional_impact || physical_impact) && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">💥 Damages & Impact</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {fi && (
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Financial Breakdown</p>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {fi.direct_payments > 0 && <FinLine label="Direct Payments" value={fi.direct_payments} />}
                                            {fi.lost_wages > 0 && <FinLine label="Lost Wages" value={fi.lost_wages} />}
                                            {fi.property_loss > 0 && <FinLine label="Property Loss" value={fi.property_loss} />}
                                            {fi.legal_fees > 0 && <FinLine label="Legal Fees" value={fi.legal_fees} />}
                                            {fi.medical_costs > 0 && <FinLine label="Medical Costs" value={fi.medical_costs} />}
                                            {fi.credit_damage > 0 && <FinLine label="Credit Damage" value={fi.credit_damage} />}
                                            {fi.other_amount > 0 && <FinLine label={fi.other_description || 'Other'} value={fi.other_amount} />}
                                        </div>
                                        {financialTotal > 0 && (
                                            <div className="mt-3 pt-3 border-t flex justify-between items-center">
                                                <span className="text-sm font-semibold">Total Documented Losses</span>
                                                <span className="text-lg font-bold">${financialTotal.toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {emotional_impact && (
                                    <FactBlock label="Psychological & Emotional Effects" value={emotional_impact} />
                                )}
                                {physical_impact && (
                                    <FactBlock label="Physical Injuries & Health Effects" value={physical_impact} />
                                )}
                                {wish_understood && (
                                    <div className="rounded-lg bg-muted/20 border p-4">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">What the plaintiff wants understood</p>
                                        <p className="text-sm italic leading-relaxed">&ldquo;{wish_understood}&rdquo;</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Legal Actions */}
                    {(police_report_filed || lawyer_consulted || court_case_filed || why_filing) && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">⚖️ Legal Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-wrap gap-3">
                                    {police_report_filed && police_report_filed !== 'no' && (
                                        <Badge variant="outline" className="text-xs">
                                            🚔 Police Report: {police_report_filed.replace(/_/g, ' ')}
                                        </Badge>
                                    )}
                                    {lawyer_consulted && lawyer_consulted !== 'no' && (
                                        <Badge variant="outline" className="text-xs">
                                            ⚖️ Lawyer: {lawyer_consulted.replace(/_/g, ' ')}
                                        </Badge>
                                    )}
                                    {court_case_filed && court_case_filed !== 'no' && (
                                        <Badge variant="outline" className="text-xs">
                                            🏛️ Court Case: {court_case_filed.replace(/_/g, ' ')}
                                        </Badge>
                                    )}
                                </div>
                                {legal_details && (
                                    <FactBlock label="Legal Details" value={legal_details} />
                                )}
                                {why_filing && (
                                    <FactBlock label="Why Filing on the Public Record" value={why_filing} />
                                )}
                                {other_victims && other_victims !== 'no' && (
                                    <p className="text-sm text-muted-foreground">
                                        🔗 Other victims reported:{' '}
                                        <strong>{other_victims === 'yes' ? 'Yes' : 'Suspected'}</strong>
                                        {other_victims_count && ` — approximately ${other_victims_count}`}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Nominal Damages */}
                    {caseData.nominal_damages_claimed > 0 && (
                        <Card>
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">Nominal Damages Claimed</p>
                                    <p className="text-xs text-muted-foreground">Amount the jury will vote on awarding</p>
                                </div>
                                <p className="text-2xl font-bold">${caseData.nominal_damages_claimed.toLocaleString()}</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* ── TIMELINE TAB ── */}
                <TabsContent value="timeline" className="space-y-4">
                    {!timeline || timeline.length === 0 ? (
                        <EmptyState>No timeline events submitted</EmptyState>
                    ) : (
                        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-border">
                            {timeline.map((event) => (
                                <div key={event.id} className="relative">
                                    <div className="absolute -left-6 top-1 h-4 w-4 rounded-full border-2 border-primary bg-background" />
                                    <Card>
                                        <CardContent className="p-4 space-y-2">
                                            <div className="flex items-center justify-between flex-wrap gap-2">
                                                <Badge variant="outline" className={`text-xs capitalize ${EVENT_COLORS[event.event_type] || ''}`}>
                                                    {event.event_type?.replace(/_/g, ' ')}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground font-mono">{event.date_or_year}</span>
                                            </div>
                                            <p className="text-sm">{event.description}</p>
                                            {(event.city || event.country) && (
                                                <p className="text-xs text-muted-foreground">📍 {[event.city, event.country].filter(Boolean).join(', ')}</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* ── EVIDENCE TAB ── */}
                <TabsContent value="evidence" className="space-y-4">
                    {!evidence || evidence.length === 0 ? (
                        <EmptyState>No evidence submitted yet</EmptyState>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {evidence.map((ev) => (
                                <Card key={ev.id}>
                                    <CardContent className="p-4 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">{ev.label}</span>
                                            <Badge variant="outline" className="text-xs capitalize">{ev.category}</Badge>
                                        </div>
                                        {ev.description && (
                                            <p className="text-xs text-muted-foreground">{ev.description}</p>
                                        )}
                                        <div className="flex gap-2 flex-wrap">
                                            {ev.is_verified && (
                                                <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 text-xs">✅ Verified</Badge>
                                            )}
                                            {ev.file_url && (
                                                <a href={ev.file_url} target="_blank" rel="noopener noreferrer">
                                                    <Badge variant="outline" className="text-xs hover:bg-accent">📎 View File</Badge>
                                                </a>
                                            )}
                                        </div>
                                        {ev.sha256_hash && (
                                            <p className="text-xs text-muted-foreground/50 font-mono truncate">SHA-256: {ev.sha256_hash}</p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* ── WITNESSES TAB ── */}
                <TabsContent value="witnesses" className="space-y-4">
                    {!witnesses || witnesses.length === 0 ? (
                        <EmptyState>No witnesses submitted</EmptyState>
                    ) : (
                        <div className="grid gap-4">
                            {witnesses.map((w: any) => (
                                <Card key={w.id}>
                                    <CardContent className="p-4 space-y-2">
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            <p className="font-medium text-sm">{w.full_name || w.name || 'Anonymous'}</p>
                                            {w.witness_type && (
                                                <Badge variant="outline" className="text-xs">
                                                    {WITNESS_TYPE_LABELS[w.witness_type] || w.witness_type}
                                                </Badge>
                                            )}
                                        </div>
                                        {w.details?.can_verify && (
                                            <FactBlock label="Can Verify" value={w.details.can_verify} />
                                        )}
                                        {w.statement && (
                                            <FactBlock label="Statement" value={w.statement} />
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* ── RESPONSES TAB ── */}
                <TabsContent value="responses" className="space-y-4">
                    <div className="rounded-lg border p-4 bg-muted/20">
                        <p className="text-sm text-muted-foreground">
                            <strong>Right of Reply:</strong> The defendant may respond to claims made in this case. All responses are published unedited.
                        </p>
                    </div>
                    {!responses || responses.length === 0 ? (
                        <EmptyState>No defendant responses yet</EmptyState>
                    ) : (
                        responses.map((resp) => (
                            <Card key={resp.id}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">{resp.subject_heading}</CardTitle>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(resp.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: resp.body_html }} />
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>
            </Tabs>

            {/* Vote CTA */}
            {['judgment', 'investigation', 'pending_convergence'].includes(caseData.status) && (
                <VoteCTA caseId={caseData.id} />
            )}

            {/* Comments */}
            <Separator />
            <CaseComments caseId={caseData.id} />
        </div>
    )
}

// ── HELPER COMPONENTS ──

function StatBox({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border bg-card/50 p-3 text-center">
            <p className="text-xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
        </div>
    )
}

function FactBlock({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{value}</p>
        </div>
    )
}

function FinLine({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-lg border bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-base font-bold">${value.toLocaleString()}</p>
        </div>
    )
}

function EmptyState({ children }: { children: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">{children}</p>
        </div>
    )
}
