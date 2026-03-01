'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function ComparisonSlider({
    promiseHtml,
    realityHtml
}: {
    promiseHtml: React.ReactNode
    realityHtml: React.ReactNode
}) {
    const [position, setPosition] = useState(50)
    const [isDragging, setIsDragging] = useState(false)

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return
        const rect = e.currentTarget.getBoundingClientRect()
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
        setPosition((x / rect.width) * 100)
    }

    return (
        <div
            className="relative w-full max-w-7xl mx-auto h-[300px] sm:h-[400px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#050505] cursor-ew-resize select-none touch-none"
            onPointerDown={() => setIsDragging(true)}
            onPointerUp={() => setIsDragging(false)}
            onPointerLeave={() => setIsDragging(false)}
            onPointerMove={handlePointerMove}
        >
            {/* Promise Side (Underneath) */}
            <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-center bg-[#050505]">
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-[0.2em] text-white/30 mb-6">What Was Promised</h3>
                <div className="text-lg sm:text-lg font-light leading-relaxed text-white/60 text-justify hyphens-auto max-w-none">
                    {promiseHtml}
                </div>
            </div>

            {/* Reality Side (Clip Path overlay) */}
            <div
                className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-center shadow-[inset_10px_0_30px_rgba(0,0,0,0.5)] bg-gradient-to-r from-red-950/40 to-black backdrop-blur-3xl border-l border-red-500/30"
                style={{ clipPath: `inset(0 0 0 ${position}%)` }}
            >
                {/* We need an inner container that ignores the clip to keep text aligned */}
                <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-center min-w-full">
                    <h3 className="text-xl sm:text-2xl font-black uppercase tracking-[0.2em] text-red-500/80 mb-6">What Actually Happened</h3>
                    <div className="text-lg sm:text-lg font-medium leading-relaxed text-red-100/90 text-justify hyphens-auto max-w-none">
                        {realityHtml}
                    </div>
                </div>
            </div>

            {/* Drag Handle */}
            <div
                className="absolute inset-y-0 w-1 bg-white/20 hover:bg-white/50 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.8)] z-10"
                style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-16 bg-white/5 backdrop-blur-3xl rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)] border border-white/30 overflow-hidden cursor-grab active:cursor-grabbing hover:scale-105 transition-transform duration-300">
                    <div className="flex gap-1.5 opacity-70">
                        <div className="w-0.5 h-6 bg-white rounded-full shadow-[0_0_5px_rgba(255,255,255,1)]" />
                        <div className="w-0.5 h-6 bg-white rounded-full shadow-[0_0_5px_rgba(255,255,255,1)]" />
                    </div>
                </div>
            </div>
        </div>
    )
}
