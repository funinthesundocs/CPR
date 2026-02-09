'use client'

import { useTheme } from '@/lib/theme/use-theme'
import { MoonIcon, SunIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline'
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
        light: <SunIcon className="h-5 w-5" />,
        dark: <MoonIcon className="h-5 w-5" />,
        system: <ComputerDesktopIcon className="h-5 w-5" />,
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                    {resolvedMode === 'dark' ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
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
