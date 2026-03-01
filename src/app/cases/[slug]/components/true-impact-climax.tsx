'use client'

import { motion } from 'framer-motion'
import { AnimatedCounter } from '@/components/animated-counter'

type TrueImpactClimaxProps = {
    financialTotal: number
    breakdown: { label: string; amount: number }[]
    pullQuote: string
    emotionalImpact: string
    physicalImpact: string
    whenRealized: string
    howConfirmed: string
}

export function TrueImpactClimax({
    financialTotal,
    breakdown,
    pullQuote,
    emotionalImpact,
    physicalImpact,
    whenRealized,
    howConfirmed
}: TrueImpactClimaxProps) {
    const visibleItems = breakdown.filter((item) => item.amount > 0)
    const displayQuote = pullQuote || emotionalImpact || "The impact was devastating."

    return (
        <section className="relative py-32 bg-[#050505] overflow-hidden">
            {/* Deep Crimson Radial Glow for Emotional Tension Climax */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-900/20 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-900/50 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-red-900/50 to-transparent" />

            <div className="relative z-10 max-w-7xl w-full mx-auto px-6 sm:px-12 flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">

                {/* Left Side: The Emotional Climax (Pull Quote) */}
                <div className="flex-1 space-y-10">
                    <motion.blockquote
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="relative"
                    >
                        <span className="absolute -top-10 -left-6 text-7xl text-red-500/20 font-serif leading-none select-none">"</span>
                        <p className="text-2xl sm:text-4xl lg:text-5xl text-white font-serif leading-tight tracking-tight mt-6 relative z-10">
                            {displayQuote}
                        </p>
                    </motion.blockquote>

                    <div className="space-y-6 pt-6 border-t border-red-900/30">
                        {whenRealized && (
                            <div>
                                <p className="text-[10px] font-bold text-red-400/80 uppercase tracking-widest mb-1.5">When the Truth Emerged</p>
                                <p className="text-sm text-white/70 leading-relaxed font-light text-justify hyphens-auto">{whenRealized}</p>
                            </div>
                        )}
                        {howConfirmed && (
                            <div>
                                <p className="text-[10px] font-bold text-red-400/80 uppercase tracking-widest mb-1.5">How It Was Confirmed</p>
                                <p className="text-sm text-white/70 leading-relaxed font-light text-justify hyphens-auto">{howConfirmed}</p>
                            </div>
                        )}
                        {physicalImpact && (
                            <div>
                                <p className="text-[10px] font-bold text-red-400/80 uppercase tracking-widest mb-1.5">Physical Impact</p>
                                <p className="text-sm text-white/70 leading-relaxed font-light text-justify hyphens-auto">{physicalImpact}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: The Documented Financial Reality */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="w-full lg:w-[400px] shrink-0 bg-black/40 backdrop-blur-2xl border border-red-900/30 rounded-3xl p-8 sm:p-10 shadow-[0_0_50px_rgba(120,0,0,0.1)]"
                >
                    <div className="mb-8">
                        <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2">Total Financial Damages</h3>
                        <p className="text-5xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                            <AnimatedCounter value={financialTotal} prefix="$" />
                        </p>
                    </div>

                    {visibleItems.length > 0 && (
                        <div className="space-y-5">
                            {visibleItems.map((item, i) => {
                                const percentage = financialTotal > 0 ? Math.round((item.amount / financialTotal) * 100) : 0
                                return (
                                    <div key={item.label} className="group cursor-default">
                                        <div className="flex justify-between items-baseline mb-2">
                                            <span className="text-sm text-white/60 font-medium group-hover:text-white/90 transition-colors">{item.label}</span>
                                            <span className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                                                ${item.amount.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${percentage}%` }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                                                className="h-full bg-red-600 rounded-full group-hover:bg-red-500 transition-colors shadow-[0_0_10px_rgba(220,38,38,0.8)]"
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </motion.div>

            </div>
        </section>
    )
}
