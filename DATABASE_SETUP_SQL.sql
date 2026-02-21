-- ============================================
-- COPY & PASTE THIS INTO SUPABASE SQL EDITOR
-- ============================================

-- Step 1: Add missing columns to courses table
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS category text DEFAULT 'General';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS level text DEFAULT 'Beginner';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS duration_minutes integer DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS total_lessons integer DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS thumbnail_url text;

-- Step 2: Create lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  youtube_url text NOT NULL,
  order_index integer NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order_index ON public.lessons(course_id, order_index);

-- Step 4: Enable Row Level Security on lessons table
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policy - Allow all authenticated users to read lessons
CREATE POLICY "Allow users to read lessons" ON public.lessons
  FOR SELECT TO authenticated
  USING (true);

-- Step 6: Create RLS policy - Allow teachers to insert lessons for their courses
CREATE POLICY "Allow teachers to insert lessons" ON public.lessons
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = lessons.course_id
      AND courses.teacher_id = auth.uid()
    )
  );

-- Step 7: Create RLS policy - Allow teachers to update lessons for their courses
CREATE POLICY "Allow teachers to update lessons" ON public.lessons
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = lessons.course_id
      AND courses.teacher_id = auth.uid()
    )
  );

-- Step 8: Create RLS policy - Allow teachers to delete lessons for their courses
CREATE POLICY "Allow teachers to delete lessons" ON public.lessons
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = lessons.course_id
      AND courses.teacher_id = auth.uid()
    )
  );

-- Verification: Check that everything was created
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name IN ('courses', 'lessons')
ORDER BY table_name, ordinal_position;
