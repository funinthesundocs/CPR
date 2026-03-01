'use client'

import { useState } from 'react'
import {
  ScaleIcon,
  ShieldCheckIcon,
  BuildingLibraryIcon,
  ChevronDownIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
}

type LegalInfo = {
  policeReport: string
  lawyer: string
  courtCase: string
  details: string
  whyFiling: string
}

type DefendantResponse = {
  id: string
  subject_heading?: string
  body_html?: string
  created_at: string
}

type ResolutionSectionProps = {
  legal: LegalInfo
  nominalDamages: number
  responses: DefendantResponse[] | null
}

const LEGAL_BADGES: {
  key: keyof Pick<LegalInfo, 'policeReport' | 'lawyer' | 'courtCase'>
  label: string
  Icon: React.ElementType
}[] = [
    { key: 'policeReport', label: 'Police Report', Icon: ShieldCheckIcon },
    { key: 'lawyer', label: 'Legal Counsel', Icon: ScaleIcon },
    { key: 'courtCase', label: 'Court Case', Icon: BuildingLibraryIcon },
  ]

export default function ResolutionSection({
  legal,
  nominalDamages,
  responses,
}: ResolutionSectionProps) {
  const [detailsOpen, setDetailsOpen] = useState(false)

  const activeLegalBadges = LEGAL_BADGES.filter(({ key }) => {
    const value = legal[key]
    return value && value !== 'no'
  })

  return (
    <section className="relative py-24 bg-[#080F16] overflow-hidden" aria-labelledby="resolution-heading">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#101C2B_0%,transparent_70%)] opacity-60 pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

      <div className="relative z-10 max-w-7xl w-full mx-auto px-6 sm:px-12">
        <div className="text-center mb-16">
          <div className="w-16 h-16 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20 mb-6">
            <ScaleIcon className="w-8 h-8 text-blue-400" />
          </div>
          <h2 id="resolution-heading" className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-white">Legal Status &amp; Resolution</h2>
          <p className="text-blue-200/50 mt-6 text-lg font-light w-full text-justify hyphens-auto max-w-none">The current public record and active proceedings regarding this case.</p>
        </div>

        <div className="space-y-8">

          {/* Status Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/5">
              <h3 className="text-xs font-bold text-blue-400/80 uppercase tracking-widest mb-6">Formal Actions Taken</h3>
              {activeLegalBadges.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {activeLegalBadges.map(({ key, label, Icon }) => (
                    <div key={key} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
                        <Icon className="w-4 h-4 text-blue-400" />
                      </div>
                      <span className="text-white/80 font-medium">{label}: <span className="text-white capitalize inline-flex">{legal[key]?.replace(/_/g, ' ')}</span></span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/40 italic">No formal legal actions have been taken at this time.</p>
              )}
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/5 flex flex-col justify-center">
              <h3 className="text-xs font-bold text-blue-400/80 uppercase tracking-widest mb-2">Nominal Damages Claimed</h3>
              <p className="text-4xl sm:text-5xl font-black text-white tracking-tighter shadow-black/50 drop-shadow-lg mb-2">
                ${nominalDamages.toLocaleString()}
              </p>
              <p className="text-xs text-white/40">Amount the jury votes to award via resolution</p>
            </div>
          </div>

          {/* Legal Details */}
          {(legal.details || legal.whyFiling) && (
            <div className="bg-[#050A0F] rounded-3xl p-8 border border-white/5 shadow-inner">
              {legal.whyFiling && (
                <div className="mb-8 last:mb-0">
                  <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">Why This Was Filed Publicly</h3>
                  <blockquote className="border-l-2 border-primary/40 pl-4 py-1 text-white/70 italic text-lg font-serif text-justify hyphens-auto">
                    "{legal.whyFiling}"
                  </blockquote>
                </div>
              )}

              {legal.details && (
                <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
                  <CollapsibleTrigger asChild>
                    <button className="flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest">
                      <ChevronDownIcon className={`h-4 w-4 transition-transform ${detailsOpen ? 'rotate-180' : ''}`} />
                      {detailsOpen ? 'Hide Legal Details' : 'View Full Legal Details'}
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-4 pt-4 border-t border-white/5 text-white/60 leading-relaxed font-light text-sm text-justify hyphens-auto">
                      {legal.details}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          )}

          {/* Right of Reply */}
          <div className="bg-white/5 rounded-3xl p-8 border border-white/5">
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-6">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700">
                <UserIcon className="w-5 h-5 text-zinc-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Right of Reply</h3>
                <p className="text-xs text-white/40 w-full text-justify hyphens-auto">The defendant may respond to any claims. Responses are published unedited.</p>
              </div>
            </div>

            {!responses || responses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center bg-black/20">
                <p className="text-sm text-white/30 italic">No formal response has been filed by the defendant.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {responses.map((r) => (
                  <div key={r.id} className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 shadow-inner">
                    <div className="mb-4">
                      {r.subject_heading && <p className="font-bold text-lg text-amber-50 mb-1">{r.subject_heading}</p>}
                      <p className="text-xs text-amber-500/60 uppercase tracking-widest font-bold">
                        Filed {new Date(r.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    {r.body_html && (
                      <div className="prose prose-sm prose-invert max-w-none text-amber-100/80 text-justify hyphens-auto" dangerouslySetInnerHTML={{ __html: sanitizeHtml(r.body_html) }} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
