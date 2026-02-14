'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { PermissionGate } from '@/components/auth/PermissionGate'
import type { User } from '@supabase/supabase-js'
import { useTranslation } from '@/i18n'

export default function VotePage() {
    const { t } = useTranslation()

    return (
        <PermissionGate
            permission="vote"
            fallback={
                <div className="max-w-lg mx-auto text-center py-20 space-y-4">
                    <div className="text-6xl">🔒</div>
                    <h1 className="text-2xl font-bold">{t('voting.accessDenied')}</h1>
                    <p className="text-muted-foreground">
                        {t('voting.loginRequired')}
                    </p>
                </div>
            }
            loadingFallback={
                <div className="flex min-h-[60vh] items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            }
        >
            <Suspense fallback={
                <div className="flex min-h-[60vh] items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            }>
                <VoteForm />
            </Suspense>
        </PermissionGate>
    )
}

function VoteForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const caseId = searchParams.get('case')
    const supabase = createClient()
    const { t } = useTranslation()

    const [user, setUser] = useState<User | null>(null)
    const [caseData, setCaseData] = useState<any>(null)
    const [existingVote, setExistingVote] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Vote state
    const [guiltScore, setGuiltScore] = useState(5)
    const [nominalApproved, setNominalApproved] = useState(false)
    const [punitiveAmount, setPunitiveAmount] = useState('')
    const [justification, setJustification] = useState('')

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push(`/login?redirect=/vote?case=${caseId}`); return }
            setUser(user)

            if (!caseId) { setError(t('voting.noCaseId')); setLoading(false); return }

            // Load case
            const { data: caseResult } = await supabase
                .from('cases')
                .select('*, defendants(full_name, slug)')
                .eq('id', caseId)
                .single()

            if (!caseResult) { setError(t('voting.caseNotFound')); setLoading(false); return }
            setCaseData(caseResult)

            // Check for existing vote
            const { data: vote } = await supabase
                .from('votes')
                .select('*')
                .eq('case_id', caseId)
                .eq('voter_id', user.id)
                .maybeSingle()

            if (vote) {
                setExistingVote(vote)
                setGuiltScore(vote.guilt_score)
                setNominalApproved(vote.nominal_approved || false)
                setPunitiveAmount(vote.punitive_amount?.toString() || '')
                setJustification(vote.justification || '')
            }

            setLoading(false)
        }
        load()
    }, [caseId, router, supabase])

    const handleSubmit = async () => {
        if (!user || !caseId) return
        setSubmitting(true)
        setError(null)

        try {
            const punitive = punitiveAmount ? parseFloat(punitiveAmount) : 0

            const res = await fetch('/api/votes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    case_id: caseId,
                    guilt_score: guiltScore,
                    nominal_approved: nominalApproved,
                    punitive_amount: punitive || null,
                    justification: justification.trim() || null,
                }),
            })

            const result = await res.json()

            if (!res.ok) {
                throw new Error(result.error || 'Failed to submit vote')
            }

            setSubmitted(true)
        } catch (err: any) {
            setError(err.message || 'Failed to submit vote')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        )
    }

    if (submitted) {
        return (
            <div className="max-w-lg mx-auto text-center space-y-6 py-20">
                <div className="text-6xl">⚖️</div>
                <h1 className="text-2xl font-bold">{existingVote ? t('voting.voteUpdated') : t('voting.voteRecorded')}</h1>
                <p className="text-muted-foreground">
                    {t('voting.voteSealed')}
                </p>
                <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={() => router.push(`/cases/${caseData?.case_number}`)}>
                        {t('common.back')}
                    </Button>
                    <Button onClick={() => router.push('/cases')}>
                        {t('nav.browseCases')}
                    </Button>
                </div>
            </div>
        )
    }

    if (!caseData) {
        return (
            <div className="max-w-lg mx-auto text-center py-20">
                <p className="text-lg text-muted-foreground">{error || t('voting.caseNotFound')}</p>
            </div>
        )
    }

    const defendant = caseData.defendants as any
    const nominalDamages = caseData.nominal_damages_claimed || 0
    const maxPunitive = nominalDamages * 2

    const guiltLabel = guiltScore <= 2 ? t('voting.innocent') : guiltScore <= 4 ? t('voting.innocent') : guiltScore <= 6 ? t('voting.uncertain') : guiltScore <= 8 ? t('voting.guilty') : t('voting.guilty')
    const guiltColor = guiltScore <= 2 ? 'text-green-500' : guiltScore <= 4 ? 'text-emerald-500' : guiltScore <= 6 ? 'text-yellow-500' : guiltScore <= 8 ? 'text-orange-500' : 'text-red-500'

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <Badge variant="outline" className="mb-2">{t('voting.title')}</Badge>
                <h1 className="text-2xl font-bold">{t('voting.title')}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    {t('cases.caseNumber')} {caseData.case_number} {t('common.vs')} {defendant?.full_name || 'Unknown'}
                </p>
                {existingVote && (
                    <Badge className="bg-blue-500/10 text-blue-600 mt-2">{t('voting.updatingExisting')}</Badge>
                )}
            </div>

            {/* Guilt Score */}
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="text-lg">1. {t('voting.guiltAssessment')}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                        {t('voting.guiltDescription')}
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center">
                        <p className={`text-5xl font-extrabold ${guiltColor}`}>{guiltScore}</p>
                        <p className={`text-sm font-medium mt-1 ${guiltColor}`}>{guiltLabel}</p>
                    </div>
                    <Slider
                        value={[guiltScore]}
                        onValueChange={([v]) => setGuiltScore(v)}
                        min={1}
                        max={10}
                        step={1}
                        className="py-4"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>1 — {t('voting.innocent')}</span>
                        <span>5 — {t('voting.uncertain')}</span>
                        <span>10 — {t('voting.guilty')}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Nominal Damages */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">2. {t('voting.nominalDamages')}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                        {t('voting.nominalDescription')} <strong>${nominalDamages.toLocaleString()}</strong>
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-3">
                        <Button
                            variant={nominalApproved ? 'default' : 'outline'}
                            className={`flex-1 ${nominalApproved ? 'bg-green-600 hover:bg-green-700' : ''}`}
                            onClick={() => setNominalApproved(true)}
                        >
                            ✅ {t('voting.approve')}
                        </Button>
                        <Button
                            variant={!nominalApproved ? 'default' : 'outline'}
                            className={`flex-1 ${!nominalApproved ? 'bg-red-600 hover:bg-red-700' : ''}`}
                            onClick={() => setNominalApproved(false)}
                        >
                            ❌ {t('voting.deny')}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Punitive Damages */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">3. {t('voting.punitiveTitle')}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                        {t('voting.punitiveDescription')} (Max: ${maxPunitive.toLocaleString()})
                    </p>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <input
                            type="number"
                            value={punitiveAmount}
                            onChange={e => setPunitiveAmount(e.target.value)}
                            placeholder="0"
                            max={maxPunitive}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-8 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                    </div>
                    {punitiveAmount && parseFloat(punitiveAmount) > 0 && (
                        <div className="flex gap-2">
                            {[0.5, 1, 1.5, 2].map(mult => (
                                <Button
                                    key={mult}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() => setPunitiveAmount((nominalDamages * mult).toString())}
                                >
                                    {mult}×
                                </Button>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Justification */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">4. {t('voting.justification')}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                        {t('voting.justificationDescription')}
                    </p>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={justification}
                        onChange={e => setJustification(e.target.value)}
                        placeholder="I believe the evidence shows..."
                        rows={4}
                        maxLength={1000}
                    />
                    <p className="text-xs text-muted-foreground mt-1">{justification.length}/1000</p>
                </CardContent>
            </Card>

            {/* Summary */}
            <Card className="border-primary/30">
                <CardContent className="p-5">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <div>
                            <p className={`text-2xl font-bold ${guiltColor}`}>{guiltScore}/10</p>
                            <p className="text-xs text-muted-foreground">{t('voting.guilt')}</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{nominalApproved ? '✅' : '❌'}</p>
                            <p className="text-xs text-muted-foreground">{t('voting.nominal')}</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">${punitiveAmount ? parseFloat(punitiveAmount).toLocaleString() : '0'}</p>
                            <p className="text-xs text-muted-foreground">{t('voting.punitive')}</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">${(nominalApproved ? nominalDamages : 0) + (punitiveAmount ? parseFloat(punitiveAmount) : 0)}</p>
                            <p className="text-xs text-muted-foreground">{t('voting.total')}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3">
                    <p className="text-sm text-destructive">{error}</p>
                </div>
            )}

            <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => router.back()}>
                    {t('common.cancel')}
                </Button>
                <Button
                    className="flex-1"
                    onClick={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <span className="flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            {t('common.loading')}
                        </span>
                    ) : existingVote ? (
                        `⚖️ ${t('voting.updateVote')}`
                    ) : (
                        `⚖️ ${t('voting.submitVote')}`
                    )}
                </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
                {t('voting.resultSealed')}
            </p>
        </div>
    )
}
