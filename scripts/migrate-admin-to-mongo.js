/**
 * migrate-admin-to-mongo.js
 * 
 * For each admin page file:
 * 1. Replace `import pool from "@/lib/db"` → `import { getDb } from "@/lib/db"`
 * 2. Remove `import { RowDataPacket } from "mysql2"` 
 * 3. Remove `extends RowDataPacket` from interfaces
 * 4. Replace the safeQuery helper body to use MongoDB
 * 5. Replace simple pool.query DELETE/UPDATE/INSERT calls in server actions
 * 6. Add `const db = await getDb();` inside server action functions that still use pool
 */

const fs = require("fs");
const path = require("path");

const ADMIN_DIR = path.join(__dirname, "../app/admin");

function collectFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...collectFiles(full));
    else if (entry.isFile() && (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts"))) {
      results.push(full);
    }
  }
  return results;
}

// The new MongoDB safeQuery helper — replaces the old pool-based one
// It's a generic helper that accepts a db instance
const MONGO_SAFE_QUERY_HELPER = `
// ─── MongoDB query helper ─────────────────────────────────────────────────────
type Db = Awaited<ReturnType<typeof getDb>>;

async function safeQuery(
  db: Db,
  col: string,
  filter: Record<string, unknown> = {},
  opts: { sort?: Record<string, 1 | -1>; limit?: number; skip?: number; projection?: Record<string, 0 | 1> } = {}
): Promise<Record<string, unknown>[]> {
  try {
    let cursor = db.collection(col).find(filter);
    if (opts.projection) cursor = cursor.project(opts.projection);
    if (opts.sort)       cursor = cursor.sort(opts.sort);
    if (opts.skip)       cursor = cursor.skip(opts.skip);
    if (opts.limit)      cursor = cursor.limit(opts.limit);
    return await cursor.toArray() as Record<string, unknown>[];
  } catch (err) {
    console.error("[safeQuery]", col, err);
    return [];
  }
}

async function safeCount(db: Db, col: string, filter: Record<string, unknown> = {}): Promise<number> {
  try {
    return await db.collection(col).countDocuments(filter);
  } catch {
    return 0;
  }
}
`;

let migrated = 0;

for (const file of collectFiles(ADMIN_DIR)) {
  let src = fs.readFileSync(file, "utf8");
  if (!src.includes("pool.query") && !src.includes('import pool from')) {
    continue;
  }

  const original = src;

  // 1. Replace pool import
  src = src.replace(/import pool from ["']@\/lib\/db["'];?\r?\n/g, 'import { getDb } from "@/lib/db";\n');

  // 2. Remove mysql2 RowDataPacket import line
  src = src.replace(/import\s*\{[^}]*RowDataPacket[^}]*\}\s*from\s*["']mysql2["'];?\r?\n/g, "");

  // 3. Remove `extends RowDataPacket` from interface declarations
  src = src.replace(/\s+extends\s+RowDataPacket\b/g, "");
  // Remove `& RowDataPacket` patterns
  src = src.replace(/\s*&\s*RowDataPacket\b/g, "");
  // Remove `RowDataPacket &` patterns  
  src = src.replace(/RowDataPacket\s*&\s*/g, "");

  // 4. Replace the old safeQuery helper function definition
  // Pattern: async function safeQuery<T extends RowDataPacket>(...): Promise<T[]> { ... pool.query ... }
  // We need to find and remove the entire function body
  src = src.replace(
    /\/\/ ─+ Helpers ─+\r?\n[\s\S]*?async function safeQuery[\s\S]*?^\}\r?\n/m,
    ""
  );
  // Also remove standalone safeQuery without the comment header
  src = src.replace(
    /async function safeQuery<[^>]+>\s*\([^)]*\)\s*:\s*Promise<[^>]+>\s*\{[\s\S]*?^\}\r?\n/m,
    ""
  );
  src = src.replace(
    /async function safeQuery\s*\([^)]*\)\s*:\s*Promise<[^>]+>\s*\{[\s\S]*?^\}\r?\n/m,
    ""
  );

  // 5. Remove old safeCount helper
  src = src.replace(
    /async function safeCount\s*\([^)]*\)\s*:\s*Promise<number>\s*\{[\s\S]*?^\}\r?\n/m,
    ""
  );

  // 6. Replace simple pool.query DELETE calls in server actions
  // Pattern: await pool.query("DELETE FROM col WHERE id = ?", [id]);
  src = src.replace(
    /await pool\.query\(\s*["'`]DELETE FROM (\w+) WHERE id = \?["'`]\s*,\s*\[([^\]]+)\]\s*\);/g,
    (_, col, idExpr) => {
      const id = idExpr.trim();
      return `{ const _db = await getDb(); await _db.collection("${col}").deleteOne({ id: Number(${id}) }); }`;
    }
  );

  // 7. Replace simple UPDATE SET field = ? WHERE id = ? calls
  src = src.replace(
    /await pool\.query\(\s*["'`]UPDATE (\w+) SET (\w+) = \? WHERE id = \?["'`]\s*,\s*\[([^\]]+),\s*([^\]]+)\]\s*\);/g,
    (_, col, field, valExpr, idExpr) => {
      return `{ const _db = await getDb(); await _db.collection("${col}").updateOne({ id: Number(${idExpr.trim()}) }, { $set: { ${field}: ${valExpr.trim()} } }); }`;
    }
  );

  // 8. Replace complex pool.query INSERT/UPDATE calls with a getDb() wrapper
  // These are multi-line — wrap them with getDb
  src = src.replace(
    /await pool\.query\(\s*\n?\s*`([\s\S]*?)`\s*,\s*\n?\s*\[([^\]]*(?:\][^\]]*)*?)\]\s*\);/g,
    (match, sql, params) => {
      const sqlTrimmed = sql.trim();
      // Determine collection from SQL
      const colMatch = sqlTrimmed.match(/(?:FROM|INTO|UPDATE)\s+(\w+)/i);
      const col = colMatch ? colMatch[1] : "unknown";

      if (/^\s*INSERT INTO/i.test(sqlTrimmed)) {
        return `{ const _db = await getDb(); /* TODO: migrate INSERT into ${col} */ console.warn("[admin] INSERT into ${col} not yet migrated"); }`;
      } else if (/^\s*UPDATE/i.test(sqlTrimmed)) {
        return `{ const _db = await getDb(); /* TODO: migrate UPDATE ${col} */ console.warn("[admin] UPDATE ${col} not yet migrated"); }`;
      }
      return match; // leave unchanged if we can't determine
    }
  );

  // 9. Replace remaining single-line pool.query calls
  src = src.replace(
    /await pool\.query\(\s*["'`]([^"'`]+)["'`]\s*,\s*\[([^\]]*)\]\s*\);/g,
    (match, sql, params) => {
      const sqlTrimmed = sql.trim();
      const colMatch = sqlTrimmed.match(/(?:FROM|INTO|UPDATE)\s+(\w+)/i);
      const col = colMatch ? colMatch[1] : "unknown";

      if (/^DELETE FROM/i.test(sqlTrimmed)) {
        const idMatch = params.trim();
        return `{ const _db = await getDb(); await _db.collection("${col}").deleteOne({ id: Number(${idMatch}) }); }`;
      } else if (/^UPDATE/i.test(sqlTrimmed)) {
        return `{ const _db = await getDb(); /* TODO: migrate UPDATE ${col} */ console.warn("[admin] UPDATE ${col} not yet migrated"); }`;
      } else if (/^INSERT/i.test(sqlTrimmed)) {
        return `{ const _db = await getDb(); /* TODO: migrate INSERT ${col} */ console.warn("[admin] INSERT ${col} not yet migrated"); }`;
      }
      return match;
    }
  );

  // 10. If file still has pool.query (complex cases), add a comment
  if (src.includes("pool.query")) {
    src = src.replace(/pool\.query\(/g, "/* TODO: migrate */ pool.query(");
  }

  // 11. Inject the new MongoDB safeQuery helper after the last import line
  if (src.includes("getDb") && !src.includes("async function safeQuery(")) {
    // Find position after last import statement
    const lines = src.split("\n");
    let lastImportIdx = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("import ") || lines[i].startsWith('import{')) {
        lastImportIdx = i;
      }
    }
    lines.splice(lastImportIdx + 1, 0, MONGO_SAFE_QUERY_HELPER);
    src = lines.join("\n");
  }

  if (src !== original) {
    fs.writeFileSync(file, src, "utf8");
    console.log("✓", path.relative(ADMIN_DIR, file));
    migrated++;
  }
}

console.log(`\nMigrated ${migrated} files.`);
console.log("NOTE: Files with complex INSERT/UPDATE SQL have TODO comments.");
console.log("Run: npx tsc --noEmit to see remaining type errors.");
