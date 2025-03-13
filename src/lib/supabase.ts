import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tdameuxkfymxzatpvvin.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkYW1ldXhrZnlteHphdHB2dmluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4MjA1ODcsImV4cCI6MjA1NzM5NjU4N30.kaugD32aJ0y9UOm6MuEEeOz4xBalO5rizV2AelV_BAM';

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Project = {
  id: number;
  created_at: string;
  name: string;
  user_id: string;
};

export type File = {
  id: number;
  created_at: string;
  name: string;
  projet_id: number;
  storage_path: string;
};
