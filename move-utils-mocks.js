// jsh script: move-utils-and-mocks.js

const fs = require('fs');
const path = require('path');

const projectRoot = '.'; // adjust if needed
const oldPaths = ['utils', 'mocks'];
const newRoot = 'src';

// Step 1: Create src/ if it doesn't exist
if (!fs.existsSync(newRoot)) {
  fs.mkdirSync(newRoot);
  console.log('✅ Created src/ directory');
}

// Step 2: Move each folder
oldPaths.forEach(folder => {
  const oldPath = path.join(projectRoot, folder);
  const newPath = path.join(projectRoot, newRoot, folder);

  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`✅ Moved ${folder}/ to src/${folder}/`);
  } else {
    console.log(`⚠️ ${folder}/ not found`);
  }
});

// Step 3: Scan all .ts and .tsx files for references
const filesToUpdate = [];

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes("from '@/utils") || content.includes("from '@/mocks")) {
        filesToUpdate.push(fullPath);
      }
    }
  }
}

scanDir(projectRoot);

// Step 4: Output list of files to update
console.log('\n📄 Files that need import updates:');
filesToUpdate.forEach(file => console.log(' -', file));
