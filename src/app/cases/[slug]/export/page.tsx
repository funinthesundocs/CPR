import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const revalidate = 60

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    return {
        title: `Export Case ${slug} — Court of Public Record`,
    }
}

export default async function CaseExportPage({ params }: PageProps) {
    const { slug } = await params
    const supabase = await createClient()

    const { data: caseData } = await supabase
        .from('cases')
        .select(`
      *,
      defendants (*),
      case_timeline_events (*),
      case_financial_impacts (*),
      witnesses (*),
      verdict_results (*)
    `)
        .eq('case_number', slug)
        .single()

    if (!caseData) return notFound()

    const defendant = caseData.defendants as any
    const timeline = (caseData.case_timeline_events || []) as any[]
    const impacts = (caseData.case_financial_impacts || []) as any[]
    const witnesses = (caseData.witnesses || []) as any[]
    const verdict = caseData.verdict_results as any

    return (
        <div className="max-w-3xl mx-auto space-y-8 py-4">
            {/* Print-friendly styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @media print {
          nav, header, aside, footer, button, .no-print { display: none !important; }
          body { font-size: 11pt; color: #000; background: #fff; }
          .print-page { page-break-after: always; }
          @page { margin: 1.5cm; }
        }
      `}} />

            {/* Header */}
            <div className="text-center border-b-2 border-foreground pb-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Court of Public Record</p>
                <h1 className="text-3xl font-bold mt-2">Case {caseData.case_number}</h1>
                <p className="text-lg mt-1">
                    The People vs. <strong>{defendant?.full_name || 'Unknown'}</strong>
                </p>
                <div className="flex justify-center gap-6 mt-3 text-sm text-muted-foreground">
                    <span>Filed: {new Date(caseData.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <span>Status: {caseData.status.replace(/_/g, ' ').toUpperCase()}</span>
                </div>
            </div>

            {/* Print Button */}
            <div className="text-center no-print">
                <button
                    onClick={() => { if (typeof window !== 'undefined') window.print() }}
                    className="inline-flex items-center gap-2 rounded-lg border bg-card px-6 py-3 text-sm font-semibold hover:bg-muted transition-colors"
                >
                    🖨️ Print / Save as PDF
                </button>
                <p className="text-xs text-muted-foreground mt-2">
                    Use your browser&apos;s print dialog to save as PDF
                </p>
            </div>

            {/* Defendant Summary */}
            <Section title="Defendant Information">
                <Row label="Full Name" value={defendant?.full_name} />
                <Row label="Known Aliases" value={defendant?.aliases?.join(', ')} />
                <Row label="Business Entities" value={defendant?.business_entities?.join(', ')} />
                <Row label="Jurisdictions" value={defendant?.jurisdictions?.join(', ')} />
                <Row label="Status" value={defendant?.status?.replace(/_/g, ' ')} />
            </Section>

            {/* Case Narrative */}
            <Section title="Case Summary">
                <Row label="Case Type" value={(caseData.case_types as string[])?.join(', ')} />
                <Row label="Relationship" value={caseData.relationship_to_defendant} />
                <Row label="Initial Promise" value={caseData.initial_promise} />
                <Row label="What Happened" value={caseData.betrayal_description} />
                {caseData.story_narrative && (
                    <div className="mt-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Full Narrative</p>
                        <p className="text-sm whitespace-pre-wrap">{(caseData.story_narrative as any)?.full_story || String(caseData.story_narrative)}</p>
                    </div>
                )}
            </Section>

            {/* Financial Impact */}
            {impacts.length > 0 && (
                <Section title="Financial Impact">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-2 font-semibold">Category</th>
                                <th className="text-right py-2 font-semibold">Amount</th>
                                <th className="text-left py-2 font-semibold">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {impacts.map((imp: any, i: number) => (
                                <tr key={i} className="border-b last:border-0">
                                    <td className="py-2 capitalize">{imp.category?.replace(/_/g, ' ')}</td>
                                    <td className="py-2 text-right">${imp.amount?.toLocaleString()}</td>
                                    <td className="py-2 text-muted-foreground">{imp.description}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="font-bold">
                                <td className="py-2">Total</td>
                                <td className="py-2 text-right">
                                    ${impacts.reduce((sum: number, imp: any) => sum + (imp.amount || 0), 0).toLocaleString()}
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </Section>
            )}

            {/* Timeline */}
            {timeline.length > 0 && (
                <Section title="Timeline of Events">
                    <div className="space-y-3">
                        {timeline
                            .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
                            .map((event: any, i: number) => (
                                <div key={i} className="flex gap-4">
                                    <span className="text-sm font-mono text-muted-foreground shrink-0 w-28">
                                        {new Date(event.event_date).toLocaleDateString()}
                                    </span>
                                    <div>
                                        <p className="text-sm font-medium">{event.description}</p>
                                        {event.category && <p className="text-xs text-muted-foreground capitalize">{event.category.replace(/_/g, ' ')}</p>}
                                    </div>
                                </div>
                            ))}
                    </div>
                </Section>
            )}

            {/* Witnesses */}
            {witnesses.length > 0 && (
                <Section title="Witnesses">
                    {witnesses.map((w: any, i: number) => (
                        <div key={i} className="py-2 border-b last:border-0">
                            <p className="text-sm font-medium">{w.display_name || 'Anonymous'}</p>
                            <p className="text-xs text-muted-foreground capitalize">{w.relationship} • {w.can_testify ? 'Willing to testify' : 'Statement only'}</p>
                        </div>
                    ))}
                </Section>
            )}

            {/* Verdict */}
            {verdict && (
                <Section title="Verdict">
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-4 rounded-lg border">
                            <p className="text-2xl font-bold">{verdict.verdict?.replace(/_/g, ' ').toUpperCase()}</p>
                            <p className="text-xs text-muted-foreground">Verdict</p>
                        </div>
                        <div className="p-4 rounded-lg border">
                            <p className="text-2xl font-bold">{verdict.average_guilt_score?.toFixed(1)}/10</p>
                            <p className="text-xs text-muted-foreground">Avg Guilt Score</p>
                        </div>
                        <div className="p-4 rounded-lg border">
                            <p className="text-2xl font-bold">{verdict.total_votes}</p>
                            <p className="text-xs text-muted-foreground">Total Votes</p>
                        </div>
                        <div className="p-4 rounded-lg border">
                            <p className="text-2xl font-bold">${(verdict.total_restitution || 0).toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Total Restitution</p>
                        </div>
                    </div>
                </Section>
            )}

            {/* Footer */}
            <div className="text-center border-t pt-6 text-xs text-muted-foreground">
                <p>This document was generated from the Court of Public Record platform.</p>
                <p>Case #{caseData.case_number} • Export Date: {new Date().toLocaleDateString()}</p>
                <p className="mt-1">This is a public record maintained by community consensus.</p>
            </div>
        </div>
    )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="print-page">
            <h2 className="text-lg font-bold border-b pb-2 mb-4">{title}</h2>
            {children}
        </div>
    )
}

function Row({ label, value }: { label: string; value?: string | null }) {
    if (!value) return null
    return (
        <div className="flex py-1.5 border-b border-dashed last:border-0">
            <span className="text-sm font-medium w-40 shrink-0 text-muted-foreground">{label}</span>
            <span className="text-sm capitalize">{value}</span>
        </div>
    )
}
