'use client'

import { useI18n, SUPPORTED_LOCALES, LOCALE_NAMES, type Locale } from '@/i18n'
import { GlobeAmericasIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'

export function LanguageSwitcher() {
    const { locale, setLocale } = useI18n()
    const [open, setOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => { setMounted(true) }, [])

    // Use default during SSR to avoid hydration mismatch
    const displayName = mounted ? LOCALE_NAMES[locale] : LOCALE_NAMES['en']

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted transition-colors"
                title="Change language"
            >
                <GlobeAmericasIcon className="h-4 w-4" />
                <span className="text-sm font-medium">{displayName}</span>
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 bottom-full mb-1 z-50 rounded-lg border bg-popover shadow-xl py-1 min-w-[140px]">
                        {SUPPORTED_LOCALES.map((loc) => (
                            <button
                                key={loc}
                                className={`w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors ${locale === loc ? 'font-bold text-primary' : ''}`}
                                onClick={() => {
                                    setLocale(loc as Locale)
                                    setOpen(false)
                                }}
                            >
                                {LOCALE_NAMES[loc as Locale]}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

