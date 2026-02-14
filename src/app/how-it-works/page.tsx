'use client'

import { ScaleIcon, MagnifyingGlassIcon, ClockIcon, CheckBadgeIcon, DocumentCheckIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline'
import { useTranslation } from '@/i18n'
import type { ComponentType } from 'react'

export default function HowItWorksPage() {
    const { t } = useTranslation()

    const steps: { number: number; title: string; subtitle: string; description: string; icon: ComponentType<{ className?: string; style?: React.CSSProperties }> }[] = [
        { number: 1, title: t('howItWorks.step1Title'), subtitle: t('howItWorks.step1Subtitle'), description: t('howItWorks.step1Desc'), icon: ScaleIcon },
        { number: 2, title: t('howItWorks.step2Title'), subtitle: t('howItWorks.step2Subtitle'), description: t('howItWorks.step2Desc'), icon: MagnifyingGlassIcon },
        { number: 3, title: t('howItWorks.step3Title'), subtitle: t('howItWorks.step3Subtitle'), description: t('howItWorks.step3Desc'), icon: ClockIcon },
        { number: 4, title: t('howItWorks.step4Title'), subtitle: t('howItWorks.step4Subtitle'), description: t('howItWorks.step4Desc'), icon: CheckBadgeIcon },
        { number: 5, title: t('howItWorks.step5Title'), subtitle: t('howItWorks.step5Subtitle'), description: t('howItWorks.step5Desc'), icon: DocumentCheckIcon },
        { number: 6, title: t('howItWorks.step6Title'), subtitle: t('howItWorks.step6Subtitle'), description: t('howItWorks.step6Desc'), icon: ArchiveBoxIcon },
    ]

    return (
        <div className="space-y-12 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{t('howItWorks.title')}</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    {t('howItWorks.subtitle')}
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
