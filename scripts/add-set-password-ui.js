const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/admin/colleges/page.tsx');
const lines = fs.readFileSync(filePath, 'utf8').split('\n');

// Find the DeleteButton line
const delIdx = lines.findIndex(l => l.includes('<DeleteButton action={deleteCollegeById'));
if (delIdx === -1) { console.log('DeleteButton not found'); process.exit(1); }

const indent = '                  ';
const newLines = [
  `${indent}{/* Set Password */}`,
  `${indent}{college.status === "approved" && (`,
  `${indent}  <form action={setCollegePasswordAction} className="flex items-center gap-1.5 mt-2">`,
  `${indent}    <input type="hidden" name="id"  value={String(college._id)} />`,
  `${indent}    <input type="hidden" name="src" value={college._source ?? "new"} />`,
  `${indent}    <input`,
  `${indent}      type="text"`,
  `${indent}      name="new_password"`,
  `${indent}      placeholder="Set new password"`,
  `${indent}      minLength={6}`,
  `${indent}      required`,
  `${indent}      className="flex-1 h-7 px-2 text-[10px] border border-slate-200 rounded-lg focus:outline-none focus:border-[#008080] bg-white"`,
  `${indent}    />`,
  `${indent}    <button type="submit" className="text-[10px] font-black px-2 py-1 rounded-lg bg-[#008080] text-white hover:bg-[#006666] transition-colors whitespace-nowrap">`,
  `${indent}      Set`,
  `${indent}    </button>`,
  `${indent}  </form>`,
  `${indent})}`,
  '',
];

lines.splice(delIdx, 0, ...newLines);
fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('Added Set Password form at line', delIdx);
