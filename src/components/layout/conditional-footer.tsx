'use client'

import { usePathname } from 'next/navigation'
import { Footer as PublicFooter } from './footer'

export function ConditionalFooter() {
    const pathname = usePathname()

    // Hide footer on admin pages
    if (pathname?.startsWith('/admin')) {
        return null
    }

    return <PublicFooter />
}
