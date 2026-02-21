-- Complete RLS Fix for courses and lessons tables

-- ========================================
-- DROP OLD POLICIES (if they exist)
-- ========================================
DROP POLICY IF EXISTS "Teachers can create courses" ON public.courses;
DROP POLICY IF EXISTS "Teachers can update own courses" ON public.courses;
DROP POLICY IF EXISTS "Teachers can delete own courses" ON public.courses;
DROP POLICY IF EXISTS "Users can read published courses" ON public.courses;
DROP POLICY IF EXISTS "Students can read all courses" ON public.courses;
DROP POLICY IF EXISTS "Allow users to read all courses" ON public.courses;
DROP POLICY IF EXISTS "Allow teachers to insert courses" ON public.courses;
DROP POLICY IF EXISTS "Allow teachers to update own courses" ON public.courses;
DROP POLICY IF EXISTS "Allow teachers to delete own courses" ON public.courses;

-- ========================================
-- ENABLE RLS ON COURSES TABLE
-- ========================================
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- ========================================
-- CREATE NEW POLICIES FOR COURSES
-- ========================================

-- Policy 1: Everyone can read all courses
CREATE POLICY "Read all courses" ON public.courses
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 2: Teachers can insert their own courses
CREATE POLICY "Teachers insert own courses" ON public.courses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = teacher_id);

-- Policy 3: Teachers can update their own courses
CREATE POLICY "Teachers update own courses" ON public.courses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

-- Policy 4: Teachers can delete their own courses
CREATE POLICY "Teachers delete own courses" ON public.courses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = teacher_id);

-- ========================================
-- EXISTING LESSONS POLICIES (should already exist)
-- ========================================
-- If lessons table exists, policies should already be there
-- If not, they'll be created when lessons table is set up

-- ========================================
-- VERIFY SETUP
-- ========================================
-- Check courses table RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'courses';

-- Check all policies on courses table
SELECT * FROM pg_policies WHERE tablename = 'courses' ORDER BY policyname;

-- Check if lessons table exists
SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'lessons');
