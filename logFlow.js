// logFlow.js
// Robust inspector: works when mocks are TypeScript and not require()-able by plain Node.
// Run with: node logFlow.js

const fs = require('fs');
const path = require('path');

function safeRequire(p) {
  try { return require(p); } catch (e) { return null; }
}

function readFileSafe(rel) {
  try { return fs.readFileSync(path.resolve(rel), 'utf8'); } catch (e) { return null; }
}

// Try to extract exported value from TS/JS source file by finding "export const NAME = <value>"
// This is a heuristic but works for your simple mock files.
function extractExportedJSON(sourceText, exportName) {
  if (!sourceText) return null;
  const re = new RegExp(`export\\s+const\\s+${exportName}\\s*=\\s*([\\s\\S]*?);\\s*$`, 'm');
  const m = sourceText.match(re);
  if (!m) return null;
  let raw = m[1].trim();
  // Remove trailing TypeScript type assertions like "as Charity[]"
  raw = raw.replace(/\\s+as\\s+[\\w\

\[\\]

\\<\\>\\s,]+/g, '');
  // Replace single quotes with double quotes for JSON parsing, but preserve object keys that are unquoted
  // Very naive: convert common JS object literal to JSON-friendly string
  // Step 1: convert backticks to double quotes
  raw = raw.replace(/`/g, '"');
  // Step 2: convert single-quoted strings to double-quoted
  raw = raw.replace(/'([^']*)'/g, (_, p) => JSON.stringify(p));
  // Step 3: add quotes around unquoted object keys (simple heuristic)
  raw = raw.replace(/([,{]\\s*)([A-Za-z0-9_\\-]+)\\s*:/g, '$1"$2":');
  // Now try JSON.parse
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function loadMockCharities() {
  // Try regular require paths first
  const candidates = [
    '@/mocks/charities',
    './src/mocks/charities',
    './mocks/charities',
    './src/mocks/charities.ts',
    './src/mocks/charities.js',
  ];
  for (const c of candidates) {
    const mod = safeRequire(c);
    if (mod) {
      const arr = (mod.mockCharities ?? mod.charities ?? mod.default ?? mod);
      if (Array.isArray(arr) && arr.length > 0) return arr;
    }
  }

  // Fallback: read file and extract the exported array
  const txt = readFileSafe('src/mocks/charities.ts') || readFileSafe('src/mocks/charities.js') || readFileSafe('src/mocks/charities.mjs');
  const fromMock = extractExportedJSON(txt, 'mockCharities') || extractExportedJSON(txt, 'charities');
  if (Array.isArray(fromMock)) return fromMock;
  return [];
}

function loadRuntimeStore() {
  const candidates = [
    './src/mocks/runtimeStore',
    './src/mocks/runtimeStore.ts',
    './src/mocks/runtime-store',
    './mocks/runtimeStore',
  ];
  for (const c of candidates) {
    const mod = safeRequire(c);
    if (mod) {
      const rs = mod.runtimeStore ?? mod.default ?? mod;
      if (rs && typeof rs === 'object') return rs;
    }
  }

  // Fallback: try to read src/mocks/runtimeStore.ts and parse a user object and charities reference
  const txt = readFileSafe('src/mocks/runtimeStore.ts') || readFileSafe('src/mocks/runtimeStore.js');
  if (!txt) return { user: null, transactions: [], charities: [] };

  // Attempt to extract a user object literal
  const userRe = /user\s*:\s*\\{([\\s\\S]*?)\\}\\s*as\\s*User/;
  const userMatch = txt.match(userRe);
  let user = null;
  if (userMatch) {
    let raw = `{${userMatch[1]}}`;
    raw = raw.replace(/\\s+as\\s+[\\w\

\[\\]

\\<\\>\\s,]+/g, '');
