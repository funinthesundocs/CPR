'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

function ReadOnlyField({ label, value, tall }: { label: string; value?: string | null; tall?: boolean }) {
  if (!value) return null
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1.5 font-semibold">{label}</p>
      {tall ? (
        <div className="bg-white/5 border border-white/10 rounded-md p-4 text-sm text-white/70 leading-relaxed text-justify min-h-[80px]">
          {value}
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-md px-4 py-2.5 text-sm text-white/70">
          {value}
        </div>
      )}
    </div>
  )
}

interface TestimonyField {
  label: string
  value: string
}

interface CaseSummaryModuleProps {
  notebookSummary: string
  briefingDocContent: string
  testimonyFields: TestimonyField[]
  financialTotal: number
  caseNarratives: Record<string, any>
  evidenceInventory: { label: string; category: string; description: string }[]
  evidence: any[]
  summaryImage1Url: string
  summaryImage2Url: string
}

export function CaseSummaryModule({ notebookSummary, briefingDocContent, testimonyFields, financialTotal, caseNarratives, evidenceInventory, evidence, summaryImage1Url, summaryImage2Url }: CaseSummaryModuleProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'analysis' | 'testimony'>('analysis')

  const formattedAmount = financialTotal.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })

  return (
    <>
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="pt-[8px] pb-16 px-6"
      >
        <div className="max-w-[1340px] mx-auto bg-white/5 border border-white/10 rounded-lg p-8 pb-0">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-[38px] font-semibold text-white">Defendant Summary</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => { setActiveTab('analysis'); setModalOpen(true) }}
                className="bg-[var(--accent-500)] text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-[var(--accent-300)] transition-colors"
              >
                View Full Report
              </button>
              <button
                onClick={() => { setActiveTab('testimony'); setModalOpen(true) }}
                className="bg-white/10 text-white/80 hover:bg-[var(--accent-500)] hover:text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Original Testimony
              </button>
            </div>
          </div>

          <div className="flex gap-8 pb-8">
            {/* LEFT — Full text summary + evidence inventory */}
            <div className="flex-1 min-w-0 border-r border-white/20 pr-8">
              <div className="prose prose-invert max-w-none space-y-4 text-white/70">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h2: ({ children }) => <h2 className="text-lg font-bold text-white mt-4 mb-2 pb-2 border-b border-[var(--accent-500)]/30">{children}</h2>,
                    p: ({ children }) => <p className="text-[16px] leading-relaxed text-white/75 mb-3 text-justify">{children}</p>,
                    strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                    ul: ({ children }) => <ul className="list-none space-y-1 mb-3 pl-4">{children}</ul>,
                    li: ({ children }) => <li className="leading-relaxed text-white/75 flex gap-2 before:content-['•'] before:text-[var(--accent-500)] before:font-bold before:flex-shrink-0">{children}</li>,
                    hr: () => <hr className="border-t border-dashed border-white/20 my-4" />,
                  }}
                >
                  {notebookSummary}
                </ReactMarkdown>
              </div>

              {/* Supporting Documentation */}
              {evidenceInventory.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-bold text-white mb-3 pb-2 border-b border-[var(--accent-500)]/30">Supporting Documentation</h3>
                  <ul className="space-y-2 text-[16px] text-white/70">
                    {evidenceInventory.slice(0, 5).map((item, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-[var(--accent-500)] font-bold flex-shrink-0">•</span>
                        <span>{item.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Closing Statement */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <p className="text-[16px] text-white/60 italic leading-relaxed text-justify">
                  These files serve as a formal testimony and evidentiary record intended for a "Court of Public Record" to warn future victims.
                </p>
              </div>
            </div>

            {/* RIGHT — Both images stacked, filling full column height */}
            <div className="flex flex-col gap-8 self-stretch w-[340px] shrink-0 pl-2">
              {/* Image 1 */}
              <div className="flex-1 min-h-0 relative rounded-lg overflow-visible" style={{ perspective: '1000px' }}>
                <img
                  src={summaryImage1Url}
                  alt=""
                  className="w-full h-full object-cover rounded-lg"
                  style={{
                    transform: 'rotateZ(-1.5deg) rotateX(0.5deg)',
                    boxShadow: '0 15px 50px rgba(0,0,0,0.7), -5px 5px 15px rgba(0,0,0,0.3)',
                    filter: 'drop-shadow(-2px 2px 4px rgba(0,0,0,0.4))'
                  }}
                />
                <div className="absolute top-0 left-0 w-[74px] h-[28px] bg-gradient-to-br from-amber-100 to-amber-200" style={{ transform: 'rotateZ(-25deg) translateX(-8px) translateY(-8px)', boxShadow: '0 4px 12px rgba(0,0,0,0.4)', zIndex: 20, opacity: 0.85 }} />
                <div className="absolute top-0 right-0 w-[74px] h-[28px] bg-gradient-to-bl from-amber-100 to-amber-200" style={{ transform: 'rotateZ(25deg) translateX(8px) translateY(-8px)', boxShadow: '0 4px 12px rgba(0,0,0,0.4)', zIndex: 20, opacity: 0.85 }} />
              </div>
              {/* Image 2 */}
              <div className="flex-1 min-h-0 relative rounded-lg overflow-visible" style={{ perspective: '1000px' }}>
                <img
                  src={summaryImage2Url}
                  alt=""
                  className="w-full h-full object-cover rounded-lg"
                  style={{
                    transform: 'rotateZ(1.5deg) rotateX(0.5deg)',
                    boxShadow: '0 15px 50px rgba(0,0,0,0.7), 5px 5px 15px rgba(0,0,0,0.3)',
                    filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.4))'
                  }}
                />
                <div className="absolute top-0 left-0 w-[74px] h-[28px] bg-gradient-to-br from-amber-100 to-amber-200" style={{ transform: 'rotateZ(-25deg) translateX(-8px) translateY(-8px)', boxShadow: '0 4px 12px rgba(0,0,0,0.4)', zIndex: 20, opacity: 0.85 }} />
                <div className="absolute top-0 right-0 w-[74px] h-[28px] bg-gradient-to-bl from-amber-100 to-amber-200" style={{ transform: 'rotateZ(25deg) translateX(8px) translateY(-8px)', boxShadow: '0 4px 12px rgba(0,0,0,0.4)', zIndex: 20, opacity: 0.85 }} />
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Full-screen modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-xl w-full max-w-[1340px] max-h-[90vh] overflow-hidden flex flex-col">
            {/* Tab bar */}
            <div className="flex border-b border-white/10">
              <button
                onClick={() => setActiveTab('analysis')}
                className={`px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'analysis'
                    ? 'border-b-2 border-[var(--accent-500)] text-white'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                Detailed Analysis
              </button>
              <button
                onClick={() => setActiveTab('testimony')}
                className={`px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'testimony'
                    ? 'border-b-2 border-[var(--accent-500)] text-white'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                Original Testimony
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="ml-auto px-4 text-white/40 hover:text-white transition-colors"
                aria-label="Close"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-8 flex-1">
              {activeTab === 'analysis' && (
                <div className="space-y-4">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h2: ({ children }) => <h2 className="text-lg font-bold text-white mt-6 mb-3 pb-2 border-b border-[var(--accent-500)]/30">{children}</h2>,
                    p: ({ children }) => <p className="text-[16px] leading-relaxed text-white/75 mb-3 text-justify">{children}</p>,
                    strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                    ul: ({ children }) => <ul className="list-none space-y-1 mb-3 pl-4">{children}</ul>,
                    ol: ({ children }) => <ol className="list-none space-y-1 mb-3 pl-4">{children}</ol>,
                    li: ({ children }) => <li className="leading-relaxed text-white/75 flex gap-2 before:content-['•'] before:text-[var(--accent-500)] before:font-bold before:flex-shrink-0">{children}</li>,
                    hr: () => <hr className="border-t border-dashed border-white/20 my-4" />,
                  }}
                >
                  {briefingDocContent}
                </ReactMarkdown>
                </div>
              )}
              {activeTab === 'testimony' && (
                <div>
                  <p className="text-xs text-white/40 mb-6 italic">
                    Sacred record — exact words submitted by the plaintiff. No AI interpretation. Read-only.
                  </p>

                  {/* Horizontally scrollable step tabs */}
                  <div className="flex gap-2 overflow-x-auto pb-3 mb-8 border-b border-white/10 no-scrollbar">
                    {[
                      { id: 'step1', label: 'Accused' },
                      { id: 'step2', label: 'Connection' },
                      { id: 'step3', label: 'Trust' },
                      { id: 'step4', label: 'Incident' },
                      { id: 'step5', label: 'Timeline' },
                      { id: 'step6', label: 'Summary' },
                      { id: 'step7', label: 'Impact' },
                      { id: 'step8', label: 'Evidence' },
                      { id: 'step10', label: 'Legal' },
                    ].map(s => (
                      <a key={s.id} href={`#testimony-${s.id}`}
                        className="shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/10 text-white/60 hover:bg-[var(--accent-500)] hover:text-white transition-colors">
                        {s.label}
                      </a>
                    ))}
                  </div>

                  <div className="space-y-12">

                    {/* Step 1 — Accused */}
                    <section id="testimony-step1">
                      <h3 className="text-xs uppercase tracking-widest text-[var(--accent-300)] font-bold mb-4 pb-2 border-b border-white/10">
                        Step 1 — Identifying the Accused
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ReadOnlyField label="Full Name" value={caseNarratives.defendant_name} />
                        <ReadOnlyField label="Known Location" value={caseNarratives.defendant_location} />
                        <ReadOnlyField label="Known Aliases" value={Array.isArray(caseNarratives.defendant_aliases) ? caseNarratives.defendant_aliases.join(', ') : caseNarratives.defendant_aliases} />
                      </div>
                    </section>

                    {/* Step 2 — Connection */}
                    <section id="testimony-step2">
                      <h3 className="text-xs uppercase tracking-widest text-[var(--accent-300)] font-bold mb-4 pb-2 border-b border-white/10">
                        Step 2 — Your Connection
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <ReadOnlyField label="Relationship Type" value={caseNarratives.relationship_type} />
                        <ReadOnlyField label="Duration" value={caseNarratives.relationship_duration} />
                      </div>
                      <div className="space-y-4">
                        <ReadOnlyField label="How They Met" value={caseNarratives.first_interaction} tall />
                        <ReadOnlyField label="Early Warning Signs" value={caseNarratives.early_warnings} tall />
                      </div>
                    </section>

                    {/* Step 3 — Trust */}
                    <section id="testimony-step3">
                      <h3 className="text-xs uppercase tracking-widest text-[var(--accent-300)] font-bold mb-4 pb-2 border-b border-white/10">
                        Step 3 — Basis of Trust
                      </h3>
                      <div className="space-y-4">
                        <ReadOnlyField label="What Was Promised / Agreement Terms" value={caseNarratives.agreement_terms} tall />
                        <ReadOnlyField label="Reasonable Expectation" value={caseNarratives.reasonable_expectation} tall />
                        <ReadOnlyField label="Evidence of Trust" value={caseNarratives.evidence_of_trust} tall />
                        <ReadOnlyField label="Others Who Can Vouch" value={caseNarratives.others_vouch} tall />
                      </div>
                    </section>

                    {/* Step 4 — Incident */}
                    <section id="testimony-step4">
                      <h3 className="text-xs uppercase tracking-widest text-[var(--accent-300)] font-bold mb-4 pb-2 border-b border-white/10">
                        Step 4 — The Incident
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <ReadOnlyField label="When Realized" value={caseNarratives.when_realized} />
                        <ReadOnlyField label="Is Ongoing" value={caseNarratives.is_ongoing} />
                      </div>
                      <div className="space-y-4">
                        <ReadOnlyField label="What Happened" value={caseNarratives.what_happened} tall />
                        <ReadOnlyField label="The Turning Point" value={caseNarratives.primary_incident} tall />
                      </div>
                    </section>

                    {/* Step 5 — Summary (moved from Step 6, timeline now has dedicated section with H/V toggle) */}
                    <section id="testimony-step6">
                      <h3 className="text-xs uppercase tracking-widest text-[var(--accent-300)] font-bold mb-4 pb-2 border-b border-white/10">
                        Step 6 — Case Summary
                      </h3>
                      <div className="space-y-4">
                        <ReadOnlyField label="One-Line Summary" value={caseNarratives.one_line_summary} />
                        <ReadOnlyField label="Full Case Summary" value={caseNarratives.case_summary} tall />
                      </div>
                    </section>

                    {/* Step 7 — Impact */}
                    <section id="testimony-step7">
                      <h3 className="text-xs uppercase tracking-widest text-[var(--accent-300)] font-bold mb-4 pb-2 border-b border-white/10">
                        Step 7 — Damages & Impact
                      </h3>
                      <div className="space-y-4">
                        <ReadOnlyField label="Emotional Impact" value={caseNarratives.emotional_impact} tall />
                        <ReadOnlyField label="Physical Impact" value={caseNarratives.physical_impact} tall />
                        <ReadOnlyField label="What They Want Understood" value={caseNarratives.wish_understood} tall />
                      </div>
                    </section>

                    {/* Step 8 — Evidence */}
                    <section id="testimony-step8">
                      <h3 className="text-xs uppercase tracking-widest text-[var(--accent-300)] font-bold mb-4 pb-2 border-b border-white/10">
                        Step 8 — Evidence Inventory
                      </h3>
                      {evidenceInventory.length === 0 ? (
                        <p className="text-white/30 text-sm italic">No evidence inventory recorded.</p>
                      ) : (
                        <div className="space-y-3">
                          {evidenceInventory.map((item, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-md p-4">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-xs uppercase tracking-widest text-[var(--accent-300)] font-semibold">{item.category}</span>
                                <span className="text-sm text-white font-medium">{item.label}</span>
                              </div>
                              <p className="text-sm text-white/60 leading-relaxed">{item.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>

                    {/* Step 10 — Legal */}
                    <section id="testimony-step10">
                      <h3 className="text-xs uppercase tracking-widest text-[var(--accent-300)] font-bold mb-4 pb-2 border-b border-white/10">
                        Step 10 — Legal Actions
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <ReadOnlyField label="Police Report Filed" value={caseNarratives.police_report_filed} />
                        <ReadOnlyField label="Lawyer Consulted" value={caseNarratives.lawyer_consulted} />
                        <ReadOnlyField label="Court Case Filed" value={caseNarratives.court_case_filed} />
                        <ReadOnlyField label="Other Victims" value={caseNarratives.other_victims} />
                      </div>
                      <div className="space-y-4">
                        <ReadOnlyField label="Why Filing" value={caseNarratives.why_filing} tall />
                      </div>
                    </section>

                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
