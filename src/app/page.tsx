'use client'

import Link from 'next/link'
import { ArrowRightIcon, GlobeAltIcon, UsersIcon, CalendarIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/i18n'

export default function HomePage() {
  const { t } = useTranslation()

  const stats = [
    { icon: GlobeAltIcon, label: t('home.nationsInvolved'), value: '5', detail: t('home.nationsDetail') },
    { icon: UsersIcon, label: t('home.confirmedVictims'), value: '4', detail: t('home.confirmedDetail') },
    { icon: CalendarIcon, label: t('home.activePeriod'), value: '2019–2025', detail: t('home.activePeriodDetail') },
    { icon: ShieldCheckIcon, label: t('home.statusLabel'), value: t('home.statusVerified'), detail: t('home.statusDetail') },
  ]

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative py-20 text-center space-y-6">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent rounded-3xl" />
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
          {t('home.heroTitle1')}
          <br />
          <span style={{ color: 'hsl(var(--primary))' }}>{t('home.heroTitle2')}</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('home.heroSubtitle')}
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Button asChild size="lg" className="gap-2 text-base">
            <Link href="/cases">
              {t('home.enterCourt')} <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-base">
            <Link href="/how-it-works">{t('home.learnHow')}</Link>
          </Button>
        </div>
      </section>

      {/* Live Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center"
                style={{ background: 'hsl(var(--primary) / 0.1)' }}
              >
                <stat.icon className="h-5 w-5" style={{ color: 'hsl(var(--primary))' }} />
              </div>
              <span className="text-sm text-muted-foreground font-medium">{stat.label}</span>
            </div>
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.detail}</p>
          </div>
        ))}
      </section>

      {/* Mission Statement */}
      <section className="rounded-2xl border bg-card p-8 md:p-12 text-center space-y-4">
        <h2 className="text-2xl font-bold">{t('home.missionTitle')}</h2>
        <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          {t('home.missionText')}
        </p>
        <p className="text-sm text-muted-foreground/60 italic">
          &ldquo;{t('home.missionQuote')}&rdquo;
        </p>
      </section>
    </div>
  )
}
