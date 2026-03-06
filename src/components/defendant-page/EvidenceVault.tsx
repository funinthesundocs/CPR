'use client'

import { useState } from 'react'
import { useTranslation } from '@/i18n'
import { motion } from 'framer-motion'
import {
  DocumentTextIcon,
  ShieldExclamationIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  LinkIcon,
} from '@heroicons/react/24/outline'
import { type EnrichedTimelineEvent } from './CaseTimeline'

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

interface EvidenceRecord {
  id: string
  title: string
  category: string
  description?: string
  file_url: string
  file_type: string
  timeline_event_id?: string | null
}

interface DeclaredItem {
  label: string
  category: string
  description: string
  file_url?: string
  file_type?: string
}

interface EvidenceVaultProps {
  evidence: EvidenceRecord[]
  evidenceInventory: DeclaredItem[]
  timelineEvents?: EnrichedTimelineEvent[]
}

function getCategoryLabels(t: (key: string) => string): Record<string, string> {
  return {
    document: t('casePage.categoryDocument'),
    photo: t('casePage.categoryPhoto'),
    video: t('casePage.categoryVideo'),
    audio: t('casePage.categoryAudio'),
    communication: t('casePage.categoryCommunications'),
    financial: t('casePage.categoryFinancial'),
    evidFinancial: t('casePage.categoryFinancialRecords'),
    evidTexts: t('casePage.categoryCommunications'),
    evidPhotos: t('casePage.categoryPhoto'),
    evidVideo: t('casePage.categoryVideo'),
    evidAudio: t('casePage.categoryAudio'),
    other: t('casePage.categoryOther'),
  }
}

type VaultItem = {
  id: string
  title: string
  category: string
  description: string
  fileUrl: string | null
  fileType: string | null
  source: 'uploaded' | 'declared'
  timelineEventId?: string | null
}

/** Check if an item has meaningful content */
function isValidItem(title: string, description: string, fileUrl: string | null): boolean {
  return !!(title?.trim() || description?.trim() || fileUrl)
}

/** Merge uploaded evidence rows + declared inventory into a unified list */
function buildVaultItems(evidence: EvidenceRecord[], inventory: DeclaredItem[]): VaultItem[] {
  const items: VaultItem[] = []

  // Uploaded evidence (from the evidence table)
  for (const e of evidence) {
    if (isValidItem(e.title, e.description || '', e.file_url)) {
      items.push({
        id: e.id,
        title: e.title,
        category: e.category,
        description: e.description || '',
        fileUrl: e.file_url,
        fileType: e.file_type,
        source: 'uploaded',
        timelineEventId: e.timeline_event_id,
      })
    }
  }

  // Declared inventory that has NO matching upload
  for (let i = 0; i < inventory.length; i++) {
    const inv = inventory[i]
    const alreadyUploaded = evidence.some(
      e => e.title === inv.label || e.file_url === inv.file_url,
    )
    if (!alreadyUploaded && isValidItem(inv.label, inv.description, inv.file_url || null)) {
      items.push({
        id: `inv-${i}`,
        title: inv.label,
        category: inv.category,
        description: inv.description,
        fileUrl: inv.file_url || null,
        fileType: inv.file_type || null,
        source: 'declared',
      })
    }
  }

  return items
}

export function EvidenceVault({ evidence, evidenceInventory, timelineEvents = [] }: EvidenceVaultProps) {
  const { t } = useTranslation()
  const CATEGORY_LABELS = getCategoryLabels(t)
  const items = buildVaultItems(evidence || [], evidenceInventory || [])
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null)
  const [opening, setOpening] = useState(false)

  // Build lookup: timeline_event_id → { index (1-based), short_title }
  const timelineLookup = new Map<string, { index: number; short_title: string }>(
    timelineEvents.map((e, i) => [e.id, { index: i + 1, short_title: e.short_title || e.description.slice(0, 30) }])
  )

  // Sort by timeline step ascending; unlinked items go to the end
  const sortedItems = [...items].sort((a, b) => {
    const ai = a.timelineEventId ? (timelineLookup.get(a.timelineEventId)?.index ?? Infinity) : Infinity
    const bi = b.timelineEventId ? (timelineLookup.get(b.timelineEventId)?.index ?? Infinity) : Infinity
    return ai - bi
  })

  const hasItems = sortedItems.length > 0

  const handleOpenEvidence = async (item: VaultItem) => {
    if (!item.fileUrl) return
    setOpening(true)
    try {
      const res = await fetch(`/api/evidence/signed-url?path=${encodeURIComponent(item.fileUrl)}`)
      const data = await res.json()
      if (data.url) {
        window.open(data.url, '_blank')
      }
    } catch (err) {
      console.error('Failed to open evidence:', err)
    } finally {
      setOpening(false)
    }
  }

  // Split into two columns
  const leftItems = sortedItems.slice(0, Math.ceil(sortedItems.length / 2))
  const rightItems = sortedItems.slice(Math.ceil(sortedItems.length / 2))

  const renderItem = (item: VaultItem) => {
    const category = CATEGORY_LABELS[item.category] || item.category
    const timelineRef = item.timelineEventId ? timelineLookup.get(item.timelineEventId) : null
    return (
      <div
        key={item.id}
        className="border border-white/10 rounded-lg p-4 flex gap-4 cursor-pointer hover:border-white/30 transition-colors"
        style={{ backgroundColor: 'oklch(0.205 0 0 / 0.8)' }}
        onClick={() => setSelectedItem(item)}
      >
        <div className="shrink-0 w-10 h-10 rounded-md bg-[var(--accent-700)]/40 flex items-center justify-center">
          {item.fileUrl ? (
            <DocumentTextIcon className="h-5 w-5 text-[var(--accent-300)]" />
          ) : (
            <ShieldExclamationIcon className="h-5 w-5 text-[var(--accent-300)]" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className="text-white font-medium" style={{ fontSize: '18px' }}>{item.title}</p>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/50" style={{ fontSize: '14px' }}>
              {category}
            </span>
            {item.fileUrl && (
              <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400" style={{ fontSize: '12px' }}>
                {t('casePage.uploaded')}
              </span>
            )}
            {timelineRef && (
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-[var(--accent-500)]/40 bg-[var(--accent-700)]/20 text-[var(--accent-300)]"
                style={{ fontSize: '12px' }}
              >
                <LinkIcon className="h-3 w-3 shrink-0" />
                #{timelineRef.index} — {timelineRef.short_title.toUpperCase()}
              </span>
            )}
          </div>
          {item.description && (
            <p className="text-white/50 leading-relaxed line-clamp-2" style={{ fontSize: '16px' }}>{item.description}</p>
          )}
        </div>
      </div>
    )
  }

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
      <div className="absolute inset-0 z-0 bg-black/70" />

      <div className="relative z-10 max-w-[1340px] mx-auto">
        <h2 className="text-[38px] font-semibold text-white mb-2 text-center">{t('casePage.evidenceVault')}</h2>

        {hasItems && (
          <div>
            <h3 className="font-bold uppercase tracking-widest text-[var(--accent-300)] mb-8 text-center" style={{ fontSize: '18px' }}>
              {sortedItems.filter(i => i.fileUrl).length} {t('casePage.filed_')} &middot; {sortedItems.filter(i => !i.fileUrl).length} {t('casePage.declared')}
            </h3>
            <div className="flex gap-8">
              {/* Left column */}
              <div className="flex-1 space-y-3">
                {leftItems.map(renderItem)}
              </div>

              {sortedItems.length > 1 && <div className="w-px bg-white" />}

              {/* Right column */}
              <div className="flex-1 space-y-3">
                {rightItems.map(renderItem)}
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!hasItems && (
          <div className="border border-white/10 rounded-xl p-12 text-center bg-white/5">
            <ShieldExclamationIcon className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <p className="text-sm text-white/40">
              {t('casePage.noEvidence')}
            </p>
          </div>
        )}
      </div>

      {/* Evidence Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setSelectedItem(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#0a0a0a] border border-white/20 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <p style={{ fontSize: '14px' }} className="text-[var(--accent-300)] uppercase tracking-widest">
                      {CATEGORY_LABELS[selectedItem.category] || selectedItem.category}
                    </p>
                    {selectedItem.timelineEventId && timelineLookup.get(selectedItem.timelineEventId) && (() => {
                      const ref = timelineLookup.get(selectedItem.timelineEventId!)!
                      return (
                        <span
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-[var(--accent-500)]/40 bg-[var(--accent-700)]/20 text-[var(--accent-300)]"
                          style={{ fontSize: '12px' }}
                        >
                          <LinkIcon className="h-3 w-3 shrink-0" />
                          #{ref.index} — {ref.short_title.toUpperCase()}
                        </span>
                      )
                    })()}
                  </div>
                  <h3 style={{ fontSize: '24px' }} className="text-white font-semibold">
                    {selectedItem.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {selectedItem.description && (
                <div className="mb-6 pb-6 border-b border-white/10">
                  <p className="text-white/70 leading-relaxed" style={{ fontSize: '16px' }}>
                    {selectedItem.description}
                  </p>
                </div>
              )}

              {selectedItem.fileUrl ? (
                <button
                  onClick={() => handleOpenEvidence(selectedItem)}
                  disabled={opening}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[var(--accent-500)] text-white rounded-lg font-medium hover:bg-[var(--accent-600)] transition-colors disabled:opacity-50"
                >
                  <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                  {opening ? t('casePage.opening') : t('casePage.openEvidence')}
                </button>
              ) : (
                <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
                  <p className="text-white/40 text-sm">
                    {t('casePage.declaredNotUploaded')}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </motion.section>
  )
}
