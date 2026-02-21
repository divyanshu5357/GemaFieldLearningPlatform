import { createClient } from '@supabase/supabase-js';

// Type assertion to access import.meta.env
declare const import_meta_env: {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
};

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
