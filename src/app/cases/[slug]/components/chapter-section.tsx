import React from 'react'

type ChapterSectionProps = {
  title: string
  bg?: string
  children: React.ReactNode
}

export function ChapterSection({ title, bg = 'bg-background', children }: ChapterSectionProps) {
  return (
    <section className={bg}>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="w-12 h-0.5 bg-primary/40 mb-4" />
        <h2 className="text-xl font-bold tracking-tight text-foreground mb-6">
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
