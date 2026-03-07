'use client'

import { useEffect, useRef } from 'react'

export function CursorFlashlight({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const lightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!lightRef.current) return

      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      lightRef.current.style.background = `
        radial-gradient(
          circle 400px at ${x}px ${y}px,
          rgba(255,255,255,0.15),
          transparent 80%
        )
      `
    }

    const handleMouseLeave = () => {
      if (lightRef.current) {
        lightRef.current.style.background = 'none'
      }
    }

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {children}
      <div
        ref={lightRef}
        className="absolute inset-0 pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
      />
    </div>
  )
}
