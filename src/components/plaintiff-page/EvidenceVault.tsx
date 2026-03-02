'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { DocumentTextIcon, ShieldExclamationIcon, XMarkIcon } from '@heroicons/react/24/outline'

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

interface EvidenceItem {
  label: string
  category: string
  description: string
}

interface EvidenceVaultProps {
  evidence: any[]
  evidenceInventory: EvidenceItem[]
}

const CATEGORY_LABELS: Record<string, string> = {
  evidFinancial: 'Financial Records',
  evidTexts: 'Communications',
  evidPhotos: 'Photographs',
  evidVideo: 'Video',
  evidAudio: 'Audio',
}

export function EvidenceVault({ evidence, evidenceInventory }: EvidenceVaultProps) {
  const hasUploaded = evidence && evidence.length > 0
  const hasInventory = evidenceInventory && evidenceInventory.length > 0
  const [selectedEvidence, setSelectedEvidence] = useState<any>(null)

  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className="relative py-16 px-6 -mt-[75px] overflow-hidden"
    >
      {/* Vault background image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/evidence-vault-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 z-0 bg-black/70" />

      <div className="relative z-10 max-w-[1340px] mx-auto">
        <h2 className="text-[38px] font-semibold text-white mb-2 text-center">Evidence Vault</h2>

        {/* Show uploaded evidence if available */}
        {hasUploaded && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {evidence.map((item: any) => (
              <div key={item.id} className="border border-white/10 rounded-lg p-4" style={{ backgroundColor: 'oklch(0.205 0 0 / 0.8)' }}>
                <DocumentTextIcon className="h-8 w-8 text-[var(--accent-500)] mb-2" />
                <p className="text-xs text-white/70 font-medium">{item.title || item.file_name}</p>
              </div>
            ))}
          </div>
        )}

        {/* Show declared inventory (from case form) even if not uploaded yet */}
        {hasInventory && (
          <div>
            <h3 className="font-bold uppercase tracking-widest text-[var(--accent-300)] mb-8 text-center" style={{ fontSize: '18px' }}>
              Declared Evidence Inventory
            </h3>
            <div className="flex gap-8">
              {/* Left column */}
              <div className="flex-1 space-y-3">
                {evidenceInventory.slice(0, Math.ceil(evidenceInventory.length / 2)).map((item, i) => {
                  const category = CATEGORY_LABELS[item.category] || item.category
                  return (
                    <div
                      key={i}
                      className="border border-white/10 rounded-lg p-4 flex gap-4 cursor-pointer hover:border-white/30 transition-colors"
                      style={{ backgroundColor: 'oklch(0.205 0 0 / 0.8)' }}
                      onClick={() => setSelectedEvidence(item)}
                    >
                      <div className="shrink-0 w-10 h-10 rounded-md bg-[var(--accent-700)]/40 flex items-center justify-center">
                        <ShieldExclamationIcon className="h-5 w-5 text-[var(--accent-300)]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white font-medium" style={{ fontSize: '18px' }}>{item.label}</p>
                          <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/50" style={{ fontSize: '18px' }}>
                            {category}
                          </span>
                        </div>
                        <p className="text-white/50 leading-relaxed line-clamp-2" style={{ fontSize: '18px' }}>{item.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Vertical divider */}
              <div className="w-px bg-white" />

              {/* Right column */}
              <div className="flex-1 space-y-3">
                {evidenceInventory.slice(Math.ceil(evidenceInventory.length / 2)).map((item, i) => {
                  const category = CATEGORY_LABELS[item.category] || item.category
                  return (
                    <div
                      key={i}
                      className="border border-white/10 rounded-lg p-4 flex gap-4 cursor-pointer hover:border-white/30 transition-colors"
                      style={{ backgroundColor: 'oklch(0.205 0 0 / 0.8)' }}
                      onClick={() => setSelectedEvidence(item)}
                    >
                      <div className="shrink-0 w-10 h-10 rounded-md bg-[var(--accent-700)]/40 flex items-center justify-center">
                        <ShieldExclamationIcon className="h-5 w-5 text-[var(--accent-300)]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white font-medium" style={{ fontSize: '18px' }}>{item.label}</p>
                          <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/50" style={{ fontSize: '18px' }}>
                            {category}
                          </span>
                        </div>
                        <p className="text-white/50 leading-relaxed line-clamp-2" style={{ fontSize: '18px' }}>{item.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!hasUploaded && !hasInventory && (
          <div className="border border-white/10 rounded-xl p-12 text-center bg-white/5">
            <ShieldExclamationIcon className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <p className="text-sm text-white/40">
              No evidence has been filed for this case yet.
            </p>
          </div>
        )}
      </div>

      {/* Evidence Detail Modal */}
      {selectedEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#0a0a0a] border border-white/20 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p style={{ fontSize: '18px' }} className="text-[var(--accent-300)] uppercase tracking-widest mb-2">
                    {CATEGORY_LABELS[selectedEvidence.category] || selectedEvidence.category}
                  </p>
                  <h3 style={{ fontSize: '24px' }} className="text-white font-semibold">
                    {selectedEvidence.label}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedEvidence(null)}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-6 pb-6 border-b border-white/10">
                <p className="text-white/70 leading-relaxed" style={{ fontSize: '16px' }}>
                  {selectedEvidence.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="px-4 py-3 bg-[var(--accent-500)] text-white rounded-lg font-medium hover:bg-[var(--accent-600)] transition-colors">
                  📖 Read
                </button>
                <button className="px-4 py-3 bg-[var(--accent-500)] text-white rounded-lg font-medium hover:bg-[var(--accent-600)] transition-colors">
                  🔊 Listen
                </button>
                <button className="px-4 py-3 bg-[var(--accent-500)] text-white rounded-lg font-medium hover:bg-[var(--accent-600)] transition-colors">
                  👁️ Review
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.section>
  )
}
