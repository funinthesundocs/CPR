'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { ScaleIcon } from '@heroicons/react/24/outline'
import type { User } from '@supabase/supabase-js'
import { useTranslation } from '@/i18n'

export default function OnboardingPage() {
    const router = useRouter()
    const { t } = useTranslation()
    const [user, setUser] = useState<User | null>(null)
    const [step, setStep] = useState(1)
    const [displayName, setDisplayName] = useState('')
    const [tagline, setTagline] = useState('')
    const [bio, setBio] = useState('')
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const supabase = createClient()
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }
            setUser(user)

            // Check if already onboarded
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('display_name, bio')
                .eq('id', user.id)
                .single()

            if (profile?.display_name && profile.display_name.trim() !== '') {
                router.push('/')
                return
            }
            setLoading(false)
        }
        checkUser()
    }, [router])

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setAvatarFile(file)
            setAvatarPreview(URL.createObjectURL(file))
        }
    }

    const handleComplete = async () => {
        if (!user) return
        if (!displayName.trim()) {
            setError('Display name is required')
            return
        }
        if (!bio.trim()) {
            setError('Please write a short bio')
            return
        }

        setSaving(true)
        setError(null)

        const supabase = createClient()

        try {
            let avatarUrl: string | null = null

            // Upload avatar if provided
            if (avatarFile) {
                const ext = avatarFile.name.split('.').pop()
                const path = `${user.id}/avatar.${ext}`
                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(path, avatarFile, { upsert: true })

                if (!uploadError) {
                    const { data: publicUrl } = supabase.storage
                        .from('avatars')
                        .getPublicUrl(path)
                    avatarUrl = publicUrl.publicUrl
                }
            }

            // Update user_profiles
            const updates: Record<string, any> = {
                display_name: displayName.trim(),
                tagline: tagline.trim() || null,
                bio: bio.trim(),
                profile_completion: 50,
                email: user.email || null,
            }
            if (avatarUrl) updates.avatar_url = avatarUrl

            const { error: profileError } = await supabase
                .from('user_profiles')
                .update(updates)
                .eq('id', user.id)

            if (profileError) throw new Error(profileError.message)

            router.push('/')
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'Something went wrong')
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[70vh]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        )
    }

    return (
        <div className="flex min-h-[70vh] items-center justify-center">
            <div className="w-full max-w-md space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <ScaleIcon className="h-12 w-12 mx-auto" style={{ color: 'hsl(var(--primary))' }} />
                    <h1 className="text-2xl font-bold">{t('onboarding.welcome')}</h1>
                    <p className="text-sm text-muted-foreground">
                        {t('onboarding.setupProfile')}
                    </p>
                </div>

                <Progress value={step === 1 ? 33 : step === 2 ? 66 : 100} className="h-1.5" />

                {/* Step 1: Identity */}
                {step === 1 && (
                    <div className="rounded-xl border bg-card p-6 space-y-5">
                        <div>
                            <h2 className="text-lg font-semibold">{t('onboarding.identity')}</h2>
                            <p className="text-xs text-muted-foreground mt-1">{t('onboarding.setupProfile')}</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="displayName">{t('onboarding.displayName')} *</Label>
                            <Input
                                id="displayName"
                                value={displayName}
                                onChange={e => setDisplayName(e.target.value)}
                                placeholder="How should we address you?"
                                maxLength={50}
                            />
                            <p className="text-xs text-muted-foreground">{displayName.length}/50 characters</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tagline">{t('onboarding.tagline')}</Label>
                            <Input
                                id="tagline"
                                value={tagline}
                                onChange={e => setTagline(e.target.value)}
                                placeholder="e.g. Justice advocate · Fraud researcher"
                                maxLength={100}
                            />
                        </div>

                        <Button
                            className="w-full"
                            onClick={() => {
                                if (!displayName.trim()) { setError('Display name is required'); return }
                                setError(null)
                                setStep(2)
                            }}
                        >
                            {t('common.next')} →
                        </Button>
                    </div>
                )}

                {/* Step 2: Bio & Avatar */}
                {step === 2 && (
                    <div className="rounded-xl border bg-card p-6 space-y-5">
                        <div>
                            <h2 className="text-lg font-semibold">{t('onboarding.about')}</h2>
                            <p className="text-xs text-muted-foreground mt-1">{t('onboarding.setupProfile')}</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">{t('onboarding.bioLabel')} *</Label>
                            <Textarea
                                id="bio"
                                value={bio}
                                onChange={e => setBio(e.target.value)}
                                placeholder={t('onboarding.bioPlaceholder')}
                                rows={4}
                                maxLength={500}
                            />
                            <p className="text-xs text-muted-foreground">{bio.length}/500 characters</p>
                        </div>

                        <div className="space-y-2">
                            <Label>{t('onboarding.avatar')}</Label>
                            <div className="flex items-center gap-4">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar" className="h-16 w-16 rounded-full object-cover ring-2 ring-border" />
                                ) : (
                                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground">
                                        {displayName.charAt(0).toUpperCase() || '?'}
                                    </div>
                                )}
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="flex-1"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                                ← {t('common.back')}
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={() => {
                                    if (!bio.trim()) { setError('Please write a short bio'); return }
                                    setError(null)
                                    setStep(3)
                                }}
                            >
                                {t('common.next')} →
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 3: Review & Complete */}
                {step === 3 && (
                    <div className="rounded-xl border bg-card p-6 space-y-5">
                        <div>
                            <h2 className="text-lg font-semibold">{t('onboarding.complete')}</h2>
                            <p className="text-xs text-muted-foreground mt-1">{t('onboarding.setupProfile')}</p>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="" className="h-14 w-14 rounded-full object-cover ring-2 ring-border" />
                            ) : (
                                <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground">
                                    {displayName.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <p className="font-semibold">{displayName}</p>
                                {tagline && <p className="text-xs text-muted-foreground">{tagline}</p>}
                            </div>
                        </div>

                        <div className="p-4 rounded-lg bg-muted/30">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Bio</p>
                            <p className="text-sm">{bio}</p>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                                ← {t('common.back')}
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={handleComplete}
                                disabled={saving}
                            >
                                {saving ? (
                                    <span className="flex items-center gap-2">
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        {t('profile.saving')}
                                    </span>
                                ) : (
                                    `✅ ${t('onboarding.finish')}`
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3">
                        <p className="text-sm text-destructive">{error}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
