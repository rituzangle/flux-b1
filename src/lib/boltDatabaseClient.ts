// src/lib/boltDatabaseClient.ts
// Exports two Supabase clients: server (service role) and client (anon).
// Uses environment vars and performs runtime validation for required secrets.

import { createClient, SupabaseClient } from '@supabase/supabase-js';

type Clients = {
  server: SupabaseClient;
  client: SupabaseClient;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function missingEnv(name: string): never {
  throw new Error(`Missing required environment variable: ${name}`);
}

// Runtime validation (server-only check for service role)
if (!SUPABASE_URL) missingEnv('NEXT_PUBLIC_SUPABASE_URL');
if (!SUPABASE_ANON_KEY) {
  // allow client to be unusable during server runtime if anon key missing,
  // but still throw to make failure explicit during development
  missingEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
}
if (!SUPABASE_SERVICE_ROLE_KEY) {
  // service role key is required for server operations (RPCs, seeds, admin)
  missingEnv('SUPABASE_SERVICE_ROLE_KEY');
}

// Create client-side (browser) client: uses anon key and respects RLS
export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

// Create server-side client: uses service_role key and bypasses RLS
// Use this only in server code (API routes, server actions)
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Export a convenience object with types
const clients: Clients = {
  server: supabaseAdmin,
  client: supabaseClient,
};

export default clients;
