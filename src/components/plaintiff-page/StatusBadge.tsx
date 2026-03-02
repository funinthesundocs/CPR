const STATUS_CONFIG: Record<string, { label: string; className: string; glow: string }> = {
  pending: { label: 'PENDING REVIEW', className: 'bg-amber-500/20 text-amber-400', glow: '0 0 12px 4px rgba(245,158,11,0.45)' },
  pending_convergence: { label: 'PENDING REVIEW', className: 'bg-amber-500/20 text-amber-400', glow: '0 0 12px 4px rgba(245,158,11,0.45)' },
  admin_review: { label: 'UNDER INVESTIGATION', className: 'bg-blue-500/20 text-blue-400', glow: '0 0 12px 4px rgba(59,130,246,0.45)' },
  investigation: { label: 'UNDER INVESTIGATION', className: 'bg-blue-500/20 text-blue-400', glow: '0 0 12px 4px rgba(59,130,246,0.45)' },
  judgment: { label: 'IN JUDGMENT — VOTING OPEN', className: 'bg-orange-500/20 text-orange-400', glow: '0 0 12px 4px rgba(249,115,22,0.45)' },
  verdict: { label: 'VERDICT RENDERED', className: 'bg-green-500/20 text-green-400', glow: '0 0 12px 4px rgba(34,197,94,0.45)' },
  restitution: { label: 'RESTITUTION ORDERED', className: 'bg-purple-500/20 text-purple-400', glow: '0 0 12px 4px rgba(168,85,247,0.45)' },
}

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status]
  if (!config) return null
  return (
    <span
      className={`rounded-full px-[20px] py-[5.5px] text-[14px] font-bold uppercase tracking-widest ${config.className}`}
      style={{ boxShadow: config.glow }}
    >
      {config.label}
    </span>
  )
}
