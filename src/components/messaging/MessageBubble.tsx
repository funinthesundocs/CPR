'use client'

import { CheckIcon } from '@heroicons/react/24/outline'
import { useTranslation } from '@/i18n'

interface MessageBubbleProps {
  content: string
  senderName: string
  senderAvatar: string | null
  timestamp: string
  isCurrentUser: boolean
  isRead?: boolean
  isSending?: boolean
  sendError?: string
  onRetry?: () => void
}

export function MessageBubble({
  content,
  senderName,
  senderAvatar,
  timestamp,
  isCurrentUser,
  isRead,
  isSending,
  sendError,
  onRetry,
}: MessageBubbleProps) {
  const { t } = useTranslation()
  const date = new Date(timestamp)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const timeStr = isToday
    ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  if (isCurrentUser) {
    // Sent messages: large blue rounded bubble
    return (
      <div className="flex justify-end mb-3">
        <div className="flex flex-col items-end gap-2 max-w-2xl">
          <div className={`px-6 py-4 rounded-3xl bg-primary text-primary-foreground shadow-md ${
            isSending ? 'opacity-70' : ''
          }`}>
            <p className="text-base leading-relaxed whitespace-pre-wrap break-words">{content}</p>
          </div>
          <div className="flex items-center gap-2 px-4 text-xs text-muted-foreground">
            {isSending ? (
              <span>{t('messages.sending')}</span>
            ) : (
              <>
                <span>{timeStr}</span>
                <CheckIcon className={`h-3.5 w-3.5 ${isRead ? 'text-primary' : 'text-foreground/40'}`} />
              </>
            )}
            {sendError && (
              <button onClick={onRetry} className="text-destructive hover:text-destructive font-medium ml-1">
                {t('messages.retry')}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Received messages: no bubble, light background
  return (
    <div className="flex gap-3 mb-3 items-start">
      {senderAvatar ? (
        <img
          src={senderAvatar}
          alt={senderName}
          className="h-9 w-9 rounded-full object-cover flex-shrink-0 mt-1"
        />
      ) : (
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0 mt-1">
          {senderName.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="flex flex-col gap-1 max-w-2xl">
        <p className="text-xs font-semibold text-foreground/70">{senderName}</p>
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-foreground/90">{content}</p>
        <span className="text-xs text-muted-foreground">{timeStr}</span>
      </div>
    </div>
  )
}
