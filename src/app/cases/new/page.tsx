'use client'

import { useState, useEffect, useCallback } from 'react'
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

const CASE_TYPES = [
    'fraud', 'theft', 'scam', 'breach_of_contract', 'extortion',
    'identity_theft', 'harassment', 'assault', 'defamation',
    'embezzlement', 'domestic_violence', 'elder_abuse', 'other'
]

const STEPS = [
    { id: 1, title: 'Defendant Info', icon: '👤', desc: 'Who are you filing against?' },
    { id: 2, title: 'Your Connection', icon: '🔗', desc: 'How do you know this person?' },
    { id: 3, title: 'The Promise', icon: '🤝', desc: 'What was promised to you?' },
    { id: 4, title: 'The Betrayal', icon: '💔', desc: 'What actually happened?' },
    { id: 5, title: 'Timeline', icon: '📅', desc: 'When did events occur?' },
    { id: 6, title: 'Impact', icon: '💥', desc: 'How were you affected?' },
    { id: 7, title: 'Evidence', icon: '📎', desc: 'Upload supporting documents' },
    { id: 8, title: 'Witnesses', icon: '👁️', desc: 'Who else can verify?' },
    { id: 9, title: 'Legal Actions', icon: '⚖️', desc: 'Any legal steps taken?' },
    { id: 10, title: 'Your Story', icon: '📖', desc: 'Share your narrative' },
    { id: 11, title: 'Safety', icon: '🛡️', desc: 'Your safety preferences' },
    { id: 12, title: 'Review & Submit', icon: '✅', desc: 'Final review' },
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
    const [step, setStep] = useState(1)
    const [form, setForm] = useState<FormData>(DEFAULT_FORM)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [savedAt, setSavedAt] = useState<string | null>(null)

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
            setError(err.message || 'Something went wrong')
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
                        <h1 className="text-2xl font-bold">File a New Case</h1>
                        <p className="text-sm text-muted-foreground">
                            Step {step} of {STEPS.length}: {STEPS[step - 1].title}
                        </p>
                    </div>
                    <div className="text-right">
                        {savedAt && (
                            <p className="text-xs text-muted-foreground">Auto-saved at {savedAt}</p>
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
                        <span>{s.icon}</span>
                        <span className="hidden sm:inline">{s.title}</span>
                    </button>
                ))}
            </div>

            {/* Form Content */}
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <span className="text-2xl">{STEPS[step - 1].icon}</span>
                        {STEPS[step - 1].title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{STEPS[step - 1].desc}</p>
                </CardHeader>
                <CardContent className="space-y-6">

                    {/* STEP 1: Defendant Info */}
                    {step === 1 && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FieldGroup label="First Name *">
                                    <Input value={form.defendant_first_name} onChange={e => updateForm({ defendant_first_name: e.target.value })} placeholder="John" />
                                </FieldGroup>
                                <FieldGroup label="Last Name *">
                                    <Input value={form.defendant_last_name} onChange={e => updateForm({ defendant_last_name: e.target.value })} placeholder="Doe" />
                                </FieldGroup>
                            </div>
                            <FieldGroup label="Full Name (if different)">
                                <Input value={form.defendant_full_name} onChange={e => updateForm({ defendant_full_name: e.target.value })} placeholder="Leave blank to auto-generate from first + last" />
                            </FieldGroup>
                            <FieldGroup label="Known Aliases (comma-separated)">
                                <Input value={form.defendant_aliases} onChange={e => updateForm({ defendant_aliases: e.target.value })} placeholder="Johnny D, J. Doe" />
                            </FieldGroup>
                            <FieldGroup label="Known Location">
                                <Input value={form.defendant_location} onChange={e => updateForm({ defendant_location: e.target.value })} placeholder="City, State, Country" />
                            </FieldGroup>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FieldGroup label="Phone">
                                    <Input value={form.defendant_phone} onChange={e => updateForm({ defendant_phone: e.target.value })} placeholder="+1..." />
                                </FieldGroup>
                                <FieldGroup label="Date of Birth">
                                    <Input type="date" value={form.defendant_dob} onChange={e => updateForm({ defendant_dob: e.target.value })} />
                                </FieldGroup>
                            </div>
                            <FieldGroup label="Address">
                                <Textarea value={form.defendant_address} onChange={e => updateForm({ defendant_address: e.target.value })} placeholder="Known address" rows={2} />
                            </FieldGroup>
                            <FieldGroup label="Business Names (comma-separated)">
                                <Input value={form.defendant_business_names} onChange={e => updateForm({ defendant_business_names: e.target.value })} placeholder="ACME Corp, XYZ Ltd" />
                            </FieldGroup>
                        </>
                    )}

                    {/* STEP 2: Connection */}
                    {step === 2 && (
                        <>
                            <FieldGroup label="Case Types *">
                                <div className="flex flex-wrap gap-2">
                                    {CASE_TYPES.map(type => (
                                        <button
                                            key={type}
                                            onClick={() => {
                                                const types = form.case_types.includes(type)
                                                    ? form.case_types.filter(t => t !== type)
                                                    : [...form.case_types, type]
                                                updateForm({ case_types: types })
                                            }}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all capitalize
                        ${form.case_types.includes(type)
                                                    ? 'bg-primary text-primary-foreground border-primary'
                                                    : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/50'
                                                }`}
                                        >
                                            {type.replace(/_/g, ' ')}
                                        </button>
                                    ))}
                                </div>
                            </FieldGroup>
                            <FieldGroup label="Relationship Type *">
                                <Select value={form.relationship_type} onValueChange={v => updateForm({ relationship_type: v })}>
                                    <SelectTrigger><SelectValue placeholder="How do you know the defendant?" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="romantic_partner">Romantic Partner</SelectItem>
                                        <SelectItem value="family_member">Family Member</SelectItem>
                                        <SelectItem value="friend">Friend</SelectItem>
                                        <SelectItem value="business_partner">Business Partner</SelectItem>
                                        <SelectItem value="employer_employee">Employer/Employee</SelectItem>
                                        <SelectItem value="client_service_provider">Client/Service Provider</SelectItem>
                                        <SelectItem value="stranger">Stranger</SelectItem>
                                        <SelectItem value="online_contact">Online Contact</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FieldGroup>
                            <FieldGroup label="Duration of Relationship">
                                <Input value={form.relationship_duration} onChange={e => updateForm({ relationship_duration: e.target.value })} placeholder="e.g. 2 years, 6 months" />
                            </FieldGroup>
                            <FieldGroup label="How Did You Meet?">
                                <Textarea value={form.how_met} onChange={e => updateForm({ how_met: e.target.value })} placeholder="Describe how you first came in contact..." rows={3} />
                            </FieldGroup>
                        </>
                    )}

                    {/* STEP 3: Promise */}
                    {step === 3 && (
                        <>
                            <FieldGroup label="What Was Promised? *">
                                <Textarea value={form.promise_what} onChange={e => updateForm({ promise_what: e.target.value })} placeholder="Describe what was promised, offered, or agreed upon..." rows={4} />
                            </FieldGroup>
                            <FieldGroup label="When Was It Promised?">
                                <Input value={form.promise_when} onChange={e => updateForm({ promise_when: e.target.value })} placeholder="Date or approximate timeframe" />
                            </FieldGroup>
                            <FieldGroup label="Do You Have Evidence of the Promise?">
                                <Textarea value={form.promise_evidence_of_promise} onChange={e => updateForm({ promise_evidence_of_promise: e.target.value })} placeholder="Describe any texts, emails, contracts, witnesses, or recordings..." rows={3} />
                            </FieldGroup>
                        </>
                    )}

                    {/* STEP 4: Betrayal */}
                    {step === 4 && (
                        <>
                            <FieldGroup label="What Actually Happened? *">
                                <Textarea value={form.betrayal_what_happened} onChange={e => updateForm({ betrayal_what_happened: e.target.value })} placeholder="Describe the betrayal, breach, or wrongful act in detail..." rows={5} />
                            </FieldGroup>
                            <FieldGroup label="When Did You Discover It?">
                                <Input value={form.betrayal_when_discovered} onChange={e => updateForm({ betrayal_when_discovered: e.target.value })} placeholder="Date or approximate timeframe" />
                            </FieldGroup>
                            <FieldGroup label="How Did You Discover It?">
                                <Textarea value={form.betrayal_how_discovered} onChange={e => updateForm({ betrayal_how_discovered: e.target.value })} placeholder="What led you to realize what happened..." rows={3} />
                            </FieldGroup>
                        </>
                    )}

                    {/* STEP 5: Timeline */}
                    {step === 5 && (
                        <>
                            <p className="text-sm text-muted-foreground">Add key events in chronological order. These form the public timeline on the defendant&apos;s page.</p>
                            {form.timeline_events.map((event, idx) => (
                                <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-lg border bg-muted/20">
                                    <Input
                                        placeholder="Date or year"
                                        value={event.date}
                                        onChange={e => {
                                            const events = [...form.timeline_events]
                                            events[idx] = { ...events[idx], date: e.target.value }
                                            updateForm({ timeline_events: events })
                                        }}
                                    />
                                    <Input
                                        placeholder="What happened?"
                                        value={event.event}
                                        onChange={e => {
                                            const events = [...form.timeline_events]
                                            events[idx] = { ...events[idx], event: e.target.value }
                                            updateForm({ timeline_events: events })
                                        }}
                                    />
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Location"
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
                                + Add Event
                            </Button>
                        </>
                    )}

                    {/* STEP 6: Impact */}
                    {step === 6 && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FieldGroup label="Financial Loss Amount ($)">
                                    <Input type="number" value={form.financial_amount} onChange={e => updateForm({ financial_amount: e.target.value })} placeholder="0.00" />
                                </FieldGroup>
                                <FieldGroup label="Currency">
                                    <Input value="USD" disabled />
                                </FieldGroup>
                            </div>
                            <FieldGroup label="Describe Financial Impact">
                                <Textarea value={form.financial_description} onChange={e => updateForm({ financial_description: e.target.value })} placeholder="How did this affect you financially?" rows={3} />
                            </FieldGroup>
                            <FieldGroup label="Emotional Impact">
                                <Textarea value={form.emotional_impact} onChange={e => updateForm({ emotional_impact: e.target.value })} placeholder="How has this affected you emotionally, mentally, or psychologically?" rows={3} />
                            </FieldGroup>
                            <FieldGroup label="Physical Impact (if any)">
                                <Textarea value={form.physical_impact} onChange={e => updateForm({ physical_impact: e.target.value })} placeholder="Any physical harm or health effects?" rows={2} />
                            </FieldGroup>
                        </>
                    )}

                    {/* STEP 7: Evidence */}
                    {step === 7 && (
                        <>
                            <div className="rounded-lg border border-dashed p-6 text-center space-y-3 bg-muted/20">
                                <p className="text-3xl">📎</p>
                                <p className="text-sm text-muted-foreground">
                                    Evidence upload will be enabled after submission.<br />
                                    For now, describe your evidence below. You can upload files from your case dashboard.
                                </p>
                            </div>
                            {form.evidence_descriptions.map((ev, idx) => (
                                <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-lg border bg-muted/20">
                                    <Input
                                        placeholder="Label (e.g. Contract)"
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
                                        <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="document">Document</SelectItem>
                                            <SelectItem value="photo">Photo</SelectItem>
                                            <SelectItem value="video">Video</SelectItem>
                                            <SelectItem value="audio">Audio</SelectItem>
                                            <SelectItem value="communication">Communication</SelectItem>
                                            <SelectItem value="financial">Financial Record</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Description"
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
                                + Describe Evidence
                            </Button>
                        </>
                    )}

                    {/* STEP 8: Witnesses */}
                    {step === 8 && (
                        <>
                            <p className="text-sm text-muted-foreground">List anyone who can verify your claims. They may be contacted for witness statements.</p>
                            {form.witness_names.map((w, idx) => (
                                <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-lg border bg-muted/20">
                                    <Input placeholder="Full name" value={w.name} onChange={e => {
                                        const ws = [...form.witness_names]
                                        ws[idx] = { ...ws[idx], name: e.target.value }
                                        updateForm({ witness_names: ws })
                                    }} />
                                    <Input placeholder="Relationship" value={w.relationship} onChange={e => {
                                        const ws = [...form.witness_names]
                                        ws[idx] = { ...ws[idx], relationship: e.target.value }
                                        updateForm({ witness_names: ws })
                                    }} />
                                    <div className="flex gap-2">
                                        <Input placeholder="Contact (email/phone)" value={w.contact} onChange={e => {
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
                                + Add Witness
                            </Button>
                        </>
                    )}

                    {/* STEP 9: Legal Actions */}
                    {step === 9 && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <FieldGroup label="Police Report Filed?">
                                    <Select value={form.police_report_filed} onValueChange={v => updateForm({ police_report_filed: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="no">No</SelectItem>
                                            <SelectItem value="yes">Yes</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FieldGroup>
                                <FieldGroup label="Lawyer Consulted?">
                                    <Select value={form.lawyer_consulted} onValueChange={v => updateForm({ lawyer_consulted: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="no">No</SelectItem>
                                            <SelectItem value="yes">Yes</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FieldGroup>
                                <FieldGroup label="Court Case Filed?">
                                    <Select value={form.court_case_filed} onValueChange={v => updateForm({ court_case_filed: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="no">No</SelectItem>
                                            <SelectItem value="yes">Yes</SelectItem>
                                            <SelectItem value="dismissed">Dismissed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FieldGroup>
                            </div>
                            <FieldGroup label="Additional Legal Details">
                                <Textarea value={form.legal_description} onChange={e => updateForm({ legal_description: e.target.value })} placeholder="Any additional legal context, case numbers, or outcomes..." rows={4} />
                            </FieldGroup>
                        </>
                    )}

                    {/* STEP 10: Your Story */}
                    {step === 10 && (
                        <>
                            <FieldGroup label="Story Title *">
                                <Input value={form.story_title} onChange={e => updateForm({ story_title: e.target.value })} placeholder="A compelling title for your case story" />
                            </FieldGroup>
                            <FieldGroup label="Your Narrative *">
                                <Textarea
                                    value={form.story_narrative}
                                    onChange={e => updateForm({ story_narrative: e.target.value })}
                                    placeholder="Tell your story in your own words. This will be the main body of your case file, visible to the public. Be detailed, honest, and include specific dates, amounts, and names where possible."
                                    rows={12}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    {form.story_narrative.length} characters · {form.story_narrative.split(/\s+/).filter(Boolean).length} words
                                </p>
                            </FieldGroup>
                        </>
                    )}

                    {/* STEP 11: Safety */}
                    {step === 11 && (
                        <>
                            <FieldGroup label="Visibility Tier">
                                <Select value={form.visibility} onValueChange={v => updateForm({ visibility: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="open">🟢 Open — Full public visibility</SelectItem>
                                        <SelectItem value="shielded">🟡 Shielded — Display name only, no real identity</SelectItem>
                                        <SelectItem value="protected">🟠 Protected — Verified but anonymous to public</SelectItem>
                                        <SelectItem value="proxy">🔴 Proxy — Filed through attorney or advocate</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FieldGroup>
                            <div className="space-y-3 pt-2">
                                <ConsentCheckbox
                                    label="I consent to my real name being associated with this case"
                                    checked={form.consent_real_name}
                                    onChange={v => updateForm({ consent_real_name: v })}
                                />
                                <ConsentCheckbox
                                    label="I consent to my contact information being shared with case investigators"
                                    checked={form.consent_contact_sharing}
                                    onChange={v => updateForm({ consent_contact_sharing: v })}
                                />
                                <ConsentCheckbox
                                    label="I agree to the terms of service and understand this record is permanent *"
                                    checked={form.consent_terms}
                                    onChange={v => updateForm({ consent_terms: v })}
                                />
                            </div>
                            <div className="rounded-lg border p-4 bg-amber-500/5 border-amber-500/20">
                                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">⚠️ Dead Man&apos;s Switch</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    You can configure a safety switch from your profile after filing. If you stop checking in, designated contacts will be notified.
                                </p>
                            </div>
                        </>
                    )}

                    {/* STEP 12: Review */}
                    {step === 12 && (
                        <>
                            <div className="space-y-4">
                                <ReviewBlock title="Defendant" items={[
                                    form.defendant_full_name || `${form.defendant_first_name} ${form.defendant_last_name}`.trim(),
                                    form.defendant_location && `📍 ${form.defendant_location}`,
                                    form.defendant_aliases && `AKA: ${form.defendant_aliases}`,
                                ]} />
                                <ReviewBlock title="Case Types" items={form.case_types.map(t => t.replace(/_/g, ' '))} />
                                <ReviewBlock title="Relationship" items={[
                                    form.relationship_type && `Type: ${form.relationship_type.replace(/_/g, ' ')}`,
                                    form.relationship_duration && `Duration: ${form.relationship_duration}`,
                                ]} />
                                <ReviewBlock title="Financial Impact" items={[
                                    form.financial_amount && `$${parseFloat(form.financial_amount).toLocaleString()}`,
                                    form.financial_description,
                                ]} />
                                <ReviewBlock title="Timeline Events" items={
                                    form.timeline_events.filter(e => e.event).map(e => `${e.date}: ${e.event}`)
                                } />
                                <ReviewBlock title="Legal Actions" items={[
                                    `Police report: ${form.police_report_filed}`,
                                    `Lawyer: ${form.lawyer_consulted}`,
                                    `Court case: ${form.court_case_filed}`,
                                ]} />
                                <ReviewBlock title="Story" items={[
                                    form.story_title && `"${form.story_title}"`,
                                    form.story_narrative && `${form.story_narrative.split(/\s+/).filter(Boolean).length} words`,
                                ]} />
                                <ReviewBlock title="Safety" items={[
                                    `Visibility: ${form.visibility}`,
                                    `Terms accepted: ${form.consent_terms ? '✅' : '❌'}`,
                                ]} />
                            </div>

                            <FieldGroup label="Nominal Damages Claimed ($)">
                                <Input type="number" value={form.nominal_damages} onChange={e => updateForm({ nominal_damages: e.target.value })} placeholder="Amount you are claiming in damages" />
                                <p className="text-xs text-muted-foreground mt-1">
                                    This is the amount you believe you are owed. Jury members will vote on whether to award this amount.
                                </p>
                            </FieldGroup>

                            {!form.consent_terms && (
                                <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3">
                                    <p className="text-sm text-destructive">You must accept the terms of service before submitting.</p>
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
                    ← Previous
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
                        Clear Draft
                    </Button>

                    {step < 12 ? (
                        <Button onClick={() => setStep(Math.min(STEPS.length, step + 1))}>
                            Next →
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
                                    Submitting...
                                </span>
                            ) : (
                                '⚖️ Submit Case'
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
