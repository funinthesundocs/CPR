'use client'

import React, { useRef, useState, useCallback } from 'react'

const LENS_SIZE  = 352   // diameter of the lens circle (px) — 320 * 1.1
const ZOOM       = 2.8   // magnification factor
const HANDLE_W   = 14    // handle body width (px)
const HANDLE_H   = 120   // handle body length (px)
const FERRULE_H  = 24    // metallic collar height (px)
const FERRULE_W  = HANDLE_W + 8   // collar wider than handle
const HANDLE_DEG = 42    // rotation angle of handle

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

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
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

  // Handle assembly — positioned in CONTAINER coordinate space so attachment math is unambiguous
  // Rim edge in container coords = cursor position ± radius along HANDLE_DEG direction
  const rad          = (HANDLE_DEG * Math.PI) / 180
  const radius       = LENS_SIZE / 2
  const handleLeft   = pos ? Math.round(pos.x + radius * Math.sin(rad) - FERRULE_W / 2) : 0
  const handleTop    = pos ? Math.round(pos.y + radius * Math.cos(rad)) - 6 : 0  // 6px overlap into rim

  return (
    <div
      ref={containerRef}
      className={`relative select-none ${className ?? ''}`}
      style={{ cursor: isInside ? 'none' : 'default' }}
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

      {/* Magnifying glass — only visible while hovering */}
      {pos && isInside && (
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

          {/* ── Handle assembly — sibling in container space, pivot exactly on rim edge ── */}
          <div
            className="absolute pointer-events-none z-49 flex flex-col items-center"
            style={{
              width:           FERRULE_W,
              top:             handleTop,
              left:            handleLeft,
              transformOrigin: `${FERRULE_W / 2}px 0px`,
              transform:       `rotate(${HANDLE_DEG}deg)`,
            }}
          >
            {/* Ferrule — metallic collar */}
            <div
              style={{
                width:        FERRULE_W,
                height:       FERRULE_H,
                flexShrink:   0,
                borderRadius: '4px 4px 2px 2px',
                background:   'linear-gradient(to right, #5a5a5a 0%, #d8d8d8 28%, #f2f2f2 50%, #c0c0c0 72%, #5a5a5a 100%)',
                boxShadow:    '0 3px 8px rgba(0,0,0,0.65), inset 0 1px 2px rgba(255,255,255,0.4)',
              }}
            />
            {/* Handle body — dark rubber grip */}
            <div
              style={{
                width:        HANDLE_W,
                height:       HANDLE_H,
                flexShrink:   0,
                borderRadius: `2px 2px ${HANDLE_W / 2}px ${HANDLE_W / 2}px`,
                background:   'linear-gradient(to right, #0a0a0a 0%, #282828 38%, #181818 62%, #0a0a0a 100%)',
                boxShadow:    '3px 6px 20px rgba(0,0,0,0.9)',
                position:     'relative',
                overflow:     'hidden',
              }}
            >
              <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 5px, rgba(255,255,255,0.04) 5px, rgba(255,255,255,0.04) 7px)' }} />
              <div style={{ position: 'absolute', left: 2, top: '4%', bottom: '18%', width: 2, background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(255,255,255,0.06), transparent)', borderRadius: 1 }} />
              <div style={{ position: 'absolute', bottom: 8, left: 1, right: 1, height: 6, background: 'linear-gradient(to right, #111, #3a3a3a, #111)', borderRadius: 3 }} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
