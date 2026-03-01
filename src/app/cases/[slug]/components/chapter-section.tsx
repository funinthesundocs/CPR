import React from 'react'

type ChapterSectionProps = {
  title: string
  bg?: string
  children: React.ReactNode
}

export function ChapterSection({ title, bg = 'bg-background', children }: ChapterSectionProps) {
  const id = `section-${title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`
  return (
    <section className={bg} aria-labelledby={id}>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="w-12 h-0.5 bg-primary/40 mb-4" />
        <h2 id={id} className="text-xl font-bold tracking-tight text-foreground mb-6">
          {title}
        </h2>
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </section>
  )
}

export function FactBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{value}</p>
    </div>
  )
}

export function ComparisonBlock({
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
}: {
  leftLabel: string
  leftValue: string
  rightLabel: string
  rightValue: string
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border border-border/50 rounded-lg overflow-hidden">
      <div className="bg-green-500/5 p-4 sm:border-r border-b sm:border-b-0 border-border/50">
        <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wider mb-2">
          {leftLabel}
        </p>
        <p className="text-sm leading-relaxed">{leftValue}</p>
      </div>
      <div className="bg-destructive/5 p-4">
        <p className="text-xs font-semibold text-destructive uppercase tracking-wider mb-2">
          {rightLabel}
        </p>
        <p className="text-sm leading-relaxed">{rightValue}</p>
      </div>
    </div>
  )
}
