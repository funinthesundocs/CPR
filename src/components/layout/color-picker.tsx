'use client'

import { useTheme } from '@/lib/theme/use-theme'
import { THEME_COLORS, type ThemeColor } from '@/lib/theme/colors'
import { Button } from '@/components/ui/button'
import { PaintBrushIcon } from '@heroicons/react/24/outline'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ColorPicker() {
    const { color, setColor } = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                    <PaintBrushIcon className="h-4 w-4" />
                    <span className="text-sm">{THEME_COLORS[color].label}</span>
                    <span
                        className="ml-auto h-3 w-3 rounded-full"
                        style={{ background: `hsl(${THEME_COLORS[color].hsl})` }}
                    />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="grid grid-cols-2 gap-1 p-2 w-48">
                {(Object.entries(THEME_COLORS) as [ThemeColor, (typeof THEME_COLORS)[ThemeColor]][]).map(
                    ([key, value]) => (
                        <DropdownMenuItem
                            key={key}
                            onClick={() => setColor(key)}
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            <span
                                className="h-4 w-4 rounded-full shrink-0 border border-border"
                                style={{ background: `hsl(${value.hsl})` }}
                            />
                            <span className="text-xs">{value.label}</span>
                            {color === key && <span className="ml-auto text-xs">✓</span>}
                        </DropdownMenuItem>
                    )
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
