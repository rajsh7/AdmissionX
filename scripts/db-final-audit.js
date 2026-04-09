/**
 * Run: node scripts/db-final-audit.js
 * Shows final index count and doc count for every collection.
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

  const collections = [
    "collegeprofile", "collegemaster", "users", "city", "functionalarea",
    "degree", "course", "country", "faculty", "gallery", "placement",
    "college_reviews", "college_faqs", "college_admission_procedures",
    "collegefacilities", "examination_details", "blogs", "news",
    "news_types", "news_tags", "application", "applications",
    "next_student_signups", "next_college_signups", "next_admin_users",
    "password_reset_tokens", "ads_managements",
  ];

  console.log("\n" + "─".repeat(70));
  console.log(` ${"Collection".padEnd(38)} ${"Docs".padStart(8)}  ${"Indexes".padStart(7)}`);
  console.log("─".repeat(70));

  for (const name of collections) {
    try {
      const [indexes, count] = await Promise.all([
        db.collection(name).indexes(),
        db.collection(name).estimatedDocumentCount(),
      ]);
      console.log(` ${name.padEnd(38)} ${String(count).padStart(8)}  ${String(indexes.length).padStart(7)}`);
    } catch {
      console.log(` ${name.padEnd(38)} ${"N/A".padStart(8)}  ${"N/A".padStart(7)}`);
    }
  }

  console.log("─".repeat(70));

  // Critical query performance check
  console.log("\n── Critical query performance ──\n");
  const checks = [
    ["collegeprofile", { isShowOnTop: 1 }, { rating: -1, totalRatingUser: -1 }, "Top colleges listing"],
    ["collegeprofile", { isTopUniversity: 1 }, { topUniversityRank: 1 }, "Top universities listing"],
    ["collegeprofile", { slug: "galgotias-university-91" }, {}, "College page by slug"],
    ["collegemaster",  { collegeprofile_id: 1 }, {}, "Courses for college"],
    ["collegefacilities", { collegeprofile_id: 1 }, {}, "Facilities for college"],
    ["gallery",        { users_id: 100 }, {}, "Gallery for college"],
    ["city",           { state_id: 1 }, {}, "Cities by state"],
    ["examination_details", { functionalarea_id: 1 }, {}, "Exams by stream"],
    ["application",    { student_id: 1 }, {}, "Student applications"],
    ["password_reset_tokens", { token: "abc" }, {}, "Password reset token lookup"],
  ];

  for (const [col, filter, sort, label] of checks) {
    try {
      const cursor = Object.keys(sort).length
        ? db.collection(col).find(filter).sort(sort).limit(12)
        : db.collection(col).find(filter).limit(12);
      const e = await cursor.explain("executionStats");
      const s = e.executionStats;
      const stage = e.queryPlanner.winningPlan.stage;
      const ok = stage !== "COLLSCAN";
      console.log(`${ok ? "✅" : "❌"} ${label.padEnd(35)} examined=${String(s.totalDocsExamined).padStart(6)}  ms=${String(s.executionTimeMillis).padStart(4)}  stage=${stage}`);
    } catch (err) {
      console.log(`⚠️  ${label.padEnd(35)} ${err.message}`);
    }
  }

  await client.close();
}

main().catch(console.error);
