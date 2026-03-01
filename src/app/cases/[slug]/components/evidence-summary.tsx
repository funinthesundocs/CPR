'use client'

import { useState } from 'react'
import {
  DocumentTextIcon,
  PaperClipIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline'
import { Badge } from '@/components/ui/badge'

type Evidence = {
  id: string
  label: string
  category?: string
  description?: string
  is_verified?: boolean
  file_url?: string
}

type EvidenceSummaryProps = {
  evidence: Evidence[]
}

export default function EvidenceSummary({ evidence }: EvidenceSummaryProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="max-w-4xl mx-auto px-6 mt-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DocumentTextIcon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <h2 className="text-lg font-bold">
            Evidence ({evidence.length} item{evidence.length !== 1 ? 's' : ''})
          </h2>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-primary"
        >
          {expanded ? 'Hide' : 'Show all'}
        </button>
      </div>

      {expanded && (
        <div className="mt-4">
          {evidence.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0"
            >
              {item.is_verified ? (
                <CheckBadgeIcon
                  className="h-4 w-4 text-green-600 shrink-0"
                  aria-hidden="true"
                />
              ) : (
                <PaperClipIcon
                  className="h-4 w-4 text-muted-foreground shrink-0"
                  aria-hidden="true"
                />
              )}
              <span className="text-sm flex-1">{item.label}</span>
              {item.category && (
                <Badge variant="outline" className="text-xs">
                  {item.category}
                </Badge>
              )}
              {item.is_verified && (
                <Badge className="bg-green-500/10 text-green-600 text-xs border-transparent">
                  Verified
                </Badge>
              )}
              {item.file_url && (
                <a href={item.file_url} target="_blank" rel="noopener noreferrer">
                  <Badge variant="outline" className="text-xs">
                    View
                  </Badge>
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
