'use client'

import Link from 'next/link'
import { useTranslation } from '@/i18n'

interface FooterNavColumnsProps {
  showAdminLinks?: boolean
}

export function FooterNavColumns({ showAdminLinks = false }: FooterNavColumnsProps) {
  const { t } = useTranslation()

  const quickLinks = [
    { label: t('footer.browseAllCases'), href: '/cases' },
    { label: t('footer.searchDefendants'), href: '/defendants' },
    { label: t('footer.howItWorks'), href: '/about' },
    { label: t('footer.faq'), href: '/faq' },
  ]

  const resourceLinks = [
    { label: t('footer.fileACase'), href: '/cases/new' },
    { label: t('footer.evidenceGuidelines'), href: '/docs/evidence-guidelines' },
    { label: t('footer.legalInfo'), href: '/docs/legal' },
  ]

  const companyLinks = [
    { label: t('footer.aboutCpr'), href: '/about' },
    { label: t('footer.contact'), href: '/contact' },
    { label: t('footer.privacy'), href: '/privacy' },
    { label: t('footer.terms'), href: '/terms' },
  ]

  const adminLinks = [
    { label: t('footer.dashboard'), href: '/admin' },
    { label: t('footer.moderation'), href: '/admin/activity' },
    { label: t('footer.voteStats'), href: '/admin/votes' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
      {/* Quick Links */}
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-semibold text-white">{t('footer.quickLinks')}</h4>
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm text-white/70 hover:text-white/100 transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Plaintiff Resources */}
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-semibold text-white">{t('footer.plaintiffResources')}</h4>
        {resourceLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm text-white/70 hover:text-white/100 transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Company */}
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-semibold text-white">{t('footer.company')}</h4>
        {companyLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm text-white/70 hover:text-white/100 transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Admin (conditional) */}
      {showAdminLinks && (
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-semibold text-white">{t('footer.admin')}</h4>
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-white/70 hover:text-white/100 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
