const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/admin/colleges/page.tsx');
const lines = fs.readFileSync(filePath, 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('_source?: "old" | "new";')) {
    lines.splice(i + 1, 0, '    temp_password?: string | null;');
    console.log('Added temp_password to CollegeRow at line', i + 1);
    break;
  }
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('Done.');
