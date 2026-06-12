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
let count = 0;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let changed = false;

  const regex = /<table\s+className="([^"]*)"/g;
  content = content.replace(regex, (match, classes) => {
    if (!classes.includes('min-w-')) {
      changed = true;
      return '<table className="' + classes + ' min-w-[800px]"';
    }
    return match;
  });
  
  if (changed) {
    fs.writeFileSync(f, content);
    console.log('Added min-w to', f);
    count++;
  }
});
console.log('Total files fixed:', count);
