import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/cases/memberships?case_ids=uuid1,uuid2,...
// Returns the authenticated user's case_roles for the given case IDs.
// Uses service-role client to bypass RLS on case_roles.
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ memberships: [] })
  }

  const { searchParams } = new URL(request.url)
  const caseIdsParam = searchParams.get('case_ids')

  if (!caseIdsParam) {
    return NextResponse.json({ memberships: [] })
  }

  const caseIds = caseIdsParam.split(',').map(id => id.trim()).filter(Boolean)
  if (caseIds.length === 0) {
    return NextResponse.json({ memberships: [] })
  }

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: memberships, error } = await admin
    .from('case_roles')
    .select('case_id, role, status')
    .eq('user_id', user.id)
    .in('case_id', caseIds)

  if (error) {
    console.error('[memberships] DB error:', error.message)
    return NextResponse.json({ memberships: [] })
  }

  return NextResponse.json({ memberships: memberships || [] })
}
