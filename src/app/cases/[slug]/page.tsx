import { GlobeAltIcon, UsersIcon, CalendarIcon, BuildingOfficeIcon, MapPinIcon, ShieldExclamationIcon, DocumentTextIcon, CheckBadgeIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

// This will eventually come from Supabase by slug
const caseData = {
    name: 'Colin James Bradley',
    alias: 'Cole',
    businesses: ['Austyle Building Pty Ltd', 'Blue Invest Premium Consultants Pty Ltd'],
    yearsActive: '2019–2025',
    confirmedVictims: 4,
    nations: ['Australia', 'Vietnam', 'Thailand', 'UAE', 'Indonesia'],
    summary: `Colin James Bradley, operating under the alias "Cole," executed a global fraud scheme spanning multiple countries and years. Beginning in Australia, Bradley established a pattern of financial manipulation through fabricated business ventures, including a fraudulent zero-fuel propulsion technology company called Marine Warrior Superyachts.

His modus operandi involved presenting himself as a connected businessman with access to multi-million dollar yacht contracts and revolutionary marine technology. Victims were drawn in through elaborate presentations, fake contracts, and promises of substantial returns on investment.

Bradley's operations spanned from Vietnam to Australia, Thailand, and the UAE, with each jurisdiction change occurring after mounting debts and growing suspicion from victims. The collected evidence reveals a consistent pattern: establish credibility, secure financial commitments, create elaborate excuses for delays, then relocate internationally when confronted.`,

    timeline: [
        { date: 'Feb 2014', location: 'Australia', event: 'Vehicle Refinancing — first documented financial manipulation' },
        { date: 'Mar 2014', location: 'Australia', event: 'Lent Colin $10,000 based on promises of repayment from pending contracts' },
        { date: 'Jan 2015', location: 'Australia', event: 'Started Big Rig Tyres — a business venture that would later collapse' },
        { date: 'Jun 2015', location: 'Australia', event: '$60,000 loan against house — escalating financial commitments from victims' },
        { date: '2019', location: 'Vietnam', event: 'Entered victim\'s life in Da Nang, presenting Marine Warrior Superyachts concept' },
        { date: '2020', location: 'Vietnam/Australia', event: 'Pitched zero-fuel propulsion technology with fabricated technical specifications' },
        { date: '2021', location: 'Thailand', event: 'Relocated to Thailand after mounting pressure from Vietnamese and Australian contacts' },
        { date: '2023', location: 'UAE', event: 'Moved operations to Dubai, continuing the same pattern with new targets' },
        { date: '2025', location: 'Multi-jurisdictional', event: 'Case documented and verified by multiple independent victims' },
    ],
}

export default function CaseDetailPage() {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* Case Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                        Active
                    </span>
                    <span className="text-sm text-muted-foreground">Multi-jurisdictional Investigation</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                    {caseData.name}
                </h1>
                <p className="text-muted-foreground">
                    Alias: &ldquo;{caseData.alias}&rdquo;
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { icon: BuildingOfficeIcon, label: 'Businesses', value: String(caseData.businesses.length) },
                    { icon: CalendarIcon, label: 'Years Active', value: caseData.yearsActive },
                    { icon: UsersIcon, label: 'Confirmed Victims', value: String(caseData.confirmedVictims) },
                    { icon: GlobeAltIcon, label: 'Nations', value: String(caseData.nations.length) },
                ].map((stat) => (
                    <div key={stat.label} className="rounded-xl border bg-card p-4 text-center">
                        <stat.icon className="h-5 w-5 mx-auto mb-2" style={{ color: 'hsl(var(--primary))' }} />
                        <p className="text-xl font-bold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Linked Businesses */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <BuildingOfficeIcon className="h-5 w-5" /> Linked Business Entities
                </h2>
                <div className="flex flex-wrap gap-2">
                    {caseData.businesses.map((b) => (
                        <span key={b} className="px-3 py-1.5 rounded-lg border bg-muted text-sm">
                            {b}
                        </span>
                    ))}
                </div>
            </div>

            {/* Nations */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <MapPinIcon className="h-5 w-5" /> Jurisdictions
                </h2>
                <div className="flex flex-wrap gap-2">
                    {caseData.nations.map((n) => (
                        <span key={n} className="px-3 py-1.5 rounded-lg border bg-muted text-sm">
                            {n}
                        </span>
                    ))}
                </div>
            </div>

            <Separator />

            {/* Case Summary */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <ShieldExclamationIcon className="h-5 w-5" style={{ color: 'hsl(var(--primary))' }} />
                    Case Summary
                </h2>
                <div className="rounded-xl border bg-card p-6 space-y-4">
                    {caseData.summary.split('\n\n').map((paragraph, i) => (
                        <p key={i} className="text-muted-foreground leading-relaxed">
                            {paragraph}
                        </p>
                    ))}
                </div>
            </div>

            <Separator />

            {/* Timeline */}
            <div className="space-y-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <DocumentTextIcon className="h-5 w-5" style={{ color: 'hsl(var(--primary))' }} />
                    Chronological Timeline
                </h2>
                <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                    <div className="space-y-4">
                        {caseData.timeline.map((entry, i) => (
                            <div key={i} className="relative flex gap-4 pl-10">
                                <div
                                    className="absolute left-2.5 top-1.5 h-3 w-3 rounded-full border-2"
                                    style={{ borderColor: 'hsl(var(--primary))', background: 'hsl(var(--background))' }}
                                />
                                <div className="flex-1 rounded-lg border bg-card p-4">
                                    <div className="flex flex-wrap gap-2 mb-1">
                                        <span className="text-sm font-semibold">{entry.date}</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                            {entry.location}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{entry.event}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Separator />

            {/* Evidence Vault & Community */}
            <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-xl border bg-card p-6 text-center space-y-3">
                    <DocumentTextIcon className="h-8 w-8 mx-auto text-muted-foreground/40" />
                    <h3 className="font-semibold">Evidence Vault</h3>
                    <p className="text-sm text-muted-foreground">
                        Screenshots, recordings, and document backups supporting this case.
                    </p>
                    <Button variant="outline" size="sm">View Evidence</Button>
                </div>
                <div className="rounded-xl border bg-card p-6 text-center space-y-3">
                    <CheckBadgeIcon className="h-8 w-8 mx-auto text-muted-foreground/40" />
                    <h3 className="font-semibold">Community Voting</h3>
                    <p className="text-sm text-muted-foreground">
                        Review the evidence and vote on the validity of specific claims.
                    </p>
                    <Button variant="outline" size="sm">Cast Your Vote</Button>
                </div>
            </div>

            {/* Right of Reply */}
            <div className="rounded-xl border bg-card p-6 space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                    <ChatBubbleLeftRightIcon className="h-5 w-5" />
                    Right of Reply
                </h3>
                <p className="text-sm text-muted-foreground">
                    The defendant has the right to respond to any claims made in this case file.
                    A verified right of reply ensures fairness and transparency in the public record.
                </p>
                <Button variant="outline" size="sm">Submit a Response</Button>
            </div>
        </div>
    )
}
