'use client'

import { motion } from 'framer-motion'

interface HeroTextProps {
  plaintiffName: string
  plaintiffPhoto: string | null
  defendantName: string
  tagline: string
  caseNumber: string
  filedAt: string
}

export function HeroText({ plaintiffName, plaintiffPhoto, defendantName, tagline, caseNumber, filedAt }: HeroTextProps) {
  return (
    <motion.div
      className="py-12 md:py-16 px-6 bg-black"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <div className="max-w-3xl mx-auto">

        {/* Plaintiff row */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-blue-500 shrink-0">
            {plaintiffPhoto ? (
              <img src={plaintiffPhoto} alt={plaintiffName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[var(--accent-900)] to-black flex items-center justify-center text-white/40 text-xl font-bold">
                {plaintiffName.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent-300)]">Plaintiff</p>
            <p className="text-lg font-bold text-white">{plaintiffName}</p>
          </div>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4 text-center">
          {plaintiffName} <span className="text-[var(--accent-500)]">vs.</span> {defendantName}
        </h1>
        <p className="text-lg md:text-xl font-normal text-white/60 italic capitalize text-center mb-6">
          {tagline}
        </p>
        <p className="text-sm text-white/40 text-center">
          Case {caseNumber} &middot; Filed {new Date(filedAt).toLocaleDateString('en-AU', { year: 'numeric', month: 'long' })}
        </p>
      </div>
    </motion.div>
  )
}
