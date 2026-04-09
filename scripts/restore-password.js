const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/admin/colleges/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add bcrypt import after DeleteButton import
content = content.replace(
  'import DeleteButton from "@/app/admin/_components/DeleteButton";',
  'import DeleteButton from "@/app/admin/_components/DeleteButton";\nimport bcrypt from "bcryptjs";'
);

// Replace the approve action body to generate password and store it
const oldApprove = `  try {
    const db  = await getDb();

    const col = src === "old" ? "request_for_create_college_accounts" : "next_college_signups";
    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id: parseInt(id, 10) };

    const newStatus = src === "old" ? "1" : "approved";
    await db.collection(col).updateOne(filter, {
      $set: { status: newStatus, updated_at: new Date() }

    });
    } catch (e) { console.error("[admin/colleges approveAction]", e); }
  revalidatePath("/admin/colleges");

  revalidatePath("/", "layout");
}`;

const newApprove = `  try {
    const db  = await getDb();
    const col = src === "old" ? "request_for_create_college_accounts" : "next_college_signups";
    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id: parseInt(id, 10) };
    // Auto-generate a password so college can log in immediately
    const year = new Date().getFullYear();
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    const tempPassword = \`Adx@\${year}#\${rand}\`;
    const hashedPassword = await bcrypt.hash(tempPassword, 12);
    const newStatus = src === "old" ? "1" : "approved";
    await db.collection(col).updateOne(filter, {
      $set: { status: newStatus, password_hash: hashedPassword, temp_password: tempPassword, updated_at: new Date() }
    });
  } catch (e) { console.error("[admin/colleges approveAction]", e); }
  revalidatePath("/admin/colleges");
  revalidatePath("/", "layout");
}`;

content = content.replace(oldApprove, newApprove);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done. Password generation restored.');
