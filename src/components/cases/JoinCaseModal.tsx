'use client'

import { useState } from 'react'
import {
  ScaleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
  XMarkIcon,
  CheckCircleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { useTranslation } from '@/i18n'

const VALID_ROLES = [
  'jury_member',
  'witness',
  'expert_witness',
  'investigator',
  'attorney',
  'law_enforcement',
] as const
type JoinRole = (typeof VALID_ROLES)[number]

const ROLE_CONFIG: Array<{
  role: JoinRole
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  labelKey: string
  descKey: string
  available: boolean
}> = [
  {
    role: 'jury_member',
    icon: ScaleIcon,
    labelKey: 'join.roleJury',
    descKey: 'join.roleJuryDesc',
    available: true,
  },
  {
    role: 'witness',
    icon: EyeIcon,
    labelKey: 'join.roleWitness',
    descKey: 'join.roleWitnessDesc',
    available: false,
  },
  {
    role: 'investigator',
    icon: MagnifyingGlassIcon,
    labelKey: 'join.roleInvestigator',
    descKey: 'join.roleInvestigatorDesc',
    available: false,
  },
  {
    role: 'expert_witness',
    icon: AcademicCapIcon,
    labelKey: 'join.roleExpert',
    descKey: 'join.roleExpertDesc',
    available: false,
  },
  {
    role: 'attorney',
    icon: BriefcaseIcon,
    labelKey: 'join.roleAttorney',
    descKey: 'join.roleAttorneyDesc',
    available: false,
  },
  {
    role: 'law_enforcement',
    icon: ShieldCheckIcon,
    labelKey: 'join.roleLawEnforcement',
    descKey: 'join.roleLawEnforcementDesc',
    available: false,
  },
]

type ModalView = 'auth-prompt' | 'role-select' | 'confirming' | 'success' | 'error'

interface JoinCaseModalProps {
  caseNumber: string
  plaintiffName: string
  defendantName: string
  isAuthenticated: boolean
  preselectedRole?: string | null
  loginUrl: string
  onClose: () => void
  onJoined: (caseNumber: string, role: string) => void
}

export function JoinCaseModal({
  caseNumber,
  plaintiffName,
  defendantName,
  isAuthenticated,
  preselectedRole,
  loginUrl,
  onClose,
  onJoined,
}: JoinCaseModalProps) {
  const { t } = useTranslation()

  const validPreselected =
    preselectedRole && (VALID_ROLES as readonly string[]).includes(preselectedRole)
      ? (preselectedRole as JoinRole)
      : null

  const [view, setView] = useState<ModalView>(
    isAuthenticated ? 'role-select' : 'auth-prompt'
  )
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [confirmedRole, setConfirmedRole] = useState<string | null>(null)

  const handleJoin = async (role: JoinRole) => {
    setView('confirming')
    setErrorMsg(null)

    try {
      const res = await fetch(`/api/cases/join/${caseNumber}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || t('common.error'))
        setView('error')
        return
      }

      setConfirmedRole(role)
      onJoined(caseNumber, role)
      setView('success')
    } catch {
      setErrorMsg(t('common.error'))
      setView('error')
    }
  }

  const roleLabel = (role: string) =>
    ROLE_CONFIG.find(r => r.role === role)
      ? t(ROLE_CONFIG.find(r => r.role === role)!.labelKey)
      : role.replace(/_/g, ' ')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md bg-card border rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b">
          <div className="min-w-0 pr-3">
            <p className="text-xs text-muted-foreground font-mono tracking-wider">{caseNumber}</p>
            <h2 className="text-sm font-semibold truncate mt-0.5">
              {plaintiffName} {t('common.vs')} {defendantName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1.5 rounded-md bg-muted/50 text-foreground/80 hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">

          {/* ── Auth Prompt ── */}
          {view === 'auth-prompt' && (
            <div className="space-y-5">
              <div className="text-center space-y-2 py-2">
                <UserGroupIcon
                  className="h-12 w-12 mx-auto"
                  style={{ color: 'hsl(var(--primary))' }}
                />
                <h3 className="text-xl font-bold">{t('join.authTitle')}</h3>
                <p className="text-sm text-muted-foreground">{t('join.authSubtitle')}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`${loginUrl}&mode=login`}
                  className="flex items-center justify-center px-4 py-3 rounded-lg text-sm font-semibold transition-colors bg-muted/50 text-foreground/80 hover:bg-primary hover:text-primary-foreground"
                >
                  {t('common.login')}
                </a>
                <a
                  href={`${loginUrl}&mode=signup`}
                  className="flex items-center justify-center px-4 py-3 rounded-lg text-sm font-semibold transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {t('join.createAccount')}
                </a>
              </div>
              <p className="text-xs text-center text-muted-foreground">{t('join.authFree')}</p>
            </div>
          )}

          {/* ── Role Selection ── */}
          {view === 'role-select' && (
            <div className="space-y-3">
              <div>
                <h3 className="text-base font-semibold">{t('join.selectRole')}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{t('join.selectRoleDesc')}</p>
              </div>
              <div className="space-y-1.5">
                {ROLE_CONFIG.map(({ role, icon: Icon, labelKey, descKey, available }) => {
                  const isPreselected = validPreselected === role
                  return (
                    <button
                      key={role}
                      onClick={() => available ? handleJoin(role) : undefined}
                      disabled={!available}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all border ${
                        available
                          ? isPreselected
                            ? 'border-primary/40 bg-primary/10 hover:bg-primary/15 cursor-pointer'
                            : 'border-transparent bg-muted/30 hover:bg-primary/10 hover:border-primary/20 cursor-pointer'
                          : 'border-transparent bg-muted/20 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <Icon
                        className="h-5 w-5 mt-0.5 flex-shrink-0"
                        style={available ? { color: 'hsl(var(--primary))' } : undefined}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{t(labelKey)}</span>
                          {!available && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted/50 text-foreground/60 leading-none">
                              {t('join.comingSoon')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          {t(descKey)}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Confirming ── */}
          {view === 'confirming' && (
            <div className="py-10 text-center space-y-3">
              <div className="h-10 w-10 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">{t('join.joining')}</p>
            </div>
          )}

          {/* ── Success ── */}
          {view === 'success' && (
            <div className="py-6 text-center space-y-4">
              <CheckCircleIcon
                className="h-14 w-14 mx-auto"
                style={{ color: 'hsl(var(--primary))' }}
              />
              <div className="space-y-1">
                <h3 className="text-lg font-bold">{t('join.successTitle')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('join.successDesc')
                    .replace('{role}', confirmedRole ? roleLabel(confirmedRole) : '')
                    .replace('{case}', caseNumber)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {t('join.done')}
              </button>
            </div>
          )}

          {/* ── Error ── */}
          {view === 'error' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
                <p className="text-sm text-destructive">{errorMsg}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setErrorMsg(null); setView('role-select') }}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold bg-muted/50 text-foreground/80 hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {t('common.back')}
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold bg-muted/50 text-foreground/80 hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
