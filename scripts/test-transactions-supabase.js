#!/usr/bin/env node
/**
 * scripts/test-transactions-supabase.js
 * Tests the transactions API endpoint with a user ID
 *
 * Usage:
 *   node scripts/test-transactions-supabase.js --userId=UUID
 *   NODE_API_BASE="http://localhost:3000" node scripts/test-transactions-supabase.js --userId=UUID
 *
 * Environment variables:
 *   NODE_API_BASE  - optional, default http://localhost:3000
 *   NODE_USER_ID   - can be set via env or --userId flag
 *   NODE_PAGE      - optional, default 1
 *   NODE_PAGE_SIZE - optional, default 20
 *   NODE_TYPE      - optional filter, e.g., "donation"
 */

const API_BASE = process.env.NODE_API_BASE || 'http://localhost:3000';
let USER_ID = process.env.NODE_USER_ID;
const PAGE = process.env.NODE_PAGE || '1';
const PAGE_SIZE = process.env.NODE_PAGE_SIZE || '20';
const TYPE = process.env.NODE_TYPE || '';

const args = process.argv.slice(2);
for (const arg of args) {
  if (arg.startsWith('--userId=')) {
    USER_ID = arg.split('=')[1];
  }
}

if (!USER_ID) {
  console.error('❌ Missing required user ID\n');
  console.error('Usage:');
  console.error('  node scripts/test-transactions-supabase.js --userId=YOUR_USER_UUID');
  console.error('  NODE_USER_ID="uuid" node scripts/test-transactions-supabase.js\n');
  console.error('Get a user ID by running:');
  console.error('  node scripts/create-test-user.js\n');
  process.exit(1);
}

async function testTransactions() {
  console.log('🧪 Testing Transactions API\n');
  console.log(`📍 API Base: ${API_BASE}`);
  console.log(`👤 User ID: ${USER_ID}`);
  console.log(`📄 Page: ${PAGE}, Size: ${PAGE_SIZE}`);
  if (TYPE) console.log(`🔍 Filter Type: ${TYPE}`);
  console.log('');

  try {
    const url = new URL(`${API_BASE}/api/transactions`);
    url.searchParams.set('userId', USER_ID);
    url.searchParams.set('page', PAGE);
    url.searchParams.set('pageSize', PAGE_SIZE);
    if (TYPE) url.searchParams.set('type', TYPE);

    console.log(`🌐 Request URL: ${url.toString()}\n`);

    const res = await fetch(url.toString(), { method: 'GET' });
    const text = await res.text();

    console.log(`📊 HTTP Status: ${res.status} ${res.statusText}\n`);

    let json;
    try {
      json = JSON.parse(text);
    } catch {
      console.error('❌ Non-JSON response:\n', text);
      process.exit(1);
    }

    console.log('📦 Response JSON:');
    console.log(JSON.stringify(json, null, 2));
    console.log('');

    if (!json.ok) {
      console.error('❌ API returned error:', json.error);
      if (json.details) console.error('   Details:', json.details);
      process.exit(1);
    }

    const txs = Array.isArray(json.transactions) ? json.transactions : [];
    console.log(`✅ Found ${txs.length} transactions (total: ${json.total ?? 'unknown'})`);

    if (txs.length === 0) {
      console.log('\n⚠️  No transactions found.');
      console.log('\n💡 Create test transactions by:');
      console.log('   1. Using the app UI to make donations/transfers');
      console.log('   2. Creating sample transactions via SQL:\n');
      console.log(`   INSERT INTO transactions (user_id, type, category, entity_name, amount, direction, note)`);
      console.log(`   VALUES ('${USER_ID}', 'donation', 'charity', 'Test Charity', 25.00, 'outgoing', 'Test donation');\n`);
      return;
    }

    console.log('\n📋 Transaction Summary:\n');

    txs.forEach((tx, idx) => {
      console.log(`   ${idx + 1}. ${tx.type.toUpperCase()} - ${tx.entity_name || 'N/A'}`);
      console.log(`      Amount: $${Number(tx.amount).toFixed(2)} (${tx.direction})`);
      console.log(`      Date: ${new Date(tx.timestamp).toLocaleString()}`);
      if (tx.note) console.log(`      Note: ${tx.note}`);
      if (tx.insights) {
        const insights = Array.isArray(tx.insights) ? tx.insights : [];
        if (insights.length > 0) {
          console.log(`      Insights: ${insights[0].message || 'N/A'}`);
        }
      }
      console.log('');
    });

    const missing = txs.filter(t => !(t.type && (t.entity_name || t.entity_id)));
    if (missing.length === 0) {
      console.log('✅ All transactions include type and entity_name/entity_id');
    } else {
      console.log(`⚠️  ${missing.length} transaction(s) missing type or entity_name/entity_id:`);
      missing.slice(0, 3).forEach(t => {
        console.log(`   - ID: ${t.id}, Type: ${t.type || 'missing'}, Entity: ${t.entity_name || 'missing'}`);
      });
    }

    console.log('\n✅ Test complete!\n');
  } catch (err) {
    console.error('\n❌ Request failed:', String(err));
    process.exit(1);
  }
}

testTransactions();
