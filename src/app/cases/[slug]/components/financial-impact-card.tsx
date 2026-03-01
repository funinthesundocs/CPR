import { BanknotesIcon } from '@heroicons/react/24/outline'

type FinancialImpactCardProps = {
  total: number
  breakdown: { label: string; amount: number }[]
}

export function FinancialImpactCard({ total, breakdown }: FinancialImpactCardProps) {
  const visibleItems = breakdown.filter((item) => item.amount > 0)

  return (
    <section className="bg-destructive/5 border-y border-destructive/20" aria-labelledby="financial-impact-heading">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center gap-2 mb-2">
          <BanknotesIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <h2 id="financial-impact-heading" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Financial Impact
          </h2>
        </div>
        <p className="text-4xl font-extrabold text-foreground">
          ${total.toLocaleString()}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Total documented losses
        </p>

        {visibleItems.length > 0 && (
          <div className="mt-8 space-y-3">
            {visibleItems.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-semibold text-foreground">
                    ${item.amount.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-destructive/60 rounded-full"
                    style={{ width: `${Math.round((item.amount / total) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
