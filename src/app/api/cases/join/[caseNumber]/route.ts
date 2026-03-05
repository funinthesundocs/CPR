import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const VALID_ROLES = [
  'jury_member',
  'witness',
  'expert_witness',
  'investigator',
  'attorney',
  'law_enforcement',
] as const

const AUTO_APPROVED_ROLES = new Set(['jury_member'])

const JOINABLE_STATUSES = new Set([
  'admin_review',
  'investigation',
  'judgment',
  'verdict_guilty',
  'verdict_innocent',
  'restitution',
  'resolved',
  'outstanding',
])

type Params = { params: Promise<{ caseNumber: string }> }

// POST /api/cases/join/[caseNumber]
export async function POST(request: NextRequest, { params }: Params) {
  const { caseNumber } = await params

  // 1. Authenticate
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // 2. Parse and validate role
  let body: { role?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { role } = body
  if (!role || !(VALID_ROLES as readonly string[]).includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  // 3. Service-role client for all DB writes (bypasses RLS)
  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // 4. Resolve case_number → case row, verify joinable status
  const { data: caseData, error: caseError } = await admin
    .from('cases')
    .select('id, status')
    .eq('case_number', caseNumber)
    .single()

  if (caseError || !caseData) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 })
  }

  if (!JOINABLE_STATUSES.has(caseData.status)) {
    return NextResponse.json(
      { error: 'This case is not open for joining' },
      { status: 400 }
    )
  }

  // 5. Check existing membership (one role per case per user)
  const { data: existing } = await admin
    .from('case_roles')
    .select('role')
    .eq('case_id', caseData.id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      {
        error: `You are already registered as ${existing.role.replace(/_/g, ' ')} on this case`,
        code: 'already_member',
        existing_role: existing.role,
      },
      { status: 409 }
    )
  }

  // 6. Insert case_roles row
  const status = AUTO_APPROVED_ROLES.has(role) ? 'approved' : 'pending'

  const { error: insertError } = await admin
    .from('case_roles')
    .insert({
      case_id: caseData.id,
      user_id: user.id,
      role,
      status,
    })

  if (insertError) {
    console.error('[join] case_roles insert failed:', insertError.message)
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // 7. If jury_member, grant system role if not already held
  if (role === 'jury_member') {
    const { data: existingSystemRole } = await admin
      .from('user_roles')
      .select('role_id')
      .eq('user_id', user.id)
      .eq('role_id', 'jury_member')
      .maybeSingle()

    if (!existingSystemRole) {
      const { error: roleError } = await admin
        .from('user_roles')
        .insert({ user_id: user.id, role_id: 'jury_member', assigned_by: null })

      if (roleError) {
        // Non-fatal: case_roles row was created. Log and continue.
        console.error('[join] user_roles insert failed:', roleError.message)
      }
    }
  }

  return NextResponse.json({
    success: true,
    role,
    status,
    case_id: caseData.id,
  })
}
