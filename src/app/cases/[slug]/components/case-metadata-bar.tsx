import { Badge } from '@/components/ui/badge'
import { CalendarIcon, MapPinIcon, ClockIcon, UsersIcon } from '@heroicons/react/24/outline'

type CaseMetadataBarProps = {
  caseTypes: string[]
  filedDate: string
  location: string | null
  relationshipType: string
  relationshipDuration: string
}

export function CaseMetadataBar({
  caseTypes,
  filedDate,
  location,
  relationshipType,
  relationshipDuration,
}: CaseMetadataBarProps) {
  return (
    <section aria-label="Case metadata" className="border-b bg-muted/30 px-8 py-4">
      <div className="max-w-5xl mx-auto flex flex-wrap gap-6 items-start">
        {/* Group 1 — Identity: case types */}
        {caseTypes.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</p>
            <div className="flex flex-wrap gap-1.5">
              {caseTypes.map((type, i) => (
                <Badge key={i} variant="secondary" className="text-xs capitalize">
                  {type.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Group 2 — Context: filed date + location */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Filed</p>
          <div className="flex items-center gap-1.5 text-sm">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <span>{filedDate}</span>
          </div>
        </div>

        {location && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</p>
            <div className="flex items-center gap-1.5 text-sm">
              <MapPinIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span>{location}</span>
            </div>
          </div>
        )}

        {/* Group 3 — Relationship: type + duration */}
        {relationshipType && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Relationship</p>
            <div className="flex items-center gap-1.5 text-sm">
              <UsersIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="capitalize">{relationshipType.replace(/_/g, ' ')}</span>
            </div>
          </div>
        )}

        {relationshipDuration && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Duration</p>
            <div className="flex items-center gap-1.5 text-sm">
              <ClockIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span>{relationshipDuration}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
