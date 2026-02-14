'use client'

import { CommentsSection } from '@/components/comments/comments-section'

export function CaseComments({ caseId }: { caseId: string }) {
    return <CommentsSection commentableType="case" commentableId={caseId} />
}
