'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/i18n'

export default function DefendantsPage() {
    const { t } = useTranslation()
    const [defendants, setDefendants] = useState<any[] | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [query, setQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('')

    useEffect(() => {
        const fetchDefendants = async () => {
            const supabase = createClient()
            const { data, error } = await supabase
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
                .limit(50)

            if (error) {
                setError(error.message)
            } else {
                setDefendants(data)
            }
            setLoading(false)
        }
        fetchDefendants()
    }, [])

    // Client-side filtering
    const allDefendants = defendants || []
    const statusFiltered = statusFilter
        ? allDefendants.filter(d => d.status === statusFilter)
        : allDefendants
    const filtered = query
        ? statusFiltered.filter(d =>
            d.full_name.toLowerCase().includes(query.toLowerCase()) ||
            (d.aliases || []).some((a: string) => a.toLowerCase().includes(query.toLowerCase())) ||
            (d.business_names || []).some((b: string) => b.toLowerCase().includes(query.toLowerCase()))
        )
        : statusFiltered

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">{t('defendants.browseTitle')}</h1>
                    <p className="text-muted-foreground">{t('defendants.browseDescription')}</p>
                </div>
                <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">{t('defendants.browseTitle')}</h1>
                <p className="text-muted-foreground">
                    {t('defendants.browseDescription')}
                </p>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Input
                        type="search"
                        placeholder={t('defendants.searchPlaceholder')}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="h-11"
                    />
                </div>
                <Select
                    value={statusFilter || 'all'}
                    onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}
                >
                    <SelectTrigger className="w-full sm:w-[160px] h-11">
                        <SelectValue placeholder={t('defendants.allStatuses')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('defendants.allStatuses')}</SelectItem>
                        <SelectItem value="active">{t('defendants.statusActive')}</SelectItem>
                        <SelectItem value="merged">{t('defendants.statusMerged')}</SelectItem>
                        <SelectItem value="archived">{t('defendants.statusArchived')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {filtered.length} {t('defendants.defendantsFound')}
                    {query && <span> {t('defendants.forQuery')} &ldquo;{query}&rdquo;</span>}
                </p>
            </div>

            {/* Defendant Grid */}
            {filtered.length === 0 ? (
                <div className="rounded-xl border border-dashed p-12 text-center">
                    <p className="text-lg font-medium text-muted-foreground">{t('defendants.noDefendants')}</p>
                    <p className="text-sm text-muted-foreground/60 mt-1">
                        {query ? t('defendants.adjustSearch') : t('defendants.noCasesFiled')}
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
                                        <StatusBadge status={defendant.status} t={t} />
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
                                                    +{defendant.aliases.length - 3} {t('defendants.more')}
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
                    {t('defendants.errorLoading')}: {error}
                </div>
            )}
        </div>
    )
}

function StatusBadge({ status, t }: { status: string; t: (key: string) => string }) {
    const variants: Record<string, { labelKey: string; className: string }> = {
        active: { labelKey: 'defendants.statusActive', className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
        merged: { labelKey: 'defendants.statusMerged', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
        archived: { labelKey: 'defendants.statusArchived', className: 'bg-muted text-muted-foreground border-border' },
    }

    const variant = variants[status] || variants.active

    return (
        <Badge variant="outline" className={`text-xs font-medium ${variant.className}`}>
            {t(variant.labelKey)}
        </Badge>
    )
}
