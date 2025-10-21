// debug/viewRuntimeStore.js
// Run: node debug/viewRuntimeStore.js
const path = require('path');

function tryRequire(p) {
  try { return require(p); } catch (e) { return null; }
}

const candidates = [
  path.resolve('src/mocks/runtimeStore'),
  path.resolve('src/mocks/runtimeStore.ts'),
  path.resolve('mocks/runtimeStore'),
];

let rs = null;
for (const c of candidates) {
  rs = tryRequire(c);
  if (rs) {
    rs = rs.runtimeStore ?? rs.default ?? rs;
    break;
  }
}

if (!rs) {
  console.error('runtimeStore module could not be required. Fallback: show file content of src/mocks/runtimeStore.ts if present.');
  const fs = require('fs');
  const p = path.resolve('src/mocks/runtimeStore.ts');
  if (fs.existsSync(p)) console.log(fs.readFileSync(p, 'utf8').slice(0, 2000));
  process.exit(1);
}

console.log('--- runtimeStore.user ---');
console.log(JSON.stringify(rs.user, null, 2));
console.log('--- first 6 transactions ---');
console.log(JSON.stringify((rs.transactions || []).slice(0,6), null, 2));
console.log('--- transactions count ---', (rs.transactions || []).length);
