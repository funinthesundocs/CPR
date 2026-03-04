'use client'

import { usePathname } from 'next/navigation'
import { SidebarTrigger } from '@/components/ui/sidebar'

const DETAIL_PATTERNS = [/^\/cases\/[^/]+$/, /^\/defendants\/[^/]+$/]

export function StickyHeader() {
  const pathname = usePathname()
  const isDetail = DETAIL_PATTERNS.some((p) => p.test(pathname))

  if (!isDetail) return null

  return (
    <header className="flex h-14 items-center gap-2 border-b px-4 bg-background sticky top-0 z-40">
      <SidebarTrigger className="-ml-2" />
    </header>
  )
}
