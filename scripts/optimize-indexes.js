/**
 * Run: node scripts/optimize-indexes.js
 * Applies all missing/optimized indexes found from db-audit.js
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

  const indexes = [
    // ── CRITICAL: collegeprofile.id is used in every $lookup join ──────────
    // Currently COLLSCAN (16977 docs examined per join!) — needs index urgently
    { col: "collegeprofile", spec: { id: 1 }, opts: { unique: true, sparse: true, name: "id_1" } },

    // ── TOP COLLEGES: compound sort index ───────────────────────────────────
    // Current query examines 16969 docs then sorts in memory (SORT stage = bad)
    // This compound index lets MongoDB sort without loading all docs
    { col: "collegeprofile", spec: { isShowOnTop: 1, rating: -1, totalRatingUser: -1 }, opts: { name: "top_rating_sort" } },
    { col: "collegeprofile", spec: { isTopUniversity: 1, topUniversityRank: 1, rating: -1 }, opts: { name: "top_univ_sort" } },
    { col: "collegeprofile", spec: { isShowOnHome: 1, rating: -1 }, opts: { name: "home_rating_sort" } },

    // ── CITY FILTER: compound with sort ─────────────────────────────────────
    { col: "collegeprofile", spec: { registeredAddressCityId: 1, isShowOnTop: 1, rating: -1 }, opts: { name: "city_top_rating" } },

    // ── SLUG: already indexed but ensure unique ──────────────────────────────
    { col: "collegeprofile", spec: { slug: 1 }, opts: { unique: true, name: "slug_unique" } },

    // ── COLLEGEMASTER: compound for stream+degree filter pipeline ────────────
    // The search API does 2 separate queries then intersects — these help both
    { col: "collegemaster", spec: { functionalarea_id: 1, collegeprofile_id: 1, fees: 1 }, opts: { name: "fa_cp_fees" } },
    { col: "collegemaster", spec: { degree_id: 1, collegeprofile_id: 1, fees: 1 }, opts: { name: "deg_cp_fees" } },
    { col: "collegemaster", spec: { collegeprofile_id: 1, functionalarea_id: 1 }, opts: { name: "cp_fa" } },

    // ── GALLERY: compound to avoid post-filter sort ──────────────────────────
    // Currently 27ms with SORT stage — compound index eliminates in-memory sort
    { col: "gallery", spec: { users_id: 1, fullimage: 1, _id: -1 }, opts: { name: "gallery_user_image" } },

    // ── FACULTY: compound for college page load ──────────────────────────────
    { col: "faculty", spec: { collegeprofile_id: 1, sortorder: 1, name: 1 }, opts: { name: "faculty_cp_sort" } },

    // ── PLACEMENT: already has collegeprofile_id, add unique ────────────────
    { col: "placement", spec: { collegeprofile_id: 1 }, opts: { name: "placement_cp" } },

    // ── COLLEGE_REVIEWS ──────────────────────────────────────────────────────
    { col: "college_reviews", spec: { collegeprofile_id: 1, created_at: -1 }, opts: { name: "reviews_cp_date" } },

    // ── COLLEGE_ADMISSION_PROCEDURES ────────────────────────────────────────
    { col: "college_admission_procedures", spec: { collegeprofile_id: 1 }, opts: { name: "adm_proc_cp" } },

    // ── BLOGS & NEWS: listing + slug ────────────────────────────────────────
    { col: "blogs", spec: { isactive: 1, created_at: -1 }, opts: { name: "blogs_active_date" } },
    { col: "blogs", spec: { slug: 1 }, opts: { unique: true, sparse: true, name: "blogs_slug" } },
    { col: "news", spec: { isactive: 1, created_at: -1 }, opts: { name: "news_active_date" } },
    { col: "news", spec: { slug: 1 }, opts: { unique: true, sparse: true, name: "news_slug" } },

    // ── USERS: email login lookup ────────────────────────────────────────────
    { col: "users", spec: { email: 1 }, opts: { unique: true, sparse: true, name: "users_email" } },
    { col: "users", spec: { id: 1 }, opts: { unique: true, sparse: true, name: "users_id" } },

    // ── CITY: id lookup (used in $lookup joins) ──────────────────────────────
    { col: "city", spec: { id: 1 }, opts: { name: "city_id" } },
    { col: "city", spec: { name: 1 }, opts: { name: "city_name" } },

    // ── FUNCTIONALAREA & DEGREE ──────────────────────────────────────────────
    { col: "functionalarea", spec: { id: 1 }, opts: { name: "fa_id" } },
    { col: "functionalarea", spec: { pageslug: 1 }, opts: { unique: true, sparse: true, name: "fa_slug" } },
    { col: "degree", spec: { id: 1 }, opts: { name: "degree_id" } },
    { col: "degree", spec: { pageslug: 1 }, opts: { sparse: true, name: "degree_slug" } },
    { col: "degree", spec: { isShowOnTop: 1, name: 1 }, opts: { name: "degree_top" } },
  ];

  let created = 0, skipped = 0, failed = 0;

  for (const { col, spec, opts = {} } of indexes) {
    try {
      await db.collection(col).createIndex(spec, { background: true, ...opts });
      console.log(`✅ ${col}: ${JSON.stringify(spec)}`);
      created++;
    } catch (e) {
      if (e.code === 85 || e.code === 86 || e.message.includes("already exists")) {
        console.log(`⏭  ${col}: ${JSON.stringify(spec)} (already exists)`);
        skipped++;
      } else {
        console.warn(`❌ ${col}: ${JSON.stringify(spec)} — ${e.message}`);
        failed++;
      }
    }
  }

  console.log(`\nDone. created=${created} skipped=${skipped} failed=${failed}`);
  await client.close();
}

main().catch(console.error);
