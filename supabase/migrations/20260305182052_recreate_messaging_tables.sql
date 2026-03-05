-- Drop all policies on conversations first
DROP POLICY IF EXISTS conversations_participant_read ON conversations;
DROP POLICY IF EXISTS conversations_participant_write ON conversations;
DROP POLICY IF EXISTS conversations_user_access ON conversations;
DROP POLICY IF EXISTS conversations_user_insert ON conversations;
DROP POLICY IF EXISTS conversations_user_update ON conversations;

-- Drop all policies on messages first
DROP POLICY IF EXISTS messages_participant_read ON messages;
DROP POLICY IF EXISTS messages_participant_write ON messages;
DROP POLICY IF EXISTS messages_user_select ON messages;
DROP POLICY IF EXISTS messages_user_insert ON messages;
DROP POLICY IF EXISTS messages_user_update ON messages;

-- Drop existing messaging infrastructure in correct dependency order
DROP TRIGGER IF EXISTS trigger_update_conversation_on_message ON messages;
DROP FUNCTION IF EXISTS update_conversation_on_message();
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversation_participants;
DROP TABLE IF EXISTS conversations;

-- Create conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  last_message_by UUID DEFAULT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT users_ordered CHECK (user_1_id < user_2_id),
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

-- RLS Policy: conversations
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

-- RLS Policy: messages
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

-- Function to update conversation metadata on new message
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
