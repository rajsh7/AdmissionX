const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory() && !file.includes('.next') && !file.includes('node_modules')) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('c:/Users/SIU-1/AdmissionX-Home/app/admin');
let changed = 0;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let lines = content.split('\n');
  let modified = false;
  
  for(let i = 0; i < lines.length; i++) {
    if (lines[i].includes('revalidatePath') && lines[i].includes('/admin') && !lines[i].includes('layout')) {
      if (i + 1 < lines.length && lines[i+1].includes('layout') && lines[i+1].includes('revalidatePath')) continue; // Already next line
      if (typeof lines[i] === 'string') {
        lines[i] = lines[i] + '\n  revalidatePath("/", "layout");';
        modified = true;
      }
    }
  }
  
  if (modified) {
    fs.writeFileSync(f, lines.join('\n'), 'utf8');
    changed++;
  }
});

console.log('Modified ' + changed + ' files');
