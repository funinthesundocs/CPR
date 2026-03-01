import { MapPinIcon } from '@heroicons/react/24/outline'
import { Badge } from '@/components/ui/badge'

type TimelineEvent = {
  id: string
  event_type: string
  date_or_year: string
  description: string
  city?: string | null
  country?: string | null
}

type CaseTimelineProps = {
  events: TimelineEvent[]
}

const EVENT_COLORS: Record<string, { dot: string; badge: string }> = {
  first_contact: { dot: 'bg-green-500', badge: 'bg-green-500/10 text-green-700 dark:text-green-400' },
  trust_built:   { dot: 'bg-blue-500',  badge: 'bg-blue-500/10 text-blue-700 dark:text-blue-400' },
  red_flag:      { dot: 'bg-yellow-500', badge: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400' },
  escalation:    { dot: 'bg-orange-500', badge: 'bg-orange-500/10 text-orange-700 dark:text-orange-400' },
  incident:      { dot: 'bg-red-500',    badge: 'bg-red-500/10 text-red-700 dark:text-red-400' },
  discovery:     { dot: 'bg-gray-500',   badge: 'bg-gray-500/10 text-gray-700 dark:text-gray-400' },
  aftermath:     { dot: 'bg-purple-500', badge: 'bg-purple-500/10 text-purple-700 dark:text-purple-400' },
}

const DEFAULT_COLORS = { dot: 'bg-muted-foreground', badge: 'bg-muted text-muted-foreground' }

function formatEventType(eventType: string): string {
  return eventType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function formatLocation(city?: string | null, country?: string | null): string | null {
  const parts = [city, country].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : null
}

export function CaseTimeline({ events }: CaseTimelineProps) {
  if (events.length === 0) return null

  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-8 mb-4">
        Timeline of Events
      </h3>
      <ol className="relative pl-8 space-y-6 border-l-2 border-border ml-3">
        {events.map((event) => {
          const colors = EVENT_COLORS[event.event_type] ?? DEFAULT_COLORS
          const location = formatLocation(event.city, event.country)

          return (
            <li key={event.id} className="relative">
              <div
                className={`absolute -left-[1.15rem] top-1 h-4 w-4 rounded-full border-2 border-background ${colors.dot}`}
              />
              <div>
                <div className="flex gap-3 items-center flex-wrap">
                  <Badge variant="outline" className={`text-xs capitalize ${colors.badge}`}>
                    {formatEventType(event.event_type)}
                  </Badge>
                  <span className="font-mono text-xs text-muted-foreground">
                    {event.date_or_year}
                  </span>
                </div>
                <p className="text-sm leading-relaxed mt-1">{event.description}</p>
                {location && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <MapPinIcon className="h-3 w-3" aria-hidden="true" />
                    <span>{location}</span>
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
