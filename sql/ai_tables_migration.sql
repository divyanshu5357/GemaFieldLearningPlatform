-- Create AI Messages Table
CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'ai')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Student Analytics Table
CREATE TABLE IF NOT EXISTS student_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  score NUMERIC NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('Weak', 'Average', 'Good', 'Excellent')),
  weak_topics TEXT[] DEFAULT ARRAY[]::TEXT[],
  ai_feedback TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX idx_ai_messages_student ON ai_messages(student_id);
CREATE INDEX idx_ai_messages_lesson ON ai_messages(lesson_id);
CREATE INDEX idx_ai_messages_created_at ON ai_messages(created_at);
CREATE INDEX idx_student_analytics_student ON student_analytics(student_id);
CREATE INDEX idx_student_analytics_test ON student_analytics(test_id);
CREATE INDEX idx_student_analytics_created_at ON student_analytics(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_messages
CREATE POLICY ai_messages_student_policy ON ai_messages
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY ai_messages_insert_policy ON ai_messages
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- RLS Policies for student_analytics
CREATE POLICY student_analytics_policy ON student_analytics
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY student_analytics_insert_policy ON student_analytics
  FOR INSERT WITH CHECK (auth.uid() = student_id);
