'use client'

import { FooterNavColumns } from './footer/FooterNavColumns'
import { FooterSocialLinks } from './footer/FooterSocialLinks'
import { usePermissions } from '@/hooks/usePermissions'
import { useTranslation } from '@/i18n'

export function Footer() {
  const { t } = useTranslation()
  const { isAdmin, loading: permissionsLoading } = usePermissions()

  const year = new Date().getFullYear()

  return (
    <footer className="bg-black/20 backdrop-blur border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Brand */}
        <div className="mb-8">
          <div className="flex items-center gap-2 font-bold text-white mb-2">
            {/* ScaleIcon can be imported, or use simple text */}
            <span>{t('common.appName')}</span>
          </div>
          <p className="text-sm text-white/70 italic max-w-sm">
            {t('footer.tagline')}
          </p>
        </div>

        {/* Nav Columns (hidden on mobile, wait for permissions to load) */}
        {!permissionsLoading && (
          <div className="hidden md:block mb-8">
            <FooterNavColumns showAdminLinks={isAdmin} />
          </div>
        )}

        {/* Social Links */}
        <div className="mb-8 flex justify-start gap-4">
          <FooterSocialLinks />
        </div>

        {/* Divider */}
        <hr className="my-8 bg-gradient-to-r from-transparent via-white/20 to-transparent border-none h-px" />

        {/* Copyright */}
        <div className="text-xs text-white/50">
          © {year} {t('common.appName')}. {t('footer.copyright')}
        </div>
      </div>
    </footer>
  )
}
