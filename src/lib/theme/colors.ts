export const THEME_COLORS = {
    blue: { label: 'Blue', hsl: '221 83% 53%' },
    emerald: { label: 'Emerald', hsl: '160 84% 39%' },
    amber: { label: 'Amber', hsl: '38 92% 50%' },
    rose: { label: 'Rose', hsl: '347 77% 50%' },
    violet: { label: 'Violet', hsl: '263 70% 50%' },
    orange: { label: 'Orange', hsl: '25 95% 53%' },
    cyan: { label: 'Cyan', hsl: '189 94% 43%' },
    slate: { label: 'Slate', hsl: '215 16% 47%' },
} as const

export type ThemeColor = keyof typeof THEME_COLORS
export type ThemeMode = 'light' | 'dark' | 'system'

export const DEFAULT_COLOR: ThemeColor = 'blue'
export const DEFAULT_MODE: ThemeMode = 'system'
