-- =====================================================================
-- Community Chat System Migration
-- =====================================================================

-- Create community_chat_messages table
CREATE TABLE IF NOT EXISTS community_chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_community_chat_created_at ON community_chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_chat_user_id ON community_chat_messages(user_id);

-- Enable Row Level Security
ALTER TABLE community_chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read messages
CREATE POLICY "Anyone can read community chat messages"
  ON community_chat_messages
  FOR SELECT
  USING (true);

-- Policy: Only authenticated users can insert messages
CREATE POLICY "Authenticated users can send messages"
  ON community_chat_messages
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Policy: Users can delete their own messages
CREATE POLICY "Users can delete their own messages"
  ON community_chat_messages
  FOR DELETE
  USING (auth.uid()::text = user_id::text);

