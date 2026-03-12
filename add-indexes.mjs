// add-indexes.mjs
// Run with: node add-indexes.mjs
//
// Adds MySQL indexes to speed up the top-colleges (and other heavy) queries.
// Safe to run multiple times — uses IF NOT EXISTS / DROP IF EXISTS patterns.

import mysql from "mysql2/promise";
import { readFileSync } from "fs";

// ── Load .env.local ───────────────────────────────────────────────────────────
function loadEnv() {
  try {
    const raw = readFileSync(".env.local", "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // rely on actual env vars
  }
}

loadEnv();

const DB_CONFIG = {
  host:     process.env.DB_HOST     || "localhost",
  port:     Number(process.env.DB_PORT || 3306),
  user:     process.env.DB_USER     || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME     || "admissionx",
  multipleStatements: false,
};

// ── Index definitions ─────────────────────────────────────────────────────────
// Each entry: { table, indexName, columns, comment }
const INDEXES = [
  // ── collegeprofile ──────────────────────────────────────────────────────────
  {
    table: "collegeprofile",
    indexName: "idx_cp_isShowOnTop",
    columns: "isShowOnTop",
    comment: "Main filter for top-colleges page",
  },
  {
    table: "collegeprofile",
    indexName: "idx_cp_isShowOnHome",
    columns: "isShowOnHome",
    comment: "Main filter for homepage colleges",
  },
  {
    table: "collegeprofile",
    indexName: "idx_cp_users_id",
    columns: "users_id",
    comment: "JOIN with users table",
  },
  {
    table: "collegeprofile",
    indexName: "idx_cp_city",
    columns: "registeredAddressCityId",
    comment: "City filter and JOIN with city table",
  },
  {
    table: "collegeprofile",
    indexName: "idx_cp_slug",
    columns: "slug",
    comment: "College detail page lookup by slug",
  },
  {
    table: "collegeprofile",
    indexName: "idx_cp_rating",
    columns: "rating DESC",
    comment: "ORDER BY rating",
  },
  {
    table: "collegeprofile",
    indexName: "idx_cp_ranking",
    columns: "ranking",
    comment: "ORDER BY ranking",
  },
  {
    table: "collegeprofile",
    indexName: "idx_cp_top_home",
    columns: "isShowOnTop, isShowOnHome, rating",
    comment: "Composite index for filtered + sorted queries",
  },
  {
    table: "collegeprofile",
    indexName: "idx_cp_created_at",
    columns: "created_at DESC",
    comment: "ORDER BY newest",
  },

  // ── collegemaster ───────────────────────────────────────────────────────────
  {
    table: "collegemaster",
    indexName: "idx_cm_collegeprofile_id",
    columns: "collegeprofile_id",
    comment: "Primary JOIN key from collegeprofile",
  },
  {
    table: "collegemaster",
    indexName: "idx_cm_functionalarea_id",
    columns: "functionalarea_id",
    comment: "JOIN with functionalarea for streams",
  },
  {
    table: "collegemaster",
    indexName: "idx_cm_degree_id",
    columns: "degree_id",
    comment: "JOIN with degree table",
  },
  {
    table: "collegemaster",
    indexName: "idx_cm_fees",
    columns: "fees",
    comment: "Fees filter and ORDER BY fees",
  },
  {
    table: "collegemaster",
    indexName: "idx_cm_profile_fa",
    columns: "collegeprofile_id, functionalarea_id",
    comment: "Composite for stream-filtered college lookups",
  },

  // ── functionalarea ──────────────────────────────────────────────────────────
  {
    table: "functionalarea",
    indexName: "idx_fa_pageslug",
    columns: "pageslug",
    comment: "Stream filter by slug",
  },
  {
    table: "functionalarea",
    indexName: "idx_fa_name",
    columns: "name",
    comment: "Stream name lookups",
  },

  // ── degree ──────────────────────────────────────────────────────────────────
  {
    table: "degree",
    indexName: "idx_deg_pageslug",
    columns: "pageslug",
    comment: "Degree filter by slug",
  },
  {
    table: "degree",
    indexName: "idx_deg_isShowOnTop",
    columns: "isShowOnTop",
    comment: "Degree list for top-colleges filters",
  },

  // ── city ────────────────────────────────────────────────────────────────────
  {
    table: "city",
    indexName: "idx_city_state_id",
    columns: "state_id",
    comment: "State filter JOIN",
  },
  {
    table: "city",
    indexName: "idx_city_name",
    columns: "name",
    comment: "City name search",
  },

  // ── examination_details ─────────────────────────────────────────────────────
  {
    table: "examination_details",
    indexName: "idx_exam_totalViews",
    columns: "totalViews DESC",
    comment: "ORDER BY views for exams listing",
  },
  {
    table: "examination_details",
    indexName: "idx_exam_slug",
    columns: "slug",
    comment: "Exam detail page lookup by slug",
  },
  {
    table: "examination_details",
    indexName: "idx_exam_fa_id",
    columns: "functionalarea_id",
    comment: "Stream filter on exams",
  },
  {
    table: "examination_details",
    indexName: "idx_exam_created_at",
    columns: "created_at DESC",
    comment: "ORDER BY newest exams",
  },

  // ── blogs ───────────────────────────────────────────────────────────────────
  {
    table: "blogs",
    indexName: "idx_blogs_isactive",
    columns: "isactive",
    comment: "Filter active blogs",
  },
  {
    table: "blogs",
    indexName: "idx_blogs_slug",
    columns: "slug",
    comment: "Blog detail page lookup",
  },
  {
    table: "blogs",
    indexName: "idx_blogs_created_at",
    columns: "created_at DESC",
    comment: "ORDER BY newest blogs",
  },

  // ── news ────────────────────────────────────────────────────────────────────
  {
    table: "news",
    indexName: "idx_news_slug",
    columns: "slug",
    comment: "News detail page lookup",
  },
  {
    table: "news",
    indexName: "idx_news_created_at",
    columns: "created_at DESC",
    comment: "ORDER BY newest news",
  },

  // ── next_student_signups ─────────────────────────────────────────────────────
  {
    table: "next_student_signups",
    indexName: "idx_student_email",
    columns: "email",
    comment: "Student login lookup by email",
  },

  // ── next_admin_users ─────────────────────────────────────────────────────────
  {
    table: "next_admin_users",
    indexName: "idx_admin_email",
    columns: "email",
    comment: "Admin login lookup by email",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function pad(str, len) {
  return String(str).padEnd(len, " ");
}

async function tableExists(conn, tableName) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS cnt
     FROM information_schema.tables
     WHERE table_schema = DATABASE() AND table_name = ?`,
    [tableName]
  );
  return rows[0].cnt > 0;
}

async function indexExists(conn, tableName, indexName) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS cnt
     FROM information_schema.statistics
     WHERE table_schema = DATABASE()
       AND table_name   = ?
       AND index_name   = ?`,
    [tableName, indexName]
  );
  return rows[0].cnt > 0;
}

async function columnExists(conn, tableName, columnName) {
  // Strip DESC/ASC from column spec to get bare name
  const colName = columnName.split(",")[0].trim().replace(/\s+(ASC|DESC)$/i, "").trim();
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS cnt
     FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name   = ?
       AND column_name  = ?`,
    [tableName, colName]
  );
  return rows[0].cnt > 0;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║   AdmissionX — MySQL Index Optimization Script      ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");
  console.log(`Connecting to ${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.database}...\n`);

  const conn = await mysql.createConnection(DB_CONFIG);
  console.log("✅  Connected.\n");

  let added   = 0;
  let skipped = 0;
  let failed  = 0;
  let noTable = 0;

  for (const idx of INDEXES) {
    const label = `${idx.table}.${idx.indexName}`;

    // 1. Check table exists
    const tExists = await tableExists(conn, idx.table);
    if (!tExists) {
      console.log(`⬜  ${pad(label, 55)} — table not found, skipping`);
      noTable++;
      continue;
    }

    // 2. Check index already exists
    const iExists = await indexExists(conn, idx.table, idx.indexName);
    if (iExists) {
      console.log(`⏭   ${pad(label, 55)} — already exists`);
      skipped++;
      continue;
    }

    // 3. Validate first column actually exists in the table
    const firstCol = idx.columns.split(",")[0].trim().replace(/\s+(ASC|DESC)$/i, "").trim();
    const cExists = await columnExists(conn, idx.table, firstCol);
    if (!cExists) {
      console.log(`⚠   ${pad(label, 55)} — column "${firstCol}" not found, skipping`);
      failed++;
      continue;
    }

    // 4. Build and run CREATE INDEX
    // Strip ASC/DESC from column list — not supported in older MariaDB for regular indexes
    const colList = idx.columns
      .split(",")
      .map((c) => c.trim().replace(/\s+(ASC|DESC)$/i, "").trim())
      .map((c) => `\`${c}\``)
      .join(", ");

    const sql = `ALTER TABLE \`${idx.table}\` ADD INDEX \`${idx.indexName}\` (${colList})`;

    try {
      await conn.query(sql);
      console.log(`✅  ${pad(label, 55)} — created  (${idx.comment})`);
      added++;
    } catch (err) {
      // Duplicate key name is harmless
      if (err.code === "ER_DUP_KEYNAME") {
        console.log(`⏭   ${pad(label, 55)} — already exists (ER_DUP_KEYNAME)`);
        skipped++;
      } else {
        console.log(`❌  ${pad(label, 55)} — FAILED: ${err.message}`);
        failed++;
      }
    }
  }

  await conn.end();

  console.log("\n──────────────────────────────────────────────────────");
  console.log(`  ✅  Added   : ${added}`);
  console.log(`  ⏭   Skipped : ${skipped}`);
  console.log(`  ⬜  No table: ${noTable}`);
  console.log(`  ❌  Failed  : ${failed}`);
  console.log("──────────────────────────────────────────────────────\n");

  if (failed > 0) {
    console.log("⚠  Some indexes failed to create. Review the errors above.");
    console.log("   These are usually non-critical — the app will still work.\n");
  } else {
    console.log("🚀  All indexes applied! Query performance should be improved.\n");
  }
}

main().catch((err) => {
  console.error("\n❌  Fatal error:", err.message);
  process.exit(1);
});
