import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export const revalidate = 30

export default async function CasesPage() {
    const supabase = await createClient()

    const { data: cases, error } = await supabase
        .from('cases')
        .select(`
      id,
      case_number,
      status,
      case_types,
      nominal_damages_claimed,
      created_at,
      verdict_at,
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

    const statusColors: Record<string, string> = {
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

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Case Files</h1>
                <p className="text-muted-foreground mt-1">
                    Browse all active and resolved cases in the Court of Public Record.
                </p>
            </div>

            {/* Cases Count */}
            <p className="text-sm text-muted-foreground">
                {(cases || []).length} case{(cases || []).length !== 1 ? 's' : ''} on record
            </p>

            {/* Case Cards */}
            {(!cases || cases.length === 0) ? (
                <div className="rounded-xl border border-dashed p-12 text-center">
                    <p className="text-lg font-medium text-muted-foreground">No cases filed yet</p>
                    <p className="text-sm text-muted-foreground/60 mt-1">Be the first to file a case and hold someone accountable.</p>
                    <Link href="/cases/new" className="inline-block mt-4">
                        <Badge className="bg-primary text-primary-foreground px-4 py-2 text-sm cursor-pointer hover:bg-primary/90">
                            ⚖️ File a Case
                        </Badge>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {cases.map((c: any) => (
                        <Link key={c.id} href={`/cases/${c.case_number}`}>
                            <Card className="hover:shadow-md transition-all hover:border-primary/30 cursor-pointer">
                                <CardContent className="p-5">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 flex-1">
                                            {/* Defendant avatar */}
                                            {c.defendants?.photo_url ? (
                                                <img src={c.defendants.photo_url} alt="" className="h-12 w-12 rounded-lg object-cover ring-2 ring-border" />
                                            ) : (
                                                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground">
                                                    {c.defendants?.full_name?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                            )}

                                            <div className="space-y-1 flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-mono text-sm font-bold">{c.case_number}</span>
                                                    <Badge variant="outline" className={`text-xs capitalize ${statusColors[c.status] || ''}`}>
                                                        {c.status.replace(/_/g, ' ')}
                                                    </Badge>
                                                </div>
                                                {c.defendants && (
                                                    <p className="text-base font-semibold truncate">
                                                        vs. {c.defendants.full_name}
                                                    </p>
                                                )}
                                                {c.case_types && c.case_types.length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
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
                                        </div>

                                        <div className="flex gap-6 text-right shrink-0">
                                            {c.nominal_damages_claimed > 0 && (
                                                <div>
                                                    <p className="text-lg font-bold">${c.nominal_damages_claimed.toLocaleString()}</p>
                                                    <p className="text-xs text-muted-foreground">Damages</p>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                                <p className="text-xs text-muted-foreground">Filed</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

            {error && (
                <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
                    Error: {error.message}
                </div>
            )}
        </div>
    )
}
