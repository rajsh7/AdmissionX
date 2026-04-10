const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/admin/colleges/page.tsx');
const lines = fs.readFileSync(filePath, 'utf8').split('\n');

// Add bcrypt import after DeleteButton import
const hasBcrypt = lines.some(l => l.includes('import bcrypt'));
if (!hasBcrypt) {
  const idx = lines.findIndex(l => l.includes('import DeleteButton'));
  if (idx !== -1) {
    lines.splice(idx + 1, 0, 'import bcrypt from "bcryptjs";');
    console.log('Added bcrypt import');
  }
}

// Find where rejectCollegeAction ends and add setPasswordAction after it
let rejectEnd = -1;
let inReject = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('async function rejectCollegeAction')) inReject = true;
  if (inReject && lines[i].trim() === '}') {
    rejectEnd = i;
    break;
  }
}

if (rejectEnd !== -1) {
  const newAction = [
    '',
    'async function setCollegePasswordAction(formData: FormData) {',
    '  "use server";',
    '  const id  = formData.get("id")  as string;',
    '  const src = formData.get("src") as string;',
    '  const pwd = (formData.get("new_password") as string)?.trim();',
    '  if (!id || !pwd || pwd.length < 6) return;',
    '  try {',
    '    const db  = await getDb();',
    '    const col = src === "old" ? "request_for_create_college_accounts" : "next_college_signups";',
    '    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id: parseInt(id, 10) };',
    '    const hash = await bcrypt.hash(pwd, 12);',
    '    await db.collection(col).updateOne(filter, { $set: { password_hash: hash, updated_at: new Date() } });',
    '  } catch (e) { console.error("[admin/colleges setPassword]", e); }',
    '  revalidatePath("/admin/colleges");',
    '}',
  ];
  lines.splice(rejectEnd + 1, 0, ...newAction);
  console.log('Added setCollegePasswordAction at line', rejectEnd + 1);
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('Done.');
