'use client'

import { motion } from 'framer-motion'
import { DocumentTextIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline'

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
        <h2 className="text-[38px] font-semibold text-white mb-2">Evidence Vault</h2>
        <p className="text-white/40 mb-8" style={{ fontSize: '38px' }}>
          {hasUploaded
            ? `${evidence.length} files on record`
            : hasInventory
              ? `${evidenceInventory.length} items declared — uploads pending`
              : 'No evidence filed yet'
          }
        </p>

        {/* Show uploaded evidence if available */}
        {hasUploaded && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {evidence.map((item: any) => (
              <div key={item.id} className="border border-white/10 rounded-lg p-4" style={{ backgroundColor: 'oklch(0.205 0 0 / 0.8)' }}>
                <DocumentTextIcon className="h-8 w-8 text-[var(--accent-500)] mb-2" />
                <p className="text-white/70 font-medium" style={{ fontSize: '38px' }}>{item.title || item.file_name}</p>
              </div>
            ))}
          </div>
        )}

        {/* Show declared inventory (from case form) even if not uploaded yet */}
        {hasInventory && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--accent-300)] mb-4">
              Declared Evidence Inventory
            </h3>
            {evidenceInventory.map((item, i) => {
              const category = CATEGORY_LABELS[item.category] || item.category
              return (
                <div
                  key={i}
                  className="border border-white/10 rounded-lg p-4 flex gap-4"
                  style={{ backgroundColor: 'oklch(0.205 0 0 / 0.8)' }}
                >
                  <div className="shrink-0 w-10 h-10 rounded-md bg-[var(--accent-700)]/40 flex items-center justify-center">
                    <ShieldExclamationIcon className="h-5 w-5 text-[var(--accent-300)]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-medium" style={{ fontSize: '38px' }}>{item.label}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50">
                        {category}
                      </span>
                    </div>
                    <p className="text-white/50 leading-relaxed" style={{ fontSize: '38px' }}>{item.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Empty state */}
        {!hasUploaded && !hasInventory && (
          <div className="border border-white/10 rounded-xl p-12 text-center bg-white/5">
            <ShieldExclamationIcon className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/40" style={{ fontSize: '38px' }}>
              No evidence has been filed for this case yet.
            </p>
          </div>
        )}
      </div>
    </motion.section>
  )
}
