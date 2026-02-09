import Link from 'next/link'
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// This will eventually come from Supabase
const mockCases = [
    {
        slug: 'colin-james-bradley',
        name: 'Colin James "Cole" Bradley',
        status: 'Active',
        region: 'Multi-jurisdictional',
        businesses: ['Austyle Building Pty Ltd', 'Blue Invest Premium Consultants Pty Ltd'],
        summary:
            'Global fraud scheme spanning Vietnam, Australia, Thailand, and the UAE. Fabricated zero-fuel propulsion technology, fake multi-million dollar yacht contracts, and a documented pattern of fleeing jurisdictions after defrauding victims.',
        nations: 5,
        victims: 4,
        period: '2019–2025',
    },
]

export default function CasesPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Case Files</h1>
                <p className="text-muted-foreground mt-1">
                    Verified and documented fraud cases in the public record.
                </p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, alias, or keyword..."
                        className="pl-9"
                    />
                </div>
                <Button variant="outline" className="gap-2">
                    <FunnelIcon className="h-4 w-4" />
                    Status
                </Button>
                <Button variant="outline" className="gap-2">
                    <FunnelIcon className="h-4 w-4" />
                    Region
                </Button>
            </div>

            {/* Case Cards */}
            <div className="grid gap-4">
                {mockCases.map((c) => (
                    <Link
                        key={c.slug}
                        href={`/cases/${c.slug}`}
                        className="block rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-all hover:border-primary/30"
                    >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                        {c.status}
                                    </span>
                                    <span className="text-xs text-muted-foreground">{c.region}</span>
                                </div>
                                <h2 className="text-xl font-semibold">{c.name}</h2>
                                <div className="flex flex-wrap gap-2">
                                    {c.businesses.map((b) => (
                                        <span
                                            key={b}
                                            className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground"
                                        >
                                            {b}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                                    {c.summary}
                                </p>
                            </div>
                            <div className="flex md:flex-col gap-4 md:gap-2 md:text-right shrink-0">
                                <div>
                                    <p className="text-2xl font-bold">{c.nations}</p>
                                    <p className="text-xs text-muted-foreground">Nations</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{c.victims}</p>
                                    <p className="text-xs text-muted-foreground">Victims</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{c.period}</p>
                                    <p className="text-xs text-muted-foreground">Active</p>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
