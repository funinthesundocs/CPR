'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRightIcon, GlobeAltIcon, FolderOpenIcon, FolderIcon, BanknotesIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/i18n'
import { CursorFlashlight } from '@/components/cursor-flashlight'

type Stats = {
  openCases: number
  closedCases: number
  countriesInvolved: number
  damagesPaid: number
}

export default function HomePage() {
  const { t } = useTranslation()
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {})
  }, [])

  const fmt = (n: number) => n.toLocaleString()
  const fmtMoney = (n: number) =>
    n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` :
    n >= 1_000 ? `$${(n / 1_000).toFixed(0)}K` :
    `$${n}`

  const cards = [
    { icon: FolderOpenIcon, label: 'Open Cases',          value: stats ? fmt(stats.openCases)          : '—', detail: 'Active investigations' },
    { icon: FolderIcon,     label: 'Closed Cases',        value: stats ? fmt(stats.closedCases)        : '—', detail: 'Verdicts delivered'    },
    { icon: GlobeAltIcon,   label: 'Countries Involved',  value: stats ? fmt(stats.countriesInvolved)  : '—', detail: 'Global reach'           },
    { icon: BanknotesIcon,  label: 'Damages Paid',        value: stats ? fmtMoney(stats.damagesPaid)   : '—', detail: 'Restitution collected'  },
  ]

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <CursorFlashlight>
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

          <div className="flex flex-wrap justify-center gap-4 pt-4 pb-8">
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
      </CursorFlashlight>

      {/* Live Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center min-h-[180px]"
          >
            <div
              className="h-12 w-12 rounded-lg flex items-center justify-center mb-1 -mt-1"
              style={{ background: 'hsl(var(--primary) / 0.1)' }}
            >
              <card.icon className="h-6 w-6" style={{ color: 'hsl(var(--primary))' }} />
            </div>
            <span className="text-lg font-medium -mt-[10px]" style={{ color: 'var(--primary)' }}>{card.label}</span>
            <div className="flex-1 flex items-center justify-center">
              <p className="text-3xl font-bold">{card.value}</p>
            </div>
            <p className="text-sm text-muted-foreground">{card.detail}</p>
          </div>
        ))}
      </section>

      {/* Mission Statement */}
      <section className="rounded-2xl border bg-card p-8 md:p-12 text-center space-y-4 mt-[-44px]">
        <h2 className="text-3xl font-bold">{t('home.missionTitle')}</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          {t('home.missionText')}
        </p>
        <p className="text-lg text-muted-foreground/60 italic">
          &ldquo;{t('home.missionQuote')}&rdquo;
        </p>
      </section>
    </div>
  )
}
