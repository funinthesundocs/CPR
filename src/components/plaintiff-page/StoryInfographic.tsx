'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { PlayCircleIcon } from '@heroicons/react/24/outline'
import { FloatingAudioPlayer } from './FloatingAudioPlayer'
import { MagnifyLens } from './MagnifyLens'
import { useTranslation } from '@/i18n'

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

interface StoryInfographicProps {
  infographicUrl: string
  audioUrl?: string
  caseTitle: string
}

export function StoryInfographic({ infographicUrl, audioUrl, caseTitle }: StoryInfographicProps) {
  const { t } = useTranslation()
  const [playerOpen, setPlayerOpen] = useState(false)

  return (
    <>
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="pt-0 pb-12 px-8"
      >
        <div className="max-w-[1340px] mx-auto flex flex-col items-center gap-6">
          {/* Audio button above infographic */}
          {audioUrl && (
            <button
              onClick={() => setPlayerOpen(true)}
              className="flex items-center gap-2 px-4 py-2
                         bg-blue-600 hover:bg-blue-500 text-white rounded-full
                         text-sm font-medium transition-all backdrop-blur-sm
                         border border-blue-400 shadow-lg pointer-events-auto cursor-pointer"
              style={{
                boxShadow: '0 0 20px 4px rgba(59, 130, 246, 0.6), 0 0 40px 8px rgba(59, 130, 246, 0.3)'
              }}
            >
              <PlayCircleIcon className="h-5 w-5" />
              {t('casePage.listenToSummary')}
            </button>
          )}

          <MagnifyLens
            imageUrl={infographicUrl}
            alt={t('casePage.caseInfographic')}
          />
        </div>
      </motion.section>

      {playerOpen && audioUrl && (
        <FloatingAudioPlayer
          audioUrl={audioUrl}
          caseTitle={caseTitle}
          onClose={() => setPlayerOpen(false)}
        />
      )}
    </>
  )
}
