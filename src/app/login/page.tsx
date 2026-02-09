'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScaleIcon } from '@heroicons/react/24/outline'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const supabase = createClient()
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
            return
        }

        router.push('/')
        router.refresh()
    }

    const handleSignUp = async () => {
        setLoading(true)
        setError(null)

        const supabase = createClient()
        const { error } = await supabase.auth.signUp({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
            return
        }

        setError(null)
        alert('Check your email for a confirmation link!')
        setLoading(false)
    }

    return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center space-y-2">
                    <ScaleIcon className="h-10 w-10 mx-auto" style={{ color: 'hsl(var(--primary))' }} />
                    <h1 className="text-2xl font-bold">Court of Public Record</h1>
                    <p className="text-sm text-muted-foreground">Sign in to your account</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Input
                            id="email"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Input
                            id="password"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}

                    <div className="space-y-2">
                        <Button
                            type="submit"
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base py-5"
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            disabled={loading}
                            onClick={handleSignUp}
                        >
                            Create Account
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
