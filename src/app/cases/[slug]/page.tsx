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

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const supabase = await createClient()
    const { data: caseData } = await supabase
        .from('cases')
        .select('case_number, defendants(full_name)')
        .eq('case_number', slug)
        .single()

    if (!caseData) return { title: 'Case Not Found' }
    return {
        title: `Case ${caseData.case_number} — Court of Public Record`,
        description: `Case ${caseData.case_number} vs. ${(caseData.defendants as any)?.full_name}`,
    }
}

export default async function CaseDetailPage({ params }: PageProps) {
    const { slug } = await params
    const supabase = await createClient()

    // Fetch case with defendant
    const { data: caseData, error } = await supabase
        .from('cases')
        .select(`
      *,
      defendants (*)
    `)
        .eq('case_number', slug)
        .single()

    if (error || !caseData) notFound()

    // Parallel queries
    const [
        { data: timeline },
        { data: evidence },
        { data: witnesses },
        { data: verdict },
        { data: comments },
        { data: roles },
        { data: responses },
    ] = await Promise.all([
        supabase.from('timeline_events').select('*').eq('case_id', caseData.id).order('sort_order'),
        supabase.from('evidence').select('*').eq('case_id', caseData.id).order('created_at'),
        supabase.from('witnesses').select('*').eq('case_id', caseData.id),
        supabase.from('verdict_results').select('*').eq('case_id', caseData.id).maybeSingle(),
        supabase.from('comments').select('*, user_profiles(display_name, avatar_url)').eq('commentable_type', 'case').eq('commentable_id', caseData.id).eq('is_hidden', false).order('created_at', { ascending: false }).limit(20),
        supabase.from('case_roles').select('*, user_profiles(display_name, avatar_url)').eq('case_id', caseData.id).eq('status', 'approved'),
        supabase.from('defendant_responses').select('*').in('case_id', [caseData.id]).order('created_at', { ascending: false }),
    ])

    const defendant = caseData.defendants as any
    const narrativeStory = caseData.story_narrative as any

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
            {/* Case Header */}
            <div className="rounded-2xl border bg-gradient-to-br from-card via-card to-muted/30 p-8">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Defendant avatar */}
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
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-mono text-lg font-bold">{caseData.case_number}</span>
                                    <Badge variant="outline" className={`capitalize ${statusColors[caseData.status] || ''}`}>
                                        {caseData.status.replace(/_/g, ' ')}
                                    </Badge>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                                    vs. <Link href={`/defendants/${defendant?.slug || ''}`} className="hover:text-primary transition-colors">
                                        {defendant?.full_name || 'Unknown'}
                                    </Link>
                                </h1>
                            </div>
                        </div>

                        {/* Case types */}
                        {caseData.case_types && caseData.case_types.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {caseData.case_types.map((type: string, i: number) => (
                                    <Badge key={i} variant="secondary" className="text-xs capitalize">{type.replace(/_/g, ' ')}</Badge>
                                ))}
                            </div>
                        )}

                        <p className="text-sm text-muted-foreground">
                            Filed {new Date(caseData.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            {defendant?.location && <span> · 📍 {defendant.location}</span>}
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                    <StatBox label="Damages Claimed" value={caseData.nominal_damages_claimed ? `$${caseData.nominal_damages_claimed.toLocaleString()}` : '$0'} />
                    <StatBox label="Evidence" value={(evidence || []).length.toString()} />
                    <StatBox label="Witnesses" value={(witnesses || []).length.toString()} />
                    <StatBox label="Team Members" value={(roles || []).length.toString()} />
                </div>
            </div>

            {/* Verdict Banner (if exists) */}
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

            {/* Tabbed Content */}
            <Tabs defaultValue="story" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="story">Story</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="evidence">Evidence</TabsTrigger>
                    <TabsTrigger value="team">Team</TabsTrigger>
                    <TabsTrigger value="responses">Responses</TabsTrigger>
                </TabsList>

                {/* Story Tab */}
                <TabsContent value="story" className="space-y-6">
                    {narrativeStory?.title && (
                        <h2 className="text-xl font-bold">&ldquo;{narrativeStory.title}&rdquo;</h2>
                    )}

                    {/* Relationship */}
                    {caseData.relationship_narrative && (
                        <NarrativeBlock title="🔗 The Connection" data={caseData.relationship_narrative as any} fields={[
                            ['type', 'Relationship'], ['duration', 'Duration'], ['how_met', 'How They Met']
                        ]} />
                    )}

                    {/* Promise */}
                    {caseData.promise_narrative && (
                        <NarrativeBlock title="🤝 The Promise" data={caseData.promise_narrative as any} fields={[
                            ['what', 'What Was Promised'], ['when', 'When'], ['evidence', 'Evidence of Promise']
                        ]} />
                    )}

                    {/* Betrayal */}
                    {caseData.betrayal_narrative && (
                        <NarrativeBlock title="💔 The Betrayal" data={caseData.betrayal_narrative as any} fields={[
                            ['what_happened', 'What Happened'], ['when_discovered', 'When Discovered'], ['how_discovered', 'How Discovered']
                        ]} />
                    )}

                    {/* Full Story */}
                    {narrativeStory?.body && (
                        <Card>
                            <CardHeader><CardTitle>📖 Full Narrative</CardTitle></CardHeader>
                            <CardContent>
                                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                                    {narrativeStory.body}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Impact */}
                    {caseData.personal_impact && (
                        <NarrativeBlock title="💥 Impact" data={caseData.personal_impact as any} fields={[
                            ['financial_amount', 'Financial Loss'], ['financial_description', 'Financial Details'],
                            ['emotional', 'Emotional Impact'], ['physical', 'Physical Impact']
                        ]} />
                    )}

                    {/* Legal Actions */}
                    {caseData.legal_actions && (
                        <NarrativeBlock title="⚖️ Legal Actions Taken" data={caseData.legal_actions as any} fields={[
                            ['police_report', 'Police Report'], ['lawyer', 'Lawyer Consulted'],
                            ['court_case', 'Court Case Filed'], ['description', 'Details']
                        ]} />
                    )}
                </TabsContent>

                {/* Timeline Tab */}
                <TabsContent value="timeline" className="space-y-4">
                    {!timeline || timeline.length === 0 ? (
                        <EmptyState>No timeline events</EmptyState>
                    ) : (
                        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-border">
                            {timeline.map((event) => (
                                <div key={event.id} className="relative">
                                    <div className="absolute -left-6 top-1 h-4 w-4 rounded-full border-2 border-primary bg-background" />
                                    <Card>
                                        <CardContent className="p-4 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Badge variant="outline" className="text-xs capitalize">{event.event_type.replace(/_/g, ' ')}</Badge>
                                                <span className="text-xs text-muted-foreground">{event.date_or_year}</span>
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

                {/* Evidence Tab */}
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
                                        <p className="text-xs text-muted-foreground">{ev.description}</p>
                                        {ev.is_verified && (
                                            <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 text-xs">
                                                ✅ Verified
                                            </Badge>
                                        )}
                                        {ev.sha256_hash && (
                                            <p className="text-xs text-muted-foreground/50 font-mono truncate">
                                                SHA-256: {ev.sha256_hash}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Team Tab */}
                <TabsContent value="team" className="space-y-4">
                    {!roles || roles.length === 0 ? (
                        <EmptyState>No team members assigned</EmptyState>
                    ) : (
                        <div className="grid gap-3">
                            {roles.map((role) => {
                                const profile = (role as any).user_profiles
                                return (
                                    <Card key={role.id}>
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {profile?.avatar_url ? (
                                                    <img src={profile.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                                                        {profile?.display_name?.charAt(0) || '?'}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium">{profile?.display_name || 'Unknown'}</p>
                                                    <p className="text-xs text-muted-foreground capitalize">{role.role.replace(/_/g, ' ')}</p>
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Joined {new Date(role.created_at).toLocaleDateString()}
                                            </p>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                    <div className="text-center pt-4">
                        <Button variant="outline">Join This Case</Button>
                    </div>
                </TabsContent>

                {/* Responses Tab */}
                <TabsContent value="responses" className="space-y-4">
                    <div className="rounded-lg border p-4 bg-muted/20 mb-4">
                        <p className="text-sm text-muted-foreground">
                            <strong>Right of Reply:</strong> The defendant may respond to claims. Responses appear here.
                        </p>
                    </div>
                    {!responses || responses.length === 0 ? (
                        <EmptyState>No defendant responses</EmptyState>
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

            {/* Vote CTA — gated by vote permission */}
            {['judgment', 'investigation', 'pending_convergence'].includes(caseData.status) && (
                <VoteCTA caseId={caseData.id} />
            )}

            {/* Comments Section */}
            <Separator />
            <CaseComments caseId={caseData.id} />
        </div>
    )
}

function StatBox({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border bg-card/50 p-3 text-center">
            <p className="text-xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
        </div>
    )
}

function NarrativeBlock({ title, data, fields }: { title: string; data: Record<string, any>; fields: [string, string][] }) {
    const hasContent = fields.some(([key]) => data[key])
    if (!hasContent) return null
    return (
        <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">{title}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
                {fields.map(([key, label]) => data[key] && (
                    <div key={key}>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
                        <p className="text-sm whitespace-pre-wrap capitalize">{String(data[key])}</p>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

function EmptyState({ children }: { children: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">{children}</p>
        </div>
    )
}
