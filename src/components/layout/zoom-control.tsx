'use client'

import { useTheme } from '@/lib/theme/use-theme'
import { Minus, Plus, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function ZoomControl() {
    const [zoom, setZoomState] = useState(100)

    useEffect(() => {
        const stored = localStorage.getItem('ui-zoom')
        if (stored) {
            const val = parseInt(stored, 10)
            setZoomState(val)
            applyZoom(val)
        }
    }, [])

    const applyZoom = (level: number) => {
        const root = document.documentElement
        const scale = level / 100
        root.style.fontSize = `${scale}rem`
    }

    const syncToSupabase = useCallback(async (level: number) => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            await supabase
                .from('profiles')
                .update({ zoom_level: level, updated_at: new Date().toISOString() })
                .eq('id', user.id)
        }
    }, [])

    const setZoom = useCallback((level: number) => {
        const clamped = Math.max(50, Math.min(200, level))
        setZoomState(clamped)
        applyZoom(clamped)
        localStorage.setItem('ui-zoom', String(clamped))
        syncToSupabase(clamped)
    }, [syncToSupabase])

    return (
        <div className="flex items-center gap-1 px-2">
            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setZoom(zoom - 10)}
                disabled={zoom <= 50}
            >
                <Minus className="h-3 w-3" />
            </Button>
            <button
                onClick={() => setZoom(100)}
                className="text-xs text-muted-foreground min-w-[40px] text-center hover:text-foreground transition-colors"
            >
                {zoom}%
            </button>
            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setZoom(zoom + 10)}
                disabled={zoom >= 200}
            >
                <Plus className="h-3 w-3" />
            </Button>
        </div>
    )
}
