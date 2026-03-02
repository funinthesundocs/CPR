'use client'

import { useRef, useState } from 'react'
import { motion, useAnimate } from 'framer-motion'
import { MapPinIcon } from '@heroicons/react/24/outline'

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

interface TimelineEvent {
  id: string
  date_or_year: string
  description: string
  city: string | null
  event_type: string
}

interface CaseTimelineProps {
  events: TimelineEvent[]
}

const DOT_CYCLE = ['bg-blue-500', 'bg-white', 'bg-slate-500']

function FlipCard({ event }: { event: TimelineEvent }) {
  const [flipped, setFlipped] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [scope, animateFlip] = useAnimate()
  const needsMore = event.description.length > 120

  const flip = async (toFlipped: boolean) => {
    if (animating) return
    setAnimating(true)
    await animateFlip(
      scope.current,
      toFlipped
        ? { rotateY: [0, -20, 200, 180], rotateZ: [0, 6, -6, 0] }
        : { rotateY: [180, 200, -20, 0], rotateZ: [0, -6, 6, 0] },
      { duration: 0.65, times: [0, 0.25, 0.75, 1], ease: 'easeInOut' as const }
    )
    setFlipped(toFlipped)
    setAnimating(false)
  }

  return (
    <div style={{ perspective: '900px', width: '250px' }}>
      <div
        ref={scope}
        style={{ transformStyle: 'preserve-3d', position: 'relative', minHeight: '169px' }}
      >
        {/* Front face */}
        <div
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          className="bg-white/5 border border-white/10 rounded-lg p-3"
        >
          <p className="text-[14px] font-bold uppercase tracking-wider text-[var(--accent-300)] mb-1">
            {event.date_or_year}
          </p>
          <p className="text-[14px] text-white/70 leading-relaxed line-clamp-3">
            {event.description}
          </p>
          {event.city && (
            <p className="flex items-center gap-1 text-[12px] text-white/40 mt-2">
              <MapPinIcon className="h-3 w-3" />
              {event.city}
            </p>
          )}
          {needsMore && (
            <button
              onClick={() => flip(true)}
              className="mt-3 px-3 py-1 text-[11px] font-semibold rounded-md bg-[var(--accent-500)]/20 hover:bg-[var(--accent-500)]/50 border border-[var(--accent-500)]/40 hover:border-[var(--accent-500)]/80 text-[var(--accent-300)] hover:text-white transition-all tracking-wide"
            >
              More
            </button>
          )}
        </div>

        {/* Back face */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            minHeight: '100%',
          }}
          className="bg-[var(--accent-900)]/50 border border-[var(--accent-500)]/40 rounded-lg p-3"
        >
          <p className="text-[14px] font-bold uppercase tracking-wider text-[var(--accent-300)] mb-2">
            {event.date_or_year}
          </p>
          <p className="text-[13px] text-white/80 leading-relaxed">
            {event.description}
          </p>
          {event.city && (
            <p className="flex items-center gap-1 text-[12px] text-white/40 mt-2">
              <MapPinIcon className="h-3 w-3" />
              {event.city}
            </p>
          )}
          <button
            onClick={() => flip(false)}
            className="mt-3 px-3 py-1 text-[11px] font-semibold rounded-md bg-[var(--accent-500)]/20 hover:bg-[var(--accent-500)]/50 border border-[var(--accent-500)]/40 hover:border-[var(--accent-500)]/80 text-[var(--accent-300)] hover:text-white transition-all tracking-wide"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  )
}

export function CaseTimeline({ events }: CaseTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  if (!events || events.length === 0) return null

  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className="py-16"
    >
      <h2 className="text-[38px] font-semibold mb-8 px-6 text-white max-w-[1340px] mx-auto">Case Timeline</h2>

      {/* ISOLATION CONTAINER — no position:sticky, no z-index, no overflow:visible */}
      <div style={{ overflow: 'hidden' }} className="w-full">
        <div
          ref={scrollRef}
          style={{ overflowX: 'auto', overflowY: 'hidden' }}
          className="w-full pb-6 mb-[60px] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20"
        >
          <div
            style={{ minWidth: `${events.length * 288}px` }}
            className="relative flex items-center px-12 py-72"
          >
            {/* Timeline spine */}
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-[var(--accent-500)]/50" />

            {/* Events */}
            {events.map((event, i) => {
              const dotColor = DOT_CYCLE[i % 3]
              const isAbove = i % 2 === 0

              return (
                <div
                  key={event.id}
                  className="relative flex flex-col items-center shrink-0"
                  style={{ width: 264, marginRight: 24 }}
                >
                  {/* Numbered dot on spine */}
                  <div
                    className={`w-9 h-9 rounded-full ${dotColor} border-2 border-[#0a0a0a] flex items-center justify-center relative z-10`}
                  >
                    <span className="text-[16px] font-bold text-black leading-none">{i + 1}</span>
                  </div>

                  {/* Connector line — starts at dot edge */}
                  <div
                    className={`absolute left-1/2 w-px bg-white/20 h-16 ${
                      isAbove ? 'bottom-[calc(50%+18px)]' : 'top-[calc(50%+18px)]'
                    }`}
                    style={{ transform: 'translateX(-50%)' }}
                  />

                  {/* Event card — clears connector end + gap */}
                  <div
                    className={`absolute ${isAbove ? 'bottom-[calc(50%+90px)]' : 'top-[calc(50%+90px)]'}`}
                  >
                    <FlipCard event={event} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </motion.section>
  )
}
