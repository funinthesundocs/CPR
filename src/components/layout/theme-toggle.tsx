'use client'

import { useTheme } from '@/lib/theme/use-theme'
import { Moon, Sun, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ThemeMode } from '@/lib/theme/colors'

export function ThemeToggle() {
    const { mode, setMode, resolvedMode } = useTheme()

    const icons: Record<string, React.ReactNode> = {
        light: <Sun className="h-4 w-4" />,
        dark: <Moon className="h-4 w-4" />,
        system: <Monitor className="h-4 w-4" />,
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                    {resolvedMode === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    <span className="text-sm">
                        {mode === 'system' ? 'System' : mode === 'dark' ? 'Dark' : 'Light'}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                {(['light', 'dark', 'system'] as ThemeMode[]).map((m) => (
                    <DropdownMenuItem key={m} onClick={() => setMode(m)} className="gap-2">
                        {icons[m]}
                        <span className="capitalize">{m}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
