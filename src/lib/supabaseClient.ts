// src/lib/supabaseClient.ts
// Single Supabase client for server-side use.
// Usage: import { supabase } from '@/lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';

/**
 * Required env vars (set in your Bolt/host environment):
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY (server-only key) OR NEXT_PUBLIC_SUPABASE_ANON_KEY (less privileged)
 *
 * Use the service-role key for server-side operations that need to bypass RLS during development.
 * In production, prefer service functions or a restricted service role and apply RLS policies.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  // Fail fast in server environments where Supabase is required.
  // If you prefer non-fatal behavior for pure-mock workflows, replace this with a no-op client.
  throw new Error('Missing Supabase configuration. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
  realtime: { params: { eventsPerSecond: 10 } },
});
// --- 28 lines --- Oct 20