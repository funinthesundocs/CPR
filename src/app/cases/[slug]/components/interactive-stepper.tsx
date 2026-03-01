'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

export type StepperEvent = {
    id: string
    title: string
    description?: string
    date: string
}

export function InteractiveStepper({ events }: { events: StepperEvent[] }) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(false)

    const checkScroll = useCallback(() => {
        const el = scrollRef.current
        if (!el) return
        setCanScrollLeft(el.scrollLeft > 10)
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
    }, [])

    useEffect(() => {
        const el = scrollRef.current
        if (!el) return
        // RAF ensures layout is complete before we measure
        const frame = requestAnimationFrame(checkScroll)
        el.addEventListener('scroll', checkScroll, { passive: true })
        window.addEventListener('resize', checkScroll)
        return () => {
            cancelAnimationFrame(frame)
            el.removeEventListener('scroll', checkScroll)
            window.removeEventListener('resize', checkScroll)
        }
    }, [checkScroll])

    const scroll = (direction: 'left' | 'right') => {
        const el = scrollRef.current
        if (!el) return
        const cardWidth = window.innerWidth < 640 ? 280 : 340
        el.scrollBy({ left: direction === 'left' ? -(cardWidth + 24) : cardWidth + 24, behavior: 'smooth' })
    }

    const toggleExpand = (id: string) => {
        setExpandedId(prev => prev === id ? null : id)
    }

    if (!events || events.length === 0) return null

    return (
        <div className="relative w-full">
            {/* The Horizontal Laser Beam — decorative */}
            <div className="absolute bottom-4 inset-x-0 h-px bg-white/10 rounded-full pointer-events-none" />
            <div className="absolute bottom-4 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-[2px] pointer-events-none" />

            {/* Scroll wrapper — arrows positioned relative to this */}
            <div className="relative">
                {/* Navigation Arrows */}
                <AnimatePresence>
                    {canScrollLeft && (
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => scroll('left')}
                            className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-[60] w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/90 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/20 hover:border-white/50 transition-colors shadow-xl"
                            aria-label="Scroll timeline left"
                        >
                            <ChevronLeftIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </motion.button>
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {canScrollRight && (
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => scroll('right')}
                            className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-[60] w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/90 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/20 hover:border-white/50 transition-colors shadow-xl"
                            aria-label="Scroll timeline right"
                        >
                            <ChevronRightIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* Horizontal Scroll Area */}
                <div
                    ref={scrollRef}
                    onKeyDown={(e) => {
                        if (e.key === 'ArrowRight') scroll('right')
                        else if (e.key === 'ArrowLeft') scroll('left')
                        else if (e.key === 'Escape' && expandedId) setExpandedId(null)
                    }}
                    tabIndex={0}
                    role="region"
                    aria-label="Timeline events"
                    className="flex gap-5 sm:gap-6 overflow-x-auto pb-12 pt-4 px-10 sm:px-16 snap-x no-scrollbar focus:outline-none"
                >
                    {events.map((event) => {
                        const isExpanded = expandedId === event.id

                        return (
                            <motion.button
                                key={event.id}
                                onClick={() => toggleExpand(event.id)}
                                className={`
                                    relative shrink-0 snap-start w-[260px] sm:w-[300px] text-left
                                    rounded-3xl border transition-all duration-500 ease-out cursor-pointer
                                    ${isExpanded
                                        ? 'border-white/60 shadow-[inset_0_0_60px_rgba(255,255,255,0.12)] bg-white/10 backdrop-blur-3xl'
                                        : 'border-white/20 bg-white/5 backdrop-blur-2xl hover:border-white/40 hover:bg-white/[0.08]'}
                                `}
                            >
                                {/* Inner Glow when expanded */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-x-0 -bottom-4 h-1/2 bg-gradient-to-t from-cyan-400/20 to-transparent pointer-events-none rounded-b-3xl"
                                        />
                                    )}
                                </AnimatePresence>

                                <div className="relative p-5 sm:p-6 flex flex-col">
                                    {/* Date Badge */}
                                    <span className={`
                                        self-start px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase transition-colors duration-500
                                        ${isExpanded
                                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                            : 'bg-white/5 text-white/50 border border-white/10'}
                                    `}>
                                        {event.date}
                                    </span>

                                    {/* Title */}
                                    <h4 className={`mt-3 text-base sm:text-lg font-black uppercase tracking-tight transition-colors duration-500 ${isExpanded ? 'text-white' : 'text-white/80'}`}>
                                        {event.title}
                                    </h4>

                                    {/* Description */}
                                    {event.description && (
                                        <>
                                            <p className={`mt-2 text-sm leading-relaxed font-light text-justify hyphens-auto ${isExpanded ? 'text-white/80' : 'text-white/50 line-clamp-3'}`}>
                                                {event.description}
                                            </p>
                                            {!isExpanded && event.description.length > 120 && (
                                                <span className="mt-2 text-[11px] uppercase tracking-widest font-semibold text-cyan-400/60">
                                                    Read more
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>
                            </motion.button>
                        )
                    })}

                    {/* End spacer */}
                    <div className="w-8 shrink-0" />
                </div>

                {/* Edge fades — pointer-events-none so arrows still clickable */}
                <div className="absolute inset-y-0 left-0 w-12 sm:w-16 bg-gradient-to-r from-[#050505] to-transparent pointer-events-none z-30" />
                <div className="absolute inset-y-0 right-0 w-12 sm:w-16 bg-gradient-to-l from-[#050505] to-transparent pointer-events-none z-30" />
            </div>
        </div>
    )
}
