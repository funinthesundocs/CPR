import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Parses "lat, lng" or Google Maps URLs into { lat, lng }. Returns null if unrecognized.
function parseCoordinateString(input: string): { lat: number; lng: number } | null {
    const s = (input || '').trim()
    if (!s) return null
    const coordMatch = s.match(/^([-\d.]+)\s*,\s*([-\d.]+)$/)
    if (coordMatch) {
        const lat = parseFloat(coordMatch[1]), lng = parseFloat(coordMatch[2])
        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180)
            return { lat, lng }
    }
    const mapsMatch = s.match(/[?&]q=([-\d.]+)[,+]([-\d.]+)/)
    if (mapsMatch) {
        const lat = parseFloat(mapsMatch[1]), lng = parseFloat(mapsMatch[2])
        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180)
            return { lat, lng }
    }
    return null
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { caseId, caseNumber, form } = body

        if (!caseId || !form) {
            return NextResponse.json({ error: 'Missing caseId or form data' }, { status: 400 })
        }

        // ── Auth: verify session via server client ────────────────────────────
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // ── Ownership check ───────────────────────────────────────────────────
        const { data: caseRow } = await supabase
            .from('cases')
            .select('plaintiff_id, status')
            .eq('id', caseId)
            .single()

        if (!caseRow || caseRow.plaintiff_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const EDITABLE_STATUSES = ['draft', 'pending', 'pending_convergence', 'admin_review', 'investigation']
        if (!EDITABLE_STATUSES.includes(caseRow.status)) {
            return NextResponse.json({ error: 'Case is locked and cannot be edited' }, { status: 403 })
        }

        // ── Admin client: bypasses RLS for all writes ─────────────────────────
        const admin = createAdminClient()

        // 1. Update cases table
        const { error: caseError } = await admin
            .from('cases')
            .update({
                case_types: form.case_types,
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
                nominal_damages_claimed: form.nominal_damages ? parseFloat(form.nominal_damages) : 0,
                updated_at: new Date().toISOString(),
            })
            .eq('id', caseId)

        if (caseError) throw new Error(`Failed to update case: ${caseError.message}`)

        // 2. Upsert financial_impacts
        const finFields = [
            form.fin_direct_payments, form.fin_lost_wages, form.fin_property_loss,
            form.fin_legal_fees, form.fin_medical_costs, form.fin_credit_damage, form.fin_other_amount,
        ]
        const finTotal = finFields.reduce((sum: number, v: string) => sum + (parseFloat(v) || 0), 0)

        const { error: finError } = await admin
            .from('financial_impacts')
            .upsert({
                case_id: caseId,
                direct_payments: parseFloat(form.fin_direct_payments) || 0,
                lost_wages: parseFloat(form.fin_lost_wages) || 0,
                property_loss: parseFloat(form.fin_property_loss) || 0,
                legal_fees: parseFloat(form.fin_legal_fees) || 0,
                medical_costs: parseFloat(form.fin_medical_costs) || 0,
                credit_damage: parseFloat(form.fin_credit_damage) || 0,
                other_amount: parseFloat(form.fin_other_amount) || 0,
                other_description: form.fin_other_description || null,
                total_lost: finTotal,
            }, { onConflict: 'case_id' })

        if (finError) throw new Error(`Failed to update financial data: ${finError.message}`)

        // 3. Delete + re-insert timeline_events
        // IMPORTANT: Preserve lat/lng from DB — form edits must never wipe coordinates.
        // Fetch existing lat/lng before deleting, then restore by matching date+description.
        const { data: existingEvents } = await admin
            .from('timeline_events')
            .select('date_or_year, description, latitude, longitude, city, sort_order')
            .eq('case_id', caseId)

        const latlngMap = new Map<string, { lat: number | null; lng: number | null; city: string | null }>()
        for (const e of existingEvents || []) {
            const key = `${e.date_or_year}|${(e.description || '').substring(0, 80)}`
            latlngMap.set(key, { lat: e.latitude ?? null, lng: e.longitude ?? null, city: e.city ?? null })
        }

        await admin.from('timeline_events').delete().eq('case_id', caseId)
        const validEvents = (form.timeline_events || []).filter((e: any) => e.event)
        for (const event of validEvents) {
            const key = `${event.date}|${(event.event || '').substring(0, 80)}`
            const preserved = latlngMap.get(key)

            // Priority: explicit coordinates field > preserved DB values (if city unchanged) > null
            const explicitCoords = parseCoordinateString(event.coordinates || '')
            let lat: number | null = null
            let lng: number | null = null
            if (explicitCoords) {
                lat = explicitCoords.lat
                lng = explicitCoords.lng
            } else if (preserved) {
                // Only preserve DB lat/lng if the city field hasn't changed
                const locationChanged = preserved.city !== event.location
                lat = locationChanged ? null : (preserved.lat ?? null)
                lng = locationChanged ? null : (preserved.lng ?? null)
            }

            await admin.from('timeline_events').insert({
                case_id: caseId,
                event_type: event.event_type || 'incident',
                date_or_year: event.date,
                description: event.event,
                city: event.location,
                short_title: event.short_title || null,
                latitude: lat,
                longitude: lng,
                submitted_by: user.id,
            })
        }

        // 4. Delete + re-insert witnesses
        await admin.from('witnesses').delete().eq('case_id', caseId)
        const validWitnesses = (form.witnesses || []).filter((w: any) => w.fullName)
        for (const witness of validWitnesses) {
            await admin.from('witnesses').insert({
                case_id: caseId,
                full_name: witness.fullName,
                witness_type: witness.type || 'eyewitness',
                contact_info: witness.contact,
                details: { can_verify: witness.canVerify },
            })
        }

        // 5. Audit trail
        const { count: versionCount } = await admin
            .from('case_versions')
            .select('*', { count: 'exact', head: true })
            .eq('case_id', caseId)

        await admin.from('case_versions').insert({
            case_id: caseId,
            version_number: (versionCount || 0) + 1,
            edited_by: user.id,
            changed_fields: ['all'],
            previous_data: body.previousSnapshot ?? null,
        })

        return NextResponse.json({ success: true, caseNumber })
    } catch (err: any) {
        console.error('[/api/cases/edit]', err)
        return NextResponse.json({ error: err.message || 'Save failed' }, { status: 500 })
    }
}
