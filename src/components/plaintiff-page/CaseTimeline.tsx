'use client'

import { useRef, useState } from 'react'
import { motion, useAnimate } from 'framer-motion'
import { MapPinIcon } from '@heroicons/react/24/outline'
import { Bars3Icon, ListBulletIcon } from '@heroicons/react/24/outline'
import { FlagIcon } from './FlagIcon'

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

// Parse date string to timestamp for sorting
const parseDate = (dateStr: string): number => {
  if (!dateStr) return 0

  // Try ISO format (2020-05-15)
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return new Date(dateStr).getTime()
  }

  // Try US format (05/15/2020)
  if (/^\d{2}\/\d{2}\/\d{4}/.test(dateStr)) {
    return new Date(dateStr).getTime()
  }

  // Try text format with day (May 15, 2020 or May 15 2020)
  const textMatch = dateStr.match(/([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/)
  if (textMatch) {
    return new Date(`${textMatch[1]} ${textMatch[2]}, ${textMatch[3]}`).getTime()
  }

  // Try month year (May 2020 or Early 2023, Late 2024, etc.)
  const monthYearMatch = dateStr.match(/([A-Za-z]+)\s+(\d{4})/)
  if (monthYearMatch) {
    return new Date(`${monthYearMatch[1]} 1, ${monthYearMatch[2]}`).getTime()
  }

  // Try date range with dash (2020–2021 or 2020-2021)
  const rangeMatch = dateStr.match(/^(\d{4})[–-](\d{4})/)
  if (rangeMatch) {
    return new Date(`${rangeMatch[1]}-01-01`).getTime()
  }

  // Try year only
  const yearMatch = dateStr.match(/(\d{4})/)
  if (yearMatch) {
    return new Date(`${yearMatch[1]}-01-01`).getTime()
  }

  return 0
}

// Get country code from location string for flag rendering
type CountryCode = 'AU' | 'TH' | 'AE' | 'VN' | 'CN' | 'US' | 'GB' | 'EU'

const getCountryCode = (location: string | null): CountryCode | null => {
  if (!location) return null

  const locationLower = location.toLowerCase()

  // Location/city to country code mapping (ISO 3166-1 alpha-2)
  const locationToCountry: Record<string, CountryCode> = {
    'australia': 'AU',
    'au': 'AU',
    'melbourne': 'AU',
    'brisbane': 'AU',
    'gold coast': 'AU',
    'queensland': 'AU',
    'sydney': 'AU',
    'perth': 'AU',

    'thailand': 'TH',
    'th': 'TH',
    'bangkok': 'TH',

    'dubai': 'AE',
    'uae': 'AE',
    'united arab emirates': 'AE',

    'vietnam': 'VN',
    'vn': 'VN',
    'da nang': 'VN',
    'hanoi': 'VN',
    'ho chi minh': 'VN',

    'china': 'CN',
    'cn': 'CN',
    'beijing': 'CN',
    'shanghai': 'CN',

    'usa': 'US',
    'us': 'US',
    'united states': 'US',
    'america': 'US',

    'uk': 'GB',
    'united kingdom': 'GB',
    'england': 'GB',
    'london': 'GB',

    'europe': 'EU',
    'european': 'EU',
  }

  // Check for matches
  for (const [key, code] of Object.entries(locationToCountry)) {
    if (locationLower.includes(key)) {
      return code
    }
  }

  return null
}

// Format date as "Month Day Year" (e.g., "September 9 2025") or "Month Year" for partial dates
const formatDate = (dateStr: string): string => {
  // Check for date range (2020–2021)
  const rangeMatch = dateStr.match(/^(\d{4})[–-](\d{4})/)
  if (rangeMatch) {
    return `${rangeMatch[1]} – ${rangeMatch[2]}`
  }

  // Check for Early/Late/Mid + Year (Early 2023, Late 2024)
  const approximateMatch = dateStr.match(/^(Early|Mid|Late)\s+(\d{4})/)
  if (approximateMatch) {
    return dateStr
  }

  const timestamp = parseDate(dateStr)
  if (timestamp === 0) return dateStr

  const date = new Date(timestamp)

  // Check if original string has a day (full date) or just month+year
  const hasDayMatch = dateStr.match(/(\d{1,2})/)
  if (hasDayMatch) {
    // Has day - format as "Month Day Year"
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  } else {
    // No day - format as "Month Year"
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
  }
}

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
    <div style={{ perspective: '900px', width: '300px' }}>
      <div
        ref={scope}
        style={{ transformStyle: 'preserve-3d', position: 'relative', minHeight: '169px' }}
      >
        {/* Front face */}
        <div
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          className="bg-white/5 border border-white/10 rounded-lg p-3"
        >
          <p className="text-[14px] font-bold uppercase tracking-wider text-[var(--accent-300)] mb-1 text-center">
            {formatDate(event.date_or_year)}
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
          <p className="text-[14px] font-bold uppercase tracking-wider text-[var(--accent-300)] mb-2 text-center">
            {formatDate(event.date_or_year)}
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
  const [viewMode, setViewMode] = useState<'horizontal' | 'vertical'>('horizontal')
  const [isDragging, setIsDragging] = useState(false)
  const dragStartX = useRef(0)
  const dragStartScrollLeft = useRef(0)

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    dragStartX.current = e.clientX
    dragStartScrollLeft.current = scrollRef.current.scrollLeft
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const delta = dragStartX.current - e.clientX
    scrollRef.current.scrollLeft = dragStartScrollLeft.current + delta
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  if (!events || events.length === 0) return null

  // Sort events chronologically by date
  const sortedEvents = [...events].sort((a, b) => {
    return parseDate(a.date_or_year) - parseDate(b.date_or_year)
  })

  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className="pt-16 pb-[30px]"
    >
      {/* Header with title and view toggle */}
      <div className="flex items-center justify-end gap-6 px-6 mb-8 max-w-[1340px] mx-auto">
        <h2 className="text-[38px] font-semibold text-white mr-auto">Case Timeline</h2>

        {/* View toggle buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('horizontal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'horizontal'
                ? 'bg-[var(--accent-500)] text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
            }`}
          >
            <Bars3Icon className="h-4 w-4" />
            Horizontal
          </button>
          <button
            onClick={() => setViewMode('vertical')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'vertical'
                ? 'bg-[var(--accent-500)] text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
            }`}
          >
            <ListBulletIcon className="h-4 w-4" />
            Vertical
          </button>
        </div>
      </div>

      {viewMode === 'horizontal' ? (
        /* HORIZONTAL VIEW — scrollable flip-card timeline */
        <div style={{ overflow: 'hidden' }} className="w-full">
          <div
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ overflowX: 'auto', overflowY: 'hidden', cursor: isDragging ? 'grabbing' : 'grab' }}
            className="w-full pb-6 mb-[60px] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 select-none"
          >
            <div
              style={{ minWidth: `${sortedEvents.length * 288}px` }}
              className="relative flex items-center px-12 py-72"
            >
              {/* Timeline spine */}
              <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-[var(--accent-500)]/50" />

              {/* Events */}
              {sortedEvents.map((event, i) => {
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
      ) : (
        /* VERTICAL VIEW — two-column layout with flag and content */
        <div className="w-full max-w-[1340px] mx-auto px-6 space-y-6 mb-12">
          {sortedEvents.map((event, i) => {
            const countryCode = getCountryCode(event.city)
            return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-4 bg-white/5 border border-white/10 rounded-lg overflow-hidden"
            >
              {/* LEFT COLUMN — 20% — Flag */}
              <div className="w-1/5 bg-white/10 flex items-center justify-center p-4 shrink-0">
                {countryCode ? (
                  <FlagIcon countryCode={countryCode} className="h-24 w-32 rounded-md" />
                ) : (
                  <div className="h-24 w-32 bg-white/20 rounded-md flex items-center justify-center text-white/40 text-sm">
                    Unknown
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN — 80% — Content */}
              <div className="w-4/5 p-6 space-y-3">
                {/* Event number and date — left justified */}
                <div className="flex items-baseline gap-4">
                  <span className="text-[24px] font-bold text-[var(--accent-500)]">#{i + 1}</span>
                  <p className="text-[16px] font-semibold text-white">{formatDate(event.date_or_year)}</p>
                </div>

                {/* Full description */}
                <p className="text-[15px] leading-relaxed text-white/80">
                  {event.description}
                </p>

                {/* Location */}
                {event.city && (
                  <p className="flex items-center gap-2 text-[13px] text-white/50">
                    <MapPinIcon className="h-4 w-4" />
                    {event.city}
                  </p>
                )}
              </div>
            </motion.div>
            )
          })}
        </div>
      )}
    </motion.section>
  )
}
