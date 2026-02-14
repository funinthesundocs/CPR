'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ShieldExclamationIcon } from '@heroicons/react/24/outline'
import type { User } from '@supabase/supabase-js'
import { useTranslation } from '@/i18n'

type DeadManSwitch = {
    id: string
    is_active: boolean
    interval_days: number
    last_checkin: string
    next_deadline: string
    trustee_name: string
    trustee_email: string
    message: string
    include_cases: boolean
    include_evidence: boolean
}

export default function SafetyPage() {
    const router = useRouter()
    const supabase = createClient()
    const { t } = useTranslation()
    const [user, setUser] = useState<User | null>(null)
    const [switchData, setSwitchData] = useState<DeadManSwitch | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    // Form state
    const [isActive, setIsActive] = useState(false)
    const [intervalDays, setIntervalDays] = useState(30)
    const [trusteeName, setTrusteeName] = useState('')
    const [trusteeEmail, setTrusteeEmail] = useState('')
    const [message, setMessage] = useState('')
    const [includeCases, setIncludeCases] = useState(true)
    const [includeEvidence, setIncludeEvidence] = useState(false)

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/login?redirect=/profile/safety'); return }
            setUser(user)

            const { data } = await supabase
                .from('dead_man_switches')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle()

            if (data) {
                const d = data as DeadManSwitch
                setSwitchData(d)
                setIsActive(d.is_active)
                setIntervalDays(d.interval_days)
                setTrusteeName(d.trustee_name || '')
                setTrusteeEmail(d.trustee_email || '')
                setMessage(d.message || '')
                setIncludeCases(d.include_cases ?? true)
                setIncludeEvidence(d.include_evidence ?? false)
            }
            setLoading(false)
        }
        init()
    }, [router, supabase])

    const handleSave = async () => {
        if (!user) return
        if (isActive && (!trusteeName.trim() || !trusteeEmail.trim())) {
            setError('Trustee name and email are required to activate the switch')
            return
        }
        setSaving(true)
        setError(null)
        setSuccess(null)

        try {
            const now = new Date()
            const nextDeadline = new Date(now.getTime() + intervalDays * 86400000)

            const payload = {
                user_id: user.id,
                is_active: isActive,
                interval_days: intervalDays,
                last_checkin: now.toISOString(),
                next_deadline: nextDeadline.toISOString(),
                trustee_name: trusteeName.trim(),
                trustee_email: trusteeEmail.trim(),
                message: message.trim(),
                include_cases: includeCases,
                include_evidence: includeEvidence,
            }

            if (switchData) {
                const { error: err } = await supabase
                    .from('dead_man_switches')
                    .update(payload)
                    .eq('id', switchData.id)
                if (err) throw new Error(err.message)
            } else {
                const { error: err } = await supabase
                    .from('dead_man_switches')
                    .insert(payload)
                if (err) throw new Error(err.message)
            }

            setSuccess(t('safety.savedSuccess'))
        } catch (err: any) {
            setError(err.message || 'Failed to save')
        } finally {
            setSaving(false)
        }
    }

    const handleCheckin = async () => {
        if (!switchData) return
        setSaving(true)
        const now = new Date()
        const nextDeadline = new Date(now.getTime() + intervalDays * 86400000)

        await supabase
            .from('dead_man_switches')
            .update({ last_checkin: now.toISOString(), next_deadline: nextDeadline.toISOString() })
            .eq('id', switchData.id)

        setSuccess(t('safety.checkinSuccess'))
        setSaving(false)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        )
    }

    const daysUntilDeadline = switchData?.next_deadline
        ? Math.ceil((new Date(switchData.next_deadline).getTime() - Date.now()) / 86400000)
        : null

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <div className="flex items-center gap-2">
                    <ShieldExclamationIcon className="h-7 w-7" style={{ color: 'hsl(var(--primary))' }} />
                    <h1 className="text-2xl font-bold">{t('safety.title')}</h1>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                    {t('safety.description')}
                </p>
            </div>

            {/* Status Card */}
            {switchData && isActive && (
                <Card className={`border-2 ${daysUntilDeadline !== null && daysUntilDeadline <= 7 ? 'border-red-500/50 bg-red-500/5' : 'border-green-500/50 bg-green-500/5'}`}>
                    <CardContent className="p-5 flex flex-col sm:flex-row items-center gap-4">
                        <div className="text-4xl">{daysUntilDeadline !== null && daysUntilDeadline <= 7 ? '⚠️' : '🛡️'}</div>
                        <div className="flex-1 text-center sm:text-left">
                            <p className="font-semibold">
                                {daysUntilDeadline !== null && daysUntilDeadline <= 7
                                    ? `⚠️ Check-in due in ${daysUntilDeadline} day${daysUntilDeadline !== 1 ? 's' : ''}`
                                    : `✅ Active — ${daysUntilDeadline} days until next deadline`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Last check-in: {switchData.last_checkin ? new Date(switchData.last_checkin).toLocaleDateString() : 'Never'}
                            </p>
                        </div>
                        <Button onClick={handleCheckin} disabled={saving}>
                            {saving ? t('common.loading') : `✅ ${t('safety.checkIn')}`}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Switch Toggle */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                        {t('safety.deadManSwitch')}
                        <Badge variant={isActive ? 'default' : 'outline'} className={isActive ? 'bg-green-600' : ''}>
                            {isActive ? t('safety.enable') : t('safety.disable')}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-3">
                        <Button
                            variant={isActive ? 'default' : 'outline'}
                            className={`flex-1 ${isActive ? 'bg-green-600 hover:bg-green-700' : ''}`}
                            onClick={() => setIsActive(true)}
                        >
                            {t('safety.enable')}
                        </Button>
                        <Button
                            variant={!isActive ? 'default' : 'outline'}
                            className={`flex-1 ${!isActive ? 'bg-red-600 hover:bg-red-700' : ''}`}
                            onClick={() => setIsActive(false)}
                        >
                            {t('safety.disable')}
                        </Button>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <Label>{t('safety.interval')} ({t('safety.daysInterval')})</Label>
                        <div className="flex gap-2">
                            {[7, 14, 30, 60, 90].map(d => (
                                <Button
                                    key={d}
                                    variant={intervalDays === d ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setIntervalDays(d)}
                                >
                                    {d}d
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Trustee Info */}
            <Card>
                <CardHeader><CardTitle className="text-lg">{t('safety.trustee')}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>{t('safety.trusteeName')} *</Label>
                        <Input value={trusteeName} onChange={e => setTrusteeName(e.target.value)} placeholder="Full name of your trusted person" />
                    </div>
                    <div className="space-y-2">
                        <Label>{t('safety.trusteeEmail')} *</Label>
                        <Input type="email" value={trusteeEmail} onChange={e => setTrusteeEmail(e.target.value)} placeholder="trustee@example.com" />
                    </div>
                </CardContent>
            </Card>

            {/* Message & Content */}
            <Card>
                <CardHeader><CardTitle className="text-lg">{t('safety.message')}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>{t('safety.message')}</Label>
                        <Textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="If you're reading this, something has happened to me. Please ensure my cases remain public..."
                            rows={4}
                            maxLength={2000}
                        />
                    </div>

                    <Separator />

                    <div className="space-y-3">
                        <p className="text-sm font-medium">What to share with trustee:</p>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={includeCases} onChange={e => setIncludeCases(e.target.checked)} className="rounded" />
                            <span className="text-sm">{t('safety.includeCases')}</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={includeEvidence} onChange={e => setIncludeEvidence(e.target.checked)} className="rounded" />
                            <span className="text-sm">{t('safety.includeEvidence')}</span>
                        </label>
                    </div>
                </CardContent>
            </Card>

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

            <Button className="w-full" onClick={handleSave} disabled={saving}>
                {saving ? t('profile.saving') : `💾 ${t('common.save')} ${t('safety.title')}`}
            </Button>
        </div>
    )
}
