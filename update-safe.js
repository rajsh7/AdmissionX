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
  let lines = fs.readFileSync(f, 'utf8').split('\n');
  let modified = false;
  let newLines = [];
  
  for(let i = 0; i < lines.length; i++) {
    newLines.push(lines[i]);
    
    let l = lines[i];
    if (l.includes('revalidatePath') && l.includes('/admin') && !l.includes('layout')) {
      if (i + 1 < lines.length && lines[i+1].includes('layout') && lines[i+1].includes('revalidatePath')) {
        continue;
      }
      
      let match = l.match(/^(\s*)/);
      let indent = match ? match[1] : '  ';
      newLines.push(indent + 'revalidatePath("/", "layout");');
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(f, newLines.join('\n'), 'utf8');
    changed++;
  }
});

console.log('Safe script modified ' + changed + ' files');
