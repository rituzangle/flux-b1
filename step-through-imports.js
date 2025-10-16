/** path: step-through-imports.js
usage: node: step-through-imports.js
purpose: re-hydrate bolt's scope of moved files
*/
const fs = require('fs');
const path = require('path');
const readline = require('readline');

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
    if (entry.isDirectory()) walk(fullPath);
    else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) scanFile(fullPath);
  }
}

walk(projectRoot);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let index = 0;

function showNext() {
  if (index >= results.length) {
    console.log('\n✅ All files processed!');
    rl.close();
    return;
  }

  const { file, line, original, replacement } = results[index];
  console.log(`#-------#\nFile: ${file}`);
  console.log(`🔢 Line ${line}:`);
  console.log(`❌ ${original}`);
  console.log(`✅ ${replacement}`);
  console.log(`code ${path.resolve(file)}`);

  rl.question('\nPress Enter to continue...', () => {
    index++;
    showNext();
  });
}

showNext();
