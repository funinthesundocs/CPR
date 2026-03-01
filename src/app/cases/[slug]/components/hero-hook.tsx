import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

type HeroHookProps = {
  caseNumber: string
  status: string
  defendant: { full_name: string; slug: string; photo_url: string | null; location: string | null }
  summary: string
  financialTotal: number
  evidenceCount: number
  witnessCount: number
  timelineCount: number
  visibility: string
  isOngoing: boolean
  verdict: { verdict: string; average_guilt_score: number | null; total_votes: number; total_restitution_awarded: number } | null
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  pending_convergence: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  admin_review: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  investigation: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  judgment: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  verdict_guilty: 'bg-red-500/10 text-red-700 dark:text-red-400',
  verdict_innocent: 'bg-green-500/10 text-green-600 dark:text-green-400',
  restitution: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  resolved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  draft: 'bg-muted text-muted-foreground',
}

function StatBlock({ label, value, dominant }: { label: string; value: string; dominant?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 text-center ${dominant ? 'border-primary/20 bg-primary/5' : 'bg-card/50'}`}>
      <p className={`font-bold ${dominant ? 'text-3xl' : 'text-xl'}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  )
}

export function HeroHook({
  caseNumber,
  status,
  defendant,
  summary,
  financialTotal,
  evidenceCount,
  witnessCount,
  timelineCount,
  visibility,
  isOngoing,
  verdict,
}: HeroHookProps) {
  return (
    <section aria-labelledby="hero-heading" className="rounded-2xl border bg-gradient-to-br from-card via-card to-muted/30 p-8">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Defendant avatar */}
        <Link href={`/defendants/${defendant.slug}`}>
          {defendant.photo_url ? (
            <img
              src={defendant.photo_url}
              alt={defendant.full_name}
              className="h-20 w-20 rounded-2xl object-cover ring-4 ring-border shadow-lg hover:ring-primary/50 transition-all"
            />
          ) : (
            <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground ring-4 ring-border shadow-lg hover:ring-primary/50 transition-all">
              {defendant.full_name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
        </Link>

        <div className="flex-1 space-y-2">
          {/* Top row: case number + status + visibility badges */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-mono text-lg font-bold">{caseNumber}</span>
            <Badge variant="outline" className={`capitalize ${statusColors[status] || ''}`}>
              {status.replace(/_/g, ' ')}
            </Badge>
            {visibility && visibility !== 'open' && (
              <Badge variant="outline" className="text-xs capitalize">
                {visibility}
              </Badge>
            )}
          </div>

          {/* h1 headline */}
          <h1 id="hero-heading" className="text-3xl font-extrabold tracking-tight">
            vs.{' '}
            <Link href={`/defendants/${defendant.slug}`} className="hover:text-primary transition-colors">
              {defendant.full_name || 'Unknown'}
            </Link>
          </h1>

          {/* One-line summary */}
          {summary && (
            <p className="text-base text-muted-foreground italic leading-snug">
              &ldquo;{summary}&rdquo;
            </p>
          )}

          {/* Ongoing warning */}
          {isOngoing && (
            <div className="flex items-center gap-1.5">
              <ExclamationTriangleIcon className="h-4 w-4 text-destructive" aria-hidden="true" />
              <Badge variant="destructive" className="text-xs">Ongoing</Badge>
            </div>
          )}
        </div>
      </div>

      {/* Stat bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <StatBlock label="Damages Claimed" value={`$${financialTotal.toLocaleString()}`} dominant />
        <StatBlock label="Evidence Items" value={evidenceCount.toString()} />
        <StatBlock label="Witnesses" value={witnessCount.toString()} />
        <StatBlock label="Timeline Events" value={timelineCount.toString()} />
      </div>

      {/* Verdict banner (inside hero, below stats) */}
      {verdict && (
        <div className={`rounded-xl p-6 text-center space-y-2 border-2 mt-6 ${
          verdict.verdict === 'guilty'
            ? 'bg-red-500/5 border-red-500/30'
            : 'bg-green-500/5 border-green-500/30'
        }`}>
          <p className="text-3xl font-extrabold uppercase tracking-wider">
            {verdict.verdict === 'guilty' ? 'GUILTY' : 'INNOCENT'}
          </p>
          <p className="text-lg font-bold">
            Average Score: {verdict.average_guilt_score?.toFixed(1)}/10
            <span className="text-muted-foreground font-normal ml-2">({verdict.total_votes} votes)</span>
          </p>
          {verdict.total_restitution_awarded > 0 && (
            <p className="text-base font-medium text-muted-foreground">
              Restitution Awarded: ${verdict.total_restitution_awarded.toLocaleString()}
            </p>
          )}
        </div>
      )}
    </section>
  )
}
