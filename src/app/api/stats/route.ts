import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const locationToCountry: Record<string, string> = {
    'australia': 'AU', 'au': 'AU', 'melbourne': 'AU', 'brisbane': 'AU',
    'gold coast': 'AU', 'queensland': 'AU', 'sydney': 'AU', 'perth': 'AU',
    'thailand': 'TH', 'th': 'TH', 'bangkok': 'TH',
    'dubai': 'AE', 'uae': 'AE', 'united arab emirates': 'AE',
    'vietnam': 'VN', 'vn': 'VN', 'da nang': 'VN', 'hanoi': 'VN', 'ho chi minh': 'VN',
    'china': 'CN', 'cn': 'CN', 'beijing': 'CN', 'shanghai': 'CN',
    'usa': 'US', 'us': 'US', 'united states': 'US', 'america': 'US',
    'uk': 'GB', 'united kingdom': 'GB', 'england': 'GB', 'london': 'GB',
    'europe': 'EU', 'european': 'EU',
}

function getCountryCode(city: string): string | null {
    const lower = city.toLowerCase()
    for (const [key, code] of Object.entries(locationToCountry)) {
        if (lower.includes(key)) return code
    }
    return null
}

export async function GET() {
    try {
        const supabase = await createClient()

        const [casesRes, timelineRes] = await Promise.all([
            supabase
                .from('cases')
                .select('status, nominal_damages_claimed')
                .not('status', 'eq', 'draft'),
            supabase
                .from('timeline_events')
                .select('city'),
        ])

        if (casesRes.error) throw casesRes.error

        const allCases = casesRes.data || []
        const allEvents = timelineRes.data || []

        const openStatuses = new Set(['pending', 'admin_review', 'investigation', 'judgment'])
        const closedStatuses = new Set(['verdict', 'restitution'])

        const openCases = allCases.filter(c => openStatuses.has(c.status)).length
        const closedCases = allCases.filter(c => closedStatuses.has(c.status)).length

        const countrySet = new Set<string>()
        for (const e of allEvents) {
            if (e.city) {
                const code = getCountryCode(e.city)
                if (code) countrySet.add(code)
            }
        }

        const damagesPaid = allCases
            .filter(c => c.status === 'restitution')
            .reduce((sum, c) => sum + (c.nominal_damages_claimed || 0), 0)

        return NextResponse.json({
            openCases,
            closedCases,
            countriesInvolved: countrySet.size,
            damagesPaid,
        })
    } catch (error) {
        console.error('Stats error:', error)
        return NextResponse.json({ openCases: 0, closedCases: 0, countriesInvolved: 0, damagesPaid: 0 })
    }
}
