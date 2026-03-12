import mysql from "mysql2/promise";
import { readFileSync } from "fs";

function loadEnv() {
  try {
    const raw = readFileSync(".env.local", "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed
        .slice(eqIdx + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // rely on actual env vars
  }
}

loadEnv();

console.log("\n=== AdmissionX — Add Indexes (direct mode) ===\n");

const conn = await mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "admissionx",
  connectTimeout: 10000,
});

console.log("Connected.\n");

// Each entry: [table, indexName, column(s)]
// We just run ALTER TABLE directly and catch errors — no information_schema lookups.
const INDEXES = [
  ["collegeprofile", "idx_cp_isShowOnTop", "isShowOnTop"],
  ["collegeprofile", "idx_cp_isShowOnHome", "isShowOnHome"],
  ["collegeprofile", "idx_cp_users_id", "users_id"],
  ["collegeprofile", "idx_cp_city", "registeredAddressCityId"],
  ["collegeprofile", "idx_cp_slug", "slug(191)"],
  ["collegeprofile", "idx_cp_rating", "rating"],
  ["collegeprofile", "idx_cp_ranking", "ranking"],
  ["collegemaster", "idx_cm_profile_id", "collegeprofile_id"],
  ["collegemaster", "idx_cm_fa_id", "functionalarea_id"],
  ["collegemaster", "idx_cm_degree_id", "degree_id"],
  ["collegemaster", "idx_cm_fees", "fees"],
  ["functionalarea", "idx_fa_pageslug", "pageslug(191)"],
  ["degree", "idx_deg_pageslug", "pageslug(191)"],
  ["city", "idx_city_state_id", "state_id"],
  ["city", "idx_city_name", "name(191)"],
  ["examination_details", "idx_exam_slug", "slug(191)"],
  ["examination_details", "idx_exam_totalViews", "totalViews"],
  ["blogs", "idx_blogs_isactive", "isactive"],
  ["blogs", "idx_blogs_slug", "slug(191)"],
  ["blogs", "idx_blogs_created_at", "created_at"],
];

let added = 0;
let skipped = 0;
let failed = 0;

for (const [table, indexName, col] of INDEXES) {
  const sql = `ALTER TABLE \`${table}\` ADD INDEX \`${indexName}\` (${col})`;
  try {
    await conn.query(sql);
    console.log(`✅  ${table}.${indexName}`);
    added++;
  } catch (err) {
    // ER_DUP_KEYNAME  = index already exists (safe to ignore)
    // ER_NO_SUCH_TABLE = table doesn't exist yet (safe to ignore)
    // ER_BAD_FIELD_ERROR = column doesn't exist (safe to ignore)
    if (err.code === "ER_DUP_KEYNAME" || err.errno === 1061) {
      console.log(`⏭   ${table}.${indexName} — already exists`);
      skipped++;
    } else if (err.code === "ER_NO_SUCH_TABLE" || err.errno === 1146) {
      console.log(`⬜  ${table}.${indexName} — table not found`);
      skipped++;
    } else if (err.code === "ER_BAD_FIELD_ERROR" || err.errno === 1054) {
      console.log(`⚠   ${table}.${indexName} — column not found, skipping`);
      skipped++;
    } else {
      console.log(`❌  ${table}.${indexName} — ${err.code}: ${err.message}`);
      failed++;
    }
  }
}

await conn.end();

console.log("\n================================");
console.log(`  ✅  Added   : ${added}`);
console.log(`  ⏭   Skipped : ${skipped}`);
console.log(`  ❌  Failed  : ${failed}`);
console.log("================================\n");

if (added > 0) {
  console.log(
    "🚀  Indexes applied! Query performance should be noticeably faster.\n",
  );
} else {
  console.log("ℹ   All indexes were already present. Nothing to do.\n");
}
