'use client'

import { useState } from 'react'
import {
  ScaleIcon,
  ShieldCheckIcon,
  BuildingLibraryIcon,
  ChevronDownIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

type LegalInfo = {
  policeReport: string
  lawyer: string
  courtCase: string
  details: string
  whyFiling: string
}

type DefendantResponse = {
  id: string
  subject_heading?: string
  body_html?: string
  created_at: string
}

type ResolutionSectionProps = {
  legal: LegalInfo
  nominalDamages: number
  responses: DefendantResponse[] | null
}

const LEGAL_BADGES: {
  key: keyof Pick<LegalInfo, 'policeReport' | 'lawyer' | 'courtCase'>
  label: string
  Icon: React.ElementType
}[] = [
  { key: 'policeReport', label: 'Police Report', Icon: ShieldCheckIcon },
  { key: 'lawyer', label: 'Legal Counsel', Icon: ScaleIcon },
  { key: 'courtCase', label: 'Court Case', Icon: BuildingLibraryIcon },
]

export default function ResolutionSection({
  legal,
  nominalDamages,
  responses,
}: ResolutionSectionProps) {
  const [detailsOpen, setDetailsOpen] = useState(false)

  return (
    <section className="bg-gradient-to-br from-card via-card to-muted/30 border-t py-12" aria-labelledby="resolution-heading">
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        <h2 id="resolution-heading" className="text-xl font-bold mb-6">Legal Status &amp; Resolution</h2>

        {/* Legal action badges */}
        <div className="flex flex-wrap gap-2">
          {LEGAL_BADGES.map(({ key, label, Icon }) => {
            const value = legal[key]
            if (!value || value === 'no') return null
            return (
              <Badge
                key={key}
                variant="outline"
                className="flex items-center gap-1.5 text-xs px-3 py-1.5"
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {label}: {value.replace(/_/g, ' ')}
              </Badge>
            )
          })}
        </div>

        {/* Nominal damages */}
        {nominalDamages > 0 && (
          <div className="bg-muted/50 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Nominal Damages Claimed</p>
              <p className="text-xs text-muted-foreground">
                Amount the jury votes to award
              </p>
            </div>
            <p className="text-2xl font-bold">
              ${nominalDamages.toLocaleString()}
            </p>
          </div>
        )}

        {/* Legal details (collapsible) */}
        {legal.details && (
          <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-2 text-sm text-muted-foreground">
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform ${detailsOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
                Legal Details
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <p className="text-sm leading-relaxed text-muted-foreground mt-3">
                {legal.details}
              </p>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Why filing */}
        {legal.whyFiling && (
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Why Filing on the Public Record
            </p>
            <p className="text-sm leading-relaxed italic border-l-2 border-primary/30 pl-4">
              {legal.whyFiling}
            </p>
          </div>
        )}

        {/* Defendant response - Right of Reply */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold">Right of Reply</h3>
            <UserIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </div>
          <p className="text-xs text-muted-foreground">
            The defendant may respond to any claims. Responses are published
            unedited.
          </p>

          {!responses || responses.length === 0 ? (
            <div className="rounded border border-dashed p-6 text-center text-sm text-muted-foreground">
              No defendant response filed.
            </div>
          ) : (
            <div className="space-y-4">
              {responses.map((r) => (
                <div
                  key={r.id}
                  className="rounded-lg border-dashed border border-amber-500/30 bg-amber-500/5 p-4 space-y-2"
                >
                  {r.subject_heading && (
                    <p className="font-semibold text-sm">{r.subject_heading}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  {r.body_html && (
                    <div
                      className="prose prose-sm dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: r.body_html }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
