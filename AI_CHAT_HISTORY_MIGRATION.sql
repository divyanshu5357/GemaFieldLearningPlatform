-- Create ai_chat_history table for storing AI mentor chat messages
CREATE TABLE IF NOT EXISTS ai_chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  session_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_user_id ON ai_chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_session_id ON ai_chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_created_at ON ai_chat_history(created_at DESC);

-- Create composite index for session-based queries
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_user_session ON ai_chat_history(user_id, session_id);

-- Enable Row Level Security (RLS)
ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;

-- Create RLS Policy: Users can only see their own chat history
CREATE POLICY "Users can view their own chat history"
  ON ai_chat_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create RLS Policy: Users can only insert their own messages
CREATE POLICY "Users can insert their own messages"
  ON ai_chat_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create RLS Policy: Users can only update their own messages
CREATE POLICY "Users can update their own messages"
  ON ai_chat_history
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create RLS Policy: Users can only delete their own messages
CREATE POLICY "Users can delete their own messages"
  ON ai_chat_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON ai_chat_history TO authenticated;
