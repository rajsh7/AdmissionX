/**
 * Run: node scripts/reset-college-password.js <email> <newpassword>
 * Resets a college's password directly in the database.
 */
const fs = require('fs');
const path = require('path');
const env = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
env.split('\n').forEach(l => { const [k, ...v] = l.split('='); if (k && v.length) process.env[k.trim()] = v.join('=').trim(); });

const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  const newPassword = process.argv[3]?.trim();

  if (!email || !newPassword) {
    console.error('Usage: node scripts/reset-college-password.js <email> <newpassword>');
    process.exit(1);
  }
  if (newPassword.length < 8) {
    console.error('Password must be at least 8 characters.');
    process.exit(1);
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB);

  const college = await db.collection('next_college_signups').findOne({ email });
  if (!college) {
    console.error('College not found:', email);
    await client.close();
    process.exit(1);
  }

  const hash = await bcrypt.hash(newPassword, 12);
  await db.collection('next_college_signups').updateOne(
    { email },
    { $set: { password_hash: hash, updated_at: new Date() } }
  );

  console.log(`✅ Password reset for ${email}`);
  console.log(`   College: ${college.college_name}`);
  console.log(`   Status:  ${college.status}`);
  console.log(`   New password: ${newPassword}`);
  await client.close();
}

main().catch(console.error);
