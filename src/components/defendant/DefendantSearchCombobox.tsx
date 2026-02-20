'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { Search, UserCheck, Plus, MapPin, FileText, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DefendantResult {
    id: string
    full_name: string
    first_name: string | null
    middle_name: string | null
    last_name: string | null
    location: string | null
    slug: string
    status: string
    aliases: string[] | null
    business_names: string[] | null
    case_count: number
}

interface DefendantSearchComboboxProps {
    onSelect: (defendant: DefendantResult) => void
    onCreateNew: () => void
    className?: string
}

export function DefendantSearchCombobox({
    onSelect,
    onCreateNew,
    className,
}: DefendantSearchComboboxProps) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<DefendantResult[]>([])
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [searched, setSearched] = useState(false)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Debounced search — fires 350ms after user stops typing (pearl: lazy, on interaction)
    const handleChange = useCallback((val: string) => {
        setQuery(val)
        setSearched(false)

        if (debounceRef.current) clearTimeout(debounceRef.current)

        if (val.trim().length < 2) {
            setResults([])
            setOpen(false)
            return
        }

        debounceRef.current = setTimeout(async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/defendants/search?q=${encodeURIComponent(val.trim())}`)
                const json = await res.json()
                setResults(json.results ?? [])
                setOpen(true)
                setSearched(true)
            } catch {
                setResults([])
            } finally {
                setLoading(false)
            }
        }, 350)
    }, [])

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleSelect = (defendant: DefendantResult) => {
        setOpen(false)
        setQuery(defendant.full_name)
        onSelect(defendant)
    }

    const handleCreateNew = () => {
        setOpen(false)
        onCreateNew()
    }

    return (
        <div ref={containerRef} className={cn('relative', className)}>
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                {loading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
                )}
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={e => handleChange(e.target.value)}
                    onFocus={() => { if (results.length > 0) setOpen(true) }}
                    placeholder="Search by name, alias, or business name…"
                    autoComplete="off"
                    className={cn(
                        'w-full pl-9 pr-9 py-3 rounded-lg border border-input bg-background',
                        'text-sm placeholder:text-muted-foreground',
                        'focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring',
                        'transition-colors'
                    )}
                />
            </div>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-lg border border-border bg-popover shadow-lg overflow-hidden">

                    {/* Results */}
                    {results.length > 0 && (
                        <ul>
                            {results.map(d => (
                                <li key={d.id}>
                                    <button
                                        type="button"
                                        onMouseDown={() => handleSelect(d)}
                                        className="w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/60 transition-colors text-left border-b border-border last:border-0"
                                    >
                                        {/* Avatar placeholder */}
                                        <div className="shrink-0 w-9 h-9 rounded-full bg-muted flex items-center justify-center mt-0.5">
                                            <span className="text-sm font-semibold text-muted-foreground">
                                                {d.full_name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-medium text-sm truncate">{d.full_name}</span>
                                                {d.case_count > 0 && (
                                                    <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-medium shrink-0">
                                                        <FileText className="w-3 h-3" />
                                                        {d.case_count} {d.case_count === 1 ? 'case' : 'cases'}
                                                    </span>
                                                )}
                                                {d.status === 'active' && d.case_count >= 2 && (
                                                    <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 font-medium shrink-0">
                                                        Active Record
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                {d.location && (
                                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <MapPin className="w-3 h-3" />
                                                        {d.location}
                                                    </span>
                                                )}
                                                {d.aliases && d.aliases.length > 0 && (
                                                    <span className="text-xs text-muted-foreground italic">
                                                        aka {d.aliases.slice(0, 2).join(', ')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <UserCheck className="shrink-0 w-4 h-4 text-primary mt-1 opacity-0 group-hover:opacity-100" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* No results + create new */}
                    {searched && results.length === 0 && (
                        <div className="px-4 py-3 text-sm text-muted-foreground border-b border-border">
                            No matches found for &quot;<span className="font-medium text-foreground">{query}</span>&quot;
                        </div>
                    )}

                    {/* Always show Create New option at bottom */}
                    <button
                        type="button"
                        onMouseDown={handleCreateNew}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/60 transition-colors text-left text-sm font-medium text-primary"
                    >
                        <div className="shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <Plus className="w-4 h-4 text-primary" />
                        </div>
                        <span>
                            {query.trim()
                                ? <>Create new record for &quot;<span className="font-semibold">{query}</span>&quot;</>
                                : 'Create a new defendant record'
                            }
                        </span>
                    </button>
                </div>
            )}

            {/* Helper text */}
            <p className="mt-2 text-xs text-muted-foreground">
                Type at least 2 characters to search. If your defendant already has a record, please select them — do not create a duplicate.
            </p>
        </div>
    )
}
