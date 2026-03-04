'use client'

import { usePathname } from 'next/navigation'
import { SidebarInset } from '@/components/ui/sidebar'

const DETAIL_PATTERNS = [/^\/cases\/[^/]+$/, /^\/defendants\/[^/]+$/]

export function SidebarInsetWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDetail = DETAIL_PATTERNS.some((p) => p.test(pathname))

  return (
    <SidebarInset
      suppressHydrationWarning
      className={isDetail ? 'h-svh overflow-y-auto' : undefined}
    >
      {children}
    </SidebarInset>
  )
}
