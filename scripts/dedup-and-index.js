// Run: node scripts/dedup-and-index.js
// 1. Removes duplicate email/phone records (keeps the most recent one)
// 2. Creates unique sparse indexes on email and phone for both collections

const { MongoClient } = require("mongodb");
const fs = require("fs");
const envPath = require("path").join(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8").split("\n").forEach(line => {
    const [k, ...v] = line.split("=");
    if (k && v.length) process.env[k.trim()] = v.join("=").trim();
  });
}

const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME   = process.env.MONGODB_DB || "admissionx";

async function removeDuplicates(db, collectionName, field) {
  const dups = await db.collection(collectionName).aggregate([
    { $match: { [field]: { $ne: null, $ne: "" } } },
    { $group: { _id: `$${field}`, count: { $sum: 1 }, ids: { $push: "$_id" }, dates: { $push: "$created_at" } } },
    { $match: { count: { $gt: 1 } } },
  ]).toArray();

  let removed = 0;
  for (const dup of dups) {
    // Keep the most recent (_id is ObjectId so sort descending = newest first)
    const sorted = dup.ids.sort((a, b) => (a > b ? -1 : 1));
    const toDelete = sorted.slice(1); // delete all but the newest
    await db.collection(collectionName).deleteMany({ _id: { $in: toDelete } });
    removed += toDelete.length;
    console.log(`  [${collectionName}] Removed ${toDelete.length} dup(s) for ${field}="${dup._id}"`);
  }
  if (removed === 0) console.log(`  [${collectionName}] No duplicate ${field}s found.`);
  return removed;
}

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  console.log("\n── Removing duplicates ──────────────────────────────");

  await removeDuplicates(db, "next_student_signups", "email");
  await removeDuplicates(db, "next_student_signups", "phone");
  await removeDuplicates(db, "next_college_signups", "email");
  await removeDuplicates(db, "next_college_signups", "phone");

  console.log("\n── Creating unique indexes ───────────────────────────");

  // Drop old indexes if they exist (ignore errors)
  const dropIndex = async (col, name) => {
    try { await db.collection(col).dropIndex(name); } catch {}
  };

  await dropIndex("next_student_signups", "email_unique");
  await dropIndex("next_student_signups", "phone_unique");
  await dropIndex("next_college_signups", "email_unique");
  await dropIndex("next_college_signups", "phone_unique");

  // Unique + sparse (sparse = allows multiple null/missing values)
  await db.collection("next_student_signups").createIndex(
    { email: 1 }, { unique: true, name: "email_unique", background: true }
  );
  console.log("  ✓ next_student_signups.email — unique index created");

  await db.collection("next_student_signups").createIndex(
    { phone: 1 }, { unique: true, sparse: true, name: "phone_unique", background: true }
  );
  console.log("  ✓ next_student_signups.phone — unique sparse index created");

  await db.collection("next_college_signups").createIndex(
    { email: 1 }, { unique: true, name: "email_unique", background: true }
  );
  console.log("  ✓ next_college_signups.email — unique index created");

  await db.collection("next_college_signups").createIndex(
    { phone: 1 }, { unique: true, sparse: true, name: "phone_unique", background: true }
  );
  console.log("  ✓ next_college_signups.phone — unique sparse index created");

  console.log("\n── Done ─────────────────────────────────────────────\n");
  await client.close();
}

main().catch(console.error);
