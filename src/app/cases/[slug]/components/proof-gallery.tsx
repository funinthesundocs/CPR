'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    EyeIcon,
    UserIcon,
    LinkIcon,
    AcademicCapIcon,
    ComputerDesktopIcon,
    DocumentTextIcon,
    CheckBadgeIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    XMarkIcon
} from '@heroicons/react/24/outline'

type Witness = { id: string; full_name?: string; name?: string; witness_type?: string; statement?: string; details?: { can_verify?: string } }
type Evidence = { id: string; label: string; category?: string; description?: string; is_verified?: boolean; file_url?: string }
type CaseRole = { role: string; user_profiles: { display_name: string; avatar_url: string | null } | null }

const WITNESS_ICONS: Record<string, React.ElementType> = {
    eyewitness: EyeIcon, character: UserIcon, corroborating: LinkIcon, expert: AcademicCapIcon, digital: ComputerDesktopIcon,
}

export function ProofGallery({ witnesses = [], evidence = [], caseRoles = [] }: { witnesses?: Witness[], evidence?: Evidence[], caseRoles?: CaseRole[] }) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [selectedProof, setSelectedProof] = useState<Witness | Evidence | null>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(true)

    const checkScroll = useCallback(() => {
        const el = scrollRef.current
        if (!el) return
        setCanScrollLeft(el.scrollLeft > 10)
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
    }, [])

    useEffect(() => {
        const el = scrollRef.current
        if (!el) return
        checkScroll()
        el.addEventListener('scroll', checkScroll, { passive: true })
        window.addEventListener('resize', checkScroll)
        return () => {
            el.removeEventListener('scroll', checkScroll)
            window.removeEventListener('resize', checkScroll)
        }
    }, [checkScroll])

    const scroll = (direction: 'left' | 'right') => {
        const el = scrollRef.current
        if (!el) return
        el.scrollBy({ left: direction === 'left' ? -340 : 340, behavior: 'smooth' })
    }

    // Block body scroll when lightbox open
    useEffect(() => {
        if (selectedProof) document.body.style.overflow = 'hidden'
        else document.body.style.overflow = ''
        return () => { document.body.style.overflow = '' }
    }, [selectedProof])

    if (!witnesses.length && !evidence.length) return null

    return (
        <section className="relative py-24 bg-[#050505] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] to-[#050505] pointer-events-none" />

            <div className="relative z-10 max-w-7xl w-full mx-auto px-6 sm:px-12 mb-12">
                <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-white mb-6">Evidence &amp; Witnesses</h2>
                <p className="text-white/50 text-lg font-light w-full text-justify hyphens-auto max-w-none">The verification layer. Proof of pattern, timeline, and impact corroborated by digital trails and third-party testament.</p>

                {/* Case Participants Ribbon */}
                {caseRoles.length > 0 && (
                    <div className="mt-8 flex flex-wrap gap-3">
                        {caseRoles.map((cr, i) => (
                            <div key={i} className="flex items-center gap-2.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full shadow-lg">
                                <div className="w-6 h-6 rounded-full bg-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                                    {cr.user_profiles?.avatar_url ? (
                                        <img src={cr.user_profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon className="w-3 h-3 text-white/50" />
                                    )}
                                </div>
                                <span className="text-xs font-medium text-white/80">{cr.user_profiles?.display_name ?? 'Unknown'}</span>
                                <span className="text-[10px] uppercase tracking-widest text-primary font-bold pr-1">{cr.role.replace(/_/g, ' ')}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Scroll Navigation Arrows */}
            <AnimatePresence>
                {canScrollLeft && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => scroll('left')}
                        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/10 hover:border-white/40 transition-colors shadow-lg"
                        aria-label="Scroll evidence left"
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
                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/10 hover:border-white/40 transition-colors shadow-lg"
                        aria-label="Scroll evidence right"
                    >
                        <ChevronRightIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Horizontal Scroll Gallery */}
            <div
                ref={scrollRef}
                onKeyDown={(e) => {
                    if (e.key === 'ArrowRight') scroll('right')
                    else if (e.key === 'ArrowLeft') scroll('left')
                }}
                tabIndex={0}
                role="region"
                aria-label="Evidence and witness gallery"
                className="relative z-10 flex gap-6 overflow-x-auto pb-12 pt-4 px-8 sm:px-28 snap-x snap-mandatory no-scrollbar focus:outline-none"
                style={{ scrollBehavior: 'smooth' }}
            >
                {/* Witnesses First */}
                {witnesses.map(w => (
                    <WitnessCard key={w.id} witness={w} onClick={() => setSelectedProof(w)} />
                ))}
                {/* Evidence Second */}
                {evidence.map(e => (
                    <EvidenceCard key={e.id} evidence={e} onClick={() => setSelectedProof(e)} />
                ))}

                {/* Spacer for right edge */}
                <div className="w-6 shrink-0" />
            </div>

            {/* Fade Edges for Scroll Strip */}
            <div className="absolute inset-y-0 right-0 w-16 sm:w-24 bg-gradient-to-l from-[#050505] to-transparent pointer-events-none z-20" />
            <div className="absolute inset-y-0 left-0 w-16 sm:w-24 bg-gradient-to-r from-[#050505] to-transparent pointer-events-none z-20" />

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedProof && (
                    <LightboxModal proof={selectedProof} onClose={() => setSelectedProof(null)} />
                )}
            </AnimatePresence>
        </section>
    )
}

function WitnessCard({ witness, onClick }: { witness: Witness, onClick: () => void }) {
    const Icon = WITNESS_ICONS[witness.witness_type ?? ''] ?? UserIcon
    const name = witness.full_name || witness.name || 'Unknown Witness'

    return (
        <motion.button
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="group shrink-0 w-[280px] sm:w-[320px] snap-center text-left bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden relative cursor-pointer"
        >
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-500" />
            <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                        <Icon className="w-5 h-5 text-white/70" />
                    </div>
                    {witness.details?.can_verify && <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),1)]" />}
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">{name}</h3>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                        {witness.witness_type ? witness.witness_type.replace(/_/g, ' ') : 'Witness'}
                    </p>
                </div>
                <p className="text-sm text-white/50 leading-relaxed line-clamp-3 text-justify hyphens-auto">
                    {witness.statement || "Witness statement available on record."}
                </p>
            </div>
        </motion.button>
    )
}

function EvidenceCard({ evidence, onClick }: { evidence: Evidence, onClick: () => void }) {
    return (
        <motion.button
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="group shrink-0 w-[280px] sm:w-[320px] snap-center text-left bg-black backdrop-blur-xl border border-primary/20 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden relative cursor-pointer"
        >
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-500" />

            <div className="relative z-10 space-y-4 flex flex-col h-full">
                <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 text-primary">
                        {evidence.is_verified ? <CheckBadgeIcon className="w-5 h-5" /> : <DocumentTextIcon className="w-5 h-5" />}
                    </div>
                    {evidence.is_verified && (
                        <span className="px-2 py-1 rounded bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-widest border border-green-500/20">Verified</span>
                    )}
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-white tracking-tight line-clamp-2">{evidence.label}</h3>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                        {evidence.category || 'Documentation'}
                    </p>
                </div>
                <p className="text-sm text-primary/60 font-medium">View Evidence &rarr;</p>
            </div>
        </motion.button>
    )
}

function LightboxModal({ proof, onClose }: { proof: Witness | Evidence, onClose: () => void }) {
    const isWitness = 'statement' in proof

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [onClose])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative z-10 w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <h3 className="text-lg font-bold text-white">
                        {isWitness ? 'Witness Testimony' : 'Case Evidence'}
                    </h3>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 sm:p-10 overflow-y-auto custom-scrollbar">
                    {isWitness ? (
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                    <UserIcon className="w-8 h-8 text-white/50" />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-white">{(proof as Witness).full_name || (proof as Witness).name || 'Unknown'}</h4>
                                    <p className="text-sm font-bold text-white/40 uppercase tracking-widest mt-1">{(proof as Witness).witness_type?.replace(/_/g, ' ')}</p>
                                </div>
                            </div>

                            {(proof as Witness).details?.can_verify && (
                                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Verifies</p>
                                    <p className="text-sm text-primary/80 font-medium">{(proof as Witness).details!.can_verify}</p>
                                </div>
                            )}

                            <div className="prose prose-invert max-w-none text-white/80 leading-relaxed font-light text-lg text-justify hyphens-auto">
                                {(proof as Witness).statement}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 text-center flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                                <DocumentTextIcon className="w-12 h-12 text-primary" />
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-white mb-2">{(proof as Evidence).label}</h4>
                                <p className="text-xs font-bold text-white/40 uppercase tracking-widest">
                                    {(proof as Evidence).category || 'Documentation'}
                                </p>
                            </div>
                            <p className="text-white/60 text-lg w-full text-justify hyphens-auto max-w-none">
                                {(proof as Evidence).description || 'This evidence item supports claims made in the timeline.'}
                            </p>
                            {(proof as Evidence).file_url && (
                                <a
                                    href={(proof as Evidence).file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-full hover:bg-primary/90 transition-colors"
                                >
                                    <LinkIcon className="w-4 h-4" /> Expand Original File
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    )
}
