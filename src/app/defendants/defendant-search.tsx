'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function DefendantSearch({ initialQuery, initialStatus }: { initialQuery: string; initialStatus: string }) {
    const router = useRouter()
    const [query, setQuery] = useState(initialQuery)
    const [status, setStatus] = useState(initialStatus)
    const [isPending, startTransition] = useTransition()

    function updateSearch(newQuery: string, newStatus: string) {
        const params = new URLSearchParams()
        if (newQuery) params.set('q', newQuery)
        if (newStatus) params.set('status', newStatus)
        startTransition(() => {
            router.push(`/defendants${params.toString() ? `?${params.toString()}` : ''}`)
        })
    }

    return (
        <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
                <Input
                    type="search"
                    placeholder="Search by name, alias, or business..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        updateSearch(e.target.value, status)
                    }}
                    className="h-11"
                />
                {isPending && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                )}
            </div>
            <Select
                value={status || 'all'}
                onValueChange={(value) => {
                    const newStatus = value === 'all' ? '' : value
                    setStatus(newStatus)
                    updateSearch(query, newStatus)
                }}
            >
                <SelectTrigger className="w-full sm:w-[160px] h-11">
                    <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="merged">Merged</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}
