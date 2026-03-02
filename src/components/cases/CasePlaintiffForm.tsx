'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from '@/i18n'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { VoiceTextInput } from '@/components/voice/VoiceTextInput'
import { DefendantSearchCombobox } from '@/components/defendant/DefendantSearchCombobox'
import type { DefendantResult } from '@/components/defendant/DefendantSearchCombobox'
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

// ── Constants ──────────────────────────────────────────────────────────────────

const CASE_TYPE_GROUPS = {
    personal: ['assault', 'sexual_assault', 'domestic_violence', 'stalking', 'harassment', 'child_abuse', 'elder_abuse', 'defamation'],
    financial: ['fraud', 'scam', 'theft', 'embezzlement', 'extortion', 'identity_theft', 'wage_theft', 'consumer_fraud'],
    professional: ['breach_of_contract', 'medical_malpractice', 'landlord_violation', 'discrimination'],
    digital: ['cybercrime', 'online_harassment', 'revenge_porn'],
    other: ['other'],
}

const EVIDENCE_CHECKLIST_KEYS = [
    'evidTexts', 'evidEmails', 'evidFinancial', 'evidContracts', 'evidPhotos',
    'evidVideo', 'evidAudio', 'evidSocial', 'evidPolice', 'evidMedical', 'evidWitness', 'evidOther',
] as const

const EVENT_TYPES = [
    { value: 'first_contact', key: 'eventFirstContact' },
    { value: 'trust_built', key: 'eventTrustBuilt' },
    { value: 'red_flag', key: 'eventRedFlag' },
    { value: 'escalation', key: 'eventEscalation' },
    { value: 'the_act', key: 'eventTheAct' },
    { value: 'discovery', key: 'eventDiscovery' },
    { value: 'aftermath', key: 'eventAftermath' },
]

const STEP_ICONS: ComponentType<{ className?: string }>[] = [
    UserIcon, LinkIcon, HandRaisedIcon, FaceFrownIcon, CalendarDaysIcon, BookOpenIcon,
    BoltIcon, PaperClipIcon, EyeIcon, ScaleIcon, ShieldCheckIcon, CheckCircleIcon,
]

const STORAGE_KEY = 'cpr_case_draft'

// ── Types ──────────────────────────────────────────────────────────────────────

type FormData = {
    entity_type: string
    defendant_first_name: string
    defendant_middle_name: string
    defendant_last_name: string
    defendant_full_name: string
    defendant_aliases: string
    defendant_location: string
    defendant_photo_url: string
    defendant_business_names: string
    defendant_phone: string
    defendant_address: string
    defendant_dob: string
    defendant_description: string
    defendant_physical_desc: string
    social_instagram: string
    social_facebook: string
    social_linkedin: string
    social_twitter: string
    social_tiktok: string
    social_website: string
    social_other: string
    case_types: string[]
    case_type_other_text: string
    relationship_type: string
    relationship_duration: string
    first_interaction: string
    early_warnings: string
    explicit_agreement: string
    agreement_terms: string
    reasonable_expectation: string
    evidence_of_trust: string
    others_vouch: string
    what_happened: string
    primary_incident: string
    when_realized: string
    how_confirmed: string
    is_ongoing: string
    timeline_events: { date: string; event: string; location: string; event_type: string }[]
    one_line_summary: string
    case_summary: string
    fin_direct_payments: string
    fin_lost_wages: string
    fin_property_loss: string
    fin_legal_fees: string
    fin_medical_costs: string
    fin_credit_damage: string
    fin_other_amount: string
    fin_other_description: string
    emotional_impact: string
    physical_impact: string
    wish_understood: string
    evidence_checklist: string[]
    evidence_descriptions: { label: string; description: string; category: string }[]
    witnesses: { fullName: string; type: string; contact: string; canVerify: string }[]
    police_report_filed: string
    lawyer_consulted: string
    court_case_filed: string
    legal_description: string
    why_filing: string
    other_victims: string
    other_victims_count: string
    visibility: string
    accused_aware: string
    current_contact: string
    consent_real_name: boolean
    consent_contact_sharing: boolean
    consent_terms: boolean
    nominal_damages: string
}

const DEFAULT_FORM: FormData = {
    entity_type: 'person',
    defendant_first_name: '', defendant_middle_name: '', defendant_last_name: '', defendant_full_name: '',
    defendant_aliases: '', defendant_location: '', defendant_photo_url: '',
    defendant_business_names: '', defendant_phone: '', defendant_address: '', defendant_dob: '',
    defendant_description: '', defendant_physical_desc: '',
    social_instagram: '', social_facebook: '', social_linkedin: '', social_twitter: '',
    social_tiktok: '', social_website: '', social_other: '',
    case_types: [], case_type_other_text: '', relationship_type: '', relationship_duration: '',
    first_interaction: '', early_warnings: '',
    explicit_agreement: '', agreement_terms: '', reasonable_expectation: '',
    evidence_of_trust: '', others_vouch: '',
    what_happened: '', primary_incident: '', when_realized: '', how_confirmed: '', is_ongoing: '',
    timeline_events: [{ date: '', event: '', location: '', event_type: 'incident' }],
    one_line_summary: '', case_summary: '',
    fin_direct_payments: '', fin_lost_wages: '', fin_property_loss: '',
    fin_legal_fees: '', fin_medical_costs: '', fin_credit_damage: '',
    fin_other_amount: '', fin_other_description: '',
    emotional_impact: '', physical_impact: '', wish_understood: '',
    evidence_checklist: [], evidence_descriptions: [],
    witnesses: [],
    police_report_filed: 'no', lawyer_consulted: 'no', court_case_filed: 'no',
    legal_description: '', why_filing: '', other_victims: '', other_victims_count: '',
    visibility: 'open', accused_aware: '', current_contact: '',
    consent_real_name: false, consent_contact_sharing: false, consent_terms: false,
    nominal_damages: '',
}

type ExistingCaseData = {
    caseData: any
    financialImpacts: any | null
    timelineEvents: any[]
    witnesses: any[]
}

type EditMode = {
    caseId: string
    caseNumber: string
    existingData: ExistingCaseData
}

type Props = {
    editMode?: EditMode
}

// ── DB → FormData mapping ──────────────────────────────────────────────────────

function dbToFormData(existing: ExistingCaseData): FormData {
    const { caseData, financialImpacts: fi, timelineEvents: tl, witnesses: ws } = existing
    const defendant = caseData.defendants || {}
    const relationship = caseData.relationship_narrative || {}
    const promise = caseData.promise_narrative || {}
    const betrayal = caseData.betrayal_narrative || {}
    const impact = caseData.personal_impact || {}
    const legal = caseData.legal_actions || {}
    const story = caseData.story_narrative || {}
    const vis = caseData.visibility_settings || {}
    const sp = defendant.social_profiles || {}

    return {
        ...DEFAULT_FORM,
        // Defendant identity (read-only in edit mode)
        entity_type: relationship.entity_type || 'person',
        defendant_first_name: defendant.first_name || '',
        defendant_middle_name: defendant.middle_name || '',
        defendant_last_name: defendant.last_name || '',
        defendant_full_name: defendant.full_name || '',
        defendant_aliases: Array.isArray(defendant.aliases) ? defendant.aliases.join(', ') : (defendant.aliases || ''),
        defendant_location: defendant.location || '',
        defendant_business_names: Array.isArray(defendant.business_names) ? defendant.business_names.join(', ') : (defendant.business_names || ''),
        defendant_phone: defendant.phone || '',
        defendant_address: defendant.address || '',
        defendant_dob: defendant.date_of_birth || '',
        defendant_description: sp.description || '',
        social_instagram: sp.instagram || '',
        social_facebook: sp.facebook || '',
        social_linkedin: sp.linkedin || '',
        social_twitter: sp.twitter || '',
        social_tiktok: sp.tiktok || '',
        social_website: sp.website || '',
        social_other: sp.other || '',
        // Case types
        case_types: Array.isArray(caseData.case_types) ? caseData.case_types : [],
        // Step 2: Relationship
        relationship_type: relationship.type || '',
        relationship_duration: relationship.duration || '',
        first_interaction: relationship.first_interaction || '',
        early_warnings: relationship.early_warnings || '',
        // Step 3: Promise / Basis of Trust
        explicit_agreement: promise.explicit_agreement || '',
        agreement_terms: promise.agreement_terms || '',
        reasonable_expectation: promise.reasonable_expectation || '',
        evidence_of_trust: promise.evidence_of_trust || '',
        others_vouch: promise.others_vouch || '',
        // Step 4: Betrayal / Incident
        what_happened: betrayal.what_happened || '',
        primary_incident: betrayal.primary_incident || '',
        when_realized: betrayal.when_realized || '',
        how_confirmed: betrayal.how_confirmed || '',
        is_ongoing: betrayal.is_ongoing || '',
        // Step 5: Timeline
        timeline_events: tl && tl.length > 0
            ? tl.map(t => ({
                date: t.date_or_year || '',
                event: t.description || '',
                location: t.city || '',
                event_type: t.event_type || 'incident',
            }))
            : [{ date: '', event: '', location: '', event_type: 'incident' }],
        // Step 6: Summary
        one_line_summary: story.one_line_summary || '',
        case_summary: story.body || '',
        // Step 7: Financial + Personal Impact
        fin_direct_payments: fi?.direct_payments != null ? String(fi.direct_payments) : '',
        fin_lost_wages: fi?.lost_wages != null ? String(fi.lost_wages) : '',
        fin_property_loss: fi?.property_loss != null ? String(fi.property_loss) : '',
        fin_legal_fees: fi?.legal_fees != null ? String(fi.legal_fees) : '',
        fin_medical_costs: fi?.medical_costs != null ? String(fi.medical_costs) : '',
        fin_credit_damage: fi?.credit_damage != null ? String(fi.credit_damage) : '',
        fin_other_amount: fi?.other_amount != null ? String(fi.other_amount) : '',
        fin_other_description: fi?.other_description || '',
        emotional_impact: impact.emotional || '',
        physical_impact: impact.physical || '',
        wish_understood: impact.wish_understood || '',
        // Step 8: Evidence
        evidence_checklist: Array.isArray(story.evidence_checklist) ? story.evidence_checklist : [],
        evidence_descriptions: Array.isArray(story.evidence_inventory) ? story.evidence_inventory : [],
        // Step 9: Witnesses
        witnesses: ws && ws.length > 0
            ? ws.map(w => ({
                fullName: w.full_name || '',
                type: w.witness_type || '',
                contact: w.contact_info || '',
                canVerify: w.details?.can_verify || '',
            }))
            : [],
        // Step 10: Legal Actions
        police_report_filed: legal.police_report || 'no',
        lawyer_consulted: legal.lawyer || 'no',
        court_case_filed: legal.court_case || 'no',
        legal_description: legal.description || '',
        why_filing: legal.why_filing || '',
        other_victims: legal.other_victims || '',
        other_victims_count: legal.other_victims_count != null ? String(legal.other_victims_count) : '',
        // Step 11: Safety
        visibility: vis.tier || 'open',
        accused_aware: vis.accused_aware || '',
        current_contact: vis.current_contact || '',
        consent_real_name: true,
        consent_contact_sharing: true,
        consent_terms: true,
        // Step 12: Nominal damages
        nominal_damages: caseData.nominal_damages_claimed != null ? String(caseData.nominal_damages_claimed) : '',
    }
}

// ── Component ──────────────────────────────────────────────────────────────────

export function CasePlaintiffForm({ editMode }: Props) {
    const router = useRouter()
    const { t } = useTranslation()
    const isEditMode = !!editMode

    const [step, setStep] = useState(1)
    const [form, setForm] = useState<FormData>(DEFAULT_FORM)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [savedAt, setSavedAt] = useState<string | null>(null)
    const [defendantMode, setDefendantMode] = useState<'search' | 'existing' | 'new'>('search')
    const [selectedDefendant, setSelectedDefendant] = useState<DefendantResult | null>(null)

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

    // ── Load data on mount ───────────────────────────────────────────────────────
    useEffect(() => {
        if (isEditMode && editMode) {
            // Edit mode: populate from DB data
            setForm(dbToFormData(editMode.existingData))
            setDefendantMode('existing')
        } else {
            // Create mode: load from localStorage
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
                try {
                    const parsed = JSON.parse(saved)
                    setForm({ ...DEFAULT_FORM, ...parsed.data })
                    setStep(parsed.step || 1)
                    setSavedAt(parsed.savedAt || null)
                } catch { /* ignore corrupt data */ }
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // ── Auto-save (create mode only) ─────────────────────────────────────────────
    useEffect(() => {
        if (isEditMode) return
        const timer = setTimeout(() => {
            const now = new Date().toLocaleTimeString()
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: form, step, savedAt: now }))
            setSavedAt(now)
        }, 1000)
        return () => clearTimeout(timer)
    }, [form, step, isEditMode])

    const updateForm = useCallback((updates: Partial<FormData>) => {
        setForm(prev => ({ ...prev, ...updates }))
    }, [])

    const progress = Math.round((step / STEPS.length) * 100)

    // ── Create submit handler ─────────────────────────────────────────────────────
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

            const socialProfiles: Record<string, string> = {}
            if (form.social_instagram) socialProfiles.instagram = form.social_instagram
            if (form.social_facebook) socialProfiles.facebook = form.social_facebook
            if (form.social_linkedin) socialProfiles.linkedin = form.social_linkedin
            if (form.social_twitter) socialProfiles.twitter = form.social_twitter
            if (form.social_tiktok) socialProfiles.tiktok = form.social_tiktok
            if (form.social_website) socialProfiles.website = form.social_website
            if (form.social_other) socialProfiles.other = form.social_other
            if (form.defendant_description) socialProfiles.description = form.defendant_description

            let defendantId: string

            if (defendantMode === 'existing' && selectedDefendant) {
                defendantId = selectedDefendant.id
            } else {
                const builtFullName = [form.defendant_first_name, form.defendant_middle_name, form.defendant_last_name]
                    .filter(Boolean).join(' ').trim() || 'Unknown'
                const slug = builtFullName
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-|-$/g, '')
                    + '-' + Date.now().toString(36)

                const { data: defendant, error: defError } = await supabase
                    .from('defendants')
                    .insert({
                        first_name: form.defendant_first_name,
                        middle_name: form.defendant_middle_name || null,
                        last_name: form.defendant_last_name,
                        full_name: builtFullName,
                        aliases: form.defendant_aliases ? form.defendant_aliases.split(',').map(a => a.trim()) : [],
                        location: form.defendant_location,
                        phone: form.defendant_phone,
                        address: form.defendant_address,
                        date_of_birth: form.defendant_dob,
                        business_names: form.defendant_business_names ? form.defendant_business_names.split(',').map(b => b.trim()) : [],
                        social_profiles: Object.keys(socialProfiles).length > 0 ? socialProfiles : null,
                        slug,
                    })
                    .select()
                    .single()

                if (defError) throw new Error(`Failed to create defendant: ${defError.message}`)
                defendantId = defendant.id
            }

            const { data: newCase, error: caseError } = await supabase
                .from('cases')
                .insert({
                    defendant_id: defendantId,
                    plaintiff_id: user.id,
                    case_types: form.case_types,
                    status: 'draft',
                    current_step: 12,
                    relationship_narrative: {
                        type: form.relationship_type,
                        duration: form.relationship_duration,
                        first_interaction: form.first_interaction,
                        early_warnings: form.early_warnings,
                        entity_type: form.entity_type,
                    },
                    promise_narrative: {
                        explicit_agreement: form.explicit_agreement,
                        agreement_terms: form.agreement_terms,
                        reasonable_expectation: form.reasonable_expectation,
                        evidence_of_trust: form.evidence_of_trust,
                        others_vouch: form.others_vouch,
                    },
                    betrayal_narrative: {
                        what_happened: form.what_happened,
                        primary_incident: form.primary_incident,
                        when_realized: form.when_realized,
                        how_confirmed: form.how_confirmed,
                        is_ongoing: form.is_ongoing,
                    },
                    personal_impact: {
                        emotional: form.emotional_impact,
                        physical: form.physical_impact,
                        wish_understood: form.wish_understood,
                    },
                    legal_actions: {
                        police_report: form.police_report_filed,
                        lawyer: form.lawyer_consulted,
                        court_case: form.court_case_filed,
                        description: form.legal_description,
                        why_filing: form.why_filing,
                        other_victims: form.other_victims,
                        other_victims_count: form.other_victims_count ? parseInt(form.other_victims_count) : null,
                    },
                    story_narrative: {
                        one_line_summary: form.one_line_summary,
                        body: form.case_summary,
                        evidence_inventory: form.evidence_descriptions,
                        evidence_checklist: form.evidence_checklist,
                    },
                    visibility_settings: {
                        tier: form.visibility,
                        accused_aware: form.accused_aware,
                        current_contact: form.current_contact,
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

            for (const event of form.timeline_events.filter(e => e.event)) {
                await supabase.from('timeline_events').insert({
                    case_id: newCase.id,
                    event_type: event.event_type || 'incident',
                    date_or_year: event.date,
                    description: event.event,
                    city: event.location,
                    submitted_by: user.id,
                })
            }

            for (const witness of form.witnesses.filter(w => w.fullName)) {
                await supabase.from('witnesses').insert({
                    case_id: newCase.id,
                    full_name: witness.fullName,
                    witness_type: witness.type || 'eyewitness',
                    contact_info: witness.contact,
                    details: { can_verify: witness.canVerify },
                })
            }

            const finTotal = [
                form.fin_direct_payments, form.fin_lost_wages, form.fin_property_loss,
                form.fin_legal_fees, form.fin_medical_costs, form.fin_credit_damage, form.fin_other_amount,
            ].reduce((sum, v) => sum + (parseFloat(v) || 0), 0)

            if (finTotal > 0 || form.fin_other_description) {
                await supabase.from('financial_impacts').insert({
                    case_id: newCase.id,
                    direct_payments: parseFloat(form.fin_direct_payments) || 0,
                    lost_wages: parseFloat(form.fin_lost_wages) || 0,
                    property_loss: parseFloat(form.fin_property_loss) || 0,
                    legal_fees: parseFloat(form.fin_legal_fees) || 0,
                    medical_costs: parseFloat(form.fin_medical_costs) || 0,
                    credit_damage: parseFloat(form.fin_credit_damage) || 0,
                    other_amount: parseFloat(form.fin_other_amount) || 0,
                    other_description: form.fin_other_description || null,
                    total_lost: finTotal,
                })
            }

            localStorage.removeItem(STORAGE_KEY)
            router.push(`/cases/${newCase.case_number}`)
        } catch (err: any) {
            setError(err.message || t('common.error'))
        } finally {
            setSubmitting(false)
        }
    }

    // ── Edit save handler ─────────────────────────────────────────────────────────
    const handleEditSave = async () => {
        if (!editMode) return
        setSubmitting(true)
        setError('')

        try {
            const res = await fetch('/api/cases/edit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    caseId: editMode.caseId,
                    caseNumber: editMode.caseNumber,
                    form,
                    previousSnapshot: editMode.existingData.caseData,
                }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Save failed')

            router.push(`/cases/${editMode.caseNumber}`)
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'Failed to save changes')
        } finally {
            setSubmitting(false)
        }
    }

    // ── Render ────────────────────────────────────────────────────────────────────
    return (
        <div className="w-[75vw] mx-auto space-y-6">
            {/* Progress Header */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            {isEditMode ? `Editing Case ${editMode!.caseNumber}` : t('wizard.title')}
                        </h1>
                        <p className="text-base text-muted-foreground">
                            {t('onboarding.step')} {step} {t('onboarding.of')} {STEPS.length}: {STEPS[step - 1].title}
                        </p>
                    </div>
                    <div className="text-right">
                        {!isEditMode && savedAt && (
                            <p className="text-sm text-muted-foreground">{t('wizard.autoSaved').replace('{time}', savedAt || '')}</p>
                        )}
                        {isEditMode && (
                            <Badge variant="outline" className="text-xs">
                                {editMode!.existingData.caseData.status?.replace(/_/g, ' ')}
                            </Badge>
                        )}
                    </div>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            {/* Step Navigation */}
            <div className="flex gap-1 overflow-x-auto pb-2 step-scrollbar">
                {STEPS.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => setStep(s.id)}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2 min-w-[calc(85vw/10)] rounded-lg text-sm whitespace-nowrap transition-all
              ${step === s.id
                                ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                            }`}
                        title={s.title}
                    >
                        <s.icon className="h-4 w-4 shrink-0" />
                        <span className="hidden xl:inline truncate">{s.title}</span>
                    </button>
                ))}
            </div>

            {/* Form Content */}
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        {(() => { const StepIcon = STEPS[step - 1].icon; return <StepIcon className="h-6 w-6 text-primary" />; })()}
                        {STEPS[step - 1].title}
                    </CardTitle>
                    <p className="text-base text-muted-foreground">{STEPS[step - 1].desc}</p>
                </CardHeader>
                <CardContent className="space-y-6">

                    {/* STEP 1: Identifying the Accused */}
                    {step === 1 && (
                        <>
                            {!isEditMode && (
                                <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
                                    <p className="text-base font-semibold">Search for an existing record</p>
                                    <p className="text-base text-muted-foreground">
                                        Check if this person or business is already in our system. Selecting an existing record strengthens the case through convergence.
                                    </p>
                                    <DefendantSearchCombobox
                                        onSelect={(d) => {
                                            setSelectedDefendant(d)
                                            setDefendantMode('existing')
                                            updateForm({
                                                defendant_first_name: d.first_name || '',
                                                defendant_middle_name: d.middle_name || '',
                                                defendant_last_name: d.last_name || '',
                                                defendant_full_name: d.full_name || '',
                                            })
                                        }}
                                        onCreateNew={() => {
                                            setSelectedDefendant(null)
                                            setDefendantMode('new')
                                        }}
                                    />
                                    {selectedDefendant && defendantMode === 'existing' && (
                                        <div className="rounded-md border border-primary/40 bg-primary/5 p-3 flex items-center gap-3 mt-2">
                                            <div className="shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-base font-bold text-primary">
                                                {selectedDefendant.full_name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0 text-base">
                                                <span className="font-semibold">{selectedDefendant.full_name}</span>
                                                {selectedDefendant.case_count >= 1 && (
                                                    <span className="text-amber-600 dark:text-amber-400 ml-2">({selectedDefendant.case_count} case{selectedDefendant.case_count !== 1 ? 's' : ''} filed)</span>
                                                )}
                                            </div>
                                            <button type="button" onClick={() => { setSelectedDefendant(null); setDefendantMode('new') }} className="text-sm text-muted-foreground hover:text-foreground underline">Clear</button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {isEditMode && (
                                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                                    <p className="text-sm font-semibold text-primary mb-1">Defendant Linked</p>
                                    <p className="text-base font-medium">{form.defendant_full_name}</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        The defendant cannot be changed after filing. You can update description and social profiles below.
                                    </p>
                                </div>
                            )}

                            <FieldGroup label={t('wizard.entityType')}>
                                <div className="flex gap-2">
                                    {['person', 'business', 'unknown'].map(type => (
                                        <button key={type} onClick={() => !isEditMode && updateForm({ entity_type: type })}
                                            disabled={isEditMode}
                                            className={`px-4 py-2 rounded-lg text-base font-medium border transition-all ${form.entity_type === type ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/50'} ${isEditMode ? 'opacity-60 cursor-not-allowed' : ''}`}>
                                            {t(`wizard.entity_${type}`)}
                                        </button>
                                    ))}
                                </div>
                            </FieldGroup>
                            {form.entity_type !== 'unknown' && (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <FieldGroup label={`${form.entity_type === 'business' ? t('wizard.businessName') : t('wizard.firstName')} *`}>
                                            <Input value={form.defendant_first_name} onChange={e => updateForm({ defendant_first_name: e.target.value })} placeholder={form.entity_type === 'business' ? t('wizard.businessNamePlaceholder') : 'John'} disabled={isEditMode || defendantMode === 'existing'} />
                                        </FieldGroup>
                                        {form.entity_type === 'person' && (
                                            <FieldGroup label="Middle Name">
                                                <Input value={form.defendant_middle_name} onChange={e => updateForm({ defendant_middle_name: e.target.value })} placeholder="Michael" disabled={isEditMode || defendantMode === 'existing'} />
                                            </FieldGroup>
                                        )}
                                        {form.entity_type === 'person' && (
                                            <FieldGroup label={`${t('wizard.lastName')} *`}>
                                                <Input value={form.defendant_last_name} onChange={e => updateForm({ defendant_last_name: e.target.value })} placeholder="Doe" disabled={isEditMode || defendantMode === 'existing'} />
                                            </FieldGroup>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FieldGroup label={t('wizard.knownLocation')}>
                                            <Input value={form.defendant_location} onChange={e => updateForm({ defendant_location: e.target.value })} placeholder={t('wizard.locationPlaceholder')} disabled={isEditMode} />
                                        </FieldGroup>
                                        <FieldGroup label={t('wizard.aliases')}>
                                            <Input value={form.defendant_aliases} onChange={e => updateForm({ defendant_aliases: e.target.value })} placeholder={t('wizard.aliasesPlaceholder')} disabled={isEditMode} />
                                        </FieldGroup>
                                    </div>
                                    <FieldGroup label={t('wizard.defendant_description') || 'Description / Background'}>
                                        <Input value={form.defendant_description} onChange={e => updateForm({ defendant_description: e.target.value })} placeholder="Brief background on the defendant" />
                                    </FieldGroup>
                                </>
                            )}
                        </>
                    )}

                    {/* STEP 2: Your Connection */}
                    {step === 2 && (
                        <>
                            <div className="space-y-2">
                                <p className="text-base font-medium">{t('wizard.caseTypeLabel')}</p>
                                {Object.entries(CASE_TYPE_GROUPS).map(([group, types]) => (
                                    <div key={group} className="space-y-1">
                                        <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">{group}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {types.map(type => (
                                                <button key={type} type="button" onClick={() => {
                                                    const updated = form.case_types.includes(type)
                                                        ? form.case_types.filter(t => t !== type)
                                                        : [...form.case_types, type]
                                                    updateForm({ case_types: updated })
                                                }} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${form.case_types.includes(type) ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-foreground/80 hover:bg-primary hover:text-primary-foreground'}`}>
                                                    {type.replace(/_/g, ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {form.case_types.includes('other') && (
                                <FieldGroup label={t('wizard.caseTypeOtherLabel')}>
                                    <Input value={form.case_type_other_text} onChange={e => updateForm({ case_type_other_text: e.target.value })} placeholder={t('wizard.caseTypeOtherPlaceholder')} />
                                </FieldGroup>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FieldGroup label={`${t('wizard.relationshipType')} *`}>
                                    <Select value={form.relationship_type} onValueChange={v => updateForm({ relationship_type: v })}>
                                        <SelectTrigger className="w-full"><SelectValue placeholder={t('wizard.relationshipPlaceholder')} /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="romantic_partner">{t('wizard.relRomantic')}</SelectItem>
                                            <SelectItem value="family_member">{t('wizard.relFamily')}</SelectItem>
                                            <SelectItem value="friend">{t('wizard.relFriend')}</SelectItem>
                                            <SelectItem value="business_partner">{t('wizard.relBusiness')}</SelectItem>
                                            <SelectItem value="employer_employee">{t('wizard.relEmployer')}</SelectItem>
                                            <SelectItem value="professional_associate">{t('wizard.relClient') || 'Professional Associate'}</SelectItem>
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
                            </div>
                            <FieldGroup label={t('wizard.firstInteraction')}>
                                <VoiceTextInput value={form.first_interaction} onChange={(val) => updateForm({ first_interaction: val })} placeholder={t('wizard.firstInteractionPlaceholder')} rows={3} />
                            </FieldGroup>
                            <FieldGroup label={t('wizard.earlyWarnings')}>
                                <VoiceTextInput value={form.early_warnings} onChange={(val) => updateForm({ early_warnings: val })} placeholder={t('wizard.earlyWarningsPlaceholder')} rows={2} />
                            </FieldGroup>
                            <p className="text-sm text-muted-foreground italic">{t('wizard.step2Micro')}</p>
                        </>
                    )}

                    {/* STEP 3: Basis of Trust */}
                    {step === 3 && (
                        <>
                            <FieldGroup label={t('wizard.explicitAgreement')}>
                                <VoiceTextInput value={form.explicit_agreement} onChange={(val) => updateForm({ explicit_agreement: val })} placeholder={t('wizard.explicitAgreementPlaceholder')} rows={3} />
                            </FieldGroup>
                            <FieldGroup label={t('wizard.agreementTerms')}>
                                <VoiceTextInput value={form.agreement_terms} onChange={(val) => updateForm({ agreement_terms: val })} placeholder={t('wizard.agreementTermsPlaceholder')} rows={3} />
                            </FieldGroup>
                            <FieldGroup label={t('wizard.reasonableExpectation')}>
                                <VoiceTextInput value={form.reasonable_expectation} onChange={(val) => updateForm({ reasonable_expectation: val })} placeholder={t('wizard.reasonableExpectationPlaceholder')} rows={3} />
                            </FieldGroup>
                            <FieldGroup label={t('wizard.evidenceOfTrust')}>
                                <VoiceTextInput value={form.evidence_of_trust} onChange={(val) => updateForm({ evidence_of_trust: val })} placeholder={t('wizard.evidenceOfTrustPlaceholder')} rows={3} />
                            </FieldGroup>
                            <FieldGroup label={t('wizard.othersVouch')}>
                                <VoiceTextInput value={form.others_vouch} onChange={(val) => updateForm({ others_vouch: val })} placeholder={t('wizard.othersVouchPlaceholder')} rows={2} />
                            </FieldGroup>
                            <p className="text-sm text-muted-foreground italic">{t('wizard.step3Micro')}</p>
                        </>
                    )}

                    {/* STEP 4: The Incident */}
                    {step === 4 && (
                        <>
                            <FieldGroup label={`${t('wizard.whatHappened')} *`}>
                                <VoiceTextInput value={form.what_happened} onChange={(val) => updateForm({ what_happened: val })} placeholder={t('wizard.whatHappenedPlaceholder')} rows={5} />
                            </FieldGroup>
                            <FieldGroup label={t('wizard.primaryIncident')}>
                                <VoiceTextInput value={form.primary_incident} onChange={(val) => updateForm({ primary_incident: val })} placeholder={t('wizard.primaryIncidentPlaceholder')} rows={3} />
                            </FieldGroup>
                            <FieldGroup label={t('wizard.whenRealized')}>
                                <Input value={form.when_realized} onChange={e => updateForm({ when_realized: e.target.value })} placeholder={t('wizard.whenRealizedPlaceholder')} />
                            </FieldGroup>
                            <FieldGroup label={t('wizard.howConfirmed')}>
                                <VoiceTextInput value={form.how_confirmed} onChange={(val) => updateForm({ how_confirmed: val })} placeholder={t('wizard.howConfirmedPlaceholder')} rows={3} />
                            </FieldGroup>
                            <FieldGroup label={t('wizard.isOngoing')}>
                                <Select value={form.is_ongoing} onValueChange={v => updateForm({ is_ongoing: v })}>
                                    <SelectTrigger><SelectValue placeholder={t('wizard.selectOne')} /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="yes">{t('wizard.yes')}</SelectItem>
                                        <SelectItem value="no">{t('wizard.no')}</SelectItem>
                                        <SelectItem value="unknown">{t('wizard.unknown')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FieldGroup>
                            <p className="text-sm text-muted-foreground italic">{t('wizard.step4Micro')}</p>
                        </>
                    )}

                    {/* STEP 5: Timeline of Events */}
                    {step === 5 && (
                        <>
                            <p className="text-base text-muted-foreground">{t('wizard.timelineInstructions')}</p>
                            {form.timeline_events.map((event, idx) => (
                                <div key={idx} className="space-y-4 p-4 rounded-lg border bg-muted/20">
                                    <div className="grid grid-cols-1 sm:grid-cols-[15%_1fr_20%] gap-4">
                                        <div>
                                            <label className="text-sm font-medium block mb-1">Date</label>
                                            <Input placeholder={t('wizard.dateOrYear')} value={event.date} onChange={e => {
                                                const events = [...form.timeline_events]; events[idx] = { ...events[idx], date: e.target.value }; updateForm({ timeline_events: events })
                                            }} />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium block mb-1">Event</label>
                                            <textarea placeholder={t('wizard.whatHappenedShort')} value={event.event} onChange={e => {
                                                const events = [...form.timeline_events]; events[idx] = { ...events[idx], event: e.target.value }; updateForm({ timeline_events: events })
                                            }} rows={3} className="w-full px-3 py-2 border rounded-md bg-muted text-foreground text-sm resize-none" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium block mb-1">Location</label>
                                            <Input placeholder="City, lat/long, or map link" value={event.location} onChange={e => {
                                                const events = [...form.timeline_events]; events[idx] = { ...events[idx], location: e.target.value }; updateForm({ timeline_events: events })
                                            }} />
                                            <p className="text-xs text-muted-foreground mt-1">City name, coordinates (13.7,100.5), or Google Maps link</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-wrap gap-1.5">
                                            {EVENT_TYPES.map(et => (
                                                <button key={et.value} onClick={() => {
                                                    const events = [...form.timeline_events]; events[idx] = { ...events[idx], event_type: et.value }; updateForm({ timeline_events: events })
                                                }} className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-all ${event.event_type === et.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/50'}`}>
                                                    {t(`wizard.${et.key}`)}
                                                </button>
                                            ))}
                                        </div>
                                        {form.timeline_events.length > 1 && (
                                            <Button variant="ghost" size="sm" className="text-destructive shrink-0" onClick={() => updateForm({ timeline_events: form.timeline_events.filter((_, i) => i !== idx) })}>X</Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={() => updateForm({ timeline_events: [...form.timeline_events, { date: '', event: '', location: '', event_type: 'incident' }] })}>
                                {t('wizard.addEvent')}
                            </Button>
                            <p className="text-sm text-muted-foreground italic">{t('wizard.step5Micro')}</p>
                        </>
                    )}

                    {/* STEP 6: Case Summary */}
                    {step === 6 && (
                        <>
                            <FieldGroup label={`${t('wizard.oneLineSummary')} *`}>
                                <Input value={form.one_line_summary} onChange={e => updateForm({ one_line_summary: e.target.value })} placeholder={t('wizard.oneLineSummaryPlaceholder')} maxLength={140} />
                                <p className="text-sm text-muted-foreground mt-1">{form.one_line_summary.length}/140</p>
                            </FieldGroup>
                            <FieldGroup label={`${t('wizard.caseSummary')} *`}>
                                <VoiceTextInput value={form.case_summary} onChange={(val) => updateForm({ case_summary: val })} placeholder={t('wizard.caseSummaryPlaceholder')} rows={12} />
                                <p className="text-sm text-muted-foreground mt-1">
                                    {form.case_summary.length} {t('wizard.characters')} · {form.case_summary.split(/\s+/).filter(Boolean).length} {t('wizard.words')}
                                </p>
                            </FieldGroup>
                            <p className="text-sm text-muted-foreground italic">{t('wizard.step6Micro')}</p>
                        </>
                    )}

                    {/* STEP 7: Damages & Impact */}
                    {step === 7 && (
                        <>
                            <p className="text-base font-medium">{t('wizard.financialBreakdown')}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FieldGroup label={t('wizard.finDirectPayments')}>
                                    <Input type="number" value={form.fin_direct_payments} onChange={e => updateForm({ fin_direct_payments: e.target.value })} placeholder="0.00" />
                                </FieldGroup>
                                <FieldGroup label={t('wizard.finLostWages')}>
                                    <Input type="number" value={form.fin_lost_wages} onChange={e => updateForm({ fin_lost_wages: e.target.value })} placeholder="0.00" />
                                </FieldGroup>
                                <FieldGroup label={t('wizard.finPropertyLoss')}>
                                    <Input type="number" value={form.fin_property_loss} onChange={e => updateForm({ fin_property_loss: e.target.value })} placeholder="0.00" />
                                </FieldGroup>
                                <FieldGroup label={t('wizard.finLegalFees')}>
                                    <Input type="number" value={form.fin_legal_fees} onChange={e => updateForm({ fin_legal_fees: e.target.value })} placeholder="0.00" />
                                </FieldGroup>
                                <FieldGroup label={t('wizard.finMedicalCosts')}>
                                    <Input type="number" value={form.fin_medical_costs} onChange={e => updateForm({ fin_medical_costs: e.target.value })} placeholder="0.00" />
                                </FieldGroup>
                                <FieldGroup label={t('wizard.finCreditDamage')}>
                                    <Input type="number" value={form.fin_credit_damage} onChange={e => updateForm({ fin_credit_damage: e.target.value })} placeholder="0.00" />
                                </FieldGroup>
                                <FieldGroup label={t('wizard.finOtherAmount')}>
                                    <Input type="number" value={form.fin_other_amount} onChange={e => updateForm({ fin_other_amount: e.target.value })} placeholder="0.00" />
                                </FieldGroup>
                                <FieldGroup label={t('wizard.finOtherDesc')}>
                                    <Input value={form.fin_other_description} onChange={e => updateForm({ fin_other_description: e.target.value })} placeholder={t('wizard.finOtherDescPlaceholder')} />
                                </FieldGroup>
                            </div>
                            {(() => {
                                const total = [form.fin_direct_payments, form.fin_lost_wages, form.fin_property_loss, form.fin_legal_fees, form.fin_medical_costs, form.fin_credit_damage, form.fin_other_amount].reduce((s, v) => s + (parseFloat(v) || 0), 0)
                                return total > 0 ? <div className="rounded-lg bg-primary/5 border border-primary/20 p-3"><p className="text-base font-semibold">{t('wizard.finTotal')}: <span className="text-primary">${total.toLocaleString()}</span></p></div> : null
                            })()}
                            <FieldGroup label={t('wizard.emotionalImpact')}>
                                <VoiceTextInput value={form.emotional_impact} onChange={(val) => updateForm({ emotional_impact: val })} placeholder={t('wizard.emotionalPlaceholder')} rows={3} />
                            </FieldGroup>
                            <FieldGroup label={t('wizard.physicalImpact')}>
                                <VoiceTextInput value={form.physical_impact} onChange={(val) => updateForm({ physical_impact: val })} placeholder={t('wizard.physicalPlaceholder')} rows={3} />
                            </FieldGroup>
                            <FieldGroup label={t('wizard.wishUnderstood')}>
                                <VoiceTextInput value={form.wish_understood} onChange={(val) => updateForm({ wish_understood: val })} placeholder={t('wizard.wishUnderstoodPlaceholder')} rows={2} />
                            </FieldGroup>
                            <p className="text-sm text-muted-foreground italic">{t('wizard.step7Micro')}</p>
                        </>
                    )}

                    {/* STEP 8: Evidence Inventory */}
                    {step === 8 && (
                        <>
                            <p className="text-base text-muted-foreground">{t('wizard.evidenceChecklistDesc')}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {EVIDENCE_CHECKLIST_KEYS.map(key => (
                                    <label key={key} className="flex items-center gap-2 p-2 rounded-lg border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-all">
                                        <input type="checkbox" checked={form.evidence_checklist.includes(key)} onChange={() => {
                                            const checked = form.evidence_checklist.includes(key) ? form.evidence_checklist.filter(k => k !== key) : [...form.evidence_checklist, key]
                                            updateForm({ evidence_checklist: checked })
                                        }} className="rounded" />
                                        <span className="text-base">{t(`wizard.${key}`)}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="border-t pt-4">
                                <p className="text-base font-medium mb-3">{t('wizard.evidenceCustomEntries')}</p>
                                {form.evidence_descriptions.map((ev, idx) => (
                                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-lg border bg-muted/20 mb-3">
                                        <Input placeholder={t('wizard.evidenceLabel')} value={ev.label} onChange={e => {
                                            const descs = [...form.evidence_descriptions]; descs[idx] = { ...descs[idx], label: e.target.value }; updateForm({ evidence_descriptions: descs })
                                        }} />
                                        <Select value={ev.category} onValueChange={v => {
                                            const descs = [...form.evidence_descriptions]; descs[idx] = { ...descs[idx], category: v }; updateForm({ evidence_descriptions: descs })
                                        }}>
                                            <SelectTrigger className="w-full"><SelectValue placeholder={t('wizard.evidenceCategory')} /></SelectTrigger>
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
                                            <Input placeholder={t('wizard.evidenceDescription')} value={ev.description} onChange={e => {
                                                const descs = [...form.evidence_descriptions]; descs[idx] = { ...descs[idx], description: e.target.value }; updateForm({ evidence_descriptions: descs })
                                            }} />
                                            <Button variant="ghost" size="sm" className="text-destructive shrink-0" onClick={() => updateForm({ evidence_descriptions: form.evidence_descriptions.filter((_, i) => i !== idx) })}>X</Button>
                                        </div>
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={() => updateForm({ evidence_descriptions: [...form.evidence_descriptions, { label: '', description: '', category: '' }] })}>
                                    {t('wizard.addEvidence')}
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground italic">{t('wizard.step8Micro')}</p>
                        </>
                    )}

                    {/* STEP 9: Witnesses */}
                    {step === 9 && (
                        <>
                            {form.witnesses.map((w, idx) => (
                                <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-lg border bg-muted/20">
                                    <Input placeholder={t('wizard.witnessName')} value={w.fullName} onChange={e => {
                                        const ws = [...form.witnesses]; ws[idx] = { ...ws[idx], fullName: e.target.value }; updateForm({ witnesses: ws })
                                    }} />
                                    <Select value={w.type} onValueChange={v => {
                                        const ws = [...form.witnesses]; ws[idx] = { ...ws[idx], type: v }; updateForm({ witnesses: ws })
                                    }}>
                                        <SelectTrigger className="w-full"><SelectValue placeholder={t('wizard.witnessTypePlaceholder')} /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="eyewitness">{t('wizard.witTypeEyewitness')}</SelectItem>
                                            <SelectItem value="character">{t('wizard.witTypeCharacter')}</SelectItem>
                                            <SelectItem value="expert">{t('wizard.witTypeExpert')}</SelectItem>
                                            <SelectItem value="corroborating">{t('wizard.witTypeCorroborating')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Input placeholder={t('wizard.witnessContact')} value={w.contact} onChange={e => {
                                        const ws = [...form.witnesses]; ws[idx] = { ...ws[idx], contact: e.target.value }; updateForm({ witnesses: ws })
                                    }} />
                                    <div className="flex gap-2">
                                        <Input placeholder={t('wizard.witnessCanVerify')} value={w.canVerify} onChange={e => {
                                            const ws = [...form.witnesses]; ws[idx] = { ...ws[idx], canVerify: e.target.value }; updateForm({ witnesses: ws })
                                        }} />
                                        <Button variant="ghost" size="sm" className="text-destructive shrink-0" onClick={() => updateForm({ witnesses: form.witnesses.filter((_, i) => i !== idx) })}>X</Button>
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={() => updateForm({ witnesses: [...form.witnesses, { fullName: '', type: '', contact: '', canVerify: '' }] })}>
                                {t('wizard.addWitness')}
                            </Button>
                            <p className="text-sm text-muted-foreground italic">{t('wizard.step9Micro')}</p>
                        </>
                    )}

                    {/* STEP 10: Legal Actions */}
                    {step === 10 && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <FieldGroup label={t('wizard.policeReport')}>
                                    <Select value={form.police_report_filed} onValueChange={v => updateForm({ police_report_filed: v })}>
                                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                        <SelectContent className="w-[--radix-select-trigger-width]">
                                            <SelectItem value="no">{t('wizard.no')}</SelectItem>
                                            <SelectItem value="yes">{t('wizard.yes')}</SelectItem>
                                            <SelectItem value="pending">{t('wizard.pending')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FieldGroup>
                                <FieldGroup label={t('wizard.lawyerConsulted')}>
                                    <Select value={form.lawyer_consulted} onValueChange={v => updateForm({ lawyer_consulted: v })}>
                                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                        <SelectContent className="w-[--radix-select-trigger-width]">
                                            <SelectItem value="no">{t('wizard.no')}</SelectItem>
                                            <SelectItem value="yes">{t('wizard.yes')}</SelectItem>
                                            <SelectItem value="in_progress">{t('wizard.inProgress')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FieldGroup>
                                <FieldGroup label={t('wizard.courtCaseFiled')}>
                                    <Select value={form.court_case_filed} onValueChange={v => updateForm({ court_case_filed: v })}>
                                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                        <SelectContent className="w-[--radix-select-trigger-width]">
                                            <SelectItem value="no">{t('wizard.no')}</SelectItem>
                                            <SelectItem value="yes">{t('wizard.yes')}</SelectItem>
                                            <SelectItem value="dismissed">{t('wizard.dismissed')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FieldGroup>
                            </div>
                            <FieldGroup label={t('wizard.legalDetails')}>
                                <VoiceTextInput value={form.legal_description} onChange={(val) => updateForm({ legal_description: val })} placeholder={t('wizard.legalPlaceholder')} rows={4} />
                            </FieldGroup>
                            <FieldGroup label={t('wizard.whyFiling')}>
                                <VoiceTextInput value={form.why_filing} onChange={(val) => updateForm({ why_filing: val })} placeholder={t('wizard.whyFilingPlaceholder')} rows={3} />
                            </FieldGroup>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FieldGroup label={t('wizard.otherVictims')}>
                                    <Select value={form.other_victims} onValueChange={v => updateForm({ other_victims: v })}>
                                        <SelectTrigger className="w-full"><SelectValue placeholder={t('wizard.selectOne')} /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="yes">{t('wizard.yes')}</SelectItem>
                                            <SelectItem value="no">{t('wizard.no')}</SelectItem>
                                            <SelectItem value="suspected">{t('wizard.suspected')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FieldGroup>
                                {(form.other_victims === 'yes' || form.other_victims === 'suspected') && (
                                    <FieldGroup label={t('wizard.otherVictimsCount')}>
                                        <Input type="number" value={form.other_victims_count} onChange={e => updateForm({ other_victims_count: e.target.value })} placeholder="0" />
                                    </FieldGroup>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground italic">{t('wizard.step10Micro')}</p>
                        </>
                    )}

                    {/* STEP 11: Safety & Privacy */}
                    {step === 11 && (
                        <>
                            <div className="w-1/2">
                                <FieldGroup label={t('wizard.visibilityTier')}>
                                    <Select value={form.visibility} onValueChange={v => updateForm({ visibility: v })}>
                                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="open">{t('wizard.visOpen')}</SelectItem>
                                            <SelectItem value="shielded">{t('wizard.visShielded')}</SelectItem>
                                            <SelectItem value="protected">{t('wizard.visProtected')}</SelectItem>
                                            <SelectItem value="proxy">{t('wizard.visProxy')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FieldGroup>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FieldGroup label={t('wizard.accusedAware')}>
                                    <Select value={form.accused_aware} onValueChange={v => updateForm({ accused_aware: v })}>
                                        <SelectTrigger className="w-full"><SelectValue placeholder={t('wizard.selectOne')} /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="yes">{t('wizard.yes')}</SelectItem>
                                            <SelectItem value="no">{t('wizard.no')}</SelectItem>
                                            <SelectItem value="unknown">{t('wizard.unknown')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FieldGroup>
                                <FieldGroup label={t('wizard.currentContact')}>
                                    <Select value={form.current_contact} onValueChange={v => updateForm({ current_contact: v })}>
                                        <SelectTrigger className="w-full"><SelectValue placeholder={t('wizard.selectOne')} /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="no_contact">{t('wizard.noContact')}</SelectItem>
                                            <SelectItem value="limited">{t('wizard.limitedContact')}</SelectItem>
                                            <SelectItem value="regular">{t('wizard.regularContact')}</SelectItem>
                                            <SelectItem value="forced">{t('wizard.forcedContact')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FieldGroup>
                            </div>
                            {!isEditMode && (
                                <div className="space-y-3 pt-2">
                                    <ConsentCheckbox label={t('wizard.consentRealName')} checked={form.consent_real_name} onChange={v => updateForm({ consent_real_name: v })} />
                                    <ConsentCheckbox label={t('wizard.consentContact')} checked={form.consent_contact_sharing} onChange={v => updateForm({ consent_contact_sharing: v })} />
                                    <ConsentCheckbox label={`${t('wizard.consentTerms')} *`} checked={form.consent_terms} onChange={v => updateForm({ consent_terms: v })} />
                                </div>
                            )}
                            <div className="rounded-lg border p-4 bg-amber-500/5 border-amber-500/20">
                                <p className="text-base font-medium text-amber-600 dark:text-amber-400">{t('wizard.deadManNote')}</p>
                                <p className="text-sm text-muted-foreground mt-1">{t('wizard.deadManDesc')}</p>
                            </div>
                        </>
                    )}

                    {/* STEP 12: Review & Submit / Save */}
                    {step === 12 && (
                        <>
                            {(() => {
                                const checks = [
                                    form.defendant_first_name || form.defendant_description,
                                    form.case_types.length > 0,
                                    form.relationship_type,
                                    form.what_happened,
                                    form.timeline_events.some(e => e.event),
                                    form.one_line_summary,
                                    form.case_summary,
                                    isEditMode ? true : form.consent_terms,
                                ]
                                const filled = checks.filter(Boolean).length
                                const pct = Math.round((filled / checks.length) * 100)
                                return (
                                    <div className="rounded-lg border p-4 bg-muted/20">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-base font-semibold">{t('wizard.completeness')}</p>
                                            <Badge variant={pct >= 80 ? 'default' : 'secondary'}>{pct}%</Badge>
                                        </div>
                                        <Progress value={pct} className="h-2" />
                                    </div>
                                )
                            })()}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <ReviewBlock title={t('wizard.reviewDefendant')} items={[
                                    form.defendant_full_name || `${form.defendant_first_name} ${form.defendant_last_name}`.trim(),
                                    form.defendant_location && `${form.defendant_location}`,
                                    form.defendant_aliases && `AKA: ${form.defendant_aliases}`,
                                ]} />
                                <ReviewBlock title={t('wizard.reviewCaseTypes')} items={form.case_types.map(ct => ct.replace(/_/g, ' '))} />
                                <ReviewBlock title={t('wizard.reviewRelationship')} items={[
                                    form.relationship_type && `${t('wizard.reviewType')}: ${form.relationship_type.replace(/_/g, ' ')}`,
                                    form.relationship_duration && `${t('wizard.reviewDuration')}: ${form.relationship_duration}`,
                                ]} />
                                <ReviewBlock title={t('wizard.reviewSummary')} items={[
                                    form.one_line_summary && `"${form.one_line_summary}"`,
                                    form.case_summary && `${form.case_summary.split(/\s+/).filter(Boolean).length} ${t('wizard.words')}`,
                                ]} />
                                <ReviewBlock title={t('wizard.reviewFinancial')} items={[
                                    (() => {
                                        const total = [form.fin_direct_payments, form.fin_lost_wages, form.fin_property_loss, form.fin_legal_fees, form.fin_medical_costs, form.fin_credit_damage, form.fin_other_amount].reduce((s, v) => s + (parseFloat(v) || 0), 0)
                                        return total > 0 ? `$${total.toLocaleString()}` : ''
                                    })(),
                                ]} />
                                <ReviewBlock title={t('wizard.reviewTimeline')} items={
                                    form.timeline_events.filter(e => e.event).map(e => `${e.date}: ${e.event}`)
                                } />
                                <ReviewBlock title={t('wizard.reviewEvidence')} items={[
                                    form.evidence_checklist.length > 0 && `${form.evidence_checklist.length} ${t('wizard.reviewCheckedItems')}`,
                                    form.evidence_descriptions.length > 0 && `${form.evidence_descriptions.length} ${t('wizard.reviewCustomEntries')}`,
                                ]} />
                                <ReviewBlock title={t('wizard.reviewLegal')} items={[
                                    `${t('wizard.reviewPolice')}: ${form.police_report_filed}`,
                                    `${t('wizard.reviewLawyer')}: ${form.lawyer_consulted}`,
                                    `${t('wizard.reviewCourt')}: ${form.court_case_filed}`,
                                ]} />
                                <ReviewBlock title={t('wizard.reviewSafety')} items={[
                                    `${t('wizard.reviewVisibility')}: ${form.visibility}`,
                                    !isEditMode && `${t('wizard.reviewTerms')}: ${form.consent_terms ? 'Accepted' : 'Not accepted'}`,
                                ]} />
                            </div>

                            <FieldGroup label={t('wizard.nominalDamages')}>
                                <Input type="number" value={form.nominal_damages} onChange={e => updateForm({ nominal_damages: e.target.value })} placeholder={t('wizard.nominalDamagesPlaceholder')} />
                                <p className="text-sm text-muted-foreground mt-1">{t('wizard.nominalDamagesNote')}</p>
                            </FieldGroup>

                            {!isEditMode && !form.consent_terms && (
                                <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3">
                                    <p className="text-base text-destructive">{t('wizard.mustAcceptTerms')}</p>
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
                    {!isEditMode && (
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
                    )}

                    {step < 12 ? (
                        <Button onClick={() => setStep(Math.min(STEPS.length, step + 1))}>
                            {t('wizard.nextStep')}
                        </Button>
                    ) : isEditMode ? (
                        <Button
                            onClick={handleEditSave}
                            disabled={submitting}
                            className="min-w-[140px] bg-primary text-primary-foreground"
                        >
                            {submitting ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    Saving...
                                </span>
                            ) : (
                                'Save Changes'
                            )}
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
                    <p className="text-base text-destructive">{error}</p>
                </div>
            )}
        </div>
    )
}

// ── Helper components ─────────────────────────────────────────────────────────

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <Label className="text-base font-medium">{label}</Label>
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
            <span className="text-base text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
        </label>
    )
}

function ReviewBlock({ title, items }: { title: string; items: (string | false | undefined | null)[] }) {
    const validItems = items.filter(Boolean) as string[]
    if (validItems.length === 0) return null
    return (
        <div className="rounded-lg border p-4 space-y-1">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
            {validItems.map((item, i) => (
                <p key={i} className="text-base capitalize">{item}</p>
            ))}
        </div>
    )
}
