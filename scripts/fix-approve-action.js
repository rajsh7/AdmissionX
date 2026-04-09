const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/admin/colleges/page.tsx');
const lines = fs.readFileSync(filePath, 'utf8').split('\n');

// 1. Add bcrypt import after DeleteButton import if not present
const hasBcrypt = lines.some(l => l.includes('import bcrypt'));
if (!hasBcrypt) {
  const dbIdx = lines.findIndex(l => l.includes('import DeleteButton'));
  if (dbIdx !== -1) {
    lines.splice(dbIdx + 1, 0, 'import bcrypt from "bcryptjs";');
    console.log('Added bcrypt import at line', dbIdx + 1);
  }
}

// 2. Find the $set line in approveCollegeAction and replace it with password generation + $set
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('$set: { status: newStatus, updated_at: new Date() }') &&
      lines[i-5]?.includes('approveCollegeAction') || 
      (lines[i].includes('$set: { status: newStatus, updated_at: new Date() }') && i < 40)) {
    
    const indent = lines[i].match(/^(\s*)/)[1];
    // Replace the single $set line with password generation + $set
    lines.splice(i - 1, 3,
      `    const year = new Date().getFullYear();`,
      `    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();`,
      `    const tempPassword = \`Adx@\${year}#\${rand}\`;`,
      `    const hashedPassword = await bcrypt.hash(tempPassword, 12);`,
      `    const newStatus = src === "old" ? "1" : "approved";`,
      `    await db.collection(col).updateOne(filter, {`,
      `      $set: { status: newStatus, password_hash: hashedPassword, temp_password: tempPassword, updated_at: new Date() }`,
      `    });`,
    );
    console.log('Added password generation to approveCollegeAction at line', i);
    break;
  }
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('Done.');
