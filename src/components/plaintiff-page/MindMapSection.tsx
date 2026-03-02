'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ComingSoonPlaceholder } from './ComingSoonPlaceholder'

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

interface MindMapNode {
  id: string
  label: string
  type: string
}

interface MindMapLink {
  source: string
  target: string
  label: string
}

interface MindMapData {
  nodes: MindMapNode[]
  links: MindMapLink[]
}

interface MindMapSectionProps {
  mindMapData: MindMapData | null
}

const NODE_TYPE_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  defendant: { bg: 'bg-red-900/60', border: 'border-red-500/50', text: 'text-red-300' },
  plaintiff: { bg: 'bg-[var(--accent-700)]/60', border: 'border-[var(--accent-500)]/50', text: 'text-[var(--accent-300)]' },
  victim: { bg: 'bg-orange-900/40', border: 'border-orange-500/30', text: 'text-orange-300' },
  investigator: { bg: 'bg-blue-900/40', border: 'border-blue-500/30', text: 'text-blue-300' },
  witness: { bg: 'bg-purple-900/40', border: 'border-purple-500/30', text: 'text-purple-300' },
  location: { bg: 'bg-green-900/40', border: 'border-green-500/30', text: 'text-green-300' },
  company: { bg: 'bg-slate-800/60', border: 'border-slate-500/30', text: 'text-slate-300' },
  deception: { bg: 'bg-red-950/60', border: 'border-red-600/40', text: 'text-red-400' },
  financial_impact: { bg: 'bg-amber-900/40', border: 'border-amber-500/30', text: 'text-amber-300' },
  'ex-wife': { bg: 'bg-pink-900/40', border: 'border-pink-500/30', text: 'text-pink-300' },
}

const TYPE_LABELS: Record<string, string> = {
  defendant: 'Defendant',
  plaintiff: 'Plaintiff',
  victim: 'Victim',
  investigator: 'Investigator',
  witness: 'Witness',
  location: 'Location',
  company: 'Business',
  deception: 'Deception',
  financial_impact: 'Financial Impact',
  'ex-wife': 'Ex-Partner',
}

export function MindMapSection({ mindMapData }: MindMapSectionProps) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  if (!mindMapData) return <ComingSoonPlaceholder section="Mind Map" />

  // Group nodes by type for a clean grid display
  const nodesByType = mindMapData.nodes.reduce<Record<string, MindMapNode[]>>((acc, node) => {
    if (!acc[node.type]) acc[node.type] = []
    acc[node.type].push(node)
    return acc
  }, {})

  // Order types for display
  const typeOrder = ['defendant', 'plaintiff', 'victim', 'investigator', 'witness', 'location', 'company', 'deception', 'financial_impact', 'ex-wife']
  const orderedTypes = typeOrder.filter(t => nodesByType[t])

  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className="py-16 px-6"
      ref={ref}
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-2 text-white">Case Network</h2>
        <p className="text-sm text-white/40 mb-8">
          {mindMapData.nodes.length} entities, {mindMapData.links.length} connections
        </p>

        {visible && (
          <div className="space-y-8">
            {orderedTypes.map((type) => {
              const nodes = nodesByType[type]
              const style = NODE_TYPE_STYLES[type] || { bg: 'bg-white/5', border: 'border-white/10', text: 'text-white/70' }

              return (
                <div key={type}>
                  <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 ${style.text}`}>
                    {TYPE_LABELS[type] || type}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {nodes.map((node) => {
                      const connections = mindMapData.links.filter(
                        l => l.source === node.id || l.target === node.id
                      )
                      return (
                        <div
                          key={node.id}
                          className={`${style.bg} ${style.border} border rounded-lg px-4 py-3 group relative`}
                        >
                          <span className={`text-sm font-medium ${style.text}`}>
                            {node.label}
                          </span>
                          {/* Hover tooltip showing connections */}
                          {connections.length > 0 && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-64">
                              <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 shadow-xl">
                                {connections.map((c, i) => (
                                  <p key={i} className="text-[10px] text-white/50 leading-relaxed">
                                    {c.source === node.id ? c.label : `${c.label} (from ${c.source})`}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </motion.section>
  )
}
