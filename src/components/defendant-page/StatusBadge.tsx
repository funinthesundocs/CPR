'use client'

import { useTranslation } from '@/i18n'

const STATUS_CONFIG: Record<string, { labelKey: string; className: string; glow: string }> = {
  pending: { labelKey: 'casePage.statusPending', className: 'bg-amber-500/20 text-amber-400', glow: '0 0 12px 4px rgba(245,158,11,0.45)' },
  pending_convergence: { labelKey: 'casePage.statusPending', className: 'bg-amber-500/20 text-amber-400', glow: '0 0 12px 4px rgba(245,158,11,0.45)' },
  admin_review: { labelKey: 'casePage.statusInvestigation', className: 'bg-blue-500/20 text-blue-400', glow: '0 0 12px 4px rgba(59,130,246,0.45)' },
  investigation: { labelKey: 'casePage.statusInvestigation', className: 'bg-blue-500/20 text-blue-400', glow: '0 0 12px 4px rgba(59,130,246,0.45)' },
  judgment: { labelKey: 'casePage.statusJudgment', className: 'bg-orange-500/20 text-orange-400', glow: '0 0 12px 4px rgba(249,115,22,0.45)' },
  verdict: { labelKey: 'casePage.statusVerdict', className: 'bg-green-500/20 text-green-400', glow: '0 0 12px 4px rgba(34,197,94,0.45)' },
  restitution: { labelKey: 'casePage.statusRestitution', className: 'bg-purple-500/20 text-purple-400', glow: '0 0 12px 4px rgba(168,85,247,0.45)' },
}

export function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation()
  const config = STATUS_CONFIG[status]
  if (!config) return null
  return (
    <span
      className={`rounded-full px-[20px] py-[5.5px] text-[14px] font-bold uppercase tracking-widest ${config.className}`}
      style={{ boxShadow: config.glow }}
    >
      {t(config.labelKey)}
    </span>
  )
}
