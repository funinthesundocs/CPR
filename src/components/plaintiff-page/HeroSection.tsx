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
      {/* Realistic fire animation */}
      <style>{`
        @keyframes flameFlicker1 {
          0%, 100% { transform: scaleY(1) scaleX(0.95) translateY(0px); opacity: 0.8; }
          25% { transform: scaleY(1.15) scaleX(1.1) translateY(-8px); opacity: 0.95; }
          50% { transform: scaleY(0.95) scaleX(0.9) translateY(-4px); opacity: 0.7; }
          75% { transform: scaleY(1.2) scaleX(1.05) translateY(-10px); opacity: 0.85; }
        }

        @keyframes flameFlicker2 {
          0%, 100% { transform: scaleY(0.9) scaleX(1.05) translateY(-2px); opacity: 0.75; }
          25% { transform: scaleY(0.95) scaleX(0.95) translateY(-6px); opacity: 0.8; }
          50% { transform: scaleY(1.1) scaleX(1.15) translateY(-12px); opacity: 0.9; }
          75% { transform: scaleY(1.05) scaleX(1.0) translateY(-8px); opacity: 0.7; }
        }

        @keyframes flameFlicker3 {
          0%, 100% { transform: scaleY(1.05) scaleX(0.98) translateY(-5px); opacity: 0.85; }
          25% { transform: scaleY(0.92) scaleX(1.08) translateY(-11px); opacity: 0.75; }
          50% { transform: scaleY(1.15) scaleX(1.02) translateY(-3px); opacity: 0.88; }
          75% { transform: scaleY(0.98) scaleX(0.95) translateY(-9px); opacity: 0.8; }
        }

        @keyframes fireWobble {
          0%, 100% { transform: translateX(0px); }
          25% { transform: translateX(4px); }
          50% { transform: translateX(-3px); }
          75% { transform: translateX(2px); }
        }

        @keyframes emberRise {
          0% {
            opacity: 1;
            transform: translateY(0px) translateX(0px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-140px) translateX(var(--ember-x)) scale(0.3);
          }
        }

        .fire-layer {
          position: absolute;
          left: 50%;
          top: 50%;
          border-radius: 50%;
          filter: blur(8px);
        }

        .fire-layer-1 {
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at 50% 30%, rgba(255,255,0,0.8) 0%, rgba(255,150,0,0.6) 30%, rgba(255,50,0,0.4) 60%, transparent 100%);
          animation: flameFlicker1 0.5s ease-in-out infinite, fireWobble 0.8s ease-in-out infinite;
        }

        .fire-layer-2 {
          width: 95%;
          height: 95%;
          margin-left: -47.5%;
          margin-top: -47.5%;
          background: radial-gradient(circle at 50% 35%, rgba(255,220,0,0.7) 0%, rgba(255,120,0,0.5) 35%, rgba(255,30,0,0.3) 65%, transparent 100%);
          animation: flameFlicker2 0.6s ease-in-out infinite 0.1s, fireWobble 1s ease-in-out infinite 0.15s;
        }

        .fire-layer-3 {
          width: 85%;
          height: 85%;
          margin-left: -42.5%;
          margin-top: -42.5%;
          background: radial-gradient(circle at 50% 25%, rgba(255,255,100,0.6) 0%, rgba(255,100,0,0.4) 40%, rgba(200,20,0,0.2) 70%, transparent 100%);
          animation: flameFlicker3 0.55s ease-in-out infinite 0.2s, fireWobble 1.2s ease-in-out infinite 0.3s;
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
        const distance = 150
        const x = Math.cos(angle) * distance
        const y = Math.sin(angle) * distance
        return (
          <motion.div
            key={`particle-${i}`}
            className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full bg-orange-500/80"
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x, y, opacity: 0, scale: 0 }}
            transition={{ delay: 0.7, duration: 0.6, ease: 'easeOut' }}
          />
        )
      })}

      {/* EXPLOSION FLASH — bright center burst (fire) */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-25 w-32 h-32 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,140,0,0.9) 0%, rgba(255,80,0,0.6) 40%, transparent 70%)',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 2, 0], opacity: [0, 1, 0] }}
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
          <div className="relative z-10 flex flex-col items-center justify-center">
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 6px 2px rgb(59,130,246)',
                  '0 0 19px 6px rgb(59,130,246)',
                  '0 0 6px 2px rgb(59,130,246)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.8 }}
              className="w-[140px] h-[140px] md:w-[200px] md:h-[200px] rounded-full overflow-hidden border-2 border-blue-500"
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
            <span className="mt-1 text-[28px] font-bold text-white">
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
                  '0 0 6px 2px rgb(220,38,38)',
                  '0 0 19px 6px rgb(220,38,38)',
                  '0 0 6px 2px rgb(220,38,38)',
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
            <span className="mt-1 text-[28px] font-bold text-white/70">
              {defendantName}
            </span>
          </div>
        </div>
      </motion.div>

      {/* VS badge — emerges from collision explosion, set ABLAZE with realistic fire */}
      <motion.div
        className="absolute left-1/2 top-[calc(50%-30px)] -translate-x-1/2 -translate-y-1/2 z-30"
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
        {/* Animated fire layers */}
        <div className="relative w-[101px] h-[101px] md:w-[115px] md:h-[115px]">
          <div className="fire-layer fire-layer-1" />
          <div className="fire-layer fire-layer-2" />
          <div className="fire-layer fire-layer-3" />

          {/* VS text on top */}
          <div className="absolute inset-0 flex items-center justify-center rounded-full border-2 border-black bg-black/60 z-10
                          text-white font-black text-2xl md:text-3xl">
            VS
          </div>
        </div>

        {/* Rising embers */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`ember-${i}`}
            className="absolute w-1.5 h-1.5 rounded-full bg-orange-400"
            style={{
              left: '50%',
              top: '50%',
              '--ember-x': `${Math.cos((i / 8) * Math.PI * 2) * 50}px`,
              animation: `emberRise 2.5s ease-out ${i * 0.2}s infinite`,
            } as React.CSSProperties}
          />
        ))}
      </motion.div>

      {/* Status badge — emerges from explosion upward */}
      <motion.div
        className="absolute left-1/2 top-[calc(68%-30px)] -translate-x-1/2 z-30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75, duration: 0.5, ease: 'easeOut' }}
      >
        <StatusBadge status={status} />
      </motion.div>

    </section>
  )
}
