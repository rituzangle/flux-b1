// scripts/test-transactions.js
// Usage:
//   NODE_API_BASE="https://your-app.bolt.dev" NODE_USER_ID="7db3864f-266a-4744-9d64-753abc9598a0" node scripts/test-transactions.js
//
// Environment variables:
//   NODE_API_BASE  - required, base URL of your Bolt app (no trailing slash)
//   NODE_USER_ID   - required, the user UUID to query
//   NODE_PAGE      - optional, default 1
//   NODE_PAGE_SIZE - optional, default 8
//   NODE_TYPE      - optional filter, e.g., "donation"
//
const API_BASE = process.env.NODE_API_BASE;
const USER_ID = process.env.NODE_USER_ID;
const PAGE = process.env.NODE_PAGE || '1';
const PAGE_SIZE = process.env.NODE_PAGE_SIZE || '8';
const TYPE = process.env.NODE_TYPE || '';

if (!API_BASE || !USER_ID) {
  console.error('Missing required env vars. Set NODE_API_BASE and NODE_USER_ID and re-run.');
  process.exit(2);
}

const url = new URL(`${API_BASE}/api/transactions`);
url.searchParams.set('userId', USER_ID);
url.searchParams.set('page', PAGE);
url.searchParams.set('pageSize', PAGE_SIZE);
if (TYPE) url.searchParams.set('type', TYPE);

async function run() {
  try {
    const res = await fetch(url.toString(), { method: 'GET' });
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      console.error('Non-JSON response:\n', text);
      process.exit(3);
    }

    console.log('HTTP', res.status, res.statusText);
    console.log('Response JSON:', JSON.stringify(json, null, 2));

    const txs = Array.isArray(json.transactions) ? json.transactions : [];
    console.log(`Found ${txs.length} transactions (total: ${json.total ?? 'unknown'})`);

    if (txs.length === 0) {
      console.log('No transactions returned. If you expected recent rows, confirm the user has transactions in Supabase.');
      return;
    }

    const missing = txs.filter(t => !(t.type && (t.entity_name || t.entity_id)));
    if (missing.length === 0) {
      console.log('All returned transactions include type and entity_name/entity_id — UI can render "Donation — Test Charity" or similar.');
    } else {
      console.log(`${missing.length} transaction(s) missing type or entity_name/entity_id. Sample missing items:`);
      console.log(missing.slice(0, 5).map(t => ({ id: t.id, type: t.type, entity_name: t.entity_name, entity_id: t.entity_id })));
    }
  } catch (err) {
    console.error('Request failed', String(err));
    process.exit(4);
  }
}

run();
