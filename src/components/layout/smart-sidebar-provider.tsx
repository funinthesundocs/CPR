'use client'

import React, { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { SidebarProvider } from '@/components/ui/sidebar'

const SIDEBAR_WIDTH_PX = 256  // 16rem — matches shadcn --sidebar-width default
const PROXIMITY_PX     = 100  // hover zone: distance from left edge that triggers open
const CLOSE_DELAY_MS   = 200  // debounce before auto-closing on mouse exit

const FIXED_OPEN_ROUTES = new Set(['/', '/how-it-works'])

function isDetailRoute(pathname: string): boolean {
  return (
    /^\/cases\/[^/]+$/.test(pathname) && pathname !== '/cases/new'
  ) || /^\/defendants\/[^/]+$/.test(pathname)
}

export function SmartSidebarProvider({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isDetail = isDetailRoute(pathname)
  const isFixed = FIXED_OPEN_ROUTES.has(pathname)

  const [open, setOpen] = useState(() => !isDetail)
  const openRef  = useRef(open)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Keep ref in sync — updated in render body so mousemove handler is never stale
  openRef.current = open

  // Reset sidebar state on route changes (client-side navigation)
  useEffect(() => {
    clearTimeout(timerRef.current)
    setOpen(!isDetail)
  }, [isDetail])

  // Proximity hover — only on detail pages, only on non-touch devices
  useEffect(() => {
    if (!isDetail) return
    if (typeof window !== 'undefined' && 'ontouchstart' in window) return

    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientX <= PROXIMITY_PX) {
        // Cursor in hover zone → cancel any pending close, open if not already
        clearTimeout(timerRef.current)
        if (!openRef.current) setOpen(true)
      } else if (e.clientX > SIDEBAR_WIDTH_PX + 20) {
        // Cursor past sidebar edge → schedule close (debounced)
        clearTimeout(timerRef.current)
        if (openRef.current) {
          timerRef.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS)
        }
      } else {
        // Cursor over sidebar body (100–276px) → cancel any pending close
        clearTimeout(timerRef.current)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(timerRef.current)
    }
  }, [isDetail])

  return (
    <SidebarProvider open={isFixed ? true : open} onOpenChange={isFixed ? undefined : setOpen} suppressHydrationWarning>
      {sidebar}
      {children}
    </SidebarProvider>
  )
}
