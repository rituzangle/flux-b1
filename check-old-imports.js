// check-old-imports.js
const fs = require('fs');
const path = require('path');

const patterns = ['@/utils', '@/mocks', '@/components'];
const flagged = [];

function scan(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  patterns.forEach(p => {
    if (content.includes(p)) {
      flagged.push(filePath);
    }
  });
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) scan(fullPath);
  }
}

walk('.');

if (flagged.length) {
  console.log('\n🚨 Still using old import paths in:');
  flagged.forEach(f => console.log(' -', f));
} else {
  console.log('\n✅ All import paths are updated!');
}
