import Link from 'next/link'
import { Scale } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const quickLinks = [
    { title: 'Cases', href: '/cases' },
    { title: 'Submit Testimony', href: '/cases/new' },
    { title: 'How It Works', href: '/how-it-works' },
]

const companyLinks = [
    { title: 'About', href: '/about' },
    { title: 'Legal & Transparency', href: '/legal' },
]

const connectLinks = [
    { title: 'Contact Us', href: '/contact' },
    { title: 'Submit Testimony', href: '/cases/new' },
]

export function Footer() {
    return (
        <footer className="border-t bg-card/50">
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 font-bold">
                            <Scale className="h-5 w-5" style={{ color: 'hsl(var(--primary))' }} />
                            Court of Public Record
                        </div>
                        <p className="text-sm text-muted-foreground italic">
                            &ldquo;Truth isn&apos;t fragile. It just needs somewhere to live.&rdquo;
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold">Quick Links</h4>
                        {quickLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {link.title}
                            </Link>
                        ))}
                    </div>

                    {/* Company */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold">Company</h4>
                        {companyLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {link.title}
                            </Link>
                        ))}
                    </div>

                    {/* Connect */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold">Connect</h4>
                        {connectLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {link.title}
                            </Link>
                        ))}
                    </div>
                </div>

                <Separator className="my-8" />

                <p className="text-center text-xs text-muted-foreground">
                    © 2026 Court of Public Record. Verified by the public, preserved by truth.
                </p>
            </div>
        </footer>
    )
}
