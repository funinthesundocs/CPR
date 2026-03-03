'use client'

import { motion } from 'framer-motion'

interface HeroTextProps {
  plaintiffName: string
  defendantName: string
  tagline: string
  caseNumber: string
  filedAt: string
}

export function HeroText({ plaintiffName, defendantName, tagline, caseNumber, filedAt }: HeroTextProps) {
  return (
    <motion.div
      className="text-center py-12 md:py-16 px-6 bg-black"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
          {plaintiffName} <span className="text-[var(--accent-500)]">vs.</span> {defendantName}
        </h1>
        <p className="text-lg md:text-xl font-normal text-white/60 italic capitalize text-center mb-6">
          {tagline}
        </p>
        <p className="text-sm text-white/40">
          Case {caseNumber} &middot; Filed {new Date(filedAt).toLocaleDateString('en-AU', { year: 'numeric', month: 'long' })}
        </p>
      </div>
    </motion.div>
  )
}
