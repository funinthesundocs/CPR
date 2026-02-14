import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DefendantSearch } from './defendant-search'

export const revalidate = 30

type SearchParams = Promise<{ q?: string; status?: string }>

export default async function DefendantsPage({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams
    const query = params?.q || ''
    const statusFilter = params?.status || ''

    const supabase = await createClient()

    let dbQuery = supabase
        .from('defendants')
        .select(`
      id,
      full_name,
      aliases,
      photo_url,
      location,
      status,
      slug,
      business_names,
      created_at
    `)
        .order('created_at', { ascending: false })

    if (statusFilter) {
        dbQuery = dbQuery.eq('status', statusFilter)
    }

    const { data: defendants, error } = await dbQuery.limit(50)

    // Client-side fuzzy filter (trigram search happens in DB for large datasets, 
    // but for MVP we filter in JS since we're loading ≤50)
    const filtered = query
        ? (defendants || []).filter(d =>
            d.full_name.toLowerCase().includes(query.toLowerCase()) ||
            (d.aliases || []).some((a: string) => a.toLowerCase().includes(query.toLowerCase())) ||
            (d.business_names || []).some((b: string) => b.toLowerCase().includes(query.toLowerCase()))
        )
        : (defendants || [])

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Defendants</h1>
                <p className="text-muted-foreground">
                    Browse and search all defendants with active or archived cases on the public record.
                </p>
            </div>

            {/* Search & Filters */}
            <DefendantSearch initialQuery={query} initialStatus={statusFilter} />

            {/* Results Count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {filtered.length} defendant{filtered.length !== 1 ? 's' : ''} found
                    {query && <span> for &ldquo;{query}&rdquo;</span>}
                </p>
            </div>

            {/* Defendant Grid */}
            {filtered.length === 0 ? (
                <div className="rounded-xl border border-dashed p-12 text-center">
                    <p className="text-lg font-medium text-muted-foreground">No defendants found</p>
                    <p className="text-sm text-muted-foreground/60 mt-1">
                        {query ? 'Try adjusting your search terms' : 'No cases have been filed yet'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((defendant) => (
                        <Link key={defendant.id} href={`/defendants/${defendant.slug}`}>
                            <Card className="hover:shadow-lg transition-all duration-200 hover:border-primary/30 cursor-pointer h-full">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-3">
                                            {defendant.photo_url ? (
                                                <img
                                                    src={defendant.photo_url}
                                                    alt={defendant.full_name}
                                                    className="h-12 w-12 rounded-full object-cover ring-2 ring-border"
                                                />
                                            ) : (
                                                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground">
                                                    {defendant.full_name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <CardTitle className="text-base leading-snug">{defendant.full_name}</CardTitle>
                                                {defendant.location && (
                                                    <p className="text-xs text-muted-foreground mt-0.5">{defendant.location}</p>
                                                )}
                                            </div>
                                        </div>
                                        <StatusBadge status={defendant.status} />
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    {defendant.aliases && defendant.aliases.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {defendant.aliases.slice(0, 3).map((alias: string, i: number) => (
                                                <Badge key={i} variant="outline" className="text-xs">
                                                    {alias}
                                                </Badge>
                                            ))}
                                            {defendant.aliases.length > 3 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{defendant.aliases.length - 3} more
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                    {defendant.business_names && defendant.business_names.length > 0 && (
                                        <p className="text-xs text-muted-foreground truncate">
                                            🏢 {defendant.business_names.join(', ')}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

            {error && (
                <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
                    Error loading defendants: {error.message}
                </div>
            )}
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const variants: Record<string, { label: string; className: string }> = {
        active: { label: 'Active', className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
        merged: { label: 'Merged', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
        archived: { label: 'Archived', className: 'bg-muted text-muted-foreground border-border' },
    }

    const variant = variants[status] || variants.active

    return (
        <Badge variant="outline" className={`text-xs font-medium ${variant.className}`}>
            {variant.label}
        </Badge>
    )
}
