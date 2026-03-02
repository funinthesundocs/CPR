'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowsPointingOutIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { ComingSoonPlaceholder } from './ComingSoonPlaceholder'

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

interface SlideDeckSectionProps {
  pdfUrl: string | null
}

export function SlideDeckSection({ pdfUrl }: SlideDeckSectionProps) {
  const [visible, setVisible] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  if (!pdfUrl) return <ComingSoonPlaceholder section="Slide Deck" />

  return (
    <>
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="pt-12 pb-[100px] px-6 bg-[var(--accent-900)]/50"
        ref={ref}
      >
        <div className="max-w-[1340px] mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-semibold text-white">Case Slide Deck</h2>
            <button
              onClick={() => setFullscreen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
            >
              <ArrowsPointingOutIcon className="h-4 w-4" />
              Fullscreen
            </button>
          </div>

          {visible && (
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0`}
              className="w-full h-[400px] md:h-[654px] block"
              title="Case Slide Deck"
            />
          )}
        </div>
      </motion.section>

      {/* Fullscreen overlay */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex justify-end p-4">
            <button
              onClick={() => setFullscreen(false)}
              className="text-white/60 hover:text-white transition-colors"
              aria-label="Close fullscreen"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0`}
            className="flex-1 w-full"
            title="Case Slide Deck Fullscreen"
          />
        </div>
      )}
    </>
  )
}
