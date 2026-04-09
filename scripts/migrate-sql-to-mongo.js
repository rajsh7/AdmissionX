/**
 * migrate-sql-to-mongo.js
 *
 * Streams a MySQL SQL dump and inserts all data into MongoDB Atlas.
 * Run: node scripts/migrate-sql-to-mongo.js
 *
 * Requirements: npm install mongodb (already installed)
 */

const fs = require("fs");
const readline = require("readline");
const { MongoClient } = require("mongodb");

// ── Config ────────────────────────────────────────────────────────────────────

const SQL_FILE = process.argv[2] || "D:\\web_admissionx_upgrade.sql";
const MONGO_URI =
  "mongodb+srv://admissionx:Adx%23%21eg2026@admissionx.apn7pcl.mongodb.net/?appName=Admissionx";
const DB_NAME = "admissionx";
const BATCH_SIZE = 500; // rows per MongoDB insertMany

// Tables to SKIP (system/migration tables not needed in MongoDB)
const SKIP_TABLES = new Set([
  "migrations",
  "alltableinformations",
  "country-bk",
]);

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseInsertLine(line) {
  // Match: INSERT INTO `tablename` (`col1`, `col2`, ...) VALUES (...),...;
  const tableMatch = line.match(/^INSERT INTO `([^`]+)`\s*\(([^)]+)\)\s*VALUES\s*/i);
  if (!tableMatch) return null;

  const tableName = tableMatch[1];
  const colsPart = tableMatch[2];
  const columns = colsPart
    .split(",")
    .map((c) => c.trim().replace(/`/g, ""));

  // Extract everything after VALUES
  const valuesStr = line.slice(line.indexOf("VALUES") + 6).trim();

  const rows = [];
  let i = 0;
  const len = valuesStr.length;

  while (i < len) {
    // Skip whitespace and commas between row tuples
    while (i < len && (valuesStr[i] === "," || valuesStr[i] === " " || valuesStr[i] === "\n")) i++;
    if (i >= len || valuesStr[i] === ";") break;
    if (valuesStr[i] !== "(") { i++; continue; }

    // Parse one tuple
    i++; // skip '('
    const values = [];
    let current = "";
    let inStr = false;
    let strChar = "";
    let escaped = false;

    while (i < len) {
      const ch = valuesStr[i];

      if (escaped) {
        current += ch;
        escaped = false;
        i++;
        continue;
      }

      if (ch === "\\" && inStr) {
        escaped = true;
        current += ch;
        i++;
        continue;
      }

      if (!inStr && (ch === "'" || ch === '"')) {
        inStr = true;
        strChar = ch;
        i++;
        continue;
      }

      if (inStr && ch === strChar) {
        // Check for doubled quote (escape)
        if (valuesStr[i + 1] === strChar) {
          current += ch;
          i += 2;
          continue;
        }
        inStr = false;
        i++;
        continue;
      }

      if (!inStr && ch === ",") {
        values.push(current);
        current = "";
        i++;
        continue;
      }

      if (!inStr && ch === ")") {
        values.push(current);
        i++;
        break;
      }

      current += ch;
      i++;
    }

    // Build document
    if (values.length === columns.length) {
      const doc = {};
      for (let j = 0; j < columns.length; j++) {
        const col = columns[j];
        let val = values[j];

        if (val === "NULL") {
          doc[col] = null;
        } else if (val === "''") {
          doc[col] = "";
        } else {
          // Unescape SQL string escapes
          val = val
            .replace(/\\'/g, "'")
            .replace(/\\"/g, '"')
            .replace(/\\n/g, "\n")
            .replace(/\\r/g, "\r")
            .replace(/\\t/g, "\t")
            .replace(/\\\\/g, "\\");

          // Try to coerce numbers
          if (col === "id" || col.endsWith("_id") || col.endsWith("Id")) {
            const n = Number(val);
            doc[col] = isNaN(n) || val === "" ? val : n;
          } else if (/^\d+$/.test(val) && val.length < 15) {
            doc[col] = Number(val);
          } else if (/^\d+\.\d+$/.test(val)) {
            doc[col] = parseFloat(val);
          } else {
            doc[col] = val;
          }
        }
      }
      rows.push(doc);
    }
  }

  return { tableName, rows };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🚀 AdmissionX MySQL → MongoDB Migration`);
  console.log(`   SQL file : ${SQL_FILE}`);
  console.log(`   Database : ${DB_NAME}`);
  console.log(`   Batch    : ${BATCH_SIZE} rows\n`);

  if (!fs.existsSync(SQL_FILE)) {
    console.error(`❌ File not found: ${SQL_FILE}`);
    process.exit(1);
  }

  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  console.log("✅ Connected to MongoDB Atlas\n");

  // Track stats
  const stats = {};
  let currentTable = null;
  let buffer = [];
  let lineNum = 0;
  let totalInserted = 0;

  async function flushBuffer(tableName, force = false) {
    if (!buffer.length) return;
    if (!force && buffer.length < BATCH_SIZE) return;

    const col = db.collection(tableName);
    try {
      await col.insertMany(buffer, { ordered: false });
      stats[tableName] = (stats[tableName] || 0) + buffer.length;
      totalInserted += buffer.length;
      process.stdout.write(`\r  📦 ${tableName}: ${stats[tableName]} rows inserted`);
    } catch (err) {
      // Ignore duplicate key errors (E11000), log others
      if (err.code !== 11000 && err.writeErrors) {
        const nonDup = err.writeErrors.filter((e) => e.code !== 11000);
        if (nonDup.length) console.error(`\n  ⚠️  ${tableName}: ${nonDup.length} write errors`);
        const inserted = buffer.length - (err.writeErrors?.length || 0);
        stats[tableName] = (stats[tableName] || 0) + inserted;
        totalInserted += inserted;
      }
    }
    buffer = [];
  }

  const rl = readline.createInterface({
    input: fs.createReadStream(SQL_FILE, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });

  let multiLineInsert = "";
  let inMultiLine = false;

  for await (const rawLine of rl) {
    lineNum++;
    const line = rawLine.trim();

    // Skip comments and empty lines
    if (!line || line.startsWith("--") || line.startsWith("/*") || line.startsWith("SET ") || line.startsWith("/*!")) {
      continue;
    }

    // Detect table context from CREATE TABLE
    const createMatch = line.match(/^CREATE TABLE `([^`]+)`/i);
    if (createMatch) {
      if (currentTable && buffer.length) {
        await flushBuffer(currentTable, true);
        console.log(); // newline after progress
      }
      currentTable = createMatch[1];
      if (!SKIP_TABLES.has(currentTable)) {
        console.log(`\n  🗂️  Table: ${currentTable}`);
      }
      continue;
    }

    // Skip non-INSERT lines
    if (!line.toUpperCase().startsWith("INSERT INTO")) {
      // Handle multi-line INSERT continuation
      if (inMultiLine) {
        multiLineInsert += " " + line;
        if (line.endsWith(";")) {
          inMultiLine = false;
          const parsed = parseInsertLine(multiLineInsert);
          if (parsed && !SKIP_TABLES.has(parsed.tableName)) {
            currentTable = parsed.tableName;
            buffer.push(...parsed.rows);
            await flushBuffer(currentTable);
          }
          multiLineInsert = "";
        }
      }
      continue;
    }

    // Handle INSERT line
    const fullLine = line;

    if (!fullLine.endsWith(";")) {
      // Multi-line INSERT
      inMultiLine = true;
      multiLineInsert = fullLine;
      continue;
    }

    const parsed = parseInsertLine(fullLine);
    if (!parsed) continue;
    if (SKIP_TABLES.has(parsed.tableName)) continue;

    if (parsed.tableName !== currentTable) {
      if (currentTable && buffer.length) {
        await flushBuffer(currentTable, true);
        console.log();
      }
      currentTable = parsed.tableName;
    }

    buffer.push(...parsed.rows);
    await flushBuffer(currentTable);
  }

  // Flush remaining
  if (currentTable && buffer.length) {
    await flushBuffer(currentTable, true);
    console.log();
  }

  // ── Create indexes for performance ────────────────────────────────────────
  console.log("\n\n📐 Creating indexes...");

  const indexes = [
    ["collegeprofile", [{ key: { slug: 1 }, unique: true, sparse: true }]],
    ["collegeprofile", [{ key: { users_id: 1 } }]],
    ["collegeprofile", [{ key: { isShowOnHome: 1 } }]],
    ["collegeprofile", [{ key: { rating: -1 } }]],
    ["users", [{ key: { email: 1 }, unique: true, sparse: true }]],
    ["collegemaster", [{ key: { collegeprofile_id: 1 } }]],
    ["collegemaster", [{ key: { functionalarea_id: 1 } }]],
    ["collegemaster", [{ key: { degree_id: 1 } }]],
    ["functionalarea", [{ key: { pageslug: 1 } }]],
    ["blogs", [{ key: { slug: 1 }, sparse: true }]],
    ["blogs", [{ key: { isactive: 1, created_at: -1 } }]],
    ["news", [{ key: { slug: 1 }, sparse: true }]],
    ["news", [{ key: { isactive: 1, created_at: -1 } }]],
    ["examination_details", [{ key: { slug: 1 }, sparse: true }]],
    ["examination_details", [{ key: { totalViews: -1 } }]],
    ["next_student_signups", [{ key: { email: 1 }, unique: true, sparse: true }]],
    ["next_college_signups", [{ key: { email: 1 }, unique: true, sparse: true }]],
    ["next_admin_users", [{ key: { email: 1 }, unique: true, sparse: true }]],
    ["password_reset_tokens", [{ key: { token: 1 }, sparse: true }]],
    ["applications", [{ key: { studentId: 1 } }]],
    ["applications", [{ key: { collegeId: 1 } }]],
    ["city", [{ key: { name: 1 } }]],
    ["degree", [{ key: { pageslug: 1 }, sparse: true }]],
    ["course", [{ key: { name: 1 } }]],
    ["faculty", [{ key: { collegeprofile_id: 1 } }]],
    ["college_reviews", [{ key: { collegeprofile_id: 1 } }]],
    ["college_faqs", [{ key: { collegeprofile_id: 1 } }]],
    ["placement", [{ key: { collegeprofile_id: 1 } }]],
    ["gallery", [{ key: { users_id: 1 } }]],
    ["ads_managements", [{ key: { isactive: 1, ads_position: 1 } }]],
    ["seo_contents", [{ key: { slug: 1 }, sparse: true }]],
  ];

  for (const [colName, idxDefs] of indexes) {
    try {
      const col = db.collection(colName);
      for (const def of idxDefs) {
        await col.createIndex(def.key, { background: true, ...Object.fromEntries(Object.entries(def).filter(([k]) => k !== "key")) });
      }
      process.stdout.write(`  ✅ ${colName}\n`);
    } catch (err) {
      process.stdout.write(`  ⚠️  ${colName}: ${err.message}\n`);
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n\n📊 Migration Summary:");
  console.log("─".repeat(50));

  const sorted = Object.entries(stats).sort((a, b) => b[1] - a[1]);
  for (const [table, count] of sorted) {
    console.log(`  ${table.padEnd(40)} ${count.toLocaleString()} rows`);
  }

  console.log("─".repeat(50));
  console.log(`  ${"TOTAL".padEnd(40)} ${totalInserted.toLocaleString()} rows`);
  console.log(`\n✅ Migration complete!\n`);

  await client.close();
}

main().catch((err) => {
  console.error("\n❌ Fatal error:", err.message);
  process.exit(1);
});
