// Run: node scripts/cleanup-db.js
// Removes expired/used password reset tokens, test documents, and runs compaction.

const { MongoClient } = require("mongodb");
const path = require("path");
const fs = require("fs");

// Load .env
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

async function main() {
  const client = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  await client.connect();
  const db = client.db(DB_NAME);

  console.log(`\n🔌 Connected to: ${DB_NAME}\n`);

  // 1. Expired or used password reset tokens
  const tokenResult = await db.collection("password_reset_tokens").deleteMany({
    $or: [
      { used: true },
      { expires_at: { $lt: new Date() } },
    ],
  });
  console.log(`🗑️  password_reset_tokens  — removed ${tokenResult.deletedCount} expired/used tokens`);

  // 2. Test / diagnostic documents left by test scripts
  const testResult = await db.collection("test_connection_check").deleteMany({});
  console.log(`🗑️  test_connection_check  — removed ${testResult.deletedCount} test document(s)`);

  // 3. OTP / verification codes older than 24 hours (if collection exists)
  const otpResult = await db.collection("otp_verifications").deleteMany({
    created_at: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  });
  console.log(`🗑️  otp_verifications      — removed ${otpResult.deletedCount} stale OTP record(s)`);

  // 4. Show collection sizes before compaction
  console.log("\n📊 Collection stats (storageSize in bytes):");
  const collections = await db.listCollections().toArray();
  for (const col of collections) {
    try {
      const stats = await db.command({ collStats: col.name });
      const storageMB = (stats.storageSize / 1024 / 1024).toFixed(2);
      const dataMB    = (stats.size / 1024 / 1024).toFixed(2);
      console.log(`   ${col.name.padEnd(35)} data: ${dataMB} MB  |  storage: ${storageMB} MB  |  docs: ${stats.count}`);
    } catch {
      // skip collections we can't stat
    }
  }

  // 5. Compact each collection to reclaim fragmented space
  console.log("\n⚙️  Compacting collections...");
  for (const col of collections) {
    try {
      await db.command({ compact: col.name });
      console.log(`   ✓ ${col.name}`);
    } catch (e) {
      // Atlas M0/M2/M5 free tiers don't support compact — skip gracefully
      if (e.message?.includes("not supported") || e.message?.includes("not allowed") || e.code === 115) {
        console.log(`   ⚠️  ${col.name} — compact not supported on this tier (Atlas free/shared)`);
        break;
      }
      console.log(`   ✗ ${col.name}: ${e.message}`);
    }
  }

  console.log("\n✅ Cleanup complete.\n");
  await client.close();
}

main().catch(err => {
  console.error("❌ Cleanup failed:", err.message);
  process.exit(1);
});
