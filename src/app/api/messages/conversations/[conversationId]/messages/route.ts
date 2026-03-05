import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await params
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    // Verify user is in this conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id, user_1_id, user_2_id')
      .eq('id', conversationId)
      .single()

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    if (conversation.user_1_id !== user.id && conversation.user_2_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get pagination params from query string
    const url = new URL(request.url)
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100)
    const offset = parseInt(url.searchParams.get('offset') || '0')

    // Fetch messages
    const { data: messages, error: messagesError, count: totalCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact' })
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)

    if (messagesError) {
      console.error('Error fetching messages:', messagesError)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    // Fetch sender profiles for each message
    const enrichedMessages = await Promise.all(
      (messages || []).map(async (msg) => {
        const { data: senderProfile } = await supabase
          .from('user_profiles')
          .select('display_name, avatar_url')
          .eq('id', msg.sender_id)
          .single()

        return {
          ...msg,
          sender_display_name: senderProfile?.display_name || 'Unknown',
          sender_avatar_url: senderProfile?.avatar_url || null,
        }
      })
    )

    return NextResponse.json({
      messages: enrichedMessages,
      total_count: totalCount,
      has_more: (totalCount || 0) > offset + limit,
    })
  } catch (error) {
    console.error('Error in messages GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
