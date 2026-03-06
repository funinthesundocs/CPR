'use client'

import { useTranslation } from '@/i18n'
import { motion } from 'framer-motion'

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

export function ComingSoonPlaceholder({ section }: { section: string }) {
  const { t } = useTranslation()
  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className="py-16 px-6"
    >
      <div className="max-w-3xl mx-auto border border-white/10 rounded-xl p-16 text-center bg-white/5">
        <div className="w-16 h-16 rounded-full bg-[var(--accent-700)] mx-auto mb-6 flex items-center justify-center animate-pulse">
          <span className="text-2xl text-[var(--accent-300)]">...</span>
        </div>
        <h3 className="text-lg font-semibold mb-2 text-white">{section}</h3>
        <p className="text-sm text-white/50">
          {t('casePage.comingSoon').replace('{section}', section.toLowerCase())}
        </p>
      </div>
    </motion.section>
  )
}
