import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 30

type PageProps = {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const supabase = await createClient()
    const { data: defendant } = await supabase
        .from('defendants')
        .select('full_name, location, entity_type')
        .eq('slug', slug)
        .single()

    if (!defendant) return { title: 'Defendant Not Found' }

    const entityLabel = defendant.entity_type === 'business' ? 'Organization' :
        defendant.entity_type === 'unknown' ? 'Unknown Identity' : 'Individual'

    return {
        title: `${defendant.full_name} — Court of Public Record`,
        description: `Public record for ${entityLabel}: ${defendant.full_name}${defendant.location ? ` from ${defendant.location}` : ''}. View cases, evidence, and verdicts.`,
        openGraph: {
            title: `${defendant.full_name} — Court of Public Record`,
            description: `Public record for ${defendant.full_name}. View cases, evidence, timeline, and verdicts.`,
            type: 'profile',
        },
    }
}

export default async function DefendantPage({ params }: PageProps) {
    const { slug } = await params
    const supabase = await createClient()

    // Fetch defendant
    const { data: defendant, error } = await supabase
        .from('defendants')
        .select('*')
        .eq('slug', slug)
        .single()

    if (error || !defendant) notFound()

    // Fetch cases linked to this defendant (include one_line_summary for previews)
    const { data: cases } = await supabase
        .from('cases')
        .select(`id, case_number, status, case_types, one_line_summary, nominal_damages_claimed, created_at, verdict_at`)
        .eq('defendant_id', defendant.id)
        .not('status', 'eq', 'draft')
        .order('created_at', { ascending: false })

    const caseIds = (cases || []).map(c => c.id)

    // Parallel queries for related data
    const [
        { data: timeline },
        { data: verdicts },
        { data: responses },
        { data: financialImpacts },
    ] = await Promise.all([
        supabase.from('timeline_events').select('*')
            .in('case_id', caseIds).order('sort_order', { ascending: true }),
        supabase.from('verdict_results').select('*').in('case_id', caseIds),
        supabase.from('defendant_responses').select('*')
            .in('case_id', caseIds).order('created_at', { ascending: false }),
        caseIds.length > 0
            ? supabase.from('financial_impacts').select('direct_payments, lost_wages, property_loss, legal_fees, medical_costs, credit_damage, other_amount, total_lost, case_id').in('case_id', caseIds)
            : Promise.resolve({ data: [] }),
    ])

    const activeCases = (cases || []).filter(c => !['draft', 'pending_convergence'].includes(c.status))

    // Aggregate all financial damages across all cases
    const allFi = (financialImpacts || []) as any[]
    const totalDocumentedDamages = allFi.reduce((sum, fi) => {
        return sum + (fi.total_lost || (
            (fi.direct_payments || 0) + (fi.lost_wages || 0) + (fi.property_loss || 0) +
            (fi.legal_fees || 0) + (fi.medical_costs || 0) + (fi.credit_damage || 0) + (fi.other_amount || 0)
        ))
    }, 0) || activeCases.reduce((sum, c) => sum + (c.nominal_damages_claimed || 0), 0)

    const guiltyVerdicts = (verdicts || []).filter(v => v.verdict === 'guilty')

    const ENTITY_BADGES: Record<string, { label: string; class: string }> = {
        person: { label: '👤 Individual', class: 'bg-blue-500/10 text-blue-700 dark:text-blue-400' },
        business: { label: '🏢 Business / Organization', class: 'bg-amber-500/10 text-amber-700 dark:text-amber-400' },
        unknown: { label: '❓ Unknown Identity', class: 'bg-muted text-muted-foreground' },
    }
    const entityBadge = ENTITY_BADGES[defendant.entity_type] || ENTITY_BADGES.person

    const EVENT_COLORS: Record<string, string> = {
        first_contact: 'bg-green-500/10 text-green-700 dark:text-green-400',
        trust_built: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
        red_flag: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
        escalation: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
        incident: 'bg-red-500/10 text-red-700 dark:text-red-400',
        discovery: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
        aftermath: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
    }

    return (
        <div className="space-y-8">

            {/* ── HERO ── */}
            <div className="relative rounded-2xl border bg-gradient-to-br from-card via-card to-muted/30 p-8 md:p-10">
                <div className="flex flex-col md:flex-row gap-6 items-start">

                    {/* Avatar */}
                    {defendant.photo_url ? (
                        <img
                            src={defendant.photo_url}
                            alt={defendant.full_name}
                            className="h-24 w-24 md:h-32 md:w-32 rounded-2xl object-cover ring-4 ring-border shadow-xl"
                        />
                    ) : (
                        <div className="h-24 w-24 md:h-32 md:w-32 rounded-2xl bg-muted flex items-center justify-center text-4xl font-bold text-muted-foreground ring-4 ring-border shadow-xl">
                            {defendant.full_name.charAt(0).toUpperCase()}
                        </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{defendant.full_name}</h1>
                                {defendant.location && (
                                    <p className="text-muted-foreground mt-1">📍 {defendant.location}</p>
                                )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <DefendantStatusBadge status={defendant.status} />
                                <Badge variant="outline" className={`text-xs ${entityBadge.class}`}>
                                    {entityBadge.label}
                                </Badge>
                            </div>
                        </div>

                        {/* Aliases */}
                        {defendant.aliases && defendant.aliases.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                <span className="text-xs text-muted-foreground/70">AKA:</span>
                                {defendant.aliases.map((alias: string, i: number) => (
                                    <Badge key={i} variant="outline" className="text-xs">{alias}</Badge>
                                ))}
                            </div>
                        )}

                        {/* Business names */}
                        {defendant.business_names && defendant.business_names.length > 0 && (
                            <p className="text-sm text-muted-foreground">
                                🏢 {defendant.business_names.join(' • ')}
                            </p>
                        )}
                    </div>
                </div>

                {/* Stats bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                    <StatCard
                        label="Cases Filed"
                        value={activeCases.length.toString()}
                        detail={`${activeCases.filter(c => c.status === 'investigation').length} under investigation`}
                    />
                    <StatCard
                        label="Total Damages"
                        value={totalDocumentedDamages > 0 ? `$${totalDocumentedDamages.toLocaleString()}` : '$0'}
                        detail="Documented across all cases"
                    />
                    <StatCard
                        label="Verdicts"
                        value={(verdicts || []).length.toString()}
                        detail={`${guiltyVerdicts.length} guilty`}
                    />
                    <StatCard
                        label="Responses"
                        value={(responses || []).length.toString()}
                        detail="Defendant statements"
                    />
                </div>
            </div>

            {/* ── TABS ── */}
            <Tabs defaultValue="cases" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="cases">Cases ({activeCases.length})</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline ({(timeline || []).length})</TabsTrigger>
                    <TabsTrigger value="responses">Responses ({(responses || []).length})</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>

                {/* Cases Tab */}
                <TabsContent value="cases" className="space-y-4">
                    {activeCases.length === 0 ? (
                        <EmptyState message="No active cases" />
                    ) : (
                        activeCases.map((c) => {
                            const verdict = (verdicts || []).find(v => v.case_id === c.id)
                            // Find financial impact for this case
                            const fi = allFi.find(f => f.case_id === c.id)
                            const caseDamages = fi
                                ? (fi.total_lost || (fi.direct_payments || 0) + (fi.lost_wages || 0) + (fi.property_loss || 0) + (fi.legal_fees || 0) + (fi.medical_costs || 0) + (fi.credit_damage || 0) + (fi.other_amount || 0))
                                : (c.nominal_damages_claimed || 0)

                            return (
                                <Link key={c.id} href={`/cases/${c.case_number}`}>
                                    <Card className="hover:shadow-md transition-shadow cursor-pointer mb-3">
                                        <CardContent className="p-5 space-y-2">
                                            <div className="flex items-start justify-between gap-4 flex-wrap">
                                                <div className="space-y-1.5 flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-mono text-sm font-bold">{c.case_number}</span>
                                                        <CaseStatusBadge status={c.status} />
                                                    </div>
                                                    {/* One-line summary — the key new field */}
                                                    {c.one_line_summary && (
                                                        <p className="text-sm text-muted-foreground italic">&ldquo;{c.one_line_summary}&rdquo;</p>
                                                    )}
                                                    {c.case_types && c.case_types.length > 0 && (
                                                        <div className="flex flex-wrap gap-1">
                                                            {c.case_types.map((type: string, i: number) => (
                                                                <Badge key={i} variant="secondary" className="text-xs capitalize">
                                                                    {type.replace(/_/g, ' ')}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <p className="text-xs text-muted-foreground">
                                                        Filed {new Date(c.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </p>
                                                </div>
                                                <div className="text-right space-y-1 shrink-0">
                                                    {caseDamages > 0 && (
                                                        <p className="text-lg font-bold">${caseDamages.toLocaleString()}</p>
                                                    )}
                                                    {verdict && (
                                                        <Badge className={verdict.verdict === 'guilty'
                                                            ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                                                            : 'bg-green-500/10 text-green-600 dark:text-green-400'
                                                        }>
                                                            {verdict.verdict.toUpperCase()} ({verdict.average_guilt_score.toFixed(1)}/10)
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            )
                        })
                    )}
                </TabsContent>

                {/* Timeline Tab — aggregated across all cases */}
                <TabsContent value="timeline" className="space-y-4">
                    {!timeline || timeline.length === 0 ? (
                        <EmptyState message="No timeline events" />
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

                {/* Responses Tab */}
                <TabsContent value="responses" className="space-y-4">
                    {!responses || responses.length === 0 ? (
                        <EmptyState message="No defendant responses" />
                    ) : (
                        responses.map((response) => (
                            <Card key={response.id}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">{response.subject_heading}</CardTitle>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(response.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <div
                                        className="prose prose-sm dark:prose-invert max-w-none"
                                        dangerouslySetInnerHTML={{ __html: response.body_html }}
                                    />
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-4">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <DetailRow label="Full Name" value={defendant.full_name} />
                            <DetailRow label="Entity Type" value={entityBadge.label} />
                            {defendant.date_of_birth && <DetailRow label="Date of Birth" value={defendant.date_of_birth} />}
                            {defendant.location && <DetailRow label="Known Location" value={defendant.location} />}
                            {defendant.address && <DetailRow label="Address" value={defendant.address} />}
                            {defendant.phone && <DetailRow label="Phone" value={defendant.phone} />}

                            {/* Social profiles — from new entity data */}
                            {defendant.social_profiles && Object.keys(defendant.social_profiles).length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">Social Profiles</p>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(defendant.social_profiles as Record<string, string>)
                                            .filter(([, url]) => url)
                                            .map(([platform, url]) => (
                                                <a key={platform} href={url} target="_blank" rel="noopener noreferrer">
                                                    <Badge variant="outline" className="text-xs hover:bg-accent capitalize">
                                                        🔗 {platform}
                                                    </Badge>
                                                </a>
                                            ))}
                                    </div>
                                </div>
                            )}

                            <Separator />
                            <p className="text-xs text-muted-foreground">
                                Record created {new Date(defendant.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
    return (
        <div className="rounded-xl border bg-card/50 p-4 space-y-1">
            <p className="text-xs text-muted-foreground font-medium">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground/70">{detail}</p>
        </div>
    )
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-sm">{value}</p>
        </div>
    )
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="rounded-xl border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">{message}</p>
        </div>
    )
}

function DefendantStatusBadge({ status }: { status: string }) {
    const variants: Record<string, { label: string; className: string }> = {
        active: { label: '⚠️ Active', className: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30 text-sm px-3 py-1' },
        merged: { label: 'Merged', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
        archived: { label: 'Archived', className: 'bg-muted text-muted-foreground border-border' },
    }
    const variant = variants[status] || variants.active
    return (
        <Badge variant="outline" className={`font-semibold ${variant.className}`}>{variant.label}</Badge>
    )
}

function CaseStatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        pending_convergence: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
        admin_review: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        investigation: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
        judgment: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
        verdict_guilty: 'bg-red-500/10 text-red-600 dark:text-red-400',
        verdict_innocent: 'bg-green-500/10 text-green-600 dark:text-green-400',
        restitution: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
        resolved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        outstanding: 'bg-red-500/10 text-red-700 dark:text-red-400',
    }
    return (
        <Badge variant="outline" className={`text-xs capitalize ${colors[status] || ''}`}>
            {status.replace(/_/g, ' ')}
        </Badge>
    )
}
