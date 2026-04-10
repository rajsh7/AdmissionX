/**
 * Run: node scripts/fix-all-db-issues.js
 * Fixes ALL remaining database issues found in the full audit:
 *  1. Missing indexes on application, collegefacilities, course, country, etc.
 *  2. TTL index on password_reset_tokens (auto-expire old tokens)
 *  3. TTL index on activation tokens
 *  4. Sparse/partial indexes where needed
 *  5. collegeprofile.email index (used in college login slug lookup)
 *  6. city.state_id index (45553 doc COLLSCAN → instant)
 *  7. Duplicate/redundant index cleanup
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

  let created = 0, skipped = 0, failed = 0, dropped = 0;

  async function ensure(col, spec, opts = {}) {
    try {
      await db.collection(col).createIndex(spec, { background: true, ...opts });
      console.log(`✅ ${col}: ${JSON.stringify(spec)}`);
      created++;
    } catch (e) {
      if (e.code === 85 || e.code === 86 || e.message.includes("already exists") || e.message.includes("Index already exists")) {
        console.log(`⏭  ${col}: ${JSON.stringify(spec)} (exists)`);
        skipped++;
      } else {
        console.warn(`❌ ${col}: ${JSON.stringify(spec)} — ${e.message}`);
        failed++;
      }
    }
  }

  async function drop(col, name) {
    try {
      await db.collection(col).dropIndex(name);
      console.log(`🗑  dropped ${col}.${name}`);
      dropped++;
    } catch (e) {
      console.log(`⏭  ${col}.${name} not found (skip drop)`);
    }
  }

  console.log("\n── 1. application collection (COLLSCAN on all fields) ──");
  await ensure("application", { student_id: 1 }, { name: "app_student" });
  await ensure("application", { college_id: 1 }, { name: "app_college" });
  await ensure("application", { status: 1 }, { name: "app_status" });
  await ensure("application", { college_id: 1, status: 1, created_at: -1 }, { name: "app_college_status_date" });

  console.log("\n── 2. applications collection (new schema used by student dashboard) ──");
  await ensure("applications", { studentId: 1, createdAt: -1 }, { name: "apps_student_date" });
  await ensure("applications", { collegeId: 1, status: 1 }, { name: "apps_college_status" });
  await ensure("applications", { applicationRef: 1 }, { unique: true, sparse: true, name: "apps_ref" });

  console.log("\n── 3. collegefacilities (73505 docs, COLLSCAN — worst offender) ──");
  await ensure("collegefacilities", { collegeprofile_id: 1 }, { name: "cf_cp" });

  console.log("\n── 4. course collection ──");
  await ensure("course", { id: 1 }, { unique: true, sparse: true, name: "course_id" });
  await ensure("course", { name: 1 }, { name: "course_name" });
  await ensure("course", { pageslug: 1 }, { sparse: true, name: "course_slug" });

  console.log("\n── 5. country collection ──");
  await ensure("country", { name: 1 }, { name: "country_name" });

  console.log("\n── 6. city.state_id (45553 doc COLLSCAN) ──");
  await ensure("city", { state_id: 1, name: 1 }, { name: "city_state_name" });

  console.log("\n── 7. examination_details ──");
  await ensure("examination_details", { functionalarea_id: 1 }, { name: "exam_fa" });
  await ensure("examination_details", { totalViews: -1, created_at: -1 }, { name: "exam_views_date" });
  await ensure("examination_details", { slug: 1 }, { unique: true, sparse: true, name: "exam_slug" });

  console.log("\n── 8. password_reset_tokens — TTL auto-expire ──");
  // TTL index: MongoDB auto-deletes expired tokens after 1 hour grace
  await ensure("password_reset_tokens", { expires_at: 1 }, { expireAfterSeconds: 3600, name: "reset_token_ttl" });
  await ensure("password_reset_tokens", { email: 1, used: 1 }, { name: "reset_email_used" });
  await ensure("password_reset_tokens", { token: 1 }, { unique: true, name: "reset_token_unique" });

  console.log("\n── 9. next_student_signups — activation token + TTL ──");
  await ensure("next_student_signups", { activation_token: 1 }, { sparse: true, name: "student_activation" });
  // TTL: auto-delete unactivated accounts after 48h
  await ensure("next_student_signups", { activation_token_exp: 1 }, { expireAfterSeconds: 0, partialFilterExpression: { is_active: 0 }, name: "student_activation_ttl" });
  await ensure("next_student_signups", { is_active: 1 }, { name: "student_active" });

  console.log("\n── 10. next_college_signups ──");
  await ensure("next_college_signups", { status: 1, created_at: -1 }, { name: "college_status_date" });

  console.log("\n── 11. collegeprofile.email (used in college login) ──");
  await ensure("collegeprofile", { email: 1 }, { sparse: true, name: "cp_email" });

  console.log("\n── 12. next_admin_users ──");
  await ensure("next_admin_users", { email: 1, is_active: 1 }, { name: "admin_email_active" });

  console.log("\n── 13. news_types / news_tags ──");
  await ensure("news_types", { slug: 1 }, { unique: true, sparse: true, name: "news_type_slug" });
  await ensure("news_tags", { slug: 1 }, { unique: true, sparse: true, name: "news_tag_slug" });

  console.log("\n── 14. ads_managements ──");
  await ensure("ads_managements", { isactive: 1, ads_position: 1 }, { name: "ads_active_pos" });

  console.log("\n── 15. college_reviews — compound for page load ──");
  await ensure("college_reviews", { collegeprofile_id: 1, created_at: -1 }, { name: "reviews_cp_date" });

  console.log("\n── 16. Drop redundant single-field indexes superseded by compounds ──");
  // isShowOnTop:1 alone is superseded by isShowOnTop+rating+totalRatingUser compound
  await drop("collegeprofile", "isShowOnTop_1");
  // rating:-1 alone is superseded by compound
  await drop("collegeprofile", "rating_-1");
  // isShowOnHome:1 alone superseded by isShowOnHome+rating compound
  await drop("collegeprofile", "isShowOnHome_1");
  // functionalarea_id:1 alone superseded by fa+cp compound
  await drop("collegemaster", "functionalarea_id_1");
  // degree_id:1 alone superseded by deg+cp compound
  await drop("collegemaster", "degree_id_1");

  console.log(`\n✅ Done. created=${created} skipped=${skipped} dropped=${dropped} failed=${failed}`);
  await client.close();
}

main().catch(console.error);
