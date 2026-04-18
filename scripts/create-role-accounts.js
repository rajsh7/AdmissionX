const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const envPath = require("path").join(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8").split("\n").forEach(line => {
    const [k, ...v] = line.split("=");
    if (k && v.length) process.env[k.trim()] = v.join("=").trim();
  });
}

const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || "admissionx";

const ACCOUNTS = [
  {
    name: "Role Admin",
    email: "roleadmin@admissionx.in",
    password: "Admin@123",
    admin_role: "role_admin",
  },
  {
    name: "Counsellor",
    email: "counsellor@admissionx.in",
    password: "Counsellor@123",
    admin_role: "role_counsellor",
  },
];

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  for (const acc of ACCOUNTS) {
    const existing = await db.collection("next_admin_users").findOne({ email: acc.email });
    if (existing) {
      console.log("Already exists:", acc.email);
      continue;
    }
    const password_hash = await bcrypt.hash(acc.password, 10);
    await db.collection("next_admin_users").insertOne({
      name: acc.name,
      email: acc.email,
      password_hash,
      admin_role: acc.admin_role,
      is_active: true,
      created_at: new Date(),
    });
    console.log("Created:", acc.email, "| role:", acc.admin_role, "| password:", acc.password);
  }

  const all = await db.collection("next_admin_users")
    .find({}, { projection: { name: 1, email: 1, admin_role: 1, is_active: 1 } })
    .toArray();
  console.log("\nAll admin users:");
  all.forEach(u => console.log(" -", u.email, "| role:", u.admin_role ?? "super_admin (default)", "| active:", u.is_active));

  await client.close();
}

main().catch(console.error);
