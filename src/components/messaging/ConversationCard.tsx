'use client'

import { useTranslation } from '@/i18n'

interface ConversationCardProps {
  id: string
  otherUserName: string
  otherUserAvatar: string | null
  lastMessagePreview: string
  lastMessageAt: string | null
  unreadCount: number
  isSelected: boolean
  onClick: () => void
}

export function ConversationCard({
  id,
  otherUserName,
  otherUserAvatar,
  lastMessagePreview,
  lastMessageAt,
  unreadCount,
  isSelected,
  onClick,
}: ConversationCardProps) {
  const { t } = useTranslation()

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return t('comments.justNow')
    if (diffMins < 60) return `${diffMins}${t('comments.minutesAgo')}`
    if (diffHours < 24) return `${diffHours}${t('comments.hoursAgo')}`
    if (diffDays < 7) return `${diffDays}${t('comments.daysAgo')}`
    return date.toLocaleDateString()
  }

  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-3 rounded-xl text-left transition-all duration-150 flex gap-3 items-stretch ${
        isSelected
          ? 'bg-primary/10 border border-primary/30'
          : 'hover:bg-secondary/50 border border-transparent'
      }`}
    >
      {/* Avatar with online status */}
      <div className="flex-shrink-0">
        <div className="relative">
          {otherUserAvatar ? (
            <img
              src={otherUserAvatar}
              alt={otherUserName}
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 flex items-center justify-center font-bold text-primary text-lg">
              {otherUserName.charAt(0).toUpperCase()}
            </div>
          )}
          {/* Online status indicator */}
          <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-background" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 py-1">
        <div className="flex items-baseline justify-between gap-2 mb-2">
          <h3 className="font-semibold text-sm text-foreground truncate">
            {otherUserName}
          </h3>
          <span className="text-xs text-muted-foreground flex-shrink-0 font-medium">
            {formatTime(lastMessageAt)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground truncate line-clamp-1">
          {lastMessagePreview ? (
            <>
              <span className="text-xs">{lastMessagePreview}</span>
            </>
          ) : (
            t('messages.noMessagesYet')
          )}
        </p>
      </div>

      {/* Unread badge */}
      {unreadCount > 0 && (
        <div className="flex-shrink-0 flex items-center">
          <span className="h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        </div>
      )}
    </button>
  )
}
