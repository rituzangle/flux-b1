// scripts/check-supabase-safe.ts
// Safer version: logs raw response bodies and content-type before attempting JSON.parse.
// Usage:
//   export NEXT_PUBLIC_SUPABASE_URL="https://<project>.supabase.co"
//   export NEXT_PUBLIC_SUPABASE_ANON_KEY="anon-key"
//   export SUPABASE_SERVICE_ROLE_KEY="service-role-key"
//   ts-node --project tsconfig.scripts.json scripts/check-supabase-safe.ts

import clients from '../src/lib/boltDatabaseClient';

async function safeLogResponse(res: Response, label: string) {
  const contentType = res.headers.get('content-type') ?? 'unknown';
  const text = await res.text();
  console.log(`--- ${label} (status ${res.status}) content-type: ${contentType}`);
  // Print a short preview of the body to avoid huge dumps; show full length
  const preview = text.length > 1000 ? `${text.slice(0, 1000)}... (truncated, ${text.length} bytes)` : text;
  console.log(preview);
  return { contentType, text };
}

async function runQueryWithSafeLogging(clientName: 'server' | 'client') {
  try {
    const client = clientName === 'server' ? clients.server : clients.client;
    // Use REST-style query to force raw response visibility if needed
    // But here we'll do a normal sdk query and then also hit the REST endpoint to inspect raw
    console.log(`\nRunning SDK query with ${clientName} client -> select id from charities limit 1`);
    const { data, error, status } = await client.from('charities').select('id').limit(1);
    console.log(`${clientName} SDK result status: ${status}, error: ${error?.message ?? 'none'}`);
    console.log(`${clientName} SDK data:`, data);

    // Also fetch raw REST endpoint to inspect response bytes and headers
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const restUrl = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/charities?select=id&limit=1`;
    console.log(`\nFetching raw REST endpoint: ${restUrl}`);
    const res = await fetch(restUrl, {
      method: 'GET',
      headers: {
        apikey: clientName === 'server' ? process.env.SUPABASE_SERVICE_ROLE_KEY! : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: clientName === 'server' ? `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}` : `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`
      }
    });

    const { contentType, text } = await safeLogResponse(res, `${clientName} REST`);
    // Try parse only if content-type looks like JSON
    if (contentType.includes('application/json') || contentType.includes('text/json')) {
      try {
        const parsed = JSON.parse(text);
        console.log(`${clientName} REST parsed JSON:`, parsed);
      } catch (e) {
        console.error(`${clientName} REST JSON.parse failed:`, String(e));
      }
    } else {
      console.warn(`${clientName} REST response is not JSON; skipping JSON.parse.`);
    }
  } catch (err) {
    console.error(`Query with ${clientName} failed:`, String(err));
  }
}

async function main() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing required env vars. Ensure NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are set.');
    process.exit(2);
  }
  await runQueryWithSafeLogging('server');
  await runQueryWithSafeLogging('client');
  console.log('\nDone.');
}

main().catch(e => { console.error('Unhandled error', e); process.exit(1); });
