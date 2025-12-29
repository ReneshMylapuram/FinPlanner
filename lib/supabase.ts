import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.1';

// Standard practice: check for environment variables first, then fallback to hardcoded
// Fix: Access process.env directly to avoid 'Property process does not exist on type Window' error.
const supabaseUrl = (process.env.SUPABASE_URL) || 'https://bouprseurdqedgxkjcim.supabase.co';
const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvdXByc2V1cmRxZWRneGtqY2ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5Njk0MTYsImV4cCI6MjA4MjU0NTQxNn0.k1f5cY-oMbngFbTeMyVtNyiMRrEC3wlGY6sKSYAhfhw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
