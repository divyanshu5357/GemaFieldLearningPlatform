-- Run this in Supabase SQL Editor to find CHECK constraints
SELECT 
  con.conname as constraint_name,
  pg_get_constraintdef(con.oid) as constraint_definition
FROM pg_constraint con
WHERE con.conrelid = 'public.courses'::regclass
  AND con.contype = 'c';
