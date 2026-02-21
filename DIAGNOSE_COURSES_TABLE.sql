-- Query to run in Supabase SQL Editor
-- This will show us exactly what's wrong

-- Check courses table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'courses' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check all constraints on courses table
SELECT 
  constraint_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'courses' AND table_schema = 'public';

-- Check check constraints specifically
SELECT constraint_name
FROM information_schema.constraint_column_usage
WHERE table_name = 'courses' AND table_schema = 'public';
