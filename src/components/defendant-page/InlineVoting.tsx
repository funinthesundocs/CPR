'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { useTranslation } from '@/i18n'
import { usePermissions } from '@/hooks/usePermissions'
import { Button } from '@/components/ui/button'

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

interface InlineVotingProps {
  caseId: string
  votingOpen: boolean
  status: string
  verdict: { verdict: string; average_guilt_score: number | null; total_votes: number; total_restitution_awarded: number } | null
}

interface VoteData {
  guilt_score?: number
  nominal_approved?: boolean
  punitive_amount?: number | null
  justification?: string | null
}

export function InlineVoting({ caseId, votingOpen, status, verdict }: InlineVotingProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const { hasPermission, loading: permLoading } = usePermissions()
  const canVote = hasPermission('vote')

  const [loading, setLoading] = useState(true)
  const [voteData, setVoteData] = useState<VoteData | null>(null)
  const [voteCount, setVoteCount] = useState(0)

  useEffect(() => {
    const fetchVoteData = async () => {
      try {
        const res = await fetch(`/api/votes?case_id=${caseId}`)
        if (res.ok) {
          const data = await res.json()
          setVoteData(data.vote || null)
          setVoteCount(data.count || 0)
        }
      } catch (error) {
        console.error('Failed to fetch vote data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVoteData()
  }, [caseId])

  // State 3: Verdict sealed
  if (verdict) {
    const isGuilty = verdict.verdict === 'guilty'
    const verdictColor = isGuilty ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30'
    const verdictTextColor = isGuilty ? 'text-red-500' : 'text-emerald-500'
    const verdictLabel = isGuilty ? t('casePage.guilty') : t('casePage.innocent')

    return (
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="py-16 px-6"
      >
        <div className={`max-w-2xl mx-auto ${verdictColor} border rounded-xl p-8 text-center`}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mb-4"
          >
            <CheckCircleIcon className={`h-12 w-12 mx-auto ${verdictTextColor}`} />
          </motion.div>
          <h2 className={`text-4xl font-bold mb-2 ${verdictTextColor}`}>{verdictLabel}</h2>
          <div className="space-y-2 text-sm text-white/70">
            <p>
              <span className="font-semibold">{t('casePage.avgGuiltScore')}</span>{' '}
              <span className={`font-bold ${verdictTextColor}`}>
                {verdict.average_guilt_score?.toFixed(1)}/10
              </span>
            </p>
            <p>
              <span className="font-semibold">{t('casePage.totalVotes')}</span> {verdict.total_votes}
            </p>
            <p>
              <span className="font-semibold">{t('casePage.restitutionAwarded')}</span> $
              {verdict.total_restitution_awarded.toLocaleString('en-US', {
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
      </motion.section>
    )
  }

  // State 4: Loading
  if (loading || permLoading) {
    return (
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="py-16 px-6"
      >
        <div className="max-w-2xl mx-auto bg-white/5 border border-white/10 rounded-xl p-8 flex items-center justify-center min-h-[200px]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white/60" />
        </div>
      </motion.section>
    )
  }

  // State 1: Voting closed, no verdict yet
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
          <h2 className="text-[38px] font-semibold text-white mb-2">{t('casePage.votingNotOpen')}</h2>
          <p className="text-sm text-white/50">
            {t('casePage.votingWillOpen')}
            <br />
            {t('casePage.currentStatus')} <span className="text-[var(--accent-300)] font-medium capitalize">{status.replace(/_/g, ' ')}</span>
          </p>
        </div>
      </motion.section>
    )
  }

  // State 2: Voting open
  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className="py-16 px-6"
    >
      <div className="max-w-2xl mx-auto bg-white/5 border border-white/10 rounded-xl p-8">
        <h2 className="text-[38px] font-semibold mb-6 text-white">{t('casePage.yourVerdict')}</h2>

        {/* Vote progress bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white/60">{t('casePage.votesCast')}</span>
            <span className="text-sm font-medium text-white">{voteCount} / 400</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent-500)] transition-all duration-500"
              style={{ width: `${Math.min((voteCount / 400) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Permission check */}
        {!canVote ? (
          <div className="space-y-4">
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg text-center">
              <LockClosedIcon className="h-6 w-6 text-white/40 mx-auto mb-2" />
              <p className="text-sm text-white/60">{t('casePage.joinJury')}</p>
            </div>
          </div>
        ) : voteData ? (
          // User has already voted
          <div className="space-y-4">
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <p className="text-xs text-white/50 mb-2">{t('casePage.yourVerdict')}</p>
              <p className="text-lg font-semibold text-white">
                {t('casePage.guiltScore')} <span className="text-[var(--accent-500)]">{voteData.guilt_score}/10</span>
              </p>
            </div>
            <Button
              className="w-full bg-[var(--accent-500)] hover:bg-[var(--accent-300)] text-white"
              onClick={() => router.push(`/vote?case=${caseId}`)}
            >
              {t('casePage.updateVerdict')}
            </Button>
          </div>
        ) : (
          // User hasn't voted yet
          <Button
            className="w-full bg-[var(--accent-500)] hover:bg-[var(--accent-300)] text-white py-6 text-base font-medium"
            onClick={() => router.push(`/vote?case=${caseId}`)}
          >
            {t('casePage.castVerdict')}
          </Button>
        )}
      </div>
    </motion.section>
  )
}
