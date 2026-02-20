import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim() ?? ''

    if (q.length < 2) {
        return NextResponse.json({ results: [] })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
        .from('defendants')
        .select(`
      id,
      full_name,
      first_name,
      middle_name,
      last_name,
      location,
      slug,
      status,
      aliases,
      business_names
    `)
        .or(
            `full_name.ilike.%${q}%,` +
            `first_name.ilike.%${q}%,` +
            `last_name.ilike.%${q}%`
        )
        .limit(10)
        .order('full_name', { ascending: true })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Also search aliases array using a separate query if fewer than 10 results
    let results = data ?? []
    const existingIds = new Set(results.map(r => r.id))

    if (results.length < 10) {
        const { data: aliasData } = await supabase
            .from('defendants')
            .select(`
        id,
        full_name,
        first_name,
        middle_name,
        last_name,
        location,
        slug,
        status,
        aliases,
        business_names
      `)
            .contains('aliases', [q])
            .limit(10 - results.length)

        if (aliasData) {
            for (const d of aliasData) {
                if (!existingIds.has(d.id)) {
                    results.push(d)
                    existingIds.add(d.id)
                }
            }
        }
    }

    // Fetch case counts per defendant
    const defendantIds = results.map(r => r.id)
    let caseCounts: Record<string, number> = {}

    if (defendantIds.length > 0) {
        const { data: countData } = await supabase
            .from('cases')
            .select('defendant_id')
            .in('defendant_id', defendantIds)
            .not('status', 'eq', 'draft')

        if (countData) {
            for (const row of countData) {
                caseCounts[row.defendant_id] = (caseCounts[row.defendant_id] ?? 0) + 1
            }
        }
    }

    const enriched = results.map(d => ({
        ...d,
        case_count: caseCounts[d.id] ?? 0,
    }))

    return NextResponse.json({ results: enriched })
}
