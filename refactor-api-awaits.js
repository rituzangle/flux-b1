const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'utils', 'api.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Replace hardcoded fetch URLs
content = content.replace(/fetch\(['"]\/api\/charities['"]\)/g, 'fetch(API_ENDPOINTS.charities)');
content = content.replace(/fetch\(['"]\/api\/donate['"]/g, 'fetch(API_ENDPOINTS.donate');
content = content.replace(/fetch\(['"]\/api\/user\/profile['"]\)/g, 'fetch(API_ENDPOINTS.userProfile)');
content = content.replace(/fetch\(['"]\/api\/transactions['"]\)/g, 'fetch(API_ENDPOINTS.transactions)');

// Replace hardcoded mock imports
content = content.replace(/import\(['"]@\/src\/mocks\/charities['"]\)/g, 'import(MOCK_MODULES.charities)');
content = content.replace(/import\(['"]@\/mocks\/charities['"]\)/g, 'import(MOCK_MODULES.charities)');
content = content.replace(/import\(['"]@\/src\/mocks\/donations['"]\)/g, 'import(MOCK_MODULES.donations)');
content = content.replace(/import\(['"]@\/mocks\/user['"]\)/g, 'import(MOCK_MODULES.user)');
content = content.replace(/import\(['"]@\/src\/mocks\/user['"]\)/g, 'import(MOCK_MODULES.user)');
content = content.replace(/import\(['"]@\/mocks\/transactions['"]\)/g, 'import(MOCK_MODULES.transactions)');

// Write back the updated file
fs.writeFileSync(filePath, content, 'utf8');
console.log(`✅ Refactored await statements in ${filePath}`);
