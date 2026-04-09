const fs = require("fs");
const path = require("path");
const env = fs.readFileSync(path.join(__dirname, "../.env.local"), "utf8");
env.split("\n").forEach((l) => {
  const [k, ...v] = l.split("=");
  if (k && v.length) process.env[k.trim()] = v.join("=").trim();
});
const { MongoClient } = require("mongodb");

async function explain(db, col, filter, label) {
  try {
    const e = await db.collection(col).find(filter).explain("executionStats");
    const s = e.executionStats;
    console.log(`[${label}] examined=${s.totalDocsExamined} returned=${s.nReturned} ms=${s.executionTimeMillis} stage=${e.queryPlanner.winningPlan.stage}`);
  } catch (err) {
    console.log(`[${label}] ERR: ${err.message}`);
  }
}

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB);

  await explain(db, "application", { student_id: 1 }, "application.student_id");
  await explain(db, "application", { college_id: 1 }, "application.college_id");
  await explain(db, "application", { status: "pending" }, "application.status");
  await explain(db, "collegefacilities", { collegeprofile_id: 1 }, "collegefacilities.cp_id");
  await explain(db, "course", { id: 1 }, "course.id");
  await explain(db, "course", { name: { $regex: "eng", $options: "i" } }, "course.name_regex");
  await explain(db, "country", { name: { $exists: true, $ne: "" } }, "country.name");
  await explain(db, "examination_details", { functionalarea_id: 1 }, "exam.fa_id");
  await explain(db, "examination_details", { slug: "jee-main" }, "exam.slug");
  await explain(db, "password_reset_tokens", { email: "test@test.com", used: false }, "reset_tokens.email_used");
  await explain(db, "password_reset_tokens", { token: "abc123" }, "reset_tokens.token");
  await explain(db, "next_student_signups", { activation_token: "abc" }, "student.activation_token");
  await explain(db, "next_student_signups", { email: "test@test.com" }, "student.email");
  await explain(db, "next_college_signups", { email: "test@test.com" }, "college.email");
  await explain(db, "next_college_signups", { status: "pending" }, "college.status");
  await explain(db, "collegeprofile", { email: "test@test.com" }, "collegeprofile.email");
  await explain(db, "blogs", { isactive: 1, slug: { $exists: true, $ne: "" } }, "blogs.active_slug");
  await explain(db, "news", { isactive: 1, slug: { $exists: true, $ne: "" } }, "news.active_slug");
  await explain(db, "gallery", { users_id: 100, fullimage: { $exists: true, $ne: "" } }, "gallery.users_fullimage");
  await explain(db, "collegemaster", { collegeprofile_id: 1, functionalarea_id: 1 }, "cm.cp_fa");
  await explain(db, "city", { state_id: 1 }, "city.state_id");

  await client.close();
}

main().catch(console.error);
