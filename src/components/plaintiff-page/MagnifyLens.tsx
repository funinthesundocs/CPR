'use client'

import React, { useRef, useState, useCallback } from 'react'

const LENS_SIZE  = 440   // diameter of the lens circle (px) — 352 * 1.25
const ZOOM       = 2.8   // magnification factor

interface MagnifyLensProps {
  imageUrl: string
  alt: string
  className?: string
  children?: React.ReactNode
}

interface MousePos {
  x: number
  y: number
  containerW: number
  containerH: number
}

export function MagnifyLens({ imageUrl, alt, className, children }: MagnifyLensProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [pos, setPos]           = useState<MousePos | null>(null)
  const [isInside, setIsInside] = useState(false)
  const [isOverButton, setIsOverButton] = useState(false)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()

    // Check if hovering over a button
    const target = e.target as HTMLElement
    const isButton = target.closest('button') !== null
    setIsOverButton(isButton)

    setPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      containerW: rect.width,
      containerH: rect.height,
    })
  }, [])

  const handleMouseEnter = useCallback(() => setIsInside(true), [])
  const handleMouseLeave = useCallback(() => { setIsInside(false); setPos(null) }, [])

  // Background-size of the magnified image inside the lens
  const bgW = pos ? pos.containerW * ZOOM : 0
  const bgH = pos ? pos.containerH * ZOOM : 0

  // Background-position: offset so the area around cursor shows inside lens
  const bgX = pos ? -(pos.x * ZOOM - LENS_SIZE / 2) : 0
  const bgY = pos ? -(pos.y * ZOOM - LENS_SIZE / 2) : 0

  // Position of the lens top-left corner
  const lensLeft = pos ? pos.x - LENS_SIZE / 2 : 0
  const lensTop  = pos ? pos.y - LENS_SIZE / 2 : 0


  return (
    <div
      ref={containerRef}
      className={`relative select-none ${className ?? ''}`}
      style={{ cursor: isInside && !isOverButton ? 'none' : 'default' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* The actual infographic image */}
      <img
        src={imageUrl}
        alt={alt}
        className="w-full rounded-lg shadow-2xl block"
        draggable={false}
        loading="lazy"
      />

      {/* Slot for overlays (e.g. audio button) */}
      {children}

      {/* Magnifying glass — only visible while hovering (hidden when over button) */}
      {pos && isInside && !isOverButton && (
        <>
          {/* ── Lens circle (rim + glass) — positioned in container space ── */}
          <div
            className="absolute pointer-events-none z-50"
            style={{ left: lensLeft, top: lensTop, width: LENS_SIZE, height: LENS_SIZE }}
          >
            {/* Outer rim (metallic ring) */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'conic-gradient(from 120deg, #e8e8e8, #a0a0a0, #f5f5f5, #888, #e0e0e0, #c0c0c0, #e8e8e8)',
                padding: 6,
                boxShadow: '0 10px 40px rgba(0,0,0,0.75), 0 2px 10px rgba(0,0,0,0.5), inset 0 1px 3px rgba(255,255,255,0.3)',
              }}
            >
              {/* Lens glass (magnified image) */}
              <div
                className="w-full h-full rounded-full overflow-hidden"
                style={{
                  backgroundImage:    `url(${imageUrl})`,
                  backgroundSize:     `${bgW}px ${bgH}px`,
                  backgroundPosition: `${bgX}px ${bgY}px`,
                  backgroundRepeat:   'no-repeat',
                }}
              >
                {/* Glass glare overlay */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse at 32% 28%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.06) 45%, transparent 70%)',
                  }}
                />
                {/* Subtle edge vignette for depth */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{ boxShadow: 'inset 0 0 20px rgba(0,0,0,0.25)' }}
                />
              </div>
            </div>
          </div>

        </>
      )}
    </div>
  )
}
