// src/lib/supabaseBrowserClient.ts
// Browser-only Supabase client. Safe to import in 'use client' components.
// Uses only NEXT_PUBLIC keys and will not throw if server-only env vars are missing.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Avoid throwing in production browser; surface a clear console warning instead
  // so the app can still render and you can debug missing env locally.
  // This prevents module load-time exceptions in client bundles.
  // Server code should still use boltDatabaseClient (service role) where required.
  // eslint-disable-next-line no-console
  console.warn('supabaseBrowserClient: missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabaseBrowserClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

export default supabaseBrowserClient;
// --- 
