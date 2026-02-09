import { ScaleIcon, MagnifyingGlassIcon, ClockIcon, CheckBadgeIcon, DocumentCheckIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline'

const steps = [
    {
        number: 1,
        title: 'Accusations',
        subtitle: 'Every Case Starts with More than One Claim',
        description:
            'The Court of Public Record requires at least two independent claims before opening a case. This protects against personal vendettas and ensures patterns of behavior are documented, not isolated grievances. Every accusation is reviewed for basic credibility before proceeding.',
        icon: ScaleIcon,
    },
    {
        number: 2,
        title: 'Public Investigation Opens',
        subtitle: 'A Case Becomes Live',
        description:
            'Once verified, a case is assigned a unique Case ID and given a permanent URL on the platform. The case becomes publicly accessible, allowing additional victims to come forward and add their testimony. All submissions are timestamped and attributed.',
        icon: MagnifyingGlassIcon,
    },
    {
        number: 3,
        title: 'Timeline Construction',
        subtitle: 'Building the Chronological Record',
        description:
            'Victims, witnesses, and investigators collaboratively build a chronological timeline of events, interactions, and financial flows. Each entry is tagged with a date, location, and supporting evidence. The timeline reveals patterns that isolated victims could never see alone.',
        icon: ClockIcon,
    },
    {
        number: 4,
        title: 'Judgment by the Public',
        subtitle: 'Evidence Presented for Public Review',
        description:
            'The compiled evidence is presented for public review. Community members can examine the timeline, read testimonies, and view supporting documents. The community can vote on the validity of specific claims, creating a transparent consensus.',
        icon: CheckBadgeIcon,
    },
    {
        number: 5,
        title: 'Verified Record',
        subtitle: 'Patterns Documented into a Formal Case File',
        description:
            'Confirmed patterns of behavior are documented into a formal Case File. This includes the defendant profile, verified timeline, victim testimonies, and supporting evidence. The record becomes a comprehensive reference for anyone researching the individual.',
        icon: DocumentCheckIcon,
    },
    {
        number: 6,
        title: 'Archived in History',
        subtitle: 'Permanently Preserved',
        description:
            'The completed record is permanently preserved, ensuring the truth is accessible to future partners, employers, investors, or authorities. The Court of Public Record exists so that no one has to discover the truth the hard way — alone.',
        icon: ArchiveBoxIcon,
    },
]

export default function HowItWorksPage() {
    return (
        <div className="space-y-12 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">How It Works</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    The Court of Public Record transforms scattered testimonies into verified, permanent
                    case files through a transparent six-step process.
                </p>
            </div>

            <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-8 top-0 bottom-0 w-px bg-border hidden md:block" />

                <div className="space-y-8">
                    {steps.map((step) => (
                        <div key={step.number} className="relative flex gap-6">
                            {/* Step number circle */}
                            <div
                                className="shrink-0 h-16 w-16 rounded-full flex items-center justify-center text-white font-bold text-lg relative z-10"
                                style={{ background: 'hsl(var(--primary))' }}
                            >
                                {step.number}
                            </div>

                            {/* Content card */}
                            <div className="flex-1 rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-3 mb-3">
                                    <step.icon className="h-5 w-5 mt-0.5 shrink-0" style={{ color: 'hsl(var(--primary))' }} />
                                    <div>
                                        <h3 className="font-semibold text-lg">{step.title}</h3>
                                        <p className="text-sm text-muted-foreground">{step.subtitle}</p>
                                    </div>
                                </div>
                                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
