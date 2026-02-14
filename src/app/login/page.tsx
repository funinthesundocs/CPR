'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScaleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { useTranslation } from '@/i18n'

type Mode = 'login' | 'signup'

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-[70vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    )
}

function LoginForm() {
    const [mode, setMode] = useState<Mode>('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirect = searchParams.get('redirect')
    const { t } = useTranslation()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const supabase = createClient()
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            setError(error.message)
            setLoading(false)
            return
        }

        // Check if user has completed onboarding (display_name set)
        if (data.user) {
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('display_name, bio')
                .eq('id', data.user.id)
                .single()

            if (!profile || !profile.display_name || profile.display_name.trim() === '') {
                router.push('/onboarding')
                return
            }
        }

        router.push(redirect || '/')
        router.refresh()
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(null)

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            setLoading(false)
            return
        }

        const supabase = createClient()
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/onboarding`,
            },
        })

        if (error) {
            setError(error.message)
            setLoading(false)
            return
        }

        setSuccess('Check your email for a confirmation link! Once confirmed, you\'ll set up your profile.')
        setLoading(false)
    }

    return (
        <div className="flex min-h-[70vh] items-center justify-center">
            <div className="w-full max-w-sm space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <ScaleIcon className="h-12 w-12 mx-auto" style={{ color: 'hsl(var(--primary))' }} />
                    <h1 className="text-2xl font-bold tracking-tight">{t('common.appName')}</h1>
                    <p className="text-sm text-muted-foreground">
                        {mode === 'login' ? t('auth.signInTitle') : t('auth.signUpTitle')}
                    </p>
                </div>

                {/* Tab Toggle */}
                <div className="flex rounded-lg border overflow-hidden">
                    <button
                        onClick={() => { setMode('login'); setError(null); setSuccess(null) }}
                        className={`flex-1 py-2.5 text-sm font-medium transition-colors ${mode === 'login'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                            }`}
                    >
                        {t('common.login')}
                    </button>
                    <button
                        onClick={() => { setMode('signup'); setError(null); setSuccess(null) }}
                        className={`flex-1 py-2.5 text-sm font-medium transition-colors ${mode === 'signup'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                            }`}
                    >
                        {t('common.signup')}
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={mode === 'login' ? handleLogin : handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">{t('auth.email')}</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">{t('auth.password')}</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className="h-4 w-4" />
                                ) : (
                                    <EyeIcon className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    {mode === 'signup' && (
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">{t('auth.confirmPassword')}</Label>
                            <div className="relative">
                                <Input
                                    id="confirm-password"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    autoComplete="new-password"
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? (
                                        <EyeSlashIcon className="h-4 w-4" />
                                    ) : (
                                        <EyeIcon className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3">
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="rounded-lg border border-green-500/50 bg-green-500/5 p-3">
                            <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full font-semibold text-base py-5"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                            </span>
                        ) : (
                            mode === 'login' ? t('common.login') : t('common.signup')
                        )}
                    </Button>
                </form>

                <p className="text-xs text-center text-muted-foreground">
                    {mode === 'login'
                        ? 'By signing in, you agree to the Court\'s terms of service.'
                        : 'You\'ll set up your profile after confirming your email.'}
                </p>
            </div>
        </div>
    )
}
