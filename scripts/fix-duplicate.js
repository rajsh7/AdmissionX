const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/admin/colleges/page.tsx');
const lines = fs.readFileSync(filePath, 'utf8').split('\n');

// Remove the first (early) newStatus line inside approveCollegeAction
// It appears before the password generation block
let removedFirst = false;
for (let i = 0; i < 40; i++) {
  if (!removedFirst && lines[i].includes('const newStatus = src === "old"') && 
      !lines[i-1]?.includes('hashedPassword')) {
    lines.splice(i, 1);
    removedFirst = true;
    console.log('Removed duplicate newStatus at line', i);
    break;
  }
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('Done.');
