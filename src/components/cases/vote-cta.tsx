'use client'

import { useTranslation } from '@/i18n'
import { PermissionGate } from '@/components/auth/PermissionGate'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface VoteCTAProps {
    caseId: string
}

export function VoteCTA({ caseId }: VoteCTAProps) {
    const { t } = useTranslation()

    return (
        <PermissionGate permission="vote">
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4">
                    <div className="text-4xl">⚖️</div>
                    <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-lg font-bold">{t('voting.castYourVote')}</h3>
                        <p className="text-sm text-muted-foreground">
                            {t('voting.ctaDescription')}
                        </p>
                    </div>
                    <Link href={`/vote?case=${caseId}`}>
                        <Button size="lg" className="font-semibold">
                            🗳️ {t('voting.voteNow')}
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </PermissionGate>
    )
}
