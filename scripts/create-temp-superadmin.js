// Run: node scripts/create-temp-superadmin.js
// Creates a temporary super admin account. Does NOT modify any existing accounts.

const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

[".env.local", ".env"].forEach(f => {
  const p = path.join(__dirname, "..", f);
  if (fs.existsSync(p)) {
    fs.readFileSync(p, "utf8").split("\n").forEach(line => {
      const [k, ...v] = line.split("=");
      if (k && v.length && !process.env[k.trim()]) process.env[k.trim()] = v.join("=").trim();
    });
  }
});

const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME   = process.env.MONGODB_DB || "admissionx";

const EMAIL    = "tempadmin@admissionx.in";
const PASSWORD = "TempAdmin@2025";
const NAME     = "Temp Super Admin";

async function main() {
  const client = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  await client.connect();
  const db = client.db(DB_NAME);

  const existing = await db.collection("next_admin_users").findOne({ email: EMAIL });
  if (existing) {
    console.log("⚠️  Account already exists:", EMAIL);
    await client.close();
    return;
  }

  const password_hash = await bcrypt.hash(PASSWORD, 10);
  await db.collection("next_admin_users").insertOne({
    name:          NAME,
    email:         EMAIL,
    password_hash,
    admin_role:    "super_admin",
    is_active:     true,
    created_at:    new Date(),
  });

  console.log("✅ Temporary super admin created.");
  console.log("   Email   :", EMAIL);
  console.log("   Password:", PASSWORD);
  console.log("   Role    : super_admin");
  console.log("\n⚠️  Delete this account after use.");
  await client.close();
}

main().catch(err => {
  console.error("❌ Failed:", err.message);
  process.exit(1);
});
