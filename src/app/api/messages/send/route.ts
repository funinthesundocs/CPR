import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const MAX_MESSAGE_LENGTH = 2000
const RATE_LIMIT_MESSAGES = 10
const RATE_LIMIT_SECONDS = 60

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { conversation_id, content } = body

    // Validate input
    if (!conversation_id) {
      return NextResponse.json({ error: 'conversation_id is required' }, { status: 400 })
    }

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'content is required' }, { status: 400 })
    }

    const trimmedContent = content.trim()
    if (trimmedContent.length === 0) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 })
    }

    if (trimmedContent.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters` },
        { status: 400 }
      )
    }

    // Verify user is in this conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id, user_1_id, user_2_id')
      .eq('id', conversation_id)
      .single()

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    if (conversation.user_1_id !== user.id && conversation.user_2_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check rate limit: max RATE_LIMIT_MESSAGES in RATE_LIMIT_SECONDS
    const { count: recentMessageCount } = await supabase
      .from('messages')
      .select('id', { count: 'exact' })
      .eq('sender_id', user.id)
      .gte('created_at', new Date(Date.now() - RATE_LIMIT_SECONDS * 1000).toISOString())

    if ((recentMessageCount || 0) >= RATE_LIMIT_MESSAGES) {
      return NextResponse.json(
        { error: 'Too many messages. Try again in a moment.' },
        { status: 429 }
      )
    }

    // Create message
    const { data: message, error: insertError } = await supabase
      .from('messages')
      .insert({
        conversation_id,
        sender_id: user.id,
        content: trimmedContent,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting message:', insertError)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    // Fetch sender profile
    const { data: senderProfile } = await supabase
      .from('user_profiles')
      .select('display_name, avatar_url')
      .eq('id', user.id)
      .single()

    const responseMessage = {
      ...message,
      sender_display_name: senderProfile?.display_name || user.email,
      sender_avatar_url: senderProfile?.avatar_url || null,
    }

    return NextResponse.json(responseMessage)
  } catch (error) {
    console.error('Error in send POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
