'use client'

import { usePathname } from 'next/navigation'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { OnlineStatusBadge } from './online-status-badge'

const DETAIL_PATTERNS = [/^\/cases\/[^/]+$/, /^\/defendants\/[^/]+$/]

const BREADCRUMBS: Record<string, string> = {
  '/': 'COURT OF PUBLIC RECORD > HOME',
  '/how-it-works': 'COURT OF PUBLIC RECORD > HOW IT WORKS',
}

export function StickyHeader() {
  const pathname = usePathname()
  const isDetail = DETAIL_PATTERNS.some((p) => p.test(pathname))
  const breadcrumb = BREADCRUMBS[pathname]

  if (!isDetail && !breadcrumb) return null

  return (
    <header className="flex h-14 items-center justify-between gap-2 border-b px-4 bg-background sticky top-0 z-40">
      <div className="flex items-center gap-2">
        {!breadcrumb && <SidebarTrigger className="-ml-2" />}
        {breadcrumb && (
          <span className="text-xs font-bold tracking-widest text-foreground uppercase select-none">
            {breadcrumb}
          </span>
        )}
      </div>
      {breadcrumb && <OnlineStatusBadge />}
    </header>
  )
}
