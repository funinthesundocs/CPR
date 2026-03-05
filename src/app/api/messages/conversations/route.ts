import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    // Fetch all conversations for current user with last message preview
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select(
        `
        id,
        user_1_id,
        user_2_id,
        created_at,
        updated_at,
        last_message_at,
        last_message_by
        `
      )
      .or(`user_1_id.eq.${user.id},user_2_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false, nullsFirst: false })

    if (conversationsError) {
      console.error('Error fetching conversations:', conversationsError)
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
    }

    // For each conversation, fetch other user info and last message preview
    const enrichedConversations = await Promise.all(
      (conversations || []).map(async (conv) => {
        const otherUserId = conv.user_1_id === user.id ? conv.user_2_id : conv.user_1_id

        // Fetch other user's profile
        const { data: otherUserProfile } = await supabase
          .from('user_profiles')
          .select('id, display_name, avatar_url')
          .eq('id', otherUserId)
          .single()

        // Fetch last message for preview
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('id, content, sender_id, created_at')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        // Count unread messages
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('id', { count: 'exact' })
          .eq('conversation_id', conv.id)
          .eq('is_read', false)
          .neq('sender_id', user.id)

        return {
          id: conv.id,
          other_user_id: otherUserId,
          other_user_display_name: otherUserProfile?.display_name || 'Unknown',
          other_user_avatar_url: otherUserProfile?.avatar_url || null,
          last_message_at: conv.last_message_at,
          last_message_preview: lastMessage?.content?.substring(0, 100) || '',
          last_message_sender: conv.last_message_by || null,
          unread_count: unreadCount || 0,
        }
      })
    )

    return NextResponse.json(enrichedConversations)
  } catch (error) {
    console.error('Error in conversations GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { other_user_id } = body

    console.log('[POST /api/messages/conversations] Current user:', user.id, 'Other user:', other_user_id)

    // Validate
    if (!other_user_id) {
      return NextResponse.json({ error: 'other_user_id is required' }, { status: 400 })
    }

    if (other_user_id === user.id) {
      return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 })
    }

    // Get or create conversation using ON CONFLICT
    const user1Id = user.id < other_user_id ? user.id : other_user_id
    const user2Id = user.id > other_user_id ? user.id : other_user_id

    console.log('[POST /api/messages/conversations] Upserting conversation:', { user1Id, user2Id })

    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .upsert(
        {
          user_1_id: user1Id,
          user_2_id: user2Id,
        },
        {
          onConflict: 'user_1_id,user_2_id',
          ignoreDuplicates: false,
        }
      )
      .select('id, user_1_id, user_2_id, created_at, last_message_at, last_message_by')
      .single()

    if (convError) {
      console.error('[POST /api/messages/conversations] Error:', convError)
      return NextResponse.json({ error: `Failed to create conversation: ${convError.message}` }, { status: 500 })
    }

    console.log('[POST /api/messages/conversations] Success:', conversation.id)
    return NextResponse.json(conversation)
  } catch (error) {
    console.error('[POST /api/messages/conversations] Exception:', error)
    return NextResponse.json({ error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown'}` }, { status: 500 })
  }
}
