'use client'

import Link from 'next/link'
import { ScaleIcon } from '@heroicons/react/24/outline'
import { Separator } from '@/components/ui/separator'
import { useTranslation } from '@/i18n'

export function Footer() {
    const { t } = useTranslation()

    const quickLinks = [
        { title: t('common.cases'), href: '/cases' },
        { title: t('nav.fileCase'), href: '/cases/new' },
        { title: t('nav.howItWorks'), href: '/how-it-works' },
    ]

    const companyLinks = [
        { title: t('footer.about'), href: '/about' },
        { title: t('footer.legal'), href: '/legal' },
    ]

    const connectLinks = [
        { title: t('footer.contact'), href: '/contact' },
        { title: t('nav.fileCase'), href: '/cases/new' },
    ]

    return (
        <footer className="border-t bg-card/50">
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 font-bold">
                            <ScaleIcon className="h-6 w-6" style={{ color: 'hsl(var(--primary))' }} />
                            {t('common.appName')}
                        </div>
                        <p className="text-sm text-muted-foreground italic">
                            {t('footer.tagline')}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold">{t('footer.platform')}</h4>
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
                        <h4 className="text-sm font-semibold">{t('footer.legal')}</h4>
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
                        <h4 className="text-sm font-semibold">{t('footer.connect')}</h4>
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
                    © 2026 {t('common.appName')}. {t('footer.copyright')}
                </p>
            </div>
        </footer>
    )
}
