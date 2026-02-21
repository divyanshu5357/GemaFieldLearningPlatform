-- Playlist System Database Setup
-- Run these queries in Supabase SQL Editor

-- 1. Update courses table to match our simplified playlist structure
-- Add missing columns if they don't exist
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS category text DEFAULT 'General';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS level text DEFAULT 'Beginner';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS duration_minutes integer DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS total_lessons integer DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS thumbnail_url text;

-- 2. Create lessons table for storing YouTube video lessons
CREATE TABLE IF NOT EXISTS public.lessons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  youtube_url text NOT NULL,
  order_index integer NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 3. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order_index ON public.lessons(course_id, order_index);

-- 4. Enable RLS on lessons table
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for lessons
-- Allow authenticated users to read lessons for courses they can access
CREATE POLICY "Allow users to read lessons" ON public.lessons
  FOR SELECT TO authenticated
  USING (true);

-- Allow teachers to insert lessons for their courses
CREATE POLICY "Allow teachers to insert lessons" ON public.lessons
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = lessons.course_id
      AND courses.teacher_id = auth.uid()
    )
  );

-- Allow teachers to update lessons for their courses
CREATE POLICY "Allow teachers to update lessons" ON public.lessons
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = lessons.course_id
      AND courses.teacher_id = auth.uid()
    )
  );

-- Allow teachers to delete lessons for their courses
CREATE POLICY "Allow teachers to delete lessons" ON public.lessons
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = lessons.course_id
      AND courses.teacher_id = auth.uid()
    )
  );

-- 6. Verify the setup
SELECT 
  table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
