import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.1';

/**
 * Robust environment variable lookup.
 * Netlify and modern bundlers might inject variables in different ways.
 */
const getEnv = (key: string): string | undefined => {
  // Check window.process (from our shim in index.html)
  if ((window as any).process?.env?.[key]) return (window as any).process.env[key];
  // Check standard process.env
  try { if (process.env?.[key]) return process.env[key]; } catch(e) {}
  // Check import.meta.env (Vite standard)
  try { if ((import.meta as any).env?.[key]) return (import.meta as any).env[key]; } catch(e) {}
  return undefined;
};

const supabaseUrl = getEnv('SUPABASE_URL') || 'https://bouprseurdqedgxkjcim.supabase.co';
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvdXByc2V1cmRxZWRneGtqY2ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5Njk0MTYsImV4cCI6MjA4MjU0NTQxNn0.k1f5cY-oMbngFbTeMyVtNyiMRrEC3wlGY6sKSYAhfhw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);