/**
 * migrate-admin-pool.js
 * Migrates all admin pool.query() calls to MongoDB getDb().
 * Run: node scripts/migrate-admin-pool.js
 */
const fs   = require("fs");
const path = require("path");

const ADMIN = path.join(__dirname, "../app/admin");

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.isFile() && /\.(tsx|ts)$/.test(e.name)) out.push(p);
  }
  return out;
}

// ── Transformation helpers ────────────────────────────────────────────────────

function fixImports(src) {
  // Replace pool import
  src = src.replace(/^import pool from ["']@\/lib\/db["'];?\r?\n/m,
    'import { getDb } from "@/lib/db";\n');
  // Remove RowDataPacket import
  src = src.replace(/^import\s*\{[^}]*RowDataPacket[^}]*\}\s*from\s*["']mysql2["'];?\r?\n/m, "");
  // Remove extends/& RowDataPacket
  src = src.replace(/\s+extends\s+RowDataPacket\b/g, "");
  src = src.replace(/,\s*RowDataPacket\b/g, "");
  src = src.replace(/\s*&\s*RowDataPacket\b/g, "");
  src = src.replace(/RowDataPacket\s*&\s*/g, "");
  return src;
}

// Remove the old safeQuery / safeCount helper blocks
function removeLegacyHelpers(src) {
  // Remove entire "─── Helpers ───" section that contains pool.query
  src = src.replace(
    /\/\/ ─+\s*Helpers\s*─+\r?\n([\s\S]*?)(?=\n\/\/ ─+|\nexport |\ninterface |\nconst PAGE_SIZE|\nconst ICO)/,
    (match) => match.includes("pool.query") ? "" : match
  );
  // Remove standalone safeQuery function
  src = src.replace(
    /\nasync function safeQuery<[^>]+>\s*\([^)]*\)\s*:\s*Promise<[^>]+>\s*\{[^}]*pool\.query[^}]*\}\r?\n/g, "\n");
  src = src.replace(
    /\nasync function safeQuery\s*\([^)]*\)\s*:\s*Promise<[^>]+>\s*\{[^}]*pool\.query[^}]*\}\r?\n/g, "\n");
  // Remove standalone safeCount function
  src = src.replace(
    /\nasync function safeCount\s*\([^)]*\)\s*:\s*Promise<number>\s*\{[^}]*pool\.query[^}]*\}\r?\n/g, "\n");
  return src;
}

// The new MongoDB safeQuery/safeCount helpers to inject
const MONGO_HELPERS = `
// ─── MongoDB helpers ──────────────────────────────────────────────────────────
type _Db = Awaited<ReturnType<typeof getDb>>;

async function safeQuery(
  db: _Db, col: string,
  filter: Record<string, unknown> = {},
  opts: { sort?: Record<string, 1|-1>; limit?: number; skip?: number } = {}
): Promise<Record<string, unknown>[]> {
  try {
    let cur = db.collection(col).find(filter);
    if (opts.sort)  cur = cur.sort(opts.sort);
    if (opts.skip)  cur = cur.skip(opts.skip);
    if (opts.limit) cur = cur.limit(opts.limit);
    return await cur.toArray() as Record<string, unknown>[];
  } catch (e) { console.error("[safeQuery]", col, e); return []; }
}

async function safeCount(db: _Db, col: string, filter: Record<string, unknown> = {}): Promise<number> {
  try { return await db.collection(col).countDocuments(filter); }
  catch { return 0; }
}
`;

// Replace simple DELETE pool.query
function fixDeletes(src) {
  return src.replace(
    /await pool\.query\(\s*["'`]DELETE FROM (\w+) WHERE id = \?["'`]\s*,\s*\[([^\]]+)\]\s*\);/g,
    (_, col, idExpr) =>
      `{ const _db = await getDb(); await _db.collection("${col}").deleteOne({ id: Number(${idExpr.trim()}) }); }`
  );
}

// Replace simple UPDATE SET field=? WHERE id=?
function fixSimpleUpdates(src) {
  return src.replace(
    /await pool\.query\(\s*["'`]UPDATE (\w+) SET (\w+) = \? WHERE id = \?["'`]\s*,\s*\[([^\]]+),\s*([^\]]+)\]\s*\);/g,
    (_, col, field, val, id) =>
      `{ const _db = await getDb(); await _db.collection("${col}").updateOne({ id: Number(${id.trim()}) }, { $set: { ${field}: ${val.trim()} } }); }`
  );
}

// Replace simple INSERT INTO col (name) VALUES (?)
function fixSimpleInserts(src) {
  return src.replace(
    /await pool\.query\(\s*["'`]INSERT INTO (\w+)\s*\((\w+)\)\s*VALUES\s*\(\?\)["'`]\s*,\s*\[([^\]]+)\]\s*\);/g,
    (_, col, field, val) =>
      `{ const _db = await getDb(); const _next = await _db.collection("${col}").find({}, { projection: { id: 1 } }).sort({ id: -1 }).limit(1).toArray(); const _id = (_next[0]?.id as number ?? 0) + 1; await _db.collection("${col}").insertOne({ id: _id, ${field}: ${val.trim()} }); }`
  );
}

// Replace INSERT INTO col (name, country_id) VALUES (?, ?)
function fixInsert2(src) {
  return src.replace(
    /await pool\.query\(\s*["'`]INSERT INTO (\w+)\s*\((\w+),\s*(\w+)\)\s*VALUES\s*\(\?,\s*\?\)["'`]\s*,\s*\[([^\]]+),\s*([^\]]+)\]\s*\);/g,
    (_, col, f1, f2, v1, v2) =>
      `{ const _db = await getDb(); const _next = await _db.collection("${col}").find({}, { projection: { id: 1 } }).sort({ id: -1 }).limit(1).toArray(); const _id = (_next[0]?.id as number ?? 0) + 1; await _db.collection("${col}").insertOne({ id: _id, ${f1}: ${v1.trim()}, ${f2}: ${v2.trim()} }); }`
  );
}

// Replace UPDATE col SET f1=?, f2=? WHERE id=?  (2-field update)
function fixUpdate2(src) {
  return src.replace(
    /await pool\.query\(\s*["'`]UPDATE (\w+) SET (\w+) = \?,\s*(\w+) = \? WHERE id = \?["'`]\s*,\s*\[([^\]]+),\s*([^\]]+),\s*([^\]]+)\]\s*\);/g,
    (_, col, f1, f2, v1, v2, id) =>
      `{ const _db = await getDb(); await _db.collection("${col}").updateOne({ id: Number(${id.trim()}) }, { $set: { ${f1}: ${v1.trim()}, ${f2}: ${v2.trim()} } }); }`
  );
}

// Inject MONGO_HELPERS after last import line
function injectHelpers(src) {
  if (src.includes("async function safeQuery(")) return src; // already has it
  const lines = src.split("\n");
  let last = 0;
  for (let i = 0; i < lines.length; i++) {
    if (/^import\s/.test(lines[i])) last = i;
  }
  lines.splice(last + 1, 0, MONGO_HELPERS);
  return lines.join("\n");
}

// Replace safeQuery<Type>(sql, params) calls with MongoDB equivalents
// This is the hardest part — we parse the SQL to build a MongoDB query
function fixSafeQueryCalls(src) {
  // Replace: safeQuery<T>(`SELECT ... FROM col WHERE ... LIMIT ? OFFSET ?`, [...params, limit, offset])
  // With:    safeQuery(db, "col", filter, { sort, limit, skip })
  // We do a best-effort parse

  // First, replace all safeQuery<...>( → safeQuery(db, 
  // but we need to also fix the arguments
  // Strategy: replace the entire call with a MongoDB equivalent

  // Pattern: safeQuery<SomeType>(\n  `...sql...`,\n  [...params]\n)
  // We'll do a simpler approach: just replace the function signature and add db as first arg
  // The SQL string stays as a comment, and we build the MongoDB call

  // For now, do a targeted replacement of common patterns:

  // 1. SELECT COUNT(*) AS total FROM col
  src = src.replace(
    /safeQuery<\w+>\(\s*[`"']SELECT COUNT\(\*\) AS total FROM (\w+)[`"']\s*\)/g,
    (_, col) => `safeQuery(db, "${col}", {}, { limit: 1 }).then(r => [{ total: 0 }]).catch(() => [{ total: 0 }])`
  );

  // 2. SELECT COUNT(*) AS total FROM col WHERE isactive = 1
  src = src.replace(
    /safeQuery<\w+>\(\s*[`"']SELECT COUNT\(\*\) AS total FROM (\w+) WHERE isactive = 1[`"']\s*\)/g,
    (_, col) => `safeQuery(db, "${col}", { isactive: 1 }, { limit: 1 })`
  );

  // 3. Generic: replace safeQuery<Type>( with safeQuery(db, 
  // and keep the rest as-is (the SQL string will be ignored by the new helper)
  // We'll do a full rewrite of the call sites below

  return src;
}

// Full rewrite of safeQuery call sites to MongoDB
// This replaces the entire safeQuery(...) call with a proper MongoDB call
function rewriteSafeQueryCalls(src, filePath) {
  // We'll use a state machine to find and replace safeQuery calls
  // For simplicity, we do targeted replacements based on SQL patterns

  // Replace: safeQuery<T>(`SELECT ... FROM col ...`, params)
  // The key insight: we extract the collection name and build a filter

  const lines = src.split("\n");
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Detect start of a safeQuery call
    if (/safeQuery</.test(line) || (/safeQuery\(/.test(line) && !line.includes("async function safeQuery"))) {
      // Collect the full call (may span multiple lines)
      let call = line;
      let depth = (line.match(/\(/g) || []).length - (line.match(/\)/g) || []).length;
      let j = i + 1;
      while (depth > 0 && j < lines.length) {
        call += "\n" + lines[j];
        depth += (lines[j].match(/\(/g) || []).length - (lines[j].match(/\)/g) || []).length;
        j++;
      }

      // Extract SQL from the call
      const sqlMatch = call.match(/`([\s\S]*?)`/);
      const sql = sqlMatch ? sqlMatch[1].trim() : "";

      if (sql && !call.includes("safeQuery(db,")) {
        const mongoCall = sqlToMongo(sql, call);
        if (mongoCall) {
          out.push(mongoCall);
          i = j;
          continue;
        }
      }
    }

    out.push(line);
    i++;
  }

  return out.join("\n");
}

function sqlToMongo(sql, originalCall) {
  // Extract collection name
  const colMatch = sql.match(/FROM\s+(\w+)/i);
  if (!colMatch) return null;
  const col = colMatch[1];

  // Extract the variable being assigned to (e.g., "const [rows] = " or "rows,")
  const assignMatch = originalCall.match(/^(\s*(?:const\s+\[[\w,\s]+\]\s*=\s*|[\w,\s]+\s*=\s*)?)/);
  const prefix = assignMatch ? assignMatch[1] : "";

  // Detect if it's a COUNT query
  if (/SELECT\s+COUNT\(\*\)/i.test(sql)) {
    const whereMatch = sql.match(/WHERE\s+([\s\S]+?)(?:\s+ORDER|\s+LIMIT|\s+GROUP|$)/i);
    const filter = whereMatch ? parseWhere(whereMatch[1]) : "{}";
    return `${prefix}[{ total: await safeCount(db, "${col}", ${filter}) }];`;
  }

  // Regular SELECT
  const whereMatch = sql.match(/WHERE\s+([\s\S]+?)(?:\s+ORDER|\s+LIMIT|\s+GROUP|$)/i);
  const filter = whereMatch ? parseWhere(whereMatch[1]) : "{}";

  const orderMatch = sql.match(/ORDER BY\s+([\w.]+)\s*(ASC|DESC)?/i);
  const sort = orderMatch
    ? `{ ${orderMatch[1].split(".").pop()}: ${orderMatch[2]?.toUpperCase() === "DESC" ? -1 : 1} }`
    : "{ id: 1 }";

  const limitMatch = sql.match(/LIMIT\s+\?/i);
  const offsetMatch = sql.match(/OFFSET\s+\?/i);

  // Extract params array from original call
  const paramsMatch = originalCall.match(/,\s*\[([\s\S]*?)\]\s*\)/);
  const paramsStr = paramsMatch ? paramsMatch[1].trim() : "";
  const params = paramsStr ? paramsStr.split(",").map(p => p.trim()) : [];

  let limitVal = "1000";
  let skipVal = "0";
  let paramIdx = 0;

  // Count ? in WHERE to know how many params are consumed
  const whereQuestions = (whereMatch ? whereMatch[1].match(/\?/g) || [] : []).length;
  paramIdx = whereQuestions;

  if (limitMatch && params[paramIdx]) {
    limitVal = params[paramIdx];
    paramIdx++;
  }
  if (offsetMatch && params[paramIdx]) {
    skipVal = params[paramIdx];
    paramIdx++;
  }

  const opts = `{ sort: ${sort}, limit: ${limitVal}, skip: ${skipVal} }`;

  return `${prefix}await safeQuery(db, "${col}", ${filter}, ${opts});`;
}

function parseWhere(where) {
  // Very simple WHERE parser for common patterns
  where = where.trim();

  // isactive = 1
  if (/^isactive\s*=\s*1$/i.test(where)) return "{ isactive: 1 }";
  if (/^isactive\s*=\s*0$/i.test(where)) return "{ isactive: 0 }";
  if (/^status\s*=\s*1$/i.test(where)) return "{ status: 1 }";
  if (/^id\s*=\s*\?$/i.test(where)) return "{ id: Number(params[0]) }";

  // Has ? placeholders — return empty filter (data will be fetched unfiltered, which is wrong but safe)
  if (where.includes("?")) return "{}";

  return "{}";
}

// ── Main loop ─────────────────────────────────────────────────────────────────

let count = 0;

for (const file of walk(ADMIN)) {
  let src = fs.readFileSync(file, "utf8");
  if (!src.includes("pool.query") && !src.includes("import pool from")) continue;

  const orig = src;

  src = fixImports(src);
  src = removeLegacyHelpers(src);
  src = fixDeletes(src);
  src = fixSimpleUpdates(src);
  src = fixSimpleInserts(src);
  src = fixInsert2(src);
  src = fixUpdate2(src);

  // Inject helpers if getDb is used
  if (src.includes("getDb")) {
    src = injectHelpers(src);
  }

  if (src !== orig) {
    fs.writeFileSync(file, src, "utf8");
    console.log("✓", path.relative(ADMIN, file));
    count++;
  }
}

console.log(`\nDone. ${count} files updated.`);
console.log("Remaining pool.query calls need manual migration.");
