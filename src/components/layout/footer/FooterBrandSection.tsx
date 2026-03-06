'use client'

import { ScaleIcon } from '@heroicons/react/24/outline'
import { useTranslation } from '@/i18n'

interface FooterBrandSectionProps {
  stats?: {
    casesCount: number
    plaintiffsCount: number
    votesCastCount: number
  }
  loading?: boolean
}

export function FooterBrandSection({ stats, loading }: FooterBrandSectionProps) {
  const { t } = useTranslation()

  const siteTitle = t('common.appName')
  const tagline = t('footer.tagline')

  return (
    <div className="flex flex-col md:flex-row md:gap-8 md:justify-between">
      {/* Brand + Tagline */}
      <div className="mb-6 md:mb-0 flex-shrink-0">
        <div className="flex items-center gap-2 font-bold text-white mb-2">
          <ScaleIcon className="h-6 w-6" style={{ color: 'hsl(var(--primary))' }} />
          <span>{siteTitle}</span>
        </div>
        <p className="text-sm text-white/70 italic max-w-sm">
          {tagline}
        </p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
          {/* Active Cases */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col items-center justify-center min-w-[120px]">
            <div className="text-xs text-white/60 mb-1">{t('footer.activeCases')}</div>
            <div className="text-2xl font-bold text-white">
              {loading ? '—' : stats.casesCount}
            </div>
          </div>

          {/* Plaintiffs Filing */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col items-center justify-center min-w-[120px]">
            <div className="text-xs text-white/60 mb-1">{t('footer.plaintiffsFiling')}</div>
            <div className="text-2xl font-bold text-white">
              {loading ? '—' : stats.plaintiffsCount}
            </div>
          </div>

          {/* Public Verdicts */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col items-center justify-center min-w-[120px]">
            <div className="text-xs text-white/60 mb-1">{t('footer.publicVerdicts')}</div>
            <div className="text-2xl font-bold text-white">
              {loading ? '—' : stats.votesCastCount}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
