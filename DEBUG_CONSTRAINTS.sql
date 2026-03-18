-- ============================================================
-- COMPLETE FIX FOR COURSES TABLE CONSTRAINT ERROR
-- ============================================================

-- Step 1: Check what constraints actually exist
SELECT 
  con.conname as constraint_name,
  con.contype as constraint_type,
  pg_get_constraintdef(con.oid) as constraint_definition
FROM pg_constraint con
WHERE con.conrelid = 'public.courses'::regclass;

-- Step 2: If there's a foreign key on teacher_id, check it
SELECT 
  constraint_name,
  table_name,
  column_name,
  foreign_table_name,
  foreign_column_name
FROM information_schema.key_column_usage
WHERE table_name = 'courses' AND column_name = 'teacher_id';

-- Step 3: Check if profiles table exists and is set up
SELECT * FROM information_schema.tables 
WHERE table_name = 'profiles' AND table_schema = 'public';

-- Step 4: List all tables in public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Step 5: Check auth.users exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'users' AND table_schema = 'auth'
) as auth_users_exists;
