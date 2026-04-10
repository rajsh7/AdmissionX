const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/admin/colleges/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Remove leftover comment line
content = content.replace(/\s*\/\/ Generate temp password: Adx@\{year\}#\{random6\}\s*\n/g, '\n');

// Fix duplicate catch blocks - remove the extra one
content = content.replace(/\n\s*\} catch \(e\) \{ console\.error\("\[admin\/colleges approveAction\]", e\); \}\s*\n(\s*\} catch \(e\) \{ console\.error\("\[admin\/colleges approveAction\]", e\); \})/, '\n  $1');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done.');
