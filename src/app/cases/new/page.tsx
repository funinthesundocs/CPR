'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from '@/i18n'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    UserIcon,
    LinkIcon,
    HandRaisedIcon,
    FaceFrownIcon,
    CalendarDaysIcon,
    BoltIcon,
    PaperClipIcon,
    EyeIcon,
    ScaleIcon,
    BookOpenIcon,
    ShieldCheckIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline'
import type { ComponentType } from 'react'

const CASE_TYPES = [
    'fraud', 'theft', 'scam', 'breach_of_contract', 'extortion',
    'identity_theft', 'harassment', 'assault', 'defamation',
    'embezzlement', 'domestic_violence', 'elder_abuse', 'other'
]

const STEP_ICONS: ComponentType<{ className?: string }>[] = [
    UserIcon, LinkIcon, HandRaisedIcon, FaceFrownIcon, CalendarDaysIcon, BoltIcon,
    PaperClipIcon, EyeIcon, ScaleIcon, BookOpenIcon, ShieldCheckIcon, CheckCircleIcon,
]

type FormData = {
    // Step 1: Defendant
    defendant_first_name: string
    defendant_last_name: string
    defendant_full_name: string
    defendant_aliases: string
    defendant_location: string
    defendant_photo_url: string
    defendant_business_names: string
    defendant_phone: string
    defendant_address: string
    defendant_dob: string
    // Step 2: Connection
    case_types: string[]
    relationship_type: string
    relationship_duration: string
    how_met: string
    // Step 3: Promise
    promise_what: string
    promise_when: string
    promise_evidence_of_promise: string
    // Step 4: Betrayal  
    betrayal_what_happened: string
    betrayal_when_discovered: string
    betrayal_how_discovered: string
    // Step 5: Timeline
    timeline_events: { date: string; event: string; location: string }[]
    // Step 6: Impact
    financial_amount: string
    financial_description: string
    emotional_impact: string
    physical_impact: string
    // Step 7: Evidence (file references)
    evidence_descriptions: { label: string; description: string; category: string }[]
    // Step 8: Witnesses
    witness_names: { name: string; relationship: string; contact: string }[]
    // Step 9: Legal
    police_report_filed: string
    lawyer_consulted: string
    court_case_filed: string
    legal_description: string
    // Step 10: Story
    story_title: string
    story_narrative: string
    // Step 11: Safety
    visibility: string
    consent_real_name: boolean
    consent_contact_sharing: boolean
    consent_terms: boolean
    // Step 12: Review
    nominal_damages: string
}

const DEFAULT_FORM: FormData = {
    defendant_first_name: '', defendant_last_name: '', defendant_full_name: '',
    defendant_aliases: '', defendant_location: '', defendant_photo_url: '',
    defendant_business_names: '', defendant_phone: '', defendant_address: '', defendant_dob: '',
    case_types: [], relationship_type: '', relationship_duration: '', how_met: '',
    promise_what: '', promise_when: '', promise_evidence_of_promise: '',
    betrayal_what_happened: '', betrayal_when_discovered: '', betrayal_how_discovered: '',
    timeline_events: [{ date: '', event: '', location: '' }],
    financial_amount: '', financial_description: '', emotional_impact: '', physical_impact: '',
    evidence_descriptions: [],
    witness_names: [],
    police_report_filed: 'no', lawyer_consulted: 'no', court_case_filed: 'no', legal_description: '',
    story_title: '', story_narrative: '',
    visibility: 'open', consent_real_name: false, consent_contact_sharing: false, consent_terms: false,
    nominal_damages: '',
}

const STORAGE_KEY = 'cpr_case_draft'

export default function NewCaseForm() {
    const router = useRouter()
    const { t } = useTranslation()
    const [step, setStep] = useState(1)
    const [form, setForm] = useState<FormData>(DEFAULT_FORM)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [savedAt, setSavedAt] = useState<string | null>(null)

    const STEPS = useMemo(() => [
        { id: 1, title: t('wizard.step1Title'), icon: STEP_ICONS[0], desc: t('wizard.step1Desc') },
        { id: 2, title: t('wizard.step2Title'), icon: STEP_ICONS[1], desc: t('wizard.step2Desc') },
        { id: 3, title: t('wizard.step3Title'), icon: STEP_ICONS[2], desc: t('wizard.step3Desc') },
        { id: 4, title: t('wizard.step4Title'), icon: STEP_ICONS[3], desc: t('wizard.step4Desc') },
        { id: 5, title: t('wizard.step5Title'), icon: STEP_ICONS[4], desc: t('wizard.step5Desc') },
        { id: 6, title: t('wizard.step6Title'), icon: STEP_ICONS[5], desc: t('wizard.step6Desc') },
        { id: 7, title: t('wizard.step7Title'), icon: STEP_ICONS[6], desc: t('wizard.step7Desc') },
        { id: 8, title: t('wizard.step8Title'), icon: STEP_ICONS[7], desc: t('wizard.step8Desc') },
        { id: 9, title: t('wizard.step9Title'), icon: STEP_ICONS[8], desc: t('wizard.step9Desc') },
        { id: 10, title: t('wizard.step10Title'), icon: STEP_ICONS[9], desc: t('wizard.step10Desc') },
        { id: 11, title: t('wizard.step11Title'), icon: STEP_ICONS[10], desc: t('wizard.step11Desc') },
        { id: 12, title: t('wizard.step12Title'), icon: STEP_ICONS[11], desc: t('wizard.step12Desc') },
    ], [t])

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                setForm({ ...DEFAULT_FORM, ...parsed.data })
                setStep(parsed.step || 1)
                setSavedAt(parsed.savedAt || null)
            } catch { /* ignore corrupt data */ }
        }
    }, [])

    // Auto-save on change (debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            const now = new Date().toLocaleTimeString()
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: form, step, savedAt: now }))
            setSavedAt(now)
        }, 1000)
        return () => clearTimeout(timer)
    }, [form, step])

    const updateForm = useCallback((updates: Partial<FormData>) => {
        setForm(prev => ({ ...prev, ...updates }))
    }, [])

    const progress = Math.round((step / STEPS.length) * 100)

    const handleSubmit = async () => {
        setSubmitting(true)
        setError('')

        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login?redirect=/cases/new')
                return
            }

            // 1. Create or find the defendant
            const slug = (form.defendant_full_name || 'unknown')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '')
                + '-' + Date.now().toString(36)

            const { data: defendant, error: defError } = await supabase
                .from('defendants')
                .insert({
                    first_name: form.defendant_first_name,
                    last_name: form.defendant_last_name,
                    full_name: form.defendant_full_name || `${form.defendant_first_name} ${form.defendant_last_name}`.trim(),
                    aliases: form.defendant_aliases ? form.defendant_aliases.split(',').map(a => a.trim()) : [],
                    location: form.defendant_location,
                    phone: form.defendant_phone,
                    address: form.defendant_address,
                    date_of_birth: form.defendant_dob,
                    business_names: form.defendant_business_names ? form.defendant_business_names.split(',').map(b => b.trim()) : [],
                    slug,
                })
                .select()
                .single()

            if (defError) throw new Error(`Failed to create defendant: ${defError.message}`)

            // 2. Create the case
            const { data: newCase, error: caseError } = await supabase
                .from('cases')
                .insert({
                    defendant_id: defendant.id,
                    plaintiff_id: user.id,
                    case_types: form.case_types,
                    status: 'draft',
                    current_step: 12,
                    relationship_narrative: {
                        type: form.relationship_type,
                        duration: form.relationship_duration,
                        how_met: form.how_met,
                    },
                    promise_narrative: {
                        what: form.promise_what,
                        when: form.promise_when,
                        evidence: form.promise_evidence_of_promise,
                    },
                    betrayal_narrative: {
                        what_happened: form.betrayal_what_happened,
                        when_discovered: form.betrayal_when_discovered,
                        how_discovered: form.betrayal_how_discovered,
                    },
                    personal_impact: {
                        financial_amount: form.financial_amount ? parseFloat(form.financial_amount) : 0,
                        financial_description: form.financial_description,
                        emotional: form.emotional_impact,
                        physical: form.physical_impact,
                    },
                    legal_actions: {
                        police_report: form.police_report_filed,
                        lawyer: form.lawyer_consulted,
                        court_case: form.court_case_filed,
                        description: form.legal_description,
                    },
                    story_narrative: {
                        title: form.story_title,
                        body: form.story_narrative,
                    },
                    visibility_settings: {
                        tier: form.visibility,
                    },
                    consent: {
                        real_name: form.consent_real_name,
                        contact_sharing: form.consent_contact_sharing,
                        terms: form.consent_terms,
                    },
                    nominal_damages_claimed: form.nominal_damages ? parseFloat(form.nominal_damages) : 0,
                })
                .select()
                .single()

            if (caseError) throw new Error(`Failed to create case: ${caseError.message}`)

            // 3. Create timeline events
            for (const event of form.timeline_events.filter(e => e.event)) {
                await supabase.from('timeline_events').insert({
                    case_id: newCase.id,
                    event_type: 'incident',
                    date_or_year: event.date,
                    description: event.event,
                    city: event.location,
                    submitted_by: user.id,
                })
            }

            // 4. Create witness records
            for (const witness of form.witness_names.filter(w => w.name)) {
                await supabase.from('witnesses').insert({
                    case_id: newCase.id,
                    name: witness.name,
                    relationship_to_case: witness.relationship,
                    contact_info: witness.contact,
                })
            }

            // 5. Create financial impact
            if (form.financial_amount) {
                await supabase.from('financial_impacts').insert({
                    case_id: newCase.id,
                    category: 'direct_loss',
                    amount: parseFloat(form.financial_amount),
                    currency: 'USD',
                    description: form.financial_description,
                })
            }

            // Clear draft
            localStorage.removeItem(STORAGE_KEY)

            // Redirect to case page
            router.push(`/cases/${newCase.case_number}`)
        } catch (err: any) {
            setError(err.message || t('common.error'))
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Progress Header */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{t('wizard.title')}</h1>
                        <p className="text-sm text-muted-foreground">
                            {t('onboarding.step')} {step} {t('onboarding.of')} {STEPS.length}: {STEPS[step - 1].title}
                        </p>
                    </div>
                    <div className="text-right">
                        {savedAt && (
                            <p className="text-xs text-muted-foreground">{t('wizard.autoSaved').replace('{time}', savedAt || '')}</p>
                        )}
                    </div>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            {/* Step Navigation */}
            <div className="flex gap-1 overflow-x-auto pb-2">
                {STEPS.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => setStep(s.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-all
              ${step === s.id
                                ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                            }`}
                    >
                        <s.icon className="h-4 w-4 shrink-0" />
                        <span className="hidden sm:inline">{s.title}</span>
                    </button>
                ))}
            </div>

            {/* Form Content */}
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        {(() => { const StepIcon = STEPS[step - 1].icon; return <StepIcon className="h-6 w-6 text-primary" />; })()}
                        {STEPS[step - 1].title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{STEPS[step - 1].desc}</p>
                </CardHeader>
                <CardContent className="space-y-6">

                    {/* STEP 1: Defendant Info */}
                    {step === 1 && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FieldGroup label={`${t('wizard.firstName')} *`}>
                                    <Input value={form.defendant_first_name} onChange={e => updateForm({ defendant_first_name: e.target.value })} placeholder="John" />
                                </FieldGroup>
                                <FieldGroup label={`${t('wizard.lastName')} *`}>
                                    <Input value={form.defendant_last_name} onChange={e => updateForm({ defendant_last_name: e.target.value })} placeholder="Doe" />
                                </FieldGroup>
                            </div>
                            <FieldGroup label={t('wizard.fullName')}>
                                <Input value={form.defendant_full_name} onChange={e => updateForm({ defendant_full_name: e.target.value })} placeholder={t('wizard.fullNamePlaceholder')} />
                            </FieldGroup>
                            <FieldGroup label={t('wizard.aliases')}>
                                <Input value={form.defendant_aliases} onChange={e => updateForm({ defendant_aliases: e.target.value })} placeholder={t('wizard.aliasesPlaceholder')} />
                            </FieldGroup>
                            <FieldGroup label={t('wizard.knownLocation')}>
                                <Input value={form.defendant_location} onChange={e => updateForm({ defendant_location: e.target.value })} placeholder={t('wizard.locationPlaceholder')} />
                            </FieldGroup>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FieldGroup label={t('wizard.phone')}>
                                    <Input value={form.defendant_phone} onChange={e => updateForm({ defendant_phone: e.target.value })} placeholder="+1..." />
                                </FieldGroup>
                                <FieldGroup label={t('wizard.dateOfBirth')}>
                                    <Input type="date" value={form.defendant_dob} onChange={e => updateForm({ defendant_dob: e.target.value })} />
                                </FieldGroup>
                            </div>
                            <FieldGroup label={t('wizard.address')}>
                                <Textarea value={form.defendant_address} onChange={e => updateForm({ defendant_address: e.target.value })} placeholder={t('wizard.addressPlaceholder')} rows={2} />
                            </FieldGroup>
                            <FieldGroup label={t('wizard.businessNames')}>
                                <Input value={form.defendant_business_names} onChange={e => updateForm({ defendant_business_names: e.target.value })} placeholder={t('wizard.businessPlaceholder')} />
                            </FieldGroup>
                        </>
                    )}

                    {/* STEP 2: Connection */}
                    {step === 2 && (
                        <>
                            <FieldGroup label={`${t('wizard.caseTypes')} *`}>
                                <div className="flex flex-wrap gap-2">
                                    {CASE_TYPES.map(type => (
                                        <button
                                            key={type}
                                            onClick={() => {
                                                const types = form.case_types.includes(type)
                                                    ? form.case_types.filter(ct => ct !== type)
                                                    : [...form.case_types, type]
                                                updateForm({ case_types: types })
                                            }}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all capitalize
                        ${form.case_types.includes(type)
                                                    ? 'bg-primary text-primary-foreground border-primary'
                                                    : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/50'
                                                }`}
                                        >
                                            {t('wizard.caseType_' + type)}
                                        </button>
                                    ))}
                                </div>
                            </FieldGroup>
                            <FieldGroup label={`${t('wizard.relationshipType')} *`}>
                                <Select value={form.relationship_type} onValueChange={v => updateForm({ relationship_type: v })}>
                                    <SelectTrigger><SelectValue placeholder={t('wizard.relationshipPlaceholder')} /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="romantic_partner">{t('wizard.relRomantic')}</SelectItem>
                                        <SelectItem value="family_member">{t('wizard.relFamily')}</SelectItem>
                                        <SelectItem value="friend">{t('wizard.relFriend')}</SelectItem>
                                        <SelectItem value="business_partner">{t('wizard.relBusiness')}</SelectItem>
                                        <SelectItem value="employer_employee">{t('wizard.relEmployer')}</SelectItem>
                                        <SelectItem value="client_service_provider">{t('wizard.relClient')}</SelectItem>
                                        <SelectItem value="stranger">{t('wizard.relStranger')}</SelectItem>
                                        <SelectItem value="online_contact">{t('wizard.relOnline')}</SelectItem>
                                        <SelectItem value="other">{t('wizard.relOther')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FieldGroup>
                            <FieldGroup label={t('wizard.relationshipDuration')}>
                                <Input value={form.relationship_duration} onChange={e => updateForm({ relationship_duration: e.target.value })} placeholder={t('wizard.durationPlaceholder')} />
                            </FieldGroup>
                            <FieldGroup label={t('wizard.howMet')}>
                                <Textarea value={form.how_met} onChange={e => updateForm({ how_met: e.target.value })} placeholder={t('wizard.howMetPlaceholder')} rows={3} />
                            </FieldGroup>
                        </>
                    )}

                    {/* STEP 3: Promise */}
                    {step === 3 && (
                        <>
                            <FieldGroup label={`${t('wizard.whatPromised')} *`}>
                                <Textarea value={form.promise_what} onChange={e => updateForm({ promise_what: e.target.value })} placeholder={t('wizard.promisePlaceholder')} rows={4} />
                            </FieldGroup>
                            <FieldGroup label={t('wizard.whenPromised')}>
                                <Input value={form.promise_when} onChange={e => updateForm({ promise_when: e.target.value })} placeholder={t('wizard.whenPlaceholder')} />
                            </FieldGroup>
                            <FieldGroup label={t('wizard.promiseEvidence')}>
                                <Textarea value={form.promise_evidence_of_promise} onChange={e => updateForm({ promise_evidence_of_promise: e.target.value })} placeholder={t('wizard.promiseEvidencePlaceholder')} rows={3} />
                            </FieldGroup>
                        </>
                    )}

                    {/* STEP 4: Betrayal */}
                    {step === 4 && (
                        <>
                            <FieldGroup label={`${t('wizard.whatHappened')} *`}>
                                <Textarea value={form.betrayal_what_happened} onChange={e => updateForm({ betrayal_what_happened: e.target.value })} placeholder={t('wizard.whatHappenedPlaceholder')} rows={5} />
                            </FieldGroup>
                            <FieldGroup label={t('wizard.whenDiscovered')}>
                                <Input value={form.betrayal_when_discovered} onChange={e => updateForm({ betrayal_when_discovered: e.target.value })} placeholder={t('wizard.whenPlaceholder')} />
                            </FieldGroup>
                            <FieldGroup label={t('wizard.howDiscovered')}>
                                <Textarea value={form.betrayal_how_discovered} onChange={e => updateForm({ betrayal_how_discovered: e.target.value })} placeholder={t('wizard.howDiscoveredPlaceholder')} rows={3} />
                            </FieldGroup>
                        </>
                    )}

                    {/* STEP 5: Timeline */}
                    {step === 5 && (
                        <>
                            <p className="text-sm text-muted-foreground">{t('wizard.timelineInstructions')}</p>
                            {form.timeline_events.map((event, idx) => (
                                <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-lg border bg-muted/20">
                                    <Input
                                        placeholder={t('wizard.dateOrYear')}
                                        value={event.date}
                                        onChange={e => {
                                            const events = [...form.timeline_events]
                                            events[idx] = { ...events[idx], date: e.target.value }
                                            updateForm({ timeline_events: events })
                                        }}
                                    />
                                    <Input
                                        placeholder={t('wizard.whatHappenedShort')}
                                        value={event.event}
                                        onChange={e => {
                                            const events = [...form.timeline_events]
                                            events[idx] = { ...events[idx], event: e.target.value }
                                            updateForm({ timeline_events: events })
                                        }}
                                    />
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder={t('wizard.location')}
                                            value={event.location}
                                            onChange={e => {
                                                const events = [...form.timeline_events]
                                                events[idx] = { ...events[idx], location: e.target.value }
                                                updateForm({ timeline_events: events })
                                            }}
                                        />
                                        {form.timeline_events.length > 1 && (
                                            <Button variant="ghost" size="sm" className="text-destructive shrink-0" onClick={() => {
                                                updateForm({ timeline_events: form.timeline_events.filter((_, i) => i !== idx) })
                                            }}>✕</Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={() => {
                                updateForm({ timeline_events: [...form.timeline_events, { date: '', event: '', location: '' }] })
                            }}>
                                {t('wizard.addEvent')}
                            </Button>
                        </>
                    )}

                    {/* STEP 6: Impact */}
                    {step === 6 && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FieldGroup label={t('wizard.financialLoss')}>
                                    <Input type="number" value={form.financial_amount} onChange={e => updateForm({ financial_amount: e.target.value })} placeholder="0.00" />
                                </FieldGroup>
                                <FieldGroup label={t('wizard.currency')}>
                                    <Input value="USD" disabled />
                                </FieldGroup>
                            </div>
                            <FieldGroup label={t('wizard.describeFinancial')}>
                                <Textarea value={form.financial_description} onChange={e => updateForm({ financial_description: e.target.value })} placeholder={t('wizard.financialPlaceholder')} rows={3} />
                            </FieldGroup>
                            <FieldGroup label={t('wizard.emotionalImpact')}>
                                <Textarea value={form.emotional_impact} onChange={e => updateForm({ emotional_impact: e.target.value })} placeholder={t('wizard.emotionalPlaceholder')} rows={3} />
                            </FieldGroup>
                            <FieldGroup label={t('wizard.physicalImpact')}>
                                <Textarea value={form.physical_impact} onChange={e => updateForm({ physical_impact: e.target.value })} placeholder={t('wizard.physicalPlaceholder')} rows={2} />
                            </FieldGroup>
                        </>
                    )}

                    {/* STEP 7: Evidence */}
                    {step === 7 && (
                        <>
                            <div className="rounded-lg border border-dashed p-6 text-center space-y-3 bg-muted/20">
                                <PaperClipIcon className="h-10 w-10 mx-auto" style={{ color: 'hsl(var(--primary))' }} />
                                <p className="text-sm text-muted-foreground">
                                    {t('wizard.evidenceUploadNote')}<br />
                                    {t('wizard.evidenceDescribeNote')}
                                </p>
                            </div>
                            {form.evidence_descriptions.map((ev, idx) => (
                                <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-lg border bg-muted/20">
                                    <Input
                                        placeholder={t('wizard.evidenceLabel')}
                                        value={ev.label}
                                        onChange={e => {
                                            const descs = [...form.evidence_descriptions]
                                            descs[idx] = { ...descs[idx], label: e.target.value }
                                            updateForm({ evidence_descriptions: descs })
                                        }}
                                    />
                                    <Select value={ev.category} onValueChange={v => {
                                        const descs = [...form.evidence_descriptions]
                                        descs[idx] = { ...descs[idx], category: v }
                                        updateForm({ evidence_descriptions: descs })
                                    }}>
                                        <SelectTrigger><SelectValue placeholder={t('wizard.evidenceCategory')} /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="document">{t('wizard.catDocument')}</SelectItem>
                                            <SelectItem value="photo">{t('wizard.catPhoto')}</SelectItem>
                                            <SelectItem value="video">{t('wizard.catVideo')}</SelectItem>
                                            <SelectItem value="audio">{t('wizard.catAudio')}</SelectItem>
                                            <SelectItem value="communication">{t('wizard.catCommunication')}</SelectItem>
                                            <SelectItem value="financial">{t('wizard.catFinancial')}</SelectItem>
                                            <SelectItem value="other">{t('wizard.catOther')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder={t('wizard.evidenceDescription')}
                                            value={ev.description}
                                            onChange={e => {
                                                const descs = [...form.evidence_descriptions]
                                                descs[idx] = { ...descs[idx], description: e.target.value }
                                                updateForm({ evidence_descriptions: descs })
                                            }}
                                        />
                                        <Button variant="ghost" size="sm" className="text-destructive shrink-0" onClick={() => {
                                            updateForm({ evidence_descriptions: form.evidence_descriptions.filter((_, i) => i !== idx) })
                                        }}>✕</Button>
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={() => {
                                updateForm({ evidence_descriptions: [...form.evidence_descriptions, { label: '', description: '', category: '' }] })
                            }}>
                                {t('wizard.addEvidence')}
                            </Button>
                        </>
                    )}

                    {/* STEP 8: Witnesses */}
                    {step === 8 && (
                        <>
                            <p className="text-sm text-muted-foreground">{t('wizard.witnessInstructions')}</p>
                            {form.witness_names.map((w, idx) => (
                                <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-lg border bg-muted/20">
                                    <Input placeholder={t('wizard.witnessName')} value={w.name} onChange={e => {
                                        const ws = [...form.witness_names]
                                        ws[idx] = { ...ws[idx], name: e.target.value }
                                        updateForm({ witness_names: ws })
                                    }} />
                                    <Input placeholder={t('wizard.witnessRelationship')} value={w.relationship} onChange={e => {
                                        const ws = [...form.witness_names]
                                        ws[idx] = { ...ws[idx], relationship: e.target.value }
                                        updateForm({ witness_names: ws })
                                    }} />
                                    <div className="flex gap-2">
                                        <Input placeholder={t('wizard.witnessContact')} value={w.contact} onChange={e => {
                                            const ws = [...form.witness_names]
                                            ws[idx] = { ...ws[idx], contact: e.target.value }
                                            updateForm({ witness_names: ws })
                                        }} />
                                        <Button variant="ghost" size="sm" className="text-destructive shrink-0" onClick={() => {
                                            updateForm({ witness_names: form.witness_names.filter((_, i) => i !== idx) })
                                        }}>✕</Button>
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={() => {
                                updateForm({ witness_names: [...form.witness_names, { name: '', relationship: '', contact: '' }] })
                            }}>
                                {t('wizard.addWitness')}
                            </Button>
                        </>
                    )}

                    {/* STEP 9: Legal Actions */}
                    {step === 9 && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <FieldGroup label={t('wizard.policeReport')}>
                                    <Select value={form.police_report_filed} onValueChange={v => updateForm({ police_report_filed: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="no">{t('wizard.no')}</SelectItem>
                                            <SelectItem value="yes">{t('wizard.yes')}</SelectItem>
                                            <SelectItem value="pending">{t('wizard.pending')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FieldGroup>
                                <FieldGroup label={t('wizard.lawyerConsulted')}>
                                    <Select value={form.lawyer_consulted} onValueChange={v => updateForm({ lawyer_consulted: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="no">{t('wizard.no')}</SelectItem>
                                            <SelectItem value="yes">{t('wizard.yes')}</SelectItem>
                                            <SelectItem value="in_progress">{t('wizard.inProgress')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FieldGroup>
                                <FieldGroup label={t('wizard.courtCaseFiled')}>
                                    <Select value={form.court_case_filed} onValueChange={v => updateForm({ court_case_filed: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="no">{t('wizard.no')}</SelectItem>
                                            <SelectItem value="yes">{t('wizard.yes')}</SelectItem>
                                            <SelectItem value="dismissed">{t('wizard.dismissed')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FieldGroup>
                            </div>
                            <FieldGroup label={t('wizard.legalDetails')}>
                                <Textarea value={form.legal_description} onChange={e => updateForm({ legal_description: e.target.value })} placeholder={t('wizard.legalPlaceholder')} rows={4} />
                            </FieldGroup>
                        </>
                    )}

                    {/* STEP 10: Your Story */}
                    {step === 10 && (
                        <>
                            <FieldGroup label={`${t('wizard.storyTitle')} *`}>
                                <Input value={form.story_title} onChange={e => updateForm({ story_title: e.target.value })} placeholder={t('wizard.storyTitlePlaceholder')} />
                            </FieldGroup>
                            <FieldGroup label={`${t('wizard.yourNarrative')} *`}>
                                <Textarea
                                    value={form.story_narrative}
                                    onChange={e => updateForm({ story_narrative: e.target.value })}
                                    placeholder={t('wizard.narrativePlaceholder')}
                                    rows={12}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    {form.story_narrative.length} {t('wizard.characters')} · {form.story_narrative.split(/\s+/).filter(Boolean).length} {t('wizard.words')}
                                </p>
                            </FieldGroup>
                        </>
                    )}

                    {/* STEP 11: Safety */}
                    {step === 11 && (
                        <>
                            <FieldGroup label={t('wizard.visibilityTier')}>
                                <Select value={form.visibility} onValueChange={v => updateForm({ visibility: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="open">{t('wizard.visOpen')}</SelectItem>
                                        <SelectItem value="shielded">{t('wizard.visShielded')}</SelectItem>
                                        <SelectItem value="protected">{t('wizard.visProtected')}</SelectItem>
                                        <SelectItem value="proxy">{t('wizard.visProxy')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FieldGroup>
                            <div className="space-y-3 pt-2">
                                <ConsentCheckbox
                                    label={t('wizard.consentRealName')}
                                    checked={form.consent_real_name}
                                    onChange={v => updateForm({ consent_real_name: v })}
                                />
                                <ConsentCheckbox
                                    label={t('wizard.consentContact')}
                                    checked={form.consent_contact_sharing}
                                    onChange={v => updateForm({ consent_contact_sharing: v })}
                                />
                                <ConsentCheckbox
                                    label={`${t('wizard.consentTerms')} *`}
                                    checked={form.consent_terms}
                                    onChange={v => updateForm({ consent_terms: v })}
                                />
                            </div>
                            <div className="rounded-lg border p-4 bg-amber-500/5 border-amber-500/20">
                                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">{t('wizard.deadManNote')}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {t('wizard.deadManDesc')}
                                </p>
                            </div>
                        </>
                    )}

                    {/* STEP 12: Review */}
                    {step === 12 && (
                        <>
                            <div className="space-y-4">
                                <ReviewBlock title={t('wizard.reviewDefendant')} items={[
                                    form.defendant_full_name || `${form.defendant_first_name} ${form.defendant_last_name}`.trim(),
                                    form.defendant_location && `📍 ${form.defendant_location}`,
                                    form.defendant_aliases && `AKA: ${form.defendant_aliases}`,
                                ]} />
                                <ReviewBlock title={t('wizard.reviewCaseTypes')} items={form.case_types.map(ct => ct.replace(/_/g, ' '))} />
                                <ReviewBlock title={t('wizard.reviewRelationship')} items={[
                                    form.relationship_type && `${t('wizard.reviewType')}: ${form.relationship_type.replace(/_/g, ' ')}`,
                                    form.relationship_duration && `${t('wizard.reviewDuration')}: ${form.relationship_duration}`,
                                ]} />
                                <ReviewBlock title={t('wizard.reviewFinancial')} items={[
                                    form.financial_amount && `$${parseFloat(form.financial_amount).toLocaleString()}`,
                                    form.financial_description,
                                ]} />
                                <ReviewBlock title={t('wizard.reviewTimeline')} items={
                                    form.timeline_events.filter(e => e.event).map(e => `${e.date}: ${e.event}`)
                                } />
                                <ReviewBlock title={t('wizard.reviewLegal')} items={[
                                    `${t('wizard.reviewPolice')}: ${form.police_report_filed}`,
                                    `${t('wizard.reviewLawyer')}: ${form.lawyer_consulted}`,
                                    `${t('wizard.reviewCourt')}: ${form.court_case_filed}`,
                                ]} />
                                <ReviewBlock title={t('wizard.reviewStory')} items={[
                                    form.story_title && `"${form.story_title}"`,
                                    form.story_narrative && `${form.story_narrative.split(/\s+/).filter(Boolean).length} ${t('wizard.words')}`,
                                ]} />
                                <ReviewBlock title={t('wizard.reviewSafety')} items={[
                                    `${t('wizard.reviewVisibility')}: ${form.visibility}`,
                                    `${t('wizard.reviewTerms')}: ${form.consent_terms ? '✅' : '❌'}`,
                                ]} />
                            </div>

                            <FieldGroup label={t('wizard.nominalDamages')}>
                                <Input type="number" value={form.nominal_damages} onChange={e => updateForm({ nominal_damages: e.target.value })} placeholder={t('wizard.nominalDamagesPlaceholder')} />
                                <p className="text-xs text-muted-foreground mt-1">
                                    {t('wizard.nominalDamagesNote')}
                                </p>
                            </FieldGroup>

                            {!form.consent_terms && (
                                <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3">
                                    <p className="text-sm text-destructive">{t('wizard.mustAcceptTerms')}</p>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={() => setStep(Math.max(1, step - 1))}
                    disabled={step === 1}
                >
                    {t('wizard.previous')}
                </Button>

                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            localStorage.removeItem(STORAGE_KEY)
                            setForm(DEFAULT_FORM)
                            setStep(1)
                            setSavedAt(null)
                        }}
                    >
                        {t('wizard.clearDraft')}
                    </Button>

                    {step < 12 ? (
                        <Button onClick={() => setStep(Math.min(STEPS.length, step + 1))}>
                            {t('wizard.nextStep')}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting || !form.consent_terms}
                            className="min-w-[120px]"
                        >
                            {submitting ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    {t('wizard.submitting')}
                                </span>
                            ) : (
                                t('wizard.submitCase')
                            )}
                        </Button>
                    )}
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
                    <p className="text-sm text-destructive">{error}</p>
                </div>
            )}
        </div>
    )
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <Label className="text-sm font-medium">{label}</Label>
            {children}
        </div>
    )
}

function ConsentCheckbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <label className="flex items-start gap-3 cursor-pointer group">
            <input
                type="checkbox"
                checked={checked}
                onChange={e => onChange(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-border"
            />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
        </label>
    )
}

function ReviewBlock({ title, items }: { title: string; items: (string | false | undefined | null)[] }) {
    const validItems = items.filter(Boolean) as string[]
    if (validItems.length === 0) return null
    return (
        <div className="rounded-lg border p-4 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
            {validItems.map((item, i) => (
                <p key={i} className="text-sm capitalize">{item}</p>
            ))}
        </div>
    )
}
