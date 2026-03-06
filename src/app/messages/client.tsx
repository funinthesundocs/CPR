'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ConversationCard } from '@/components/messaging/ConversationCard'
import { ConversationDetail } from '@/components/messaging/ConversationDetail'

interface Conversation {
  id: string
  other_user_id: string
  other_user_display_name: string
  other_user_avatar_url: string | null
  last_message_at: string | null
  last_message_preview: string
  unread_count: number
}

export function MessagesPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [conversationsLoading, setConversationsLoading] = useState(true)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [selectedOtherUser, setSelectedOtherUser] = useState<Conversation | null>(null)
  const [conversationError, setConversationError] = useState<string | null>(null)

  const targetUserId = searchParams.get('user_id')
  const [mobileShowDetail, setMobileShowDetail] = useState(false)

  // Check auth
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) {
          router.push(`/login?next=/messages${targetUserId ? `?user_id=${targetUserId}` : ''}`)
          return
        }
        setCurrentUser({ id: user.id })
        setAuthLoading(false)
      } catch (err) {
        setAuthError('Failed to verify authentication')
        setAuthLoading(false)
      }
    }

    checkAuth()
  }, [router, supabase, targetUserId])

  // Handle user_id query param: create or fetch conversation
  useEffect(() => {
    console.log('targetUserId:', targetUserId, 'currentUser:', currentUser?.id)

    if (!currentUser || !targetUserId) {
      console.log('Skipping: targetUserId or currentUser missing')
      return
    }

    const getOrCreateConversation = async () => {
      try {
        console.log('Creating/fetching conversation with:', targetUserId)

        const response = await fetch('/api/messages/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ other_user_id: targetUserId }),
        })

        console.log('Conversation response status:', response.status)

        if (!response.ok) {
          const errorData = await response.json()
          console.error('Conversation error:', errorData)
          throw new Error(errorData.error || 'Failed to create conversation')
        }

        const conversation = await response.json()
        console.log('Conversation created/fetched:', conversation)

        setSelectedConversationId(conversation.id)
        setMobileShowDetail(true)
        setConversationError(null)

        // Remove query param
        router.push('/messages')
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to create conversation'
        console.error('Error creating conversation:', errorMsg)
        setConversationError(errorMsg)
      }
    }

    getOrCreateConversation()
  }, [currentUser, targetUserId, router])

  // Fetch conversations
  useEffect(() => {
    if (!currentUser) return

    const fetchConversations = async () => {
      try {
        setConversationsLoading(true)
        const response = await fetch('/api/messages/conversations')
        if (!response.ok) throw new Error('Failed to fetch conversations')

        const data = await response.json()
        setConversations(data)
        setConversationsLoading(false)
      } catch (err) {
        console.error('Error fetching conversations:', err)
        setConversationsLoading(false)
      }
    }

    fetchConversations()

    // Subscribe to conversation updates
    const channel = supabase
      .channel(`conversations:${currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
        },
        () => {
          // Refetch conversations on any update
          fetchConversations()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [currentUser, supabase])

  // Loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (authError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-2xl font-bold mb-2">Session Error</h1>
        <p className="text-muted-foreground">{authError}</p>
      </div>
    )
  }

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId)

  return (
    <div className="w-full h-[calc(100vh-140px)] flex gap-6">
      {/* Sidebar — Conversations List */}
      <div
        className={`flex flex-col gap-4 ${
          mobileShowDetail ? 'hidden md:flex' : 'flex'
        } md:flex w-full md:w-96 flex-shrink-0 border-r border-border/50 pr-6`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 pt-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              💬
            </div>
            <h1 className="text-2xl font-bold">My Chats</h1>
          </div>
          <button
            onClick={() => router.push('/profile')}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-muted/50 text-foreground/80 hover:bg-primary hover:text-primary-foreground transition-colors flex-shrink-0"
          >
            Back to Profile
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-4 py-2.5 rounded-full border border-border/50 bg-secondary/30 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border/50">
          <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Past</button>
          <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Archived</button>
          <button className="px-4 py-2 text-sm font-medium text-foreground border-b-2 border-primary transition-colors">
            Current <span className="ml-1 inline-block h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">12</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3">
          {conversationsLoading ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              Loading conversations...
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              No conversations yet. Start a new message!
            </div>
          ) : (
            conversations.map((conv) => (
              <ConversationCard
                key={conv.id}
                id={conv.id}
                otherUserName={conv.other_user_display_name}
                otherUserAvatar={conv.other_user_avatar_url}
                lastMessagePreview={conv.last_message_preview}
                lastMessageAt={conv.last_message_at}
                unreadCount={conv.unread_count}
                isSelected={selectedConversationId === conv.id}
                onClick={() => {
                  setSelectedConversationId(conv.id)
                  setSelectedOtherUser(conv)
                  setMobileShowDetail(true)
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* Main area — Conversation Detail or Empty State */}
      <div
        className={`flex-1 ${
          mobileShowDetail ? 'flex' : 'hidden md:flex'
        } flex-col min-h-0`}
      >
        {conversationError && (
          <div className="flex items-center justify-center min-h-full flex-1 text-center">
            <div className="text-destructive">
              <p className="mb-2 font-bold">Error creating conversation</p>
              <p className="text-sm">{conversationError}</p>
            </div>
          </div>
        )}

        {selectedConversation && currentUser && !conversationError ? (
          <ConversationDetail
            conversationId={selectedConversationId!}
            otherUserName={selectedConversation.other_user_display_name}
            otherUserAvatar={selectedConversation.other_user_avatar_url}
            otherUserId={selectedConversation.other_user_id}
            currentUserId={currentUser.id}
            onBack={() => setMobileShowDetail(false)}
          />
        ) : !conversationError ? (
          <div className="flex items-center justify-center min-h-full flex-1 text-center">
            <div className="text-muted-foreground">
              <p className="mb-2">Select a conversation to start messaging</p>
              <p className="text-sm">or click Message on a user profile</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
