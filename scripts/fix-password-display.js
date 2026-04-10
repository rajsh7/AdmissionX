const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/admin/colleges/page.tsx');
const lines = fs.readFileSync(filePath, 'utf8').split('\n');

let changed = 0;

for (let i = 0; i < lines.length; i++) {
  // 1. Add temp_password to new pipeline projection - after _source: { $literal: "new" }
  if (lines[i].includes('_source: { $literal: "new" }') && !lines[i+3]?.includes('temp_password')) {
    lines.splice(i + 1, 0, '        temp_password: { $ifNull: ["$temp_password", null] },');
    changed++;
    console.log('Added temp_password to new pipeline at line', i + 1);
  }

  // 2. Add password display before the approve form
  if (lines[i].trim() === '{college.status !== "approved" && (' && !lines[i-2]?.includes('temp_password')) {
    const indent = lines[i].match(/^(\s*)/)[1];
    const insertLines = [
      `${indent}{college.status === "approved" && college.temp_password && (`,
      `${indent}  <div className="w-full mt-1 flex items-center gap-1.5 px-2 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">`,
      `${indent}    <span className="material-symbols-outlined text-[13px] text-amber-600">key</span>`,
      `${indent}    <span className="text-[10px] font-mono font-bold text-amber-700 select-all">{college.temp_password}</span>`,
      `${indent}    <span className="text-[9px] text-amber-500 ml-1">Login password</span>`,
      `${indent}  </div>`,
      `${indent})}`,
      '',
    ];
    lines.splice(i, 0, ...insertLines);
    changed++;
    console.log('Added password display UI at line', i);
    i += insertLines.length; // skip past inserted lines
  }
}

if (changed === 0) {
  console.log('No matches found. Dumping relevant lines for debug:');
  lines.forEach((l, i) => {
    if (l.includes('_source') || l.includes('approved') && l.includes('status')) {
      console.log(i, JSON.stringify(l));
    }
  });
} else {
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log(`Done. ${changed} changes made.`);
}
