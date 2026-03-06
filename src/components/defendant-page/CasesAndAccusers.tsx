'use client'

import { useCallback } from 'react'
import { useTranslation } from '@/i18n'
import useEmblaCarousel from 'embla-carousel-react'
import { motion } from 'framer-motion'
import { ChevronLeftIcon, ChevronRightIcon, UserIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export interface CaseCard {
  caseNumber: string
  status: string
  filedAt: string
  plaintiffName: string
  plaintiffPhoto: string | null
  synopsis: string
  damages: number
  damagesAwarded: boolean
  countries: string[]
  caseTypes: string[]
}

function getStatusLabels(t: (key: string) => string): Record<string, { label: string; color: string }> {
  return {
    draft:                { label: t('casePage.statusDraft'),              color: 'bg-white/10 text-white/40' },
    pending:              { label: t('casePage.statusPendingShort'),       color: 'bg-yellow-500/20 text-yellow-400' },
    admin_review:         { label: t('casePage.statusUnderReview'),        color: 'bg-blue-500/20 text-blue-400' },
    investigation:        { label: t('casePage.statusInvestigationShort'), color: 'bg-orange-500/20 text-orange-400' },
    judgment:             { label: t('casePage.statusJudgmentShort'),      color: 'bg-purple-500/20 text-purple-400' },
    pending_convergence:  { label: t('casePage.statusConvergence'),        color: 'bg-cyan-500/20 text-cyan-400' },
    verdict:              { label: t('casePage.statusVerdictShort'),       color: 'bg-red-500/20 text-red-400' },
    restitution:          { label: t('casePage.statusRestitutionShort'),   color: 'bg-green-500/20 text-green-400' },
  }
}

function formatDamages(amount: number, t: (key: string) => string) {
  if (!amount) return t('casePage.unspecified')
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
}

function AccuserCard({ card, t }: { card: CaseCard; t: (key: string) => string }) {
  const STATUS_LABELS = getStatusLabels(t)
  const status = STATUS_LABELS[card.status] || { label: card.status, color: 'bg-white/10 text-white/40' }

  return (
    <Link href={`/cases/${card.caseNumber}`} className="group block bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 h-full hover:border-[var(--accent-500)]/40 hover:bg-white/[0.07] transition-all duration-300">

      {/* Plaintiff identity */}
      <div className="flex items-center gap-3">
        <div className="w-[72px] h-[72px] rounded-full overflow-hidden border-2 border-blue-500 shrink-0"
          style={{ boxShadow: '0 0 8px 1px rgb(59,130,246)' }}>
          {card.plaintiffPhoto ? (
            <img src={card.plaintiffPhoto} alt={card.plaintiffName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-900 to-black flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-white/40" />
            </div>
          )}
        </div>
        <div>
          <p className="text-[13px] font-bold uppercase tracking-widest text-[var(--accent-300)]">{t('casePage.plaintiff')}</p>
          <p className="text-[16px] font-bold text-white leading-tight">{card.plaintiffName}</p>
        </div>

        {/* Status badge — pushed right */}
        <span className={`ml-auto text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${status.color}`}>
          {status.label}
        </span>
      </div>

      {/* Divider */}
      <div className="border-t border-white/10" />

      {/* Synopsis */}
      <p className="text-[16px] text-white/60 leading-relaxed line-clamp-6 flex-1 text-justify" style={{ letterSpacing: '-1px' }}>
        {card.synopsis || t('casePage.caseDetailsPending')}
      </p>

      {/* Damages */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-white/30 mb-0.5">
          {card.damagesAwarded ? t('casePage.damagesAwarded') : t('casePage.damagesRequested')}
        </p>
        <p className="text-[22px] font-black text-[var(--accent-500)] leading-none">
          {formatDamages(card.damages, t)}
        </p>
      </div>

      {/* Case types */}
      {card.caseTypes.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {card.caseTypes.map(type => (
            <span
              key={type}
              className="text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full bg-[var(--accent-500)]/10 text-[var(--accent-300)] border border-[var(--accent-500)]/20"
            >
              {type.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      )}

      {/* Footer — countries + CTA */}
      <div className="flex items-center justify-between mt-auto pt-2">
        <div className="text-[16px] text-white/40">
          {card.countries.length > 0 && (
            <span>{t('casePage.locations')} {card.countries.join(' | ')}</span>
          )}
        </div>
        <div className="text-[16px] font-semibold text-[var(--accent-300)] group-hover:text-white transition-colors flex items-center gap-1">
          {t('casePage.viewFullCase')}
          <ChevronRightIcon className="w-3.5 h-3.5" />
        </div>
      </div>
    </Link>
  )
}

export function CasesAndAccusers({ cards }: { cards: CaseCard[] }) {
  const { t } = useTranslation()
  const useCarousel = cards.length >= 3

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 1,
    breakpoints: { '(min-width: 768px)': { slidesToScroll: 1 } },
  })

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  return (
    <motion.section
      className="py-16 px-6 bg-[#050505]"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="max-w-[1340px] mx-auto">

        {/* Section header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent-300)] mb-1">
              {t('casePage.publicRecord')}
            </p>
            <h2 className="text-[28px] md:text-[36px] font-black text-white leading-none">
              {t('casePage.casesAndAccusers')}
            </h2>
            <p className="text-[14px] text-white/40 mt-2">
              {t('casePage.casesFiledCount').replace('{count}', String(cards.length))}
            </p>
          </div>

          {/* Carousel arrows — only shown when 3+ cards */}
          {useCarousel && (
            <div className="flex gap-2">
              <button
                onClick={scrollPrev}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[var(--accent-500)]/20 hover:border-[var(--accent-500)]/40 transition-all"
              >
                <ChevronLeftIcon className="w-5 h-5 text-white/60" />
              </button>
              <button
                onClick={scrollNext}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[var(--accent-500)]/20 hover:border-[var(--accent-500)]/40 transition-all"
              >
                <ChevronRightIcon className="w-5 h-5 text-white/60" />
              </button>
            </div>
          )}
        </div>

        {/* 2 cards — side by side */}
        {!useCarousel && (
          <div className={`grid gap-6 ${cards.length === 2 ? 'grid-cols-2' : 'grid-cols-1 max-w-md'}`}>
            {cards.map(card => (
              <AccuserCard key={card.caseNumber} card={card} t={t} />
            ))}
          </div>
        )}

        {/* 3+ cards — Embla carousel, 3 visible on desktop */}
        {useCarousel && (
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {cards.map(card => (
                <div
                  key={card.caseNumber}
                  className="flex-none w-full md:w-[calc(33.333%-1rem)]"
                >
                  <AccuserCard card={card} t={t} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.section>
  )
}
