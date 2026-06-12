const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('d:\\AdmissionX-Home\\app\\admin');

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let changed = false;
  if (content.includes('<table') && !content.includes('overflow-x-auto')) {
    content = content.replace(/(<table[\s\S]*?<\/table>)/g, '<div className="overflow-x-auto">\n          $1\n        </div>');
    changed = true;
  }
  
  if (content.includes('className="flex items-center justify-between mb-4"')) {
    content = content.replace(/className="flex items-center justify-between mb-4"/g, 'className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4"');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(f, content);
    console.log('Updated', f);
  }
});
