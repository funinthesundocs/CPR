'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { StatusBadge } from './StatusBadge'
import { UserIcon } from '@heroicons/react/24/outline'

interface HeroSectionProps {
  plaintiffName: string
  defendantName: string
  plaintiffPhoto: string | null
  defendantPhoto: string | null
  status: string
  defendantSlug: string
  plaintiffId: string
}

function AvatarPlaceholder({ label, className }: { label: string; className?: string }) {
  return (
    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${className}`}>
      <UserIcon className="h-16 w-16 text-white/40" />
    </div>
  )
}

export function HeroSection({ plaintiffName, defendantName, plaintiffPhoto, defendantPhoto, status, defendantSlug, plaintiffId }: HeroSectionProps) {
  const { scrollY } = useScroll()
  const bgY = useTransform(scrollY, [0, 400], [0, 120])

  const slideTransition = { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const }

  return (
    <section className="relative min-h-[44vh] md:min-h-[48vh] overflow-hidden bg-black">
      {/* Orange-red pulsing glow */}
      <style>{`
        @keyframes orangeGlow {
          0% {
            box-shadow:
              0 0 14px 2px rgba(255,150,0,0.63),
              0 0 28px 6px rgba(255,100,0,0.49),
              0 0 46px 9px rgba(255,50,0,0.35)
          }
          15% {
            box-shadow:
              0 0 25px 4px rgba(255,180,0,0.69),
              0 0 46px 9px rgba(255,120,0,0.6),
              0 0 67px 13px rgba(255,60,0,0.42)
          }
          25% {
            box-shadow:
              0 0 8px 1px rgba(255,100,0,0.49),
              0 0 20px 4px rgba(255,70,0,0.35),
              0 0 32px 6px rgba(255,40,0,0.25)
          }
          40% {
            box-shadow:
              0 0 22px 4px rgba(255,160,0,0.67),
              0 0 41px 7px rgba(255,110,0,0.56),
              0 0 62px 11px rgba(255,55,0,0.39)
          }
          50% {
            box-shadow:
              0 0 13px 2px rgba(255,130,0,0.6),
              0 0 28px 5px rgba(255,85,0,0.46),
              0 0 46px 8px rgba(255,45,0,0.32)
          }
          65% {
            box-shadow:
              0 0 20px 3px rgba(255,145,0,0.64),
              0 0 37px 6px rgba(255,95,0,0.53),
              0 0 56px 10px rgba(255,50,0,0.35)
          }
          75% {
            box-shadow:
              0 0 11px 1px rgba(255,110,0,0.53),
              0 0 22px 4px rgba(255,70,0,0.39),
              0 0 35px 6px rgba(255,35,0,0.21)
          }
          100% {
            box-shadow:
              0 0 14px 2px rgba(255,120,0,0.56),
              0 0 27px 6px rgba(255,80,0,0.42),
              0 0 42px 8px rgba(255,40,0,0.28)
          }
        }

      `}</style>

      {/* Parallax background */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 bg-black"
      />

      {/* EXPLOSION PARTICLES — radiate from collision point (left side only) */}
      {[...Array(4)].map((_, i) => {
        const angle = (i / 4) * Math.PI - Math.PI / 2  // Only left side (90° range)
        const distance = 105
        const x = Math.cos(angle) * distance
        const y = Math.sin(angle) * distance
        return (
          <motion.div
            key={`particle-${i}`}
            className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full bg-orange-500/56"
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x, y, opacity: 0, scale: 0 }}
            transition={{ delay: 0.7, duration: 0.6, ease: 'easeOut' }}
          />
        )
      })}

      {/* EXPLOSION FLASH — bright center burst (fire) */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-25 w-24 h-24 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,140,0,0.63) 0%, rgba(255,80,0,0.42) 40%, transparent 70%)',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.4, 0], opacity: [0, 0.7, 0] }}
        transition={{ delay: 0.7, duration: 0.5, ease: 'easeOut' }}
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
          <Link
            href={`/users/${plaintiffId}`}
            className="relative z-10 flex flex-col items-center justify-center group"
          >
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 4px 1px rgb(59,130,246)',
                  '0 0 12px 2px rgb(59,130,246)',
                  '0 0 4px 1px rgb(59,130,246)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.8 }}
              className="w-[168px] h-[168px] md:w-[240px] md:h-[240px] rounded-full overflow-hidden border-2 border-blue-500 group-hover:border-blue-300 transition-colors"
            >
              {plaintiffPhoto ? (
                <img src={plaintiffPhoto} alt={plaintiffName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <AvatarPlaceholder label={plaintiffName} className="from-[var(--accent-900)] to-black" />
              )}
            </motion.div>
            <span className="mt-3 text-[20px] font-bold tracking-[0.05em] uppercase text-[var(--accent-300)] opacity-70 group-hover:opacity-100 transition-opacity">
              Plaintiff
            </span>
            <span className="mt-1 text-[28px] font-bold text-white/70 group-hover:text-white transition-colors">
              {plaintiffName}
            </span>
          </Link>
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
          <Link
            href={`/defendants/${defendantSlug}`}
            className="relative z-10 flex flex-col items-center justify-center group"
          >
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 4px 1px rgb(220,38,38)',
                  '0 0 12px 2px rgb(220,38,38)',
                  '0 0 4px 1px rgb(220,38,38)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.8 }}
              className="w-[168px] h-[168px] md:w-[240px] md:h-[240px] rounded-full overflow-hidden border-2 border-red-600 group-hover:border-red-400 transition-colors"
            >
              {defendantPhoto ? (
                <img src={defendantPhoto} alt={defendantName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <AvatarPlaceholder label={defendantName} className="from-[var(--accent-900)] to-black" />
              )}
            </motion.div>
            <span className="mt-3 text-[20px] font-bold tracking-[0.05em] uppercase text-[var(--accent-300)] opacity-70 group-hover:opacity-100 transition-opacity">
              Defendant
            </span>
            <span className="mt-1 text-[28px] font-bold text-white/70 group-hover:text-white transition-colors">
              {defendantName}
            </span>
          </Link>
        </div>
      </motion.div>

      {/* VS badge — glossy black with orange glow */}
      <motion.div
        className="absolute left-1/2 top-[calc(50%-30px)] -translate-x-1/2 -translate-y-1/2 z-30
                   w-[91px] h-[91px] md:w-[104px] md:h-[104px] rounded-full flex items-center justify-center
                   text-white font-black text-2xl md:text-3xl"
        style={{
          background: 'linear-gradient(160deg, #3f3f46 0%, #09090b 55%, #18181b 100%)',
          border: '2px solid rgba(249,115,22,0.5)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.13)',
          animation: 'orangeGlow 3.5s cubic-bezier(0.42, 0, 0.58, 1) infinite',
        }}
        initial={{ scale: 0, opacity: 0, y: 0 }}
        animate={{
          scale: [0, 1.5, 1, 1, 1],
          opacity: [0, 1, 1, 0.2, 1, 0.2, 1],
          y: [-20, 0, 0],
        }}
        transition={{
          scale: { delay: 0.7, duration: 0.6, times: [0, 0.4, 0.7, 0.85, 1] },
          opacity: { delay: 0.7, duration: 0.6, times: [0, 0.35, 0.5, 0.65, 0.75, 0.88, 1] },
          y: { delay: 0.7, duration: 0.5 },
        }}
      >
        VS
      </motion.div>

      {/* Status badge — emerges from explosion upward */}
      <motion.div
        className="absolute left-1/2 top-[calc(68%-20px)] -translate-x-1/2 z-30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75, duration: 0.5, ease: 'easeOut' }}
      >
        <StatusBadge status={status} />
      </motion.div>

    </section>
  )
}
