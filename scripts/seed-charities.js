// scripts/seed-charities.js
// Usage:
//   SUPABASE_URL="https://<project>.supabase.co" SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE" node scripts/seed-charities.js
//
// Adjust the `mocksPath` variable to point to your local src/mock/charities.json or the module that exports the array.

const fetch = globalThis.fetch || require('node-fetch');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY and re-run.');
  process.exit(2);
}

// Change this to the actual path or require of your mocks file
const mocksPath = '../src/mock/charities.js'; // or .json
let mocks;
try {
  mocks = require(mocksPath);
  if (mocks && mocks.default) mocks = mocks.default;
} catch (e) {
  console.error('Failed to load mocks from', mocksPath, e);
  process.exit(3);
}

async function upsertCharities(items) {
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/charities`;
  const res = await fetch(url + '?on_conflict=id', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      Prefer: 'resolution=merge-duplicates'
    },
    body: JSON.stringify(items)
  });
  const text = await res.text();
  console.log('Status', res.status, text);
}

(async () => {
  // Map mocks to DB columns expected by your schema; adapt fields as needed
  const payload = (mocks || []).map(c => ({
    id: c.id || null,
    slug: c.slug || c.name?.toLowerCase().replace(/\s+/g,'-'),
    name: c.name,
    description: c.description || null,
    logo_url: c.logo || null,
    impact_rate: c.impactRate ?? null,
    impact_metric: c.impactMetric ?? null,
    metadata: c.metadata || null
  }));
  if (payload.length === 0) {
    console.error('No mock charities found in', mocksPath);
    process.exit(4);
  }
  await upsertCharities(payload);
  console.log('Done. Run select id, name from charities; in Supabase to confirm.');
})();
