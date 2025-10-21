// src/lib/dbHelpers.ts
import clients from './boltDatabaseClient';
export const server = clients.server;
export const client = clients.client;

// Simple runtime guard for server-only usage
export function requireServerClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Server client requires SUPABASE_SERVICE_ROLE_KEY. Ensure env is set.');
  }
  return server;
}
