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
  const hasSupportingFields = whenRealized || howConfirmed || emotionalImpact || physicalImpact

  return (
    <section className="w-full bg-primary/5 border-y border-primary/20 py-16">
      <div className="max-w-2xl mx-auto px-6 space-y-10">
        {pullQuote && (
          <blockquote className="relative" cite="plaintiff">
            <ChatBubbleLeftRightIcon
              className="h-8 w-8 text-primary/20 mb-4"
              aria-hidden="true"
            />
            <span
              className="text-6xl font-serif text-primary/30 leading-none select-none mb-2 block"
              aria-hidden="true"
            >
              &ldquo;
            </span>
            <p className="text-xl md:text-2xl italic font-medium leading-relaxed text-foreground">
              &ldquo;{pullQuote}&rdquo;
            </p>
            <footer className="mt-4 text-sm text-muted-foreground">
              &mdash; Plaintiff testimony
            </footer>
          </blockquote>
        )}

        {pullQuote && hasSupportingFields && <hr className="border-border/50" />}

        {hasSupportingFields && (
          <div className="space-y-6">
            <SupportingField label="When the Truth Emerged" value={whenRealized} />
            <SupportingField label="How It Was Confirmed" value={howConfirmed} />
            <SupportingField label="Psychological & Emotional Effects" value={emotionalImpact} />
            <SupportingField label="Physical Impact" value={physicalImpact} />
          </div>
        )}
      </div>
    </section>
  )
}
