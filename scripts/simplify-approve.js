const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/admin/colleges/page.tsx');
const lines = fs.readFileSync(filePath, 'utf8').split('\n');

// Find and replace the approve action body
let inApprove = false;
let filterLine = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('async function approveCollegeAction')) inApprove = true;
  if (inApprove && lines[i].includes('const filter = ObjectId.isValid')) {
    filterLine = i;
    break;
  }
}

if (filterLine === -1) {
  console.log('Could not find filter line'); process.exit(1);
}

// Find the end of the try block (the catch line)
let catchLine = -1;
for (let i = filterLine; i < filterLine + 20; i++) {
  if (lines[i].includes('} catch (e)') || lines[i].includes('catch (e)')) {
    catchLine = i;
    break;
  }
}

if (catchLine === -1) {
  console.log('Could not find catch line'); process.exit(1);
}

console.log(`Replacing lines ${filterLine+1} to ${catchLine-1}`);

// Replace everything between filter line and catch with simple status update
const newLines = [
  `    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id: parseInt(id, 10) };`,
  `    const newStatus = src === "old" ? "1" : "approved";`,
  `    await db.collection(col).updateOne(filter, {`,
  `      $set: { status: newStatus, updated_at: new Date() }`,
  `    });`,
];

lines.splice(filterLine, catchLine - filterLine, ...newLines);

// Remove bcrypt import if present (no longer needed in approve)
const bcryptIdx = lines.findIndex(l => l.trim() === 'import bcrypt from "bcryptjs";');
if (bcryptIdx !== -1) {
  lines.splice(bcryptIdx, 1);
  console.log('Removed bcrypt import');
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('Done. Approve action simplified.');
