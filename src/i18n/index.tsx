'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import en from './locales/en.json'

export const SUPPORTED_LOCALES = ['en', 'es', 'pt', 'fr', 'de', 'ja', 'ar'] as const
export type Locale = typeof SUPPORTED_LOCALES[number]

export const LOCALE_NAMES: Record<Locale, string> = {
    en: 'English',
    es: 'Español',
    pt: 'Português',
    fr: 'Français',
    de: 'Deutsch',
    ja: '日本語',
    ar: 'العربية',
}

export const RTL_LOCALES: Locale[] = ['ar']

type TranslationMap = Record<string, Record<string, string>>
type I18nContextType = {
    locale: Locale
    setLocale: (locale: Locale) => void
    t: (key: string) => string
    isRTL: boolean
}

const I18nContext = createContext<I18nContextType>({
    locale: 'en',
    setLocale: () => { },
    t: (key: string) => key,
    isRTL: false,
})

// Flatten nested object keys: { common: { home: "Home" } } -> { "common.home": "Home" }
function flatten(obj: Record<string, any>, prefix = ''): Record<string, string> {
    const result: Record<string, string> = {}
    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key
        if (typeof value === 'object' && value !== null) {
            Object.assign(result, flatten(value, fullKey))
        } else {
            result[fullKey] = String(value)
        }
    }
    return result
}

const flatEN = flatten(en)

// Lazy-load locale files
const localeLoaders: Record<Locale, () => Promise<Record<string, any>>> = {
    en: () => Promise.resolve(en),
    es: () => import('./locales/es.json').then(m => m.default),
    pt: () => import('./locales/pt.json').then(m => m.default),
    fr: () => import('./locales/fr.json').then(m => m.default),
    de: () => import('./locales/de.json').then(m => m.default),
    ja: () => import('./locales/ja.json').then(m => m.default),
    ar: () => import('./locales/ar.json').then(m => m.default),
}

const loadedLocales: Record<string, Record<string, string>> = { en: flatEN }

export function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('cpr-locale')
            if (saved && SUPPORTED_LOCALES.includes(saved as Locale)) return saved as Locale
        }
        return 'en'
    })
    const [translations, setTranslations] = useState<Record<string, string>>(flatEN)

    const setLocale = useCallback(async (newLocale: Locale) => {
        setLocaleState(newLocale)
        if (typeof window !== 'undefined') localStorage.setItem('cpr-locale', newLocale)

        if (loadedLocales[newLocale]) {
            setTranslations(loadedLocales[newLocale])
        } else {
            try {
                const data = await localeLoaders[newLocale]()
                const flat = flatten(data)
                loadedLocales[newLocale] = flat
                setTranslations(flat)
            } catch {
                setTranslations(flatEN) // Fallback to English
            }
        }

        // Set dir attribute for RTL languages
        if (typeof document !== 'undefined') {
            document.documentElement.dir = RTL_LOCALES.includes(newLocale) ? 'rtl' : 'ltr'
            document.documentElement.lang = newLocale
        }
    }, [])

    const t = useCallback((key: string): string => {
        return translations[key] ?? flatEN[key] ?? key
    }, [translations])

    const isRTL = RTL_LOCALES.includes(locale)

    return (
        <I18nContext.Provider value={{ locale, setLocale, t, isRTL }}>
            {children}
        </I18nContext.Provider>
    )
}

export function useI18n() {
    return useContext(I18nContext)
}

export function useTranslation() {
    const { t, locale } = useContext(I18nContext)
    return { t, locale }
}
