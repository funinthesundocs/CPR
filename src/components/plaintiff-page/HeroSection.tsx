'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { StatusBadge } from './StatusBadge'
import { UserIcon } from '@heroicons/react/24/outline'

interface HeroSectionProps {
  plaintiffName: string
  defendantName: string
  plaintiffPhoto: string | null
  defendantPhoto: string | null
  status: string
}

function AvatarPlaceholder({ label, className }: { label: string; className?: string }) {
  return (
    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${className}`}>
      <UserIcon className="h-16 w-16 text-white/40" />
    </div>
  )
}

export function HeroSection({ plaintiffName, defendantName, plaintiffPhoto, defendantPhoto, status }: HeroSectionProps) {
  const { scrollY } = useScroll()
  const bgY = useTransform(scrollY, [0, 400], [0, 120])

  const slideTransition = { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const }

  return (
    <section className="relative min-h-[44vh] md:min-h-[48vh] overflow-hidden bg-black">

      {/* Parallax background */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 bg-black"
      />

      {/* BLACK STRIPE — static diagonal center divider, always on screen, panels slide behind it */}
      <div
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          background: `linear-gradient(
            90deg,
            transparent 0%,
            transparent 49.5%,
            black 49.5%,
            black 50.5%,
            transparent 50.5%,
            transparent 100%
          )`
        }}
      />

      {/* LEFT PANEL — Plaintiff — slides in from fully off-screen left */}
      <motion.div
        className="absolute left-0 top-0 w-[49.5%] h-full z-10"
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        transition={slideTransition}
      >
        <div
          className="w-full h-full flex flex-col items-center justify-center relative"
          style={{
            backgroundImage: 'url(/firefighter1.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/80" />
          <div className="relative z-10 flex flex-col items-center justify-center">
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 8px 2px rgb(1,143,46)',
                  '0 0 24px 8px rgb(1,143,46)',
                  '0 0 8px 2px rgb(1,143,46)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.8 }}
              className="w-[140px] h-[140px] md:w-[200px] md:h-[200px] rounded-full overflow-hidden border-2 border-green-500"
            >
              {plaintiffPhoto ? (
                <img src={plaintiffPhoto} alt={plaintiffName} className="w-full h-full object-cover" />
              ) : (
                <AvatarPlaceholder label={plaintiffName} className="from-[var(--accent-900)] to-black" />
              )}
            </motion.div>
            <span className="mt-3 text-[20px] font-bold tracking-[0.05em] uppercase text-[var(--accent-300)]">
              Plaintiff
            </span>
            <span className="mt-1 text-[24px] font-bold text-white">
              {plaintiffName}
            </span>
          </div>
        </div>
      </motion.div>

      {/* RIGHT PANEL — Defendant — slides in from fully off-screen right */}
      <motion.div
        className="absolute right-0 top-0 w-[49.5%] h-full z-10"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        transition={slideTransition}
      >
        <div
          className="w-full h-full flex flex-col items-center justify-center relative"
          style={{
            backgroundImage: 'url(/firefighter3.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/80" />
          <div className="relative z-10 flex flex-col items-center justify-center">
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 8px 2px rgb(220,38,38)',
                  '0 0 24px 8px rgb(220,38,38)',
                  '0 0 8px 2px rgb(220,38,38)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.8 }}
              className="w-[140px] h-[140px] md:w-[200px] md:h-[200px] rounded-full overflow-hidden border-2 border-red-600"
            >
              {defendantPhoto ? (
                <img src={defendantPhoto} alt={defendantName} className="w-full h-full object-cover" />
              ) : (
                <AvatarPlaceholder label={defendantName} className="from-[var(--accent-900)] to-black" />
              )}
            </motion.div>
            <span className="mt-3 text-[20px] font-bold tracking-[0.05em] uppercase text-[var(--accent-300)] opacity-70">
              Defendant
            </span>
            <span className="mt-1 text-[24px] font-bold text-white/70">
              {defendantName}
            </span>
          </div>
        </div>
      </motion.div>

      {/* VS badge — center, above stripe, pops in after panels arrive */}
      <motion.div
        className="absolute left-1/2 top-[calc(50%-30px)] -translate-x-1/2 -translate-y-1/2 z-30
                   w-[84px] h-[84px] md:w-24 md:h-24 rounded-full bg-blue-500 flex items-center justify-center
                   text-white font-black text-2xl md:text-3xl shadow-[0_0_45px_8px_rgb(59,130,246)] border-2 border-black"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1, 0.2, 1, 0.2, 1] }}
        transition={{ delay: 0.65, duration: 0.5, times: [0, 0.35, 0.5, 0.65, 0.75, 0.88, 1] }}
      >
        VS
      </motion.div>

      {/* Status badge — fades in last */}
      <motion.div
        className="absolute left-1/2 top-[calc(68%-30px)] -translate-x-1/2 z-30"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.4 }}
      >
        <StatusBadge status={status} />
      </motion.div>

    </section>
  )
}
