'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { AnimatedCounter } from '@/components/animated-counter'
import { motion } from 'framer-motion'

type HeroHookProps = {
  caseNumber: string
  status: string
  defendant: { full_name: string; slug: string; photo_url: string | null; location: string | null }
  summary: string
  financialTotal: number
  evidenceCount: number
  witnessCount: number
  timelineCount: number
  visibility: string
  isOngoing: boolean
  verdict: { verdict: string; average_guilt_score: number | null; total_votes: number; total_restitution_awarded: number } | null
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  pending_convergence: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  admin_review: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  investigation: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  judgment: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  verdict: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  verdict_guilty: 'bg-red-500/10 text-red-500 border-red-500/30',
  verdict_innocent: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  restitution: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  draft: 'bg-white/5 text-gray-400 border-white/10',
}

function StatBlock({ label, value, dominant, prefix = '' }: { label: string; value: number; dominant?: boolean, prefix?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border px-5 py-4 backdrop-blur-md transition-all duration-500 hover:scale-[1.02] ${dominant ? 'border-primary/30 bg-primary/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
      <p className={`font-black tracking-tighter leading-none ${dominant ? 'text-3xl text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]' : 'text-2xl text-white'}`}>
        <AnimatedCounter value={value} prefix={prefix} />
      </p>
      <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mt-2">{label}</p>
      {dominant && (
        <div className="absolute top-0 right-0 w-28 h-28 bg-primary/20 rounded-full blur-3xl -mr-8 -mt-8 pointer-events-none" />
      )}
    </div>
  )
}

export function HeroHook({
  caseNumber,
  status,
  defendant,
  summary,
  financialTotal,
  evidenceCount,
  witnessCount,
  timelineCount,
  visibility,
  isOngoing,
  verdict,
}: HeroHookProps) {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-[#050505] min-h-[500px] flex items-center pt-24 pb-16 px-6 sm:px-12"
    >
      {/* Background glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none opacity-50" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] pointer-events-none" />

      <div className="relative z-10 max-w-7xl w-full mx-auto flex flex-col lg:flex-row gap-12 lg:items-center">

        {/* Left half: Title & Story Intro (Glass Panel) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl p-8 sm:p-10 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <Link href={`/defendants/${defendant.slug}`} className="shrink-0 relative group">
              {defendant.photo_url ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                  <img
                    src={defendant.photo_url}
                    alt={defendant.full_name}
                    className="relative h-24 w-24 object-cover rounded-2xl ring-1 ring-white/20 shadow-2xl transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="relative h-24 w-24 rounded-2xl bg-white/5 ring-1 ring-white/10 flex items-center justify-center text-3xl font-bold text-white/40 shadow-xl transition-transform duration-500 group-hover:scale-105 group-hover:bg-white/10 group-hover:text-white/60">
                  {defendant.full_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
            </Link>

            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono text-sm tracking-widest text-white/50 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                  {caseNumber}
                </span>
                <Badge variant="outline" className={`capitalize font-medium tracking-wide border ${statusColors[status] || 'bg-white/5 text-gray-400 border-white/10'}`}>
                  {status.replace(/_/g, ' ')}
                </Badge>
                {visibility && visibility !== 'open' && (
                  <Badge variant="outline" className="text-xs capitalize bg-white/5 text-white/40 border-white/10">
                    {visibility}
                  </Badge>
                )}
                {isOngoing && (
                  <Badge variant="destructive" className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 gap-1.5 flex items-center">
                    <ExclamationTriangleIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    Ongoing
                  </Badge>
                )}
              </div>

              <h1 id="hero-heading" className="text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-white">
                <span className="text-white/40 font-light tracking-normal mr-3 lowercase text-2xl md:text-4xl align-middle">vs.</span>
                <Link href={`/defendants/${defendant.slug}`} className="hover:text-primary transition-colors duration-300">
                  {defendant.full_name || 'Unknown'}
                </Link>
              </h1>

              {summary && (
                <p className="text-lg text-white/60 leading-relaxed font-light mt-6 w-full text-justify hyphens-auto">
                  {summary}
                </p>
              )}
            </div>
          </div>

          {verdict && (
            <div className={`mt-8 rounded-2xl p-6 relative overflow-hidden text-center border ${verdict.verdict === 'guilty'
              ? 'bg-red-500/10 border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.1)]'
              : 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]'
              }`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
              <p className={`text-2xl font-black uppercase tracking-[0.2em] mb-2 ${verdict.verdict === 'guilty' ? 'text-red-500' : 'text-emerald-400'}`}>
                {verdict.verdict === 'guilty' ? 'GUILTY' : 'INNOCENT'}
              </p>
              <p className="text-white/80 font-medium tracking-wide">
                Average Score: <span className="text-white font-bold">{verdict.average_guilt_score?.toFixed(1)}</span>/10
                <span className="text-white/40 font-normal ml-2">({verdict.total_votes} votes)</span>
              </p>
            </div>
          )}
        </motion.div>

        {/* Right half: Stat Grid */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="w-full lg:w-80 grid gap-4 shrink-0"
        >
          <StatBlock label="Damages Claimed" value={financialTotal} dominant prefix="$" />
          <div className="grid grid-cols-2 gap-4">
            <StatBlock label="Evidence" value={evidenceCount} />
            <StatBlock label="Witnesses" value={witnessCount} />
          </div>
          <StatBlock label="Timeline Events" value={timelineCount} />
        </motion.div>

      </div>

      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none" />
    </section>
  )
}
