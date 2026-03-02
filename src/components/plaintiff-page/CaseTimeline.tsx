'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
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

const EVENT_TYPE_COLORS: Record<string, string> = {
  first_contact: 'bg-blue-500',
  trust_built: 'bg-green-500',
  the_act: 'bg-[var(--accent-500)]',
  escalation: 'bg-orange-500',
  red_flag: 'bg-red-500',
  discovery: 'bg-purple-500',
  aftermath: 'bg-red-700',
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
          className="w-full pb-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20"
        >
          <div
            style={{ minWidth: `${events.length * 240}px` }}
            className="relative flex items-center px-12 py-48"
          >
            {/* Timeline spine */}
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-[var(--accent-500)]/50" />

            {/* Events */}
            {events.map((event, i) => {
              const dotColor = EVENT_TYPE_COLORS[event.event_type] || 'bg-[var(--accent-500)]'
              const isAbove = i % 2 === 0

              return (
                <div
                  key={event.id}
                  className="relative flex flex-col items-center shrink-0"
                  style={{ width: 220, marginRight: 20 }}
                >
                  {/* Dot on spine */}
                  <div className={`w-4 h-4 rounded-full ${dotColor} border-2 border-[#0a0a0a] relative`} />

                  {/* Connector line */}
                  <div
                    className={`absolute left-1/2 w-px bg-white/20 ${
                      isAbove ? 'bottom-[50%] h-16' : 'top-[50%] h-16'
                    }`}
                    style={{ transform: 'translateX(-50%)' }}
                  />

                  {/* Event card */}
                  <div
                    className={`absolute ${isAbove ? 'bottom-[calc(50%+24px)]' : 'top-[calc(50%+24px)]'} w-52`}
                  >
                    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-300)] mb-1">
                        {event.date_or_year}
                      </p>
                      <p className="text-xs text-white/70 leading-relaxed line-clamp-4">
                        {event.description}
                      </p>
                      {event.city && (
                        <p className="flex items-center gap-1 text-[10px] text-white/40 mt-2">
                          <MapPinIcon className="h-3 w-3" />
                          {event.city}
                        </p>
                      )}
                    </div>
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
