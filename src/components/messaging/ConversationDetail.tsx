'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { ChevronLeftIcon, EllipsisVerticalIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'

interface Message {
  id: string
  content: string
  sender_id: string
  sender_display_name: string
  sender_avatar_url: string | null
  created_at: string
  is_read: boolean
}

interface ConversationDetailProps {
  conversationId: string
  otherUserName: string
  otherUserAvatar: string | null
  otherUserId: string
  currentUserId: string
  onBack?: () => void
}

export function ConversationDetail({
  conversationId,
  otherUserName,
  otherUserAvatar,
  otherUserId,
  currentUserId,
  onBack,
}: ConversationDetailProps) {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [menuFocusIndex, setMenuFocusIndex] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  // Menu keyboard navigation
  useEffect(() => {
    const handleMenuKeyDown = (e: KeyboardEvent) => {
      if (!showMenu) {
        if (e.key === 'Escape') {
          setShowMenu(false)
        }
        return
      }

      if (e.key === 'Escape') {
        setShowMenu(false)
        menuButtonRef.current?.focus()
        return
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setMenuFocusIndex((prev) => (prev + 1) % 3)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setMenuFocusIndex((prev) => (prev === 0 ? 2 : prev - 1))
      }
    }

    if (showMenu) {
      window.addEventListener('keydown', handleMenuKeyDown)
      return () => window.removeEventListener('keydown', handleMenuKeyDown)
    }
  }, [showMenu])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `/api/messages/conversations/${conversationId}/messages?limit=50&offset=${offset}`
        )
        if (!response.ok) throw new Error('Failed to fetch messages')

        const data = await response.json()
        setMessages(offset === 0 ? data.messages : [...messages, ...data.messages])
        setHasMore(data.has_more)
        setLoading(false)

        // Auto-scroll to bottom when new messages load
        if (offset === 0) {
          setTimeout(scrollToBottom, 100)
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load messages'
        setError(errorMsg)
        setLoading(false)
      }
    }

    fetchMessages()

    // Mark as read
    const markRead = async () => {
      await fetch(`/api/messages/conversations/${conversationId}/mark-read`, {
        method: 'PATCH',
      })
    }
    markRead()

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
          scrollToBottom()

          // Mark as read if from other user
          if ((payload.new as Message).sender_id !== currentUserId) {
            fetch(`/api/messages/conversations/${conversationId}/mark-read`, {
              method: 'PATCH',
            })
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [conversationId, offset, currentUserId, supabase])

  const handleSendMessage = async (content: string) => {
    try {
      // Optimistic update
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        content,
        sender_id: currentUserId,
        sender_display_name: 'You',
        sender_avatar_url: null,
        created_at: new Date().toISOString(),
        is_read: true,
      }
      setMessages((prev) => [...prev, optimisticMessage])
      scrollToBottom()

      // Send to server
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          content,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send message')
      }

      const sentMessage = await response.json()

      // Replace optimistic with real message
      setMessages((prev) =>
        prev.map((msg) => (msg.id === optimisticMessage.id ? sentMessage : msg))
      )
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to send message'
      throw new Error(errorMsg)
    }
  }

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border border-border/50">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border/50 bg-background">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="flex-shrink-0 p-2 -ml-2 rounded-lg transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
              aria-label="Back to conversations"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
          )}
          <div className="flex items-center gap-3 min-w-0">
            {otherUserAvatar ? (
              <img
                src={otherUserAvatar}
                alt={otherUserName}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-border"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 flex items-center justify-center font-bold text-primary">
                {otherUserName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="font-semibold text-foreground truncate">{otherUserName}</h2>
              <p className="text-xs text-muted-foreground">Last seen 7h ago</p>
            </div>
          </div>
        </div>

        {/* Header Actions Menu */}
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Conversation options"
            aria-expanded={showMenu}
          >
            <EllipsisVerticalIcon className="h-5 w-5 text-muted-foreground" />
          </button>

          {showMenu && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-lg border border-border/50 bg-card shadow-lg z-50 animate-in fade-in slide-in-from-top-1 duration-200"
              role="menu"
              onMouseLeave={() => setShowMenu(false)}
            >
              <button
                onClick={() => {
                  setShowMenu(false)
                  // TODO: Implement mute
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors first:rounded-t-lg"
                role="menuitem"
              >
                Mute conversation
              </button>
              <button
                onClick={() => {
                  setShowMenu(false)
                  // TODO: Implement block
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors"
                role="menuitem"
              >
                Block user
              </button>
              <button
                onClick={() => {
                  setShowMenu(false)
                  // TODO: Implement report
                }}
                className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-destructive/10 transition-colors last:rounded-b-lg"
                role="menuitem"
              >
                Report user
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col justify-end bg-card min-h-0">
        {loading && offset === 0 && messages.length === 0 && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-full bg-muted animate-pulse rounded max-w-xs" />
                  <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center py-8 px-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        {hasMore && messages.length > 0 && (
          <button
            onClick={() => setOffset((prev) => prev + 50)}
            className="py-3 px-4 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50 mx-auto mb-4"
          >
            ↑ Load earlier messages
          </button>
        )}

        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ChatBubbleLeftIcon className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <h3 className="font-semibold text-foreground mb-1">Say hello!</h3>
            <p className="text-xs text-muted-foreground">
              This is the beginning of your conversation with {otherUserName}
            </p>
          </div>
        )}

        {messages.map((msg, idx) => {
          const prevMsg = idx > 0 ? messages[idx - 1] : null
          const prevDate = prevMsg ? new Date(prevMsg.created_at).toDateString() : null
          const currDate = new Date(msg.created_at).toDateString()
          const showDateSeparator = !prevDate || prevDate !== currDate

          return (
            <div key={msg.id}>
              {showDateSeparator && (
                <div className="flex items-center justify-center gap-3 my-4 first:mt-0">
                  <div className="flex-1 h-px bg-border/30" />
                  <span className="text-xs font-medium text-muted-foreground px-2">
                    {currDate === new Date().toDateString()
                      ? 'Today'
                      : (() => {
                          const yesterday = new Date()
                          yesterday.setDate(yesterday.getDate() - 1)
                          return currDate === yesterday.toDateString()
                            ? 'Yesterday'
                            : new Date(msg.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: new Date().getFullYear() !== new Date(msg.created_at).getFullYear() ? 'numeric' : undefined,
                              })
                        })()}
                  </span>
                  <div className="flex-1 h-px bg-border/30" />
                </div>
              )}
              <MessageBubble
                content={msg.content}
                senderName={msg.sender_display_name}
                senderAvatar={msg.sender_avatar_url}
                timestamp={msg.created_at}
                isCurrentUser={msg.sender_id === currentUserId}
                isRead={msg.is_read}
              />
            </div>
          )
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="flex-1 flex flex-col min-h-0">
        <MessageInput onSend={handleSendMessage} disabled={loading || !!error} />
      </div>
    </div>
  )
}
