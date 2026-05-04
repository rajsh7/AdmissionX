const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const envPath = require("path").join(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8").split("\n").forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const idx = trimmed.indexOf("=");
    if (idx === -1) return;
    const k = trimmed.slice(0, idx).trim();
    const v = trimmed.slice(idx + 1).trim().replace(/^"|"$/g, "");
    if (k && !process.env[k]) process.env[k] = v;
  });
}

const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || "admissionx";

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  const email = "rajsharma74411@gmail.com";
  const password = "Adx@Super2026";

  const existing = await db.collection("next_admin_users").findOne({ email });
  if (existing) {
    console.log("Already exists:", email);
    await client.close();
    return;
  }

  const password_hash = await bcrypt.hash(password, 12);
  await db.collection("next_admin_users").insertOne({
    name: "Super Admin 2",
    email,
    password_hash,
    is_active: true,
    is_hidden: true,
    admin_role: "super_admin",
    created_at: new Date(),
  });

  console.log("✓ Second super admin added (hidden)");
  console.log("  Email   :", email);
  console.log("  Password:", password);
  await client.close();
}

main().catch(console.error);
