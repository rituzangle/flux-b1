const fs = require('fs');
const path = require('path');

const projectRoot = '.';
const targets = ['utils', 'mocks', 'components'];
const results = [];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    targets.forEach(target => {
      const regex = new RegExp(`from ['"]@/${target}(/[^'"]*)?['"]`);
      if (regex.test(line)) {
        const updated = line.replace(
          regex,
          (match, subpath = '') => `from '@/src/${target}${subpath}'`
        );
        results.push({
          file: filePath,
          line: index + 1,
          original: line.trim(),
          replacement: updated.trim(),
        });
      }
    });
  });
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      scanFile(fullPath);
    }
  }
}

walk(projectRoot);

// Output results
console.log('\n📌 Suggested Import Replacements:\n');
results.forEach(({ file, line, original, replacement }) => {
  console.log(`File: ${file}`);
  console.log(`Line ${line}:`);
  console.log(`  ❌ ${original}`);
  console.log(`  ✅ ${replacement}\n`);
});
