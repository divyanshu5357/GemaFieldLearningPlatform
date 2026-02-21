-- Create assignments table
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  file_url TEXT,
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create submissions table
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_url TEXT,
  file_name TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL,
  grade INTEGER CHECK (grade >= 0 AND grade <= 100),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(assignment_id, student_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_assignments_course_id ON assignments(course_id);
CREATE INDEX idx_submissions_assignment_id ON submissions(assignment_id);
CREATE INDEX idx_submissions_student_id ON submissions(student_id);

-- Enable RLS (Row Level Security)
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Assignments RLS Policies
-- Allow course creator to see their assignments
CREATE POLICY "Teachers can see their course assignments" 
ON assignments FOR SELECT 
USING (course_id IN (
  SELECT id FROM courses WHERE teacher_id = auth.uid()
));

-- Allow students to see assignments for their courses
CREATE POLICY "Students can see course assignments" 
ON assignments FOR SELECT 
USING (course_id IN (
  SELECT DISTINCT course_id FROM assignments 
  WHERE course_id IN (
    SELECT id FROM courses
  )
));

-- Allow teachers to create assignments for their courses
CREATE POLICY "Teachers can create assignments" 
ON assignments FOR INSERT 
WITH CHECK (
  course_id IN (SELECT id FROM courses WHERE teacher_id = auth.uid())
);

-- Allow teachers to delete their assignments
CREATE POLICY "Teachers can delete assignments" 
ON assignments FOR DELETE 
USING (course_id IN (
  SELECT id FROM courses WHERE teacher_id = auth.uid()
));

-- Submissions RLS Policies
-- Students can see their own submissions
CREATE POLICY "Students can see own submissions" 
ON submissions FOR SELECT 
USING (student_id = auth.uid());

-- Teachers can see submissions for their courses
CREATE POLICY "Teachers can see submissions" 
ON submissions FOR SELECT 
USING (assignment_id IN (
  SELECT id FROM assignments WHERE course_id IN (
    SELECT id FROM courses WHERE teacher_id = auth.uid()
  )
));

-- Students can create submissions
CREATE POLICY "Students can create submissions" 
ON submissions FOR INSERT 
WITH CHECK (
  student_id = auth.uid() AND 
  assignment_id IN (SELECT id FROM assignments)
);

-- Students can update their own submissions
CREATE POLICY "Students can update own submissions" 
ON submissions FOR UPDATE 
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

-- Teachers can update submissions (grades, feedback)
CREATE POLICY "Teachers can update submissions" 
ON submissions FOR UPDATE 
USING (assignment_id IN (
  SELECT id FROM assignments WHERE course_id IN (
    SELECT id FROM courses WHERE teacher_id = auth.uid()
  )
));

-- Students can delete their own submissions
CREATE POLICY "Students can delete own submissions" 
ON submissions FOR DELETE 
USING (student_id = auth.uid());

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES 
  ('assignments', 'assignments', true, false, 104857600, '{"application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document","application/vnd.ms-excel","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","text/plain","image/*","video/*","application/zip"}'),
  ('submissions', 'submissions', true, false, 104857600, '{"application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document","application/vnd.ms-excel","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","text/plain","image/*","video/*","application/zip"}')
ON CONFLICT DO NOTHING;

-- Storage policies for assignments bucket
CREATE POLICY "Anyone can view assignment files" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'assignments');

CREATE POLICY "Teachers can upload assignment files" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'assignments' AND
  auth.role() = 'authenticated'
);

-- Storage policies for submissions bucket
CREATE POLICY "Users can view their own submissions" 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'submissions' AND (
    auth.uid()::text = SPLIT_PART(name, '/', 3) OR
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.teacher_id = auth.uid()
    )
  )
);

CREATE POLICY "Students can upload submissions" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'submissions' AND
  auth.role() = 'authenticated'
);
