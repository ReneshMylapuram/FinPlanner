
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.1';

const supabaseUrl = 'https://bouprseurdqedgxkjcim.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvdXByc2V1cmRxZWRneGtqY2ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5Njk0MTYsImV4cCI6MjA4MjU0NTQxNn0.k1f5cY-oMbngFbTeMyVtNyiMRrEC3wlGY6sKSYAhfhw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
