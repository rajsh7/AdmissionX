const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/admin/colleges/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Remove bcrypt import
content = content.replace(/import bcrypt from "bcryptjs";\r?\n/g, '');

// Remove sendCollegeApprovalEmail import
content = content.replace(/import \{ sendCollegeApprovalEmail \} from "@\/lib\/email";\r?\n/g, '');

// Replace the entire approveCollegeAction body - remove temp password + email sending
const oldApprove = /const year = new Date\(\)\.getFullYear\(\);[\s\S]*?const hashedPassword = await bcrypt\.hash\(tempPassword, 12\);/;
content = content.replace(oldApprove, '');

// Remove password_hash from the updateOne call
content = content.replace(/\$set: \{ status: newStatus, password_hash: hashedPassword, updated_at: new Date\(\) \}/, '$set: { status: newStatus, updated_at: new Date() }');

// Remove the email sending block
const emailBlock = /\/\/ Send approval email with temp password[\s\S]*?}\s*\n\s*}/;
content = content.replace(emailBlock, '} catch (e) { console.error("[admin/colleges approveAction]", e); }');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done. Approval email removed.');
