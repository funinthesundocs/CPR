'use client'

import Link from 'next/link'
import {
    UsersIcon,
    GlobeAltIcon,
    MagnifyingGlassIcon,
    CheckBadgeIcon,
    BanknotesIcon,
    ExclamationTriangleIcon,
    ShieldCheckIcon,
    ArrowRightIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/i18n'
import type { ComponentType } from 'react'

type Step = {
    number: number
    titleKey: string
    subtitleKey: string
    descKey: string
    icon: ComponentType<{ className?: string; style?: React.CSSProperties }>
    intensity: 1 | 2 | 3 | 4
}

export default function HowItWorksPage() {
    const { t } = useTranslation()

    const trialSteps: Step[] = [
        { number: 1, titleKey: 'howItWorks.step1Title', subtitleKey: 'howItWorks.step1Subtitle', descKey: 'howItWorks.step1Desc', icon: UsersIcon, intensity: 1 },
        { number: 2, titleKey: 'howItWorks.step2Title', subtitleKey: 'howItWorks.step2Subtitle', descKey: 'howItWorks.step2Desc', icon: GlobeAltIcon, intensity: 2 },
        { number: 3, titleKey: 'howItWorks.step3Title', subtitleKey: 'howItWorks.step3Subtitle', descKey: 'howItWorks.step3Desc', icon: MagnifyingGlassIcon, intensity: 3 },
        { number: 4, titleKey: 'howItWorks.step4Title', subtitleKey: 'howItWorks.step4Subtitle', descKey: 'howItWorks.step4Desc', icon: CheckBadgeIcon, intensity: 4 },
    ]

    return (
        <div className="max-w-5xl mx-auto space-y-24">

            {/* ── Hero ── */}
            <section className="relative py-16 md:py-24 text-center">
                <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent rounded-3xl" />
                <div className="space-y-5 max-w-3xl mx-auto">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: 'hsl(var(--primary))' }}>
                        {t('howItWorks.title')}
                    </p>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                        {t('howItWorks.heroHeadline')}
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        {t('howItWorks.subtitle')}
                    </p>
                </div>
            </section>

            {/* ── Phase I: The Trial ── */}
            <section className="space-y-16">
                <PhaseHeader label={t('howItWorks.phaseTrialTitle')} />

                <div className="relative">
                    {/* Vertical connector — desktop only */}
                    <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-primary/20 to-transparent hidden md:block" />

                    <div className="space-y-12 md:space-y-0">
                        {trialSteps.map((step, i) => (
                            <TimelineStep key={step.number} step={step} index={i} t={t} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Phase II: After the Verdict ── */}
            <section className="space-y-16">
                <PhaseHeader label={t('howItWorks.phaseAftermathTitle')} />

                {/* Step 5 — Featured card */}
                <div className="relative rounded-2xl border-2 bg-card p-8 md:p-12 shadow-sm hover:shadow-lg transition-shadow" style={{ borderColor: 'hsl(var(--primary) / 0.3)' }}>
                    <div className="absolute -top-5 left-8 md:left-12">
                        <StepCircle number={5} />
                    </div>
                    <div className="flex flex-col md:flex-row items-start gap-5 mt-2">
                        <IconBox icon={BanknotesIcon} size="lg" />
                        <div className="space-y-3">
                            <h3 className="text-2xl font-bold">{t('howItWorks.step5Title')}</h3>
                            <p className="text-base italic font-medium" style={{ color: 'hsl(var(--primary))' }}>
                                {t('howItWorks.step5Subtitle')}
                            </p>
                            <p className="text-muted-foreground leading-relaxed text-justify">{t('howItWorks.step5Desc')}</p>
                        </div>
                    </div>
                </div>

                {/* Step 6 — Two-outcome split */}
                <div className="space-y-8">
                    <div className="flex items-center gap-4">
                        <StepCircle number={6} />
                        <div>
                            <h3 className="text-2xl font-bold">{t('howItWorks.step6Title')}</h3>
                            <p className="text-sm italic font-medium" style={{ color: 'hsl(var(--primary))' }}>
                                {t('howItWorks.step6Subtitle')}
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* No restitution — public domain */}
                        <div className="rounded-2xl border-2 border-destructive/30 bg-destructive/5 p-8 space-y-4 hover:shadow-lg transition-shadow">
                            <div className="flex items-center gap-3">
                                <ExclamationTriangleIcon className="h-8 w-8 text-destructive shrink-0" />
                                <h4 className="text-lg font-bold text-destructive">{t('howItWorks.step6NoRestitution')}</h4>
                            </div>
                            <p className="text-muted-foreground leading-relaxed text-justify">{t('howItWorks.step6NoRestitutionDesc')}</p>
                        </div>

                        {/* Full restitution — sealed */}
                        <div className="rounded-2xl border-2 border-green-500/30 bg-green-500/5 p-8 space-y-4 hover:shadow-lg transition-shadow">
                            <div className="flex items-center gap-3">
                                <ShieldCheckIcon className="h-8 w-8 text-green-600 shrink-0" />
                                <h4 className="text-lg font-bold text-green-600">{t('howItWorks.step6Restitution')}</h4>
                            </div>
                            <p className="text-muted-foreground leading-relaxed text-justify">{t('howItWorks.step6RestitutionDesc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="relative rounded-2xl pb-16 text-center space-y-6">
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-primary/5 to-transparent rounded-2xl" />
                <h2 className="text-2xl md:text-3xl font-bold max-w-xl mx-auto leading-tight capitalize">
                    {t('howItWorks.ctaTitle')}
                </h2>
                <p className="text-xl md:text-2xl font-bold capitalize" style={{ color: 'hsl(var(--primary))' }}>
                    {t('howItWorks.ctaSubtitle')}
                </p>
                <div className="flex flex-wrap justify-center gap-4 pt-4">
                    <Button asChild size="lg" className="gap-2 text-base">
                        <Link href="/cases/new">
                            {t('cases.fileCase')} <ArrowRightIcon className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="text-base">
                        <Link href="/cases">{t('howItWorks.browseCases')}</Link>
                    </Button>
                </div>
            </section>
        </div>
    )
}

/* ── Helper Components ── */

function PhaseHeader({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">{label}</span>
            <div className="h-px flex-1 bg-border" />
        </div>
    )
}

function StepCircle({ number }: { number: number }) {
    return (
        <div
            className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shrink-0"
            style={{ background: 'hsl(var(--primary))' }}
        >
            {number}
        </div>
    )
}

function IconBox({ icon: Icon, size = 'md' }: { icon: ComponentType<{ className?: string; style?: React.CSSProperties }>; size?: 'md' | 'lg' }) {
    const dim = size === 'lg' ? 'h-14 w-14' : 'h-12 w-12'
    const iconDim = size === 'lg' ? 'h-7 w-7' : 'h-6 w-6'
    return (
        <div className={`${dim} rounded-xl flex items-center justify-center shrink-0`} style={{ background: 'hsl(var(--primary) / 0.1)' }}>
            <Icon className={iconDim} style={{ color: 'hsl(var(--primary))' }} />
        </div>
    )
}

function TimelineStep({ step, index, t }: { step: Step; index: number; t: (key: string) => string }) {
    const isLeft = index % 2 !== 0
    const StepIcon = step.icon

    const intensityBorder = {
        1: 'border-primary/10',
        2: 'border-primary/20',
        3: 'border-primary/30',
        4: 'border-primary/40 shadow-md',
    }[step.intensity]

    const card = () => (
        <div className={`rounded-2xl border-2 ${intensityBorder} bg-card p-8 hover:shadow-lg transition-shadow relative`}>
            <div className="absolute top-5 left-5">
                <IconBox icon={StepIcon} />
            </div>
            <div className="text-center mb-4 pt-1">
                <h3 className="text-2xl font-bold">{t(step.titleKey)}</h3>
                <p className="text-base italic font-medium" style={{ color: 'hsl(var(--primary))' }}>{t(step.subtitleKey)}</p>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed text-justify" style={{ letterSpacing: '-1px' }}>{t(step.descKey)}</p>
        </div>
    )

    return (
        <div>
            {/* Desktop: zig-zag */}
            <div className="hidden md:grid md:grid-cols-[1fr_4rem_1fr] gap-8 items-center">
                {isLeft ? <div /> : card()}
                <div className="flex flex-col items-center relative z-10">
                    <div className="h-3 w-3 rounded-full mb-2" style={{ background: 'hsl(var(--primary) / 0.3)' }} />
                    <StepCircle number={step.number} />
                    <div className="h-3 w-3 rounded-full mt-2" style={{ background: 'hsl(var(--primary) / 0.3)' }} />
                </div>
                {isLeft ? card() : <div />}
            </div>

            {/* Mobile: stacked */}
            <div className="md:hidden space-y-4">
                <div className="flex items-center gap-4">
                    <StepCircle number={step.number} />
                    <div>
                        <h3 className="text-xl font-bold">{t(step.titleKey)}</h3>
                        <p className="text-base italic font-medium" style={{ color: 'hsl(var(--primary))' }}>{t(step.subtitleKey)}</p>
                    </div>
                </div>
                <div className="rounded-2xl border bg-card p-6 shadow-sm ml-14 border-l-4" style={{ borderLeftColor: 'hsl(var(--primary))' }}>
                    <p className="text-muted-foreground leading-relaxed text-base">{t(step.descKey)}</p>
                </div>
            </div>
        </div>
    )
}
