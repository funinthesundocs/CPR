'use client'

import { useState } from 'react'
import {
  EyeIcon,
  UserIcon,
  LinkIcon,
  AcademicCapIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

type Witness = {
  id: string
  full_name?: string
  name?: string
  witness_type?: string
  statement?: string
  details?: { can_verify?: string }
}

type WitnessGridProps = {
  witnesses: Witness[]
  caseRoles?: {
    role: string
    user_profiles: {
      display_name: string
      avatar_url: string | null
    } | null
  }[]
}

const WITNESS_ICONS: Record<string, React.ElementType> = {
  eyewitness: EyeIcon,
  character: UserIcon,
  corroborating: LinkIcon,
  expert: AcademicCapIcon,
  digital: ComputerDesktopIcon,
}

function WitnessCard({ witness }: { witness: Witness }) {
  const [open, setOpen] = useState(false)
  const Icon = WITNESS_ICONS[witness.witness_type ?? ''] ?? UserIcon
  const name = witness.full_name || witness.name || 'Unknown Witness'
  const canVerify = witness.details?.can_verify
  const statement = witness.statement
  const isLong = statement && statement.length > 150

  return (
    <article className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Icon className="h-4 w-4 text-muted-foreground mr-2" aria-hidden="true" />
          <span className="font-medium text-sm">{name}</span>
        </div>
        {witness.witness_type && (
          <Badge variant="outline" className="text-xs capitalize">
            {witness.witness_type.replace(/_/g, ' ')}
          </Badge>
        )}
      </div>

      {canVerify && (
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Can Verify
          </p>
          <p className="text-sm">{canVerify}</p>
        </div>
      )}

      {statement && (
        <>
          {!isLong ? (
            <p className="text-sm text-muted-foreground">{statement}</p>
          ) : (
            <Collapsible open={open} onOpenChange={setOpen}>
              {!open && (
                <p className="text-sm text-muted-foreground">
                  {statement.slice(0, 150)}...
                </p>
              )}
              <CollapsibleContent>
                <p className="text-sm text-muted-foreground">{statement}</p>
              </CollapsibleContent>
              <CollapsibleTrigger asChild>
                <button className="text-xs text-primary underline mt-1">
                  {open ? 'Hide statement' : 'Read full statement'}
                </button>
              </CollapsibleTrigger>
            </Collapsible>
          )}
        </>
      )}
    </article>
  )
}

export default function WitnessGrid({ witnesses, caseRoles }: WitnessGridProps) {
  return (
    <div className="max-w-4xl mx-auto px-6">
      <h2 className="text-lg font-bold mb-6">Witnesses &amp; Corroboration</h2>

      {caseRoles && caseRoles.length > 0 && (
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
            Case Participants
          </p>
          <div className="flex flex-wrap gap-2">
            {caseRoles.map((cr, i) => (
              <span
                key={i}
                className="bg-secondary text-secondary-foreground px-3 py-1 text-xs rounded-full"
              >
                {cr.user_profiles?.display_name ?? 'Unknown'} &mdash;{' '}
                {cr.role.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {witnesses.map((w) => (
          <WitnessCard key={w.id} witness={w} />
        ))}
      </div>
    </div>
  )
}
