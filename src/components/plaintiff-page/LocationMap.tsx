'use client'

import { motion } from 'framer-motion'
import { MapPinIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

interface Location {
  name: string
  date: string
  description: string
  coordinates?: [number, number] // [lat, lng]
}

interface LocationMapProps {
  locations: Location[]
}

export function LocationMap({ locations }: LocationMapProps) {
  if (!locations || locations.length === 0) return null

  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className="py-16 px-6 bg-gradient-to-b from-transparent to-[var(--accent-900)]/30"
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-2 text-white">Fraud Trail</h2>
        <p className="text-sm text-white/40 mb-8">
          Tracking the path of deception across {locations.length} locations
        </p>

        {/* Location path — sequential cards */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--accent-500)] via-[var(--accent-300)] to-red-500" />

          <div className="space-y-6">
            {locations.map((loc, i) => (
              <div key={i} className="relative flex gap-4 items-start">
                {/* Pin */}
                <div className="relative z-10 shrink-0 w-12 h-12 rounded-full bg-[var(--accent-700)] border-2 border-[var(--accent-500)] flex items-center justify-center">
                  <span className="text-sm font-bold text-[var(--accent-300)]">{i + 1}</span>
                </div>

                {/* Card */}
                <div className="flex-1 bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPinIcon className="h-4 w-4 text-[var(--accent-500)]" />
                    <h3 className="text-sm font-semibold text-white">{loc.name}</h3>
                    <span className="text-[10px] text-white/40 ml-auto">{loc.date}</span>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">{loc.description}</p>
                </div>

                {/* Arrow to next */}
                {i < locations.length - 1 && (
                  <div className="absolute left-6 -bottom-3 transform -translate-x-1/2">
                    <ArrowRightIcon className="h-3 w-3 text-[var(--accent-500)] rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  )
}
