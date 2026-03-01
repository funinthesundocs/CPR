import {
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

type PatternWarningProps = {
  otherVictims: string
  count: string | number | null
  caseTypes: string[]
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export default function PatternWarning({
  otherVictims,
  count,
  caseTypes,
}: PatternWarningProps) {
  return (
    <section className="bg-destructive/5 border-y border-destructive/20 py-10" aria-labelledby="pattern-warning-heading">
      <div className="max-w-7xl w-full mx-auto px-6 sm:px-12">
        <div className="flex items-center gap-3 mb-6">
          <ExclamationTriangleIcon
            className="h-6 w-6 text-destructive"
            aria-hidden="true"
          />
          <h2 id="pattern-warning-heading" className="text-3xl font-black uppercase tracking-tighter text-destructive">
            Recognized Pattern
          </h2>
        </div>

        {otherVictims !== 'no' && otherVictims !== '' && (
          <div className="bg-destructive/10 text-destructive text-sm px-4 py-2 mb-4 inline-flex items-center gap-2 rounded-full">
            <ShieldExclamationIcon className="h-4 w-4" aria-hidden="true" />
            <span>
              Other victims reported
              {count ? ` \u2014 approximately ${count}` : ''}
            </span>
          </div>
        )}

        {caseTypes.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
              Case involves:
            </p>
            <ul>
              {caseTypes.map((ct, i) => (
                <li key={i} className="flex items-center gap-2 text-sm py-1">
                  <CheckCircleIcon
                    className="h-4 w-4 text-destructive/70"
                    aria-hidden="true"
                  />
                  {capitalize(ct.replace(/_/g, ' '))}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
