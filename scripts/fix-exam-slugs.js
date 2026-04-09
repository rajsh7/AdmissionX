/**
 * Run: node scripts/fix-exam-slugs.js
 * Finds duplicate slugs in examination_details, deduplicates them,
 * then creates the unique sparse index.
 */
const fs = require("fs");
const path = require("path");
const env = fs.readFileSync(path.join(__dirname, "../.env.local"), "utf8");
env.split("\n").forEach((l) => {
  const [k, ...v] = l.split("=");
  if (k && v.length) process.env[k.trim()] = v.join("=").trim();
});
const { MongoClient } = require("mongodb");

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB);
  const col = db.collection("examination_details");

  // 1. Find all duplicate slugs
  const dups = await col.aggregate([
    { $group: { _id: "$slug", count: { $sum: 1 }, ids: { $push: "$_id" } } },
    { $match: { count: { $gt: 1 } } },
    { $sort: { count: -1 } },
  ]).toArray();

  console.log(`Found ${dups.length} duplicate slug(s):\n`);

  let fixed = 0;
  for (const dup of dups) {
    console.log(`  slug="${dup._id}" — ${dup.count} copies`);
    // Keep the first (_id[0]), rename the rest by appending -2, -3, etc.
    const [keep, ...extras] = dup.ids;
    for (let i = 0; i < extras.length; i++) {
      const newSlug = `${dup._id}-${i + 2}`;
      await col.updateOne({ _id: extras[i] }, { $set: { slug: newSlug } });
      console.log(`    renamed _id=${extras[i]} → slug="${newSlug}"`);
      fixed++;
    }
  }

  console.log(`\nFixed ${fixed} duplicate(s).`);

  // 2. Also fix null/missing slugs (would block sparse unique index)
  const nullSlugs = await col.find({ slug: { $in: [null, ""] } }).project({ _id: 1, title: 1 }).toArray();
  console.log(`\nNull/empty slugs: ${nullSlugs.length}`);
  for (const doc of nullSlugs) {
    const base = (doc.title || "exam").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
    const newSlug = `${base}-${doc._id.toString().slice(-6)}`;
    await col.updateOne({ _id: doc._id }, { $set: { slug: newSlug } });
    console.log(`  set slug="${newSlug}" for _id=${doc._id}`);
  }

  // 3. Now create the sparse unique index
  try {
    await col.createIndex({ slug: 1 }, { unique: true, sparse: true, background: true, name: "exam_slug" });
    console.log("\n✅ examination_details.slug unique index created.");
  } catch (e) {
    console.error("\n❌ Index creation failed:", e.message);
  }

  // 4. Final verify — run audit on key queries
  console.log("\n── Post-fix explain audit ──");
  const queries = [
    { col: "application",       filter: { student_id: 1 },                label: "application.student_id" },
    { col: "application",       filter: { college_id: 1 },                label: "application.college_id" },
    { col: "collegefacilities", filter: { collegeprofile_id: 1 },         label: "collegefacilities.cp_id" },
    { col: "course",            filter: { id: 1 },                        label: "course.id" },
    { col: "city",              filter: { state_id: 1 },                  label: "city.state_id" },
    { col: "examination_details", filter: { functionalarea_id: 1 },       label: "exam.fa_id" },
    { col: "examination_details", filter: { slug: "jee-main" },           label: "exam.slug" },
    { col: "password_reset_tokens", filter: { email: "x@x.com", used: false }, label: "reset_tokens.email_used" },
    { col: "next_student_signups",  filter: { activation_token: "abc" },  label: "student.activation_token" },
    { col: "collegeprofile",    filter: { email: "x@x.com" },             label: "collegeprofile.email" },
    { col: "next_college_signups",  filter: { status: "pending" },        label: "college.status" },
    { col: "collegeprofile",    filter: { isShowOnTop: 1, rating: -1, totalRatingUser: -1 }, label: "top_colleges_sort" },
  ];

  for (const q of queries) {
    try {
      const e = await db.collection(q.col).find(q.filter).explain("executionStats");
      const s = e.executionStats;
      const stage = e.queryPlanner.winningPlan.stage;
      const ok = stage !== "COLLSCAN";
      console.log(`${ok ? "✅" : "❌"} [${q.label}] examined=${s.totalDocsExamined} ms=${s.executionTimeMillis} stage=${stage}`);
    } catch (err) {
      console.log(`⚠️  [${q.label}] ${err.message}`);
    }
  }

  await client.close();
}

main().catch(console.error);
