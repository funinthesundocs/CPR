'use client'

import {
    BuildingOfficeIcon,
    GlobeAltIcon,
    PaintBrushIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    LinkIcon,
} from '@heroicons/react/24/outline'

const sections = [
    {
        title: 'Site Identity',
        description: 'Manage your site name, logo, and tagline',
        icon: BuildingOfficeIcon,
        fields: ['Site Name', 'Tagline / Motto', 'Logo Upload', 'Favicon'],
    },
    {
        title: 'Branding & Appearance',
        description: 'Colors, typography, and visual identity',
        icon: PaintBrushIcon,
        fields: ['Primary Color', 'Dark Mode Default', 'Font Selection', 'Custom CSS'],
    },
    {
        title: 'Contact Information',
        description: 'Public contact details displayed on the site',
        icon: EnvelopeIcon,
        fields: ['Contact Email', 'Phone Number', 'Physical Address', 'Support Hours'],
    },
    {
        title: 'Social & Links',
        description: 'Social media profiles and external links',
        icon: LinkIcon,
        fields: ['Twitter / X', 'LinkedIn', 'GitHub', 'Terms of Service URL', 'Privacy Policy URL'],
    },
    {
        title: 'SEO & Metadata',
        description: 'Search engine optimization and page metadata',
        icon: GlobeAltIcon,
        fields: ['Meta Title', 'Meta Description', 'OG Image', 'Canonical URL'],
    },
]

export default function SiteManagementPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <BuildingOfficeIcon className="h-7 w-7" style={{ color: 'hsl(var(--primary))' }} />
                    Site Management
                </h1>
                <p className="text-muted-foreground mt-1">
                    Configure your site&apos;s identity, branding, and public information
                </p>
            </div>

            {/* Sections */}
            <div className="grid gap-4">
                {sections.map((section) => {
                    const Icon = section.icon
                    return (
                        <div
                            key={section.title}
                            className="rounded-lg border bg-card p-6"
                        >
                            <div className="flex items-start gap-4">
                                <div className="rounded-lg bg-primary/10 p-2.5">
                                    <Icon
                                        className="h-5 w-5"
                                        style={{ color: 'hsl(var(--primary))' }}
                                    />
                                </div>
                                <div className="flex-1">
                                    <h2 className="font-semibold text-lg">{section.title}</h2>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {section.description}
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {section.fields.map((field) => (
                                            <div
                                                key={field}
                                                className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2.5"
                                            >
                                                <span className="text-sm text-muted-foreground">{field}</span>
                                                <span className="ml-auto text-xs text-muted-foreground/50 italic">Coming soon</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
