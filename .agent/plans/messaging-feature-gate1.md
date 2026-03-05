# Messaging Feature — Gate 1 Plan (Full End-to-End)

## Complete User Journey

### Happy Path: Alice messages Bob
1. Alice views Bob's public profile at `/users/[bob_id]`
2. Alice clicks "Message" button
3. Button checks: Is Alice logged in?
   - If NO: redirect to `/login?next=/messages?user_id=[bob_id]`
   - If YES: navigate to `/messages?user_id=[bob_id]`
4. `/messages` page loads with query param `user_id=bob_id`
5. Page checks auth (redirect if logged out)
6. Page queries: Does a conversation between Alice & Bob already exist?
   - If YES: Load that conversation
   - If NO: Create one immediately
7. Page fetches:
   - Bob's profile info (name, avatar)
   - All previous messages in conversation (paginated)
   - All other conversations for Alice's sidebar
8. UI renders:
   - Sidebar showing all Alice's conversations
   - Main panel showing Bob's conversation
   - Message input form
9. Alice types message "Hi Bob"
10. Alice clicks Send
11. Message is:
    - Optimistically rendered in UI immediately (sending state)
    - POSTed to `/api/messages/send` with conversation_id
    - Persisted to database (messages table)
    - Server broadcasts via Realtime to Bob (if online)
    - Message marked as "sent" in Alice's UI
12. Message appears in Bob's sidebar's "last message" preview when Bob opens the page (or real-time if realtime enabled)
13. Bob clicks on his conversation with Alice in his sidebar
14. Bob sees Alice's message in the conversation thread
15. Bob can reply, and same flow happens in reverse

### Edge Cases in Journey
- Alice tries to message herself: Block, show error
- Network error during send: Show retry button, keep message in optimistic state until success or explicit clear
- User logs out during messaging: Clear all data, redirect to login
- User A closes conversation, re-opens later: Show same messages (not cleared)
- Two users messaging each other simultaneously: Both see new messages real-time (OR after refresh if not realtime)

## Requirements Summary
- Auth-gated (must be logged in)
- Direct 1-to-1 messaging only (not group chats)
- Conversations persist (don't delete unless explicitly deleted)
- Messages are timestamped and immutable (v1 — no edit/delete)
- Both users see same message history
- Last message preview shown in sidebar
- Unread indicator on conversations
- Real-time or polling updates (user decision needed)

---

## Data Model

### New Table: `messages`
```
id: uuid (primary key)
conversation_id: uuid (FK to conversations table)
sender_id: uuid (FK to auth.users)
content: text
created_at: timestamp
updated_at: timestamp
is_read: boolean (default false)
```

### New Table: `conversations`
```
id: uuid (primary key)
user_1_id: uuid (FK to auth.users)
user_2_id: uuid (FK to auth.users)
created_at: timestamp
updated_at: timestamp
last_message_at: timestamp (denormalized for sorting)
last_message_by: uuid (sender of last message)
```

**RLS Policy:**
- Users can see conversations where they are user_1 or user_2
- Users can see messages in conversations they belong to
- Users can only INSERT messages to conversations they're in (verified via trigger)

---

## Routes & Components

### 1. `/messages` Page (Main Layout)
**File:** `src/app/messages/page.tsx`
**Type:** Client component with auth check
**State Management:**
```typescript
// Auth
const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null)
const [authLoading, setAuthLoading] = useState(true)
const [authError, setAuthError] = useState<string | null>(null)

// Conversations list
const [conversations, setConversations] = useState<Conversation[]>([])
const [conversationsLoading, setConversationsLoading] = useState(true)
const [conversationsError, setConversationsError] = useState<string | null>(null)

// Selected conversation
const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
const [selectedOtherUser, setSelectedOtherUser] = useState<User | null>(null)

// Query param handling
const params = useParams()
const router = useRouter()
const searchParams = useSearchParams()
const targetUserId = searchParams.get('user_id')
```

**Initialization Flow (on mount):**
1. Check auth via `supabase.auth.getUser()`
   - If error or no user: redirect to `/login?next=/messages?user_id=${targetUserId}`
   - If user exists: set currentUser, proceed
2. If targetUserId in query:
   - Call `/api/messages/conversations` (POST) to get or create conversation
   - Set selectedConversationId to that conversation
   - Remove query param (push to `/messages` without param)
3. Fetch all conversations via GET `/api/messages/conversations`
4. Subscribe to realtime `conversations` table changes (or set up polling)

**Loading States:**
- `authLoading` → show spinner, block everything else
- `authError` → show "Session expired, redirecting..." and redirect
- `conversationsLoading` → show skeleton loaders in sidebar
- No conversations → show empty state with "No conversations yet. Start a new message!"

**Render:**
- Left sidebar: ConversationsList component (passes conversations, selectedConversationId, setSelectedConversationId)
- Right panel: selectedConversationId ? ConversationDetail : EmptyState

**Auth Gate:**
```typescript
if (!currentUser) return <Redirect to="/login" />
if (authError) return <ErrorState>{authError}</ErrorState>
```

### 2. Conversation Detail Component
**File:** `src/components/messaging/ConversationDetail.tsx`
**Type:** Client component
**Props:**
```typescript
{
  conversationId: string
  otherUser: {
    id: string
    display_name: string
    avatar_url: string | null
  }
  currentUserId: string
}
```

**State:**
```typescript
const [messages, setMessages] = useState<Message[]>([])
const [messagesLoading, setMessagesLoading] = useState(true)
const [messagesError, setMessagesError] = useState<string | null>(null)
const [messageInput, setMessageInput] = useState('')
const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]) // messages sent but not confirmed
const [sendingMessageIds, setSendingMessageIds] = useState<Set<string>>(new Set()) // which optimistic messages are still sending
const [hasMoreMessages, setHasMoreMessages] = useState(true)
const [messagesOffset, setMessagesOffset] = useState(0)
```

**Initialization (when conversationId changes):**
1. Set loading state
2. Fetch messages via `GET /api/messages/conversations/${conversationId}/messages?limit=50&offset=0`
3. Subscribe to realtime `messages` table filtered to this conversationId
   - When new message arrives: add to messages list in real-time
   - If current user not sender: call `/api/messages/conversations/${conversationId}/mark-read` to mark as read
4. Auto-scroll to bottom
5. Unsubscribe on unmount or when conversationId changes

**Rendering:**
- Header: Back button (mobile), other user name + avatar, online status (if available)
- Message list: Render all messages chronologically
  - Group by sender
  - Show timestamp on each message
  - Show "sending..." state for optimistic messages
  - Show "sent" checkmark when confirmed
  - Show "failed to send" state with retry button
  - "Load older messages" button at top if hasMoreMessages
- Input area: MessageInput component

**Error Handling:**
- If fetch fails: Show "Failed to load messages. Retry?" button
- If send fails: Show "Message failed to send" with Retry/Delete buttons

### 3. Message Input Component
**File:** `src/components/messaging/MessageInput.tsx`
**Type:** Client component
**Props:**
- `conversationId: string`
- `onSend: (message: Message) => void`

**Logic:**
- Text input with send button
- POST to `/api/messages/send`
- Optimistic UI (show message immediately, revert on error)

---

## API Endpoints (Complete with Error Handling)

### 1. `POST /api/messages/conversations`
**Purpose:** Get or create conversation with specific user
**Invoked by:** /messages page when user_id query param present
**Auth:** Required
**Input:** `{ other_user_id: string }`
**Success Response:** `{ id, user_1_id, user_2_id, created_at, last_message_at }`
**Errors:** 401 (not auth), 400 (missing/invalid other_user_id, or user_id = self), 500 (db)
**Server Logic:**
- Get current user from auth
- Validate other_user_id ≠ current user
- Query for existing conversation: `WHERE (user_1_id=A AND user_2_id=B) OR (user_1_id=B AND user_2_id=A)`
- If exists: return it
- Else: INSERT with user_1=min(current,other), user_2=max(current,other) (prevents duplicates)
- Return conversation

---

### 2. `GET /api/messages/conversations`
**Purpose:** Fetch list of all user's conversations with metadata
**Invoked by:** /messages page on mount and when realtime triggers
**Auth:** Required
**Input:** None
**Success Response:**
```json
[
  {
    "id": "uuid",
    "other_user_id": "uuid",
    "other_user_display_name": "string",
    "other_user_avatar_url": "string | null",
    "last_message_at": "timestamp | null",
    "last_message_preview": "string (first 100 chars)",
    "last_message_sender": "uuid",
    "unread_count": 0
  }
]
```
**Errors:** 401, 500
**Server Logic:**
- Get current user from auth
- Query all conversations: `WHERE user_1_id = current OR user_2_id = current`
- For each conversation:
  - Compute other_user_id (the non-current one)
  - JOIN user_profiles to get name/avatar of other_user
  - LEFT JOIN messages to get last_message (ORDER BY created_at DESC LIMIT 1)
  - COUNT unread messages (WHERE is_read=false AND sender_id != current AND conversation_id=this)
  - If last_message exists: extract content and substring to 100 chars
- ORDER BY last_message_at DESC NULLS LAST
- Return array

---

### 3. `GET /api/messages/conversations/[conversationId]/messages`
**Purpose:** Fetch paginated message history for one conversation
**Invoked by:** ConversationDetail on mount and scroll-up (pagination)
**Auth:** Required
**Input Query Params:** `limit=50&offset=0`
**Success Response:**
```json
{
  "messages": [
    {
      "id": "uuid",
      "conversation_id": "uuid",
      "sender_id": "uuid",
      "sender_display_name": "string",
      "sender_avatar_url": "string | null",
      "content": "string",
      "created_at": "timestamp",
      "is_read": boolean
    }
  ],
  "total_count": 150,
  "has_more": true
}
```
**Errors:** 401, 403 (user not in this conversation), 404 (conversation not found), 500
**Server Logic:**
- Get current user from auth
- Query conversation by id
- Verify current user is user_1 OR user_2 (else 403)
- Query messages WHERE conversation_id = id, ORDER BY created_at ASC (oldest first)
- Get total_count of all messages
- LIMIT offset, limit (pagination)
- JOIN user_profiles to get sender info
- Return array + has_more = (total_count > offset + limit)

---

### 4. `POST /api/messages/send`
**Purpose:** Send a message to a conversation
**Invoked by:** MessageInput component send button
**Auth:** Required
**Input:** `{ conversation_id: string, content: string }`
**Success Response:**
```json
{
  "id": "uuid",
  "conversation_id": "uuid",
  "sender_id": "uuid",
  "sender_display_name": "string",
  "sender_avatar_url": "string | null",
  "content": "string",
  "created_at": "timestamp",
  "is_read": false
}
```
**Errors:** 401, 400 (empty/missing content, > 2000 chars), 403 (user not in this conversation), 404 (conversation not found), 500
**Server Logic:**
- Get current user from auth
- Validate content: not empty, not null, length <= 2000
- Query conversation by id
- Verify current user is user_1 OR user_2 (else 403)
- BEGIN TRANSACTION
  - INSERT message (sender_id=current, conversation_id, content, created_at=now(), is_read=false)
  - UPDATE conversation SET last_message_at=now(), last_message_by=current
  - COMMIT
- Broadcast via Supabase Realtime channel `messages:${conversation_id}` with INSERT event
- Return created message

---

### 5. `PATCH /api/messages/conversations/[conversationId]/mark-read`
**Purpose:** Mark all unread messages in conversation as read by current user
**Invoked by:** ConversationDetail when other user's messages arrive or on mount
**Auth:** Required
**Input:** None
**Success Response:** `{ success: true, messages_marked: 5 }`
**Errors:** 401, 403 (user not in conversation), 404 (conversation not found), 500
**Server Logic:**
- Get current user from auth
- Query conversation by id
- Verify current user is user_1 OR user_2 (else 403)
- UPDATE messages SET is_read=true WHERE conversation_id=id AND sender_id != current AND is_read=false
- Count updated rows
- Broadcast via Realtime channel `conversations:${current_user_id}` to refresh other open instances
- Return success + count

---

## Realtime Subscriptions (Client-Side Implementation)

**Subscription 1: New messages in current conversation**
```typescript
// In ConversationDetail, on mount when conversationId is set
const channel = supabase
  .channel(`messages:${conversationId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    },
    (payload) => {
      const newMessage = payload.new
      setMessages(prev => [...prev, newMessage])

      // If new message is from other user, auto-mark as read
      if (newMessage.sender_id !== currentUserId) {
        markConversationRead(conversationId)
      }

      // Auto-scroll to bottom
      scrollToBottom()
    }
  )
  .subscribe()

// On unmount or when conversationId changes:
channel.unsubscribe()
```

**Subscription 2: Conversation list updates**
```typescript
// In /messages page, on mount
const channel = supabase
  .channel(`conversations:${currentUserId}`)
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'conversations',
      filter: `user_1_id=eq.${currentUserId} OR user_2_id=eq.${currentUserId}`
    },
    (payload) => {
      // Conversation was updated (new message from other user)
      // Refetch just this conversation to update last_message_at and preview
      refetchConversation(payload.new.id)
    }
  )
  .subscribe()

// On unmount:
channel.unsubscribe()
```

---

## Database Schema & Migrations (SQL)

**File:** `supabase/migrations/[timestamp]_create_messaging_tables.sql`

```sql
-- Create conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  last_message_by UUID DEFAULT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Ensure user_1_id < user_2_id to prevent duplicate conversations
  CONSTRAINT users_ordered CHECK (user_1_id < user_2_id),
  -- Unique constraint: only one conversation per pair
  UNIQUE(user_1_id, user_2_id)
);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_read BOOLEAN DEFAULT FALSE
);

-- Create indexes for performance
CREATE INDEX idx_conversations_user_1_id ON conversations(user_1_id);
CREATE INDEX idx_conversations_user_2_id ON conversations(user_2_id);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC NULLS LAST);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_is_read ON messages(conversation_id, is_read, sender_id);

-- Enable RLS on both tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policy: conversations — users can only see conversations they're in
CREATE POLICY conversations_user_access ON conversations
  FOR SELECT
  USING (auth.uid() = user_1_id OR auth.uid() = user_2_id);

CREATE POLICY conversations_user_insert ON conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_1_id OR auth.uid() = user_2_id);

CREATE POLICY conversations_user_update ON conversations
  FOR UPDATE
  USING (auth.uid() = user_1_id OR auth.uid() = user_2_id)
  WITH CHECK (auth.uid() = user_1_id OR auth.uid() = user_2_id);

-- RLS Policy: messages — users can only see/insert messages in conversations they're in
CREATE POLICY messages_user_select ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.user_1_id = auth.uid() OR conversations.user_2_id = auth.uid())
    )
  );

CREATE POLICY messages_user_insert ON messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.user_1_id = auth.uid() OR conversations.user_2_id = auth.uid())
    )
  );

CREATE POLICY messages_user_update ON messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.user_1_id = auth.uid() OR conversations.user_2_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.user_1_id = auth.uid() OR conversations.user_2_id = auth.uid())
    )
  );

-- Function to update conversation.updated_at and last_message_at on new message
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET updated_at = now(),
      last_message_at = NEW.created_at,
      last_message_by = NEW.sender_id
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: auto-update conversation metadata when message inserted
CREATE TRIGGER trigger_update_conversation_on_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_on_message();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON messages TO authenticated;
```

**Key Design Decisions:**
- `user_1_id < user_2_id` constraint ensures conversation between A↔B is stored once (prevents duplicates from A→B and B→A both creating conversations)
- RLS policies enforce that users can only see their own conversations and messages
- Trigger auto-updates `last_message_at` and `last_message_by` so conversation list always has fresh data
- Indexes on `conversation_id, created_at DESC` optimize pagination queries
- `is_read` index optimizes unread count queries

---

## Race Condition Handling: Conversation Creation

**Problem:** If user A and B simultaneously message each other, both might try to INSERT a conversation.

**Solution (Database Level):**
The UNIQUE constraint on (user_1_id, user_2_id) + the ordering constraint (user_1 < user_2) means:
- User A tries to INSERT (A, B) if A < B, or (B, A) if B < A
- User B tries to INSERT (A, B) if A < B, or (B, A) if B < A
- Both try to insert the same row → second one hits UNIQUE conflict
- Second one fails with integrity error

**Solution (Application Level):**
API endpoint `POST /api/messages/conversations` uses PostgreSQL `ON CONFLICT` clause:
```sql
INSERT INTO conversations (user_1_id, user_2_id, created_at, updated_at)
VALUES (LEAST($1, $2), GREATEST($1, $2), now(), now())
ON CONFLICT (user_1_id, user_2_id) DO UPDATE SET updated_at = now()
RETURNING *;
```
- First INSERT succeeds
- Second INSERT hits conflict, executes DO UPDATE (touches updated_at only, no-op)
- Both calls return the same conversation row
- No error exposed to client
- Caller receives conversation id and can proceed with messaging

**Tested at build time:** Will verify both users can simultaneously call create-or-get and receive same conversation_id.

---

## Message Validation & Rate Limiting

**Client-Side Validation (immediate feedback):**
- Message length: max 2000 characters (enforced in MessageInput component)
- Empty check: disable Send button if content is empty or whitespace-only
- Send button disabled while sending (prevent double-clicks)

**Server-Side Validation (API endpoint):**
- Validate content is not empty: `if (!content || content.trim() === '') return 400`
- Validate content length: `if (content.length > 2000) return 400`
- Rate limiting: **TODO in build** — Add to `POST /api/messages/send`:
  ```typescript
  // Check: user has not sent > 10 messages in last 60 seconds
  const recentMessageCount = await supabase
    .from('messages')
    .select('id', { count: 'exact' })
    .eq('sender_id', currentUserId)
    .gte('created_at', new Date(Date.now() - 60000).toISOString())

  if (recentMessageCount.count > 10) {
    return 429 // Too Many Requests
  }
  ```
- Error response for rate limit: `{ error: "Too many messages. Try again in a moment." }`

---

## UI Layout (Responsive)

### Desktop (md+):
- Left sidebar (40%): List of conversations, search, new message CTA
- Right panel (60%): Conversation detail, message list, input

### Mobile:
- Conversations list OR conversation detail (toggle with back button)

### Conversation Card (in list):
- User avatar (small)
- User name (bold)
- Last message preview (truncated, text-muted if unread)
- Timestamp of last message
- Unread indicator (blue dot or count badge)

### Message Bubble:
- Avatar + name on first message from sender
- Message content (word-wrap)
- Timestamp (small, right-aligned)
- Sent/read status (checkmark)

---

## Data Source Mapping (for every displayed value)

| Display Element | Data Source | Query | Loaded In |
|-----------------|-------------|-------|-----------|
| Other user name | user_profiles.display_name | GET /api/messages/conversations | page.tsx |
| Other user avatar | user_profiles.avatar_url | GET /api/messages/conversations | page.tsx |
| Conversation last message time | conversations.last_message_at | GET /api/messages/conversations | page.tsx |
| Message content | messages.content | GET /api/messages/conversations/[id]/messages | ConversationDetail.tsx |
| Message sender | messages.sender_id → user_profiles.display_name | GET /api/messages/conversations/[id]/messages | ConversationDetail.tsx |
| Unread count | COUNT(messages WHERE is_read=false AND sender_id != current_user) | GET /api/messages/conversations | page.tsx |

---

## Database Queries (SQL pseudocode)

### Get all conversations for user (with last message preview):
```sql
SELECT
  c.*,
  CASE WHEN c.user_1_id = $1 THEN c.user_2_id ELSE c.user_1_id END as other_user_id,
  up.display_name, up.avatar_url,
  m.content as last_message_preview,
  COUNT(m2.id) FILTER (WHERE m2.is_read = false AND m2.sender_id != $1) as unread_count
FROM conversations c
LEFT JOIN user_profiles up ON up.id = (CASE WHEN c.user_1_id = $1 THEN c.user_2_id ELSE c.user_1_id END)
LEFT JOIN messages m ON m.id = (
  SELECT id FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1
)
LEFT JOIN messages m2 ON m2.conversation_id = c.id
WHERE c.user_1_id = $1 OR c.user_2_id = $1
GROUP BY c.id, up.id, m.id
ORDER BY c.last_message_at DESC NULLS LAST
```

### Create conversation (get or create):
```sql
INSERT INTO conversations (user_1_id, user_2_id, created_at, updated_at)
VALUES (least($1, $2), greatest($1, $2), now(), now())
ON CONFLICT (user_1_id, user_2_id) DO UPDATE SET updated_at = now()
RETURNING *
```

---

## Real-Time Requirements

- **Supabase Realtime subscriptions:**
  - Subscribe to `conversations` table changes (new conversations, last_message_at updates)
  - Subscribe to `messages` table changes on current conversation_id (new messages from other user)
  - Unsubscribe when leaving page

- **Optimistic updates:**
  - Show sent message immediately in UI before server confirm
  - Revert if API returns error

---

## Edge Cases Handled

1. **User sends message to themselves:** Block at API level, return 400
2. **Conversation doesn't exist:** Create it automatically when sending message
3. **User A blocks User B:** Not implemented in v1, but add is_blocked field to future versions
4. **Network error:** Show retry button on failed message, persist to localStorage (v2)
5. **Unread messages overflow:** Lazy-load older messages when user scrolls up
6. **User logs out mid-conversation:** Unsubscribe realtime, clear state

---

## Files to Create/Modify

**Create:**
- `src/app/messages/page.tsx`
- `src/components/messaging/ConversationDetail.tsx`
- `src/components/messaging/MessageInput.tsx`
- `src/components/messaging/ConversationCard.tsx`
- `src/app/api/messages/conversations.ts` (GET all)
- `src/app/api/messages/conversations/[id]/messages.ts` (GET messages)
- `src/app/api/messages/conversations/[id]/mark-read.ts` (PATCH)
- `src/app/api/messages/send.ts` (POST)
- `src/app/api/messages/conversations.ts` (POST - create/get)
- `supabase/migrations/[timestamp]_create_messages_tables.sql`

**Modify:**
- None to existing pages

---

## Implementation Order (for Gate 2)

1. Create Supabase tables + RLS policies (migration)
2. Create API endpoints (all 4)
3. Create `ConversationCard` component
4. Create `MessageInput` component
5. Create `ConversationDetail` component (with realtime)
6. Create `/messages` page (layout, logic, list + detail)
7. Test end-to-end
