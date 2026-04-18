// Run: node scripts/set-admin-roles.js
// Sets admin_role on next_admin_users collection
// Usage: node scripts/set-admin-roles.js

require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");

const ROLES = {
  // email: role
  // Edit these to match your actual admin emails
  // "superadmin@admissionx.in": "super_admin",
  // "admin@admissionx.in": "role_admin",
  // "counsellor@admissionx.in": "role_counsellor",
};

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB);

  // List all admin users first
  const users = await db.collection("next_admin_users").find({}, { projection: { _id: 1, name: 1, email: 1, admin_role: 1 } }).toArray();
  console.log("\nCurrent admin users:");
  users.forEach(u => console.log(`  ${u.email}  →  role: ${u.admin_role ?? "(not set → defaults to super_admin)"}`));

  // Apply role assignments from ROLES map above
  for (const [email, role] of Object.entries(ROLES)) {
    const result = await db.collection("next_admin_users").updateOne(
      { email },
      { $set: { admin_role: role } }
    );
    console.log(`\nSet ${email} → ${role} (matched: ${result.matchedCount})`);
  }

  // Example: set a specific user by email via CLI arg
  // node scripts/set-admin-roles.js email@example.com role_admin
  const [,, argEmail, argRole] = process.argv;
  if (argEmail && argRole) {
    const valid = ["super_admin", "role_admin", "role_counsellor"];
    if (!valid.includes(argRole)) {
      console.error(`Invalid role. Use one of: ${valid.join(", ")}`);
    } else {
      const r = await db.collection("next_admin_users").updateOne(
        { email: argEmail },
        { $set: { admin_role: argRole } }
      );
      console.log(`\nSet ${argEmail} → ${argRole} (matched: ${r.matchedCount})`);
    }
  }

  await client.close();
  console.log("\nDone.");
}

main().catch(console.error);
