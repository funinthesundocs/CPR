'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { LockClosedIcon } from '@heroicons/react/24/outline'

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

interface InlineVotingProps {
  caseId: string
  votingOpen: boolean
  status: string
}

export function InlineVoting({ caseId, votingOpen, status }: InlineVotingProps) {
  const [credibilityScore, setCredibilityScore] = useState(5)
  const [guiltScore, setGuiltScore] = useState(5)

  if (!votingOpen) {
    return (
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="py-16 px-6"
      >
        <div className="max-w-2xl mx-auto bg-white/5 border border-white/10 rounded-xl p-8 text-center">
          <LockClosedIcon className="h-8 w-8 text-white/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Voting Not Yet Open</h2>
          <p className="text-sm text-white/50">
            Voting will open when this case enters the judgment phase.
            Current status: <span className="text-[var(--accent-300)] font-medium">{status}</span>
          </p>
        </div>
      </motion.section>
    )
  }

  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className="py-16 px-6"
    >
      <div className="max-w-2xl mx-auto bg-white/5 border border-white/10 rounded-xl p-8">
        <h2 className="text-2xl font-semibold mb-2 text-white">Your Verdict</h2>
        <p className="text-sm text-white/50 mb-8">
          Your gut instinct is captured once and locked forever.
          You can update your considered verdict at any time.
        </p>

        {/* Plaintiff Credibility slider */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3 text-white">
            Plaintiff Credibility — How believable is this account?
          </label>
          <input
            type="range"
            min={1}
            max={10}
            value={credibilityScore}
            onChange={e => setCredibilityScore(Number(e.target.value))}
            className="w-full h-2 rounded-full accent-[var(--accent-500)]"
          />
          <div className="flex justify-between text-xs text-white/40 mt-2">
            <span>1 — Not credible</span>
            <span className="font-bold text-[var(--accent-500)] text-base">{credibilityScore}</span>
            <span>10 — Fully credible</span>
          </div>
        </div>

        {/* Defendant Guilt slider */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-3 text-white">
            Defendant Guilt — Based on this case, how guilty?
          </label>
          <input
            type="range"
            min={1}
            max={10}
            value={guiltScore}
            onChange={e => setGuiltScore(Number(e.target.value))}
            className="w-full h-2 rounded-full accent-[var(--accent-500)]"
          />
          <div className="flex justify-between text-xs text-white/40 mt-2">
            <span>1 — Not guilty</span>
            <span className="font-bold text-[var(--accent-500)] text-base">{guiltScore}</span>
            <span>10 — Clearly guilty</span>
          </div>
        </div>

        <button
          className="w-full bg-[var(--accent-500)] hover:bg-[var(--accent-300)] text-white py-3 rounded-md font-medium transition-colors"
        >
          Submit My Verdict
        </button>
      </div>
    </motion.section>
  )
}
