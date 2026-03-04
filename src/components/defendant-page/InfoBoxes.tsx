'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export interface InfoBox {
  label: string
  primary: string
  extras?: string[]
  primaryClass?: string
}

interface InfoBoxesProps {
  boxes: InfoBox[]
}

function InfoBoxCard({ box, open, onToggle }: { box: InfoBox; open: boolean; onToggle: () => void }) {
  const hasExtras = box.extras && box.extras.length > 0

  return (
    <motion.div
      variants={itemVariants}
      className="bg-[var(--accent-700)]/60 border border-[var(--accent-300)]/20 rounded-lg overflow-hidden"
    >
      {/* Fixed-height header row */}
      <div
        className="p-6 flex flex-col items-center justify-center text-center cursor-pointer select-none"
        onClick={onToggle}
      >
        <p className="text-sm uppercase tracking-widest text-[var(--accent-300)] mb-3 font-semibold">
          {box.label}
        </p>
        <p className={`${box.primaryClass ?? 'text-xl'} text-white font-bold leading-snug line-clamp-1`}>
          {box.primary}
        </p>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="mt-3"
        >
          <ChevronDownIcon className="w-4 h-4 text-[var(--accent-300)]/60" />
        </motion.div>
      </div>

      {/* Accordion panel — shown for all boxes when open; empty boxes show a dash */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-[var(--accent-300)]/10 px-4 pb-4 pt-3 flex flex-col gap-1.5">
              {hasExtras ? (
                box.extras!.map((item, i) => (
                  <p key={i} className="text-[13px] text-white/60 text-center leading-snug">
                    {item}
                  </p>
                ))
              ) : (
                <p className="text-[13px] text-white/30 text-center leading-snug">—</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function InfoBoxes({ boxes }: InfoBoxesProps) {
  const [open, setOpen] = useState(false)

  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className="py-12 px-6"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-[1340px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {boxes.map((box) => (
          <InfoBoxCard
            key={box.label}
            box={box}
            open={open}
            onToggle={() => setOpen(v => !v)}
          />
        ))}
      </motion.div>
    </motion.section>
  )
}
