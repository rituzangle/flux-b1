// logFlow.js
// Simple, robust inspector for runtimeStore and mockCharities.
// Run: node logFlow.js
const fs = require('fs');
const path = require('path');

function tryRequire(p) {
  try { return require(p); } catch (e) { return null; }
}

function readText(rel) {
  try { return fs.readFileSync(path.resolve(rel), 'utf8'); } catch (e) { return null; }
}

function parseSimpleArrayFromText(text, name) {
  if (!text) return null;
  const marker = `export const ${name}`;
  const idx = text.indexOf(marker);
  if (idx === -1) return null;
  const slice = text.slice(idx + marker.length);
  const eq = slice.indexOf('=');
  if (eq === -1) return null;
  let rest = slice.slice(eq + 1).trim();
  // find first '[' and matching closing '];'
  const start = rest.indexOf('[');
  if (start === -1) return null;
  let depth = 0, endIndex = -1;
  for (let i = start; i < rest.length; i++) {
    const ch = rest[i];
    if (ch === '[') depth++;
    else if (ch === ']') {
      depth--;
      if (depth === 0) { endIndex = i; break; }
    }
  }
  if (endIndex === -1) return null;
  const arrText = rest.slice(start, endIndex + 1);
  // Attempt to transform simple JS object array to JSON-ish string
  // Replace single quotes with double quotes and unquoted keys with quoted keys (naive)
  let jsonish = arrText.replace(/`/g, '"').replace(/'([^']*)'/g, function(_, p){ return JSON.stringify(p); });
  jsonish = jsonish.replace(/([,{]\s*)([A-Za-z0-9_\-]+)\s*:/g, '$1"$2":');
  try { return JSON.parse(jsonish); } catch (e) { return null; }
}

function loadCharities() {
  const reqCandidates = [
    '@/mocks/charities',
    './src/mocks/charities',
    './mocks/charities',
    './src/mocks/charities.js',
    './src/mocks/charities.ts',
  ];
  for (const c of reqCandidates) {
    const mod = tryRequire(c);
    if (mod) {
      const arr = mod.mockCharities || mod.charities || mod.default || mod;
      if (Array.isArray(arr) && arr.length) return arr;
    }
  }
  // fallback: read file and parse simple export
  const txt = readText('src/mocks/charities.ts') || readText('src/mocks/charities.js');
  const parsed = parseSimpleArrayFromText(txt, 'mockCharities') || parseSimpleArrayFromText(txt, 'charities');
  if (Array.isArray(parsed) && parsed.length) return parsed;
  return [];
}

function loadRuntimeStore() {
  const reqCandidates = [
    './src/mocks/runtimeStore',
    './src/mocks/runtimeStore.ts',
    './mocks/runtimeStore',
  ];
  for (const c of reqCandidates) {
    const mod = tryRequire(c);
    if (mod) {
      const rs = mod.runtimeStore || mod.default || mod;
      if (rs && typeof rs === 'object') return rs;
    }
  }
  // fallback: read runtimeStore file and look for a user literal (very simple attempt)
  const txt = readText('src/mocks/runtimeStore.ts') || readText('src/mocks/runtimeStore.js');
  if (!txt) return { user: null, transactions: [], charities: [] };
  const userMarker = 'user:';
  const ui = txt.indexOf(userMarker);
  if (ui === -1) return { user: null, transactions: [], charities: [] };
  const slice = txt.slice(ui);
  const braceStart = slice.indexOf('{');
  const braceEnd = slice.indexOf('} as User');
  if (braceStart === -1 || braceEnd === -1) return { user: null, transactions: [], charities: [] };
  const userText = slice.slice(braceStart, braceEnd + 1);
  let jsonish = userText.replace(/`/g, '"').replace(/'([^']*)'/g, (_, p)=> JSON.stringify(p));
  jsonish = jsonish.replace(/([,{]\s*)([A-Za-z0-9_\-]+)\s*:/g, '$1"$2":');
  try {
    const user = JSON.parse(jsonish);
    return { user, transactions: [], charities: loadCharities() };
  } catch (e) {
    return { user: null, transactions: [], charities: loadCharities() };
  }
}

// logger
const log = {
  info: (m) => console.log(m),
  debug: (m) => console.debug(m),
  warn: (m) => console.warn(m),
  error: (m) => console.error(m),
};

log.info('=== logFlow starting ===');

const runtimeStore = loadRuntimeStore();
log.debug('runtimeStore loaded');
log.info(`User before flow: ${runtimeStore && runtimeStore.user ? JSON.stringify(runtimeStore.user) : '<<no user>>'}`);

const charities = loadCharities();
log.info(`charities.count = ${Array.isArray(charities) ? charities.length : 0}`);
log.info(`sample charities: ${JSON.stringify(Array.isArray(charities) ? charities.slice(0,3).map(c=>({id:c.id,name:c.name})) : [])}`);

// detect donate helpers
const donateRoute = tryRequire('./app/api/donate/route') || tryRequire('./src/app/api/donate/route') || null;
const donateUtil = tryRequire('./src/utils/donate') || tryRequire('./src/lib/donate') || null;
log.info(`donateRoute present: ${!!donateRoute}`);
log.info(`donateUtil present: ${!!donateUtil}`);

if (!Array.isArray(charities) || charities.length === 0) {
  log.error('No charity available to simulate donation');
  process.exit(0);
}

// simulate donation (non-mutating)
const charity = charities[0];
const sampleDonation = {
  charityId: charity.id,
  amount: 5.0,
  note: 'logFlow test donation',
  userId: runtimeStore && runtimeStore.user ? runtimeStore.user.id : 'user_1',
};

(async function simulate(){
  try {
    if (donateUtil && typeof donateUtil.createDonation === 'function') {
      log.debug('Would call donateUtil.createDonation (skipped in this script)');
    } else if (donateRoute && typeof donateRoute.POST === 'function') {
      log.debug('Would call donateRoute.POST (skipped in this script)');
    } else {
      log.warn('No donate helper found; reporting only (no mutation)');
      log.info(`Would apply mutation: userId=${sampleDonation.userId} amount=${sampleDonation.amount} charity=${sampleDonation.charityId}`);
    }
  } catch (e) {
    log.error('Error during simulation: ' + String(e));
  }

  log.info('--- Post-donation runtimeStore snapshot ---');
  log.info(`User after flow: ${runtimeStore && runtimeStore.user ? JSON.stringify(runtimeStore.user) : '<<no user>>'}`);
  log.info(`Recent transactions: ${JSON.stringify((runtimeStore && runtimeStore.transactions) ? runtimeStore.transactions.slice(-3) : [])}`);
  log.info('=== logFlow finished ===');
})();
