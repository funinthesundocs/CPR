'use client'

import React, { useRef, useState, useCallback } from 'react'

const LENS_SIZE  = 320   // diameter of the lens circle (px)
const ZOOM       = 2.8   // magnification factor
const HANDLE_W   = 12    // handle width (px)
const HANDLE_H   = 80    // handle length (px)
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
  const [pos, setPos]         = useState<MousePos | null>(null)
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

  const handleMouseEnter = useCallback(() => setIsInside(true),  [])
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
        <div
          className="absolute pointer-events-none z-50"
          style={{ left: lensLeft, top: lensTop, width: LENS_SIZE, height: LENS_SIZE }}
        >
          {/* ── Outer rim (metallic ring) ── */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'conic-gradient(from 120deg, #e8e8e8, #a0a0a0, #f5f5f5, #888, #e0e0e0, #c0c0c0, #e8e8e8)',
              padding: 5,
              boxShadow: '0 8px 32px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.3)',
            }}
          >
            {/* ── Lens glass (magnified image) ── */}
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
            </div>
          </div>

          {/* ── Handle ── */}
          <div
            className="absolute"
            style={{
              width:  HANDLE_W,
              height: HANDLE_H,
              bottom: -(HANDLE_H - LENS_SIZE / 2 + 10),
              right:  -(HANDLE_W / 2 + 8),
              borderRadius: HANDLE_W / 2,
              background: 'linear-gradient(to right, #9a9a9a, #d4d4d4, #8a8a8a)',
              boxShadow: '2px 4px 12px rgba(0,0,0,0.6)',
              transformOrigin: `${HANDLE_W / 2}px 0px`,
              transform: `rotate(${HANDLE_DEG}deg)`,
            }}
          />

          {/* Handle grip bands */}
          {[20, 38, 56].map((offset) => (
            <div
              key={offset}
              className="absolute"
              style={{
                width:  HANDLE_W + 2,
                height: 4,
                bottom: -(HANDLE_H - LENS_SIZE / 2 + 10) + HANDLE_H - offset,
                right:  -(HANDLE_W / 2 + 9),
                borderRadius: 2,
                background: 'rgba(0,0,0,0.35)',
                transformOrigin: `${(HANDLE_W + 2) / 2}px 2px`,
                transform: `rotate(${HANDLE_DEG}deg)`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
