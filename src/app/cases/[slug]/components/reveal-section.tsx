import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'

type RevealSectionProps = {
  pullQuote: string
  emotionalImpact: string
  physicalImpact: string
  whenRealized: string
  howConfirmed: string
}

function SupportingField({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-sm leading-relaxed">{value}</p>
    </div>
  )
}

export function RevealSection({
  pullQuote,
  emotionalImpact,
  physicalImpact,
  whenRealized,
  howConfirmed,
}: RevealSectionProps) {
  // Use emotionalImpact as fallback headline when primary pull quote is absent
  const usedEmotionalAsQuote = !pullQuote && !!emotionalImpact
  const displayQuote = pullQuote || emotionalImpact
  const displayQuoteSource = usedEmotionalAsQuote
    ? 'Emotional impact, plaintiff testimony'
    : 'Plaintiff testimony'

  // Supporting fields: skip emotionalImpact if it was elevated to headline.
  // SupportingField handles empty string via its own `if (!value) return null` guard —
  // safe to pass any string; empty values render nothing.
  const hasSupportingFields =
    !!whenRealized ||
    !!howConfirmed ||
    (!usedEmotionalAsQuote && !!emotionalImpact) ||
    !!physicalImpact

  return (
    <section className="w-full bg-primary/5 border-y border-primary/20 py-16">
      <div className="max-w-2xl mx-auto px-6 space-y-10">
        {displayQuote && (
          <blockquote className="relative" cite="https://courtofpublicrecord.com">
            <ChatBubbleLeftRightIcon
              className="h-8 w-8 text-primary/20 mb-4"
              aria-hidden="true"
            />
            <p className="text-xl md:text-2xl italic font-medium leading-relaxed text-foreground">
              &ldquo;{displayQuote}&rdquo;
            </p>
            <footer className="mt-4 text-sm text-muted-foreground">
              &mdash; {displayQuoteSource}
            </footer>
          </blockquote>
        )}

        {displayQuote && hasSupportingFields && <hr className="border-border/50" />}

        {hasSupportingFields && (
          <div className="space-y-6">
            <SupportingField label="When the Truth Emerged" value={whenRealized} />
            <SupportingField label="How It Was Confirmed" value={howConfirmed} />
            {!usedEmotionalAsQuote && (
              <SupportingField label="Psychological & Emotional Effects" value={emotionalImpact} />
            )}
            <SupportingField label="Physical Impact" value={physicalImpact} />
          </div>
        )}
      </div>
    </section>
  )
}
