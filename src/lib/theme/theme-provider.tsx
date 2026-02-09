'use client'

import {
    createContext,
    useCallback,
    useEffect,
    useState,
    type ReactNode,
} from 'react'
import {
    THEME_COLORS,
    DEFAULT_COLOR,
    DEFAULT_MODE,
    type ThemeColor,
    type ThemeMode,
} from './colors'
import { createClient } from '@/lib/supabase/client'

interface ThemeContextValue {
    mode: ThemeMode
    color: ThemeColor
    setMode: (mode: ThemeMode) => void
    setColor: (color: ThemeColor) => void
    resolvedMode: 'light' | 'dark'
}

export const ThemeContext = createContext<ThemeContextValue>({
    mode: DEFAULT_MODE,
    color: DEFAULT_COLOR,
    setMode: () => { },
    setColor: () => { },
    resolvedMode: 'light',
})

function getSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
}

function resolveMode(mode: ThemeMode): 'light' | 'dark' {
    return mode === 'system' ? getSystemTheme() : mode
}

function applyTheme(mode: 'light' | 'dark', color: ThemeColor) {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(mode)
    root.style.setProperty('--primary', THEME_COLORS[color].hsl)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [mode, setModeState] = useState<ThemeMode>(DEFAULT_MODE)
    const [color, setColorState] = useState<ThemeColor>(DEFAULT_COLOR)
    const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>('light')
    const [mounted, setMounted] = useState(false)

    // Load from localStorage on mount
    useEffect(() => {
        const storedMode = localStorage.getItem('theme-mode') as ThemeMode | null
        const storedColor = localStorage.getItem('theme-color') as ThemeColor | null

        const m = storedMode || DEFAULT_MODE
        const c = storedColor || DEFAULT_COLOR
        const resolved = resolveMode(m)

        setModeState(m)
        setColorState(c)
        setResolvedMode(resolved)
        applyTheme(resolved, c)
        setMounted(true)
    }, [])

    // Sync from Supabase profile on login (overrides localStorage)
    useEffect(() => {
        if (!mounted) return

        const supabase = createClient()

        const syncFromProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase
                .from('profiles')
                .select('theme, primary_color')
                .eq('id', user.id)
                .single()

            if (profile) {
                const m = (profile.theme as ThemeMode) || DEFAULT_MODE
                const c = (profile.primary_color as ThemeColor) || DEFAULT_COLOR
                const resolved = resolveMode(m)

                setModeState(m)
                setColorState(c)
                setResolvedMode(resolved)
                applyTheme(resolved, c)
                localStorage.setItem('theme-mode', m)
                localStorage.setItem('theme-color', c)
            }
        }

        syncFromProfile()

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event) => {
                if (event === 'SIGNED_IN') {
                    syncFromProfile()
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [mounted])

    // Listen for system theme changes
    useEffect(() => {
        if (mode !== 'system') return

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handler = () => {
            const resolved = getSystemTheme()
            setResolvedMode(resolved)
            applyTheme(resolved, color)
        }
        mediaQuery.addEventListener('change', handler)
        return () => mediaQuery.removeEventListener('change', handler)
    }, [mode, color])

    const setMode = useCallback(
        async (newMode: ThemeMode) => {
            const resolved = resolveMode(newMode)
            setModeState(newMode)
            setResolvedMode(resolved)
            applyTheme(resolved, color)
            localStorage.setItem('theme-mode', newMode)

            // Sync to Supabase if logged in
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                await supabase
                    .from('profiles')
                    .update({ theme: newMode, updated_at: new Date().toISOString() })
                    .eq('id', user.id)
            }
        },
        [color]
    )

    const setColor = useCallback(
        async (newColor: ThemeColor) => {
            setColorState(newColor)
            applyTheme(resolvedMode, newColor)
            localStorage.setItem('theme-color', newColor)

            // Sync to Supabase if logged in
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                await supabase
                    .from('profiles')
                    .update({ primary_color: newColor, updated_at: new Date().toISOString() })
                    .eq('id', user.id)
            }
        },
        [resolvedMode]
    )

    // Prevent flash of unstyled content
    if (!mounted) {
        return <>{children}</>
    }

    return (
        <ThemeContext.Provider value={{ mode, color, setMode, setColor, resolvedMode }}>
            {children}
        </ThemeContext.Provider>
    )
}
