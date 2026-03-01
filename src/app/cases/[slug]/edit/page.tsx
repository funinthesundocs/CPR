import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { CasePlaintiffForm } from '@/components/cases/CasePlaintiffForm'

export const revalidate = 0

type PageProps = {
    params: Promise<{ slug: string }>
}

const EDITABLE_STATUSES = ['draft', 'pending', 'pending_convergence', 'admin_review', 'investigation']

export default async function EditCasePage({ params }: PageProps) {
    const { slug } = await params
    const supabase = await createClient()

    // 1. Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // 2. Load case with defendant
    const { data: caseData, error } = await supabase
        .from('cases')
        .select('*, defendants(*)')
        .eq('case_number', slug)
        .single()

    if (error || !caseData) notFound()

    // 3. Ownership check
    if (caseData.plaintiff_id !== user.id) notFound()

    // 4. Status gate — show locked message for non-editable statuses
    if (!EDITABLE_STATUSES.includes(caseData.status)) {
        return (
            <div className="max-w-2xl mx-auto px-6 py-24 text-center space-y-4">
                <h1 className="text-2xl font-bold">Case Locked</h1>
                <p className="text-muted-foreground">
                    This case is currently in <strong className="capitalize">{caseData.status.replace(/_/g, ' ')}</strong> status
                    and can no longer be edited.
                </p>
                <a
                    href={`/cases/${slug}`}
                    className="inline-block mt-4 text-sm text-primary underline underline-offset-4"
                >
                    View case &rarr;
                </a>
            </div>
        )
    }

    // 5. Load all related data in parallel
    const [
        { data: financialImpacts },
        { data: timelineEvents },
        { data: witnesses },
    ] = await Promise.all([
        supabase.from('financial_impacts').select('*').eq('case_id', caseData.id).maybeSingle(),
        supabase.from('timeline_events').select('*').eq('case_id', caseData.id).order('sort_order'),
        supabase.from('witnesses').select('*').eq('case_id', caseData.id),
    ])

    return (
        <CasePlaintiffForm
            editMode={{
                caseId: caseData.id,
                caseNumber: caseData.case_number,
                existingData: {
                    caseData,
                    financialImpacts: financialImpacts ?? null,
                    timelineEvents: timelineEvents ?? [],
                    witnesses: witnesses ?? [],
                },
            }}
        />
    )
}
