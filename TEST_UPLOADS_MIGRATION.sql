-- Create test_uploads table
CREATE TABLE IF NOT EXISTS test_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_test_uploads_course_id ON test_uploads(course_id);
CREATE INDEX idx_test_uploads_uploaded_by ON test_uploads(uploaded_by);

-- Enable RLS
ALTER TABLE test_uploads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Teachers can view their course test uploads" ON test_uploads;
DROP POLICY IF EXISTS "Teachers can upload tests for their courses" ON test_uploads;
DROP POLICY IF EXISTS "Teachers can update their test uploads" ON test_uploads;
DROP POLICY IF EXISTS "Teachers can delete their test uploads" ON test_uploads;
DROP POLICY IF EXISTS "Students can view published tests from enrolled courses" ON test_uploads;

-- RLS Policy: Teachers can see their own uploaded tests
CREATE POLICY "Teachers can view their course test uploads"
  ON test_uploads FOR SELECT
  USING (
    course_id IN (
      SELECT id FROM courses WHERE teacher_id = auth.uid()
    )
  );

-- RLS Policy: Teachers can insert test uploads for their courses
CREATE POLICY "Teachers can upload tests for their courses"
  ON test_uploads FOR INSERT
  WITH CHECK (
    uploaded_by = auth.uid() AND
    course_id IN (
      SELECT id FROM courses WHERE teacher_id = auth.uid()
    )
  );

-- RLS Policy: Teachers can update their test uploads
CREATE POLICY "Teachers can update their test uploads"
  ON test_uploads FOR UPDATE
  USING (
    uploaded_by = auth.uid() AND
    course_id IN (
      SELECT id FROM courses WHERE teacher_id = auth.uid()
    )
  );

-- RLS Policy: Teachers can delete their test uploads
CREATE POLICY "Teachers can delete their test uploads"
  ON test_uploads FOR DELETE
  USING (
    uploaded_by = auth.uid() AND
    course_id IN (
      SELECT id FROM courses WHERE teacher_id = auth.uid()
    )
  );

-- RLS Policy: Students can view published tests from their enrolled courses
CREATE POLICY "Students can view published tests from enrolled courses"
  ON test_uploads FOR SELECT
  USING (
    is_published = true AND
    course_id IN (
      SELECT course_id FROM enrollments WHERE student_id = auth.uid()
    )
  );

-- Create storage bucket for test uploads if it doesn't exist
-- Run this in Supabase dashboard:
-- INSERT INTO storage.buckets (id, name) VALUES ('test-uploads', 'test-uploads') ON CONFLICT DO NOTHING;

-- Storage policy for test uploads (run in Supabase dashboard)
-- INSERT INTO storage.policies (bucket_id, definition, role) 
-- VALUES ('test-uploads', 
--   jsonb_build_object(
--     'bucket_id', 'test-uploads',
--     'role', 'authenticated',
--     'name', 'Allow authenticated users to upload test files',
--     'definition', '{"filesize_limit": 10485760}'
--   ), 
--   'authenticated'
-- );
