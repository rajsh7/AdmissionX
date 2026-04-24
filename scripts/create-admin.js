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

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  const email = "admin@admissionx.in";
  const password = "Admin@1234";
  const name = "Super Admin";

  const existing = await db.collection("next_admin_users").findOne({ email });
  if (existing) {
    console.log("Admin already exists:", email);
    await client.close();
    return;
  }

  const password_hash = await bcrypt.hash(password, 10);
  await db.collection("next_admin_users").insertOne({
    name,
    email,
    password_hash,
    is_active: true,
    created_at: new Date(),
  });

  console.log("✓ Admin created");
  console.log("  Email   :", email);
  console.log("  Password:", password);
  await client.close();
}

main().catch(console.error);

console.log("  Email   :", email);
console.log("  Password:", password);

await client.close();
}

main().catch(console.error);
