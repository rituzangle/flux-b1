/**
path: suggest-import-rewrites.js
usage: node suggest-import-rewrites.js
cleaned up codebase. moved: utils, mocks, components to src/
- This Script updates all scripts in app/ and src/ with modified paths
- suggests the exact replacement lines but also includes a code command for each file—so you can open it directly in your IDE and paste the fix.
*/
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
  console.log(`  ✅ ${replacement}`);
  console.log(`  💡 Open in IDE: code ${path.resolve(file)}\n`);
});
/**
node  move-utils-mocks.js
mv components src
✅ Moved utils/ src/utils/
✅ Moved mocks/ to src/mocks/
✅ Moved components/ to src/components
📄 Files that need import updates:
 - app/RedirectToOnboarding.tsx
 - app/api/charities/route.ts
 - app/api/donate/route.ts
 - app/history/page.tsx
 - app/onboarding/amount/page.tsx
 - app/onboarding/page.tsx
 - app/onboarding/success/page.tsx
 - app/page.tsx
 - app/send/page.tsx
 - app/settings/page.tsx
 - components/dashboard/RecentActivity.tsx
 - components/onboarding/AIInsightCard.tsx
 - components/onboarding/CharityCard.tsx
 - components/onboarding/ImpactPreview.tsx
 - components/ui/Button.tsx
 - components/ui/Card.tsx
 - src/mocks/charities.ts
 - src/mocks/donations.ts
 - src/mocks/transactions.ts
 - src/mocks/user.ts
 - src/utils/tokens.ts
*/