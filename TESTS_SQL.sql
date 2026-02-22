-- Create tests table
CREATE TABLE tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  total_points INTEGER NOT NULL DEFAULT 100,
  passing_score INTEGER NOT NULL DEFAULT 60,
  max_attempts INTEGER NOT NULL DEFAULT 1,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  questions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create test_attempts table
CREATE TABLE test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE,
  score INTEGER,
  answers JSONB DEFAULT '[]'::jsonb,
  is_passed BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(test_id, student_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_tests_course_id ON tests(course_id);
CREATE INDEX idx_test_attempts_test_id ON test_attempts(test_id);
CREATE INDEX idx_test_attempts_student_id ON test_attempts(student_id);

-- Enable RLS (Row Level Security)
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;

-- Tests RLS Policies
-- Allow course creator to see their tests
CREATE POLICY "Teachers can see their course tests" 
ON tests FOR SELECT 
USING (course_id IN (
  SELECT id FROM courses WHERE teacher_id = auth.uid()
));

-- Allow students to see published tests for their courses
CREATE POLICY "Students can see published tests" 
ON tests FOR SELECT 
USING (
  is_published = TRUE AND
  course_id IN (
    SELECT DISTINCT course_id FROM courses
  )
);

-- Allow teachers to create tests for their courses
CREATE POLICY "Teachers can create tests" 
ON tests FOR INSERT 
WITH CHECK (
  course_id IN (SELECT id FROM courses WHERE teacher_id = auth.uid())
);

-- Allow teachers to update their tests
CREATE POLICY "Teachers can update their tests" 
ON tests FOR UPDATE 
USING (course_id IN (
  SELECT id FROM courses WHERE teacher_id = auth.uid()
))
WITH CHECK (course_id IN (
  SELECT id FROM courses WHERE teacher_id = auth.uid()
));

-- Allow teachers to delete their tests
CREATE POLICY "Teachers can delete their tests" 
ON tests FOR DELETE 
USING (course_id IN (
  SELECT id FROM courses WHERE teacher_id = auth.uid()
));

-- Test Attempts RLS Policies
-- Students can see their own attempts
CREATE POLICY "Students can see own test attempts" 
ON test_attempts FOR SELECT 
USING (student_id = auth.uid());

-- Teachers can see all attempts for their tests
CREATE POLICY "Teachers can see test attempts" 
ON test_attempts FOR SELECT 
USING (test_id IN (
  SELECT id FROM tests WHERE course_id IN (
    SELECT id FROM courses WHERE teacher_id = auth.uid()
  )
));

-- Students can create test attempts
CREATE POLICY "Students can create test attempts" 
ON test_attempts FOR INSERT 
WITH CHECK (student_id = auth.uid());

-- Students can update their own attempts (submit answers)
CREATE POLICY "Students can update own attempts" 
ON test_attempts FOR UPDATE 
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());
