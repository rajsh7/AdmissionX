import { MongoClient, Db } from "mongodb";
import dns from "node:dns";

// Fix for Windows DNS resolution issues with MongoDB Atlas
dns.setServers(["8.8.8.8", "1.1.1.1"]);
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

declare global {
  var _mongoClient: MongoClient | undefined;
}

const uri = process.env.MONGODB_URI!;
if (!uri) throw new Error("MONGODB_URI is not defined in environment variables");

// Use a custom property to track which URI the cached client is using
declare global {
  var _mongoClient: MongoClient | undefined;
  var _mongoUri: string | undefined;
}

let _db: Db | null = null;
let _connectionFailed = false;

function createMockDb(): Db {
  const makeCursor = () => {
    const cursor = {
      toArray: async () => [],
      limit: (_n?: number) => cursor,
      sort: (_s?: unknown) => cursor,
      projection: (_p?: unknown) => cursor,
      project: (_p?: unknown) => cursor,
      skip: (_n?: number) => cursor,
    };
    return cursor;
  };

  const emptyCollection = {
    find: (..._args: unknown[]) => makeCursor(),
    findOne: async (..._args: unknown[]) => null,
    aggregate: (..._args: unknown[]) => ({ toArray: async () => [] }),
    estimatedDocumentCount: async (..._args: unknown[]) => 0,
    countDocuments: async (..._args: unknown[]) => 0,
    insertOne: async (..._args: unknown[]) => ({ insertedId: null }),
    insertMany: async (..._args: unknown[]) => ({ insertedIds: [] }),
    updateOne: async (..._args: unknown[]) => ({ modifiedCount: 0 }),
    updateMany: async (..._args: unknown[]) => ({ modifiedCount: 0 }),
    deleteOne: async (..._args: unknown[]) => ({ deletedCount: 0 }),
    deleteMany: async (..._args: unknown[]) => ({ deletedCount: 0 }),
    replaceOne: async (..._args: unknown[]) => ({ modifiedCount: 0 }),
  };

  return {
    collection: () => emptyCollection,
    admin: () => ({}),
    createCollection: async () => {},
  } as any;
}

export async function forceReconnect() {
  console.log("♻️ [db] Forcing database reconnection...");
  if (globalThis._mongoClient) {
    try { await globalThis._mongoClient.close(); } catch {}
  }
  globalThis._mongoClient = undefined;
  globalThis._mongoUri = undefined;
  _db = null;
  _connectionFailed = false;
}

export async function getDb(): Promise<Db> {
  const currentUri = process.env.MONGODB_URI!;
  
  // If URI changed or client missing, re-initialize
  if (!globalThis._mongoClient || globalThis._mongoUri !== currentUri) {
    const hostInfo = currentUri.split('@')[1]?.split('/')[0] || "unknown-host";
    console.log(`🔌 [db] Initializing new connection to: ${hostInfo}`);
    
    globalThis._mongoClient = new MongoClient(currentUri, {
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
      retryWrites: true,
    });
    globalThis._mongoUri = currentUri;
    _db = null;
    _connectionFailed = false;
  }

  if (!_db) {
    if (_connectionFailed) {
      console.warn("⚠️ [db] Previous connection attempt failed. Using mock DB.");
      return createMockDb();
    }
    
    try {
      console.log("⏳ [db] Connecting to MongoDB...");
      await globalThis._mongoClient.connect();
      _db = globalThis._mongoClient.db(process.env.MONGODB_DB ?? "admissionx");
      console.log("✅ [db] Connected successfully.");
    } catch (error) {
      console.error("❌ [db] Connection failed:", error);
      _connectionFailed = true;
      return createMockDb();
    }
  }
  return _db;
}

// ── SQL → MongoDB translator ──────────────────────────────────────────────────
// Handles the common patterns used across all admin pages so legacy pool.query()
// calls work against MongoDB without individual file rewrites.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryResult = [any, null];

function extractCollection(sql: string): string | null {
  const m = sql.match(/(?:FROM|INTO|UPDATE|JOIN)\s+(\w+)/i);
  return m ? m[1] : null;
}

function buildFilter(sql: string, params: unknown[]): Record<string, unknown> {
  const filter: Record<string, unknown> = {};
  const whereMatch = sql.match(/WHERE\s+([\s\S]+?)(?:\s+(?:ORDER|LIMIT|GROUP|HAVING|$))/i)
    || sql.match(/WHERE\s+([\s\S]+)$/i);
  if (!whereMatch) return filter;

  const where = whereMatch[1];
  let pIdx = 0;

  // Parse simple conditions: field = ?, field LIKE ?, field IS NOT NULL
  const condRe = /(\w+(?:\.\w+)?)\s*(=|!=|<>|LIKE|IS NOT NULL|IS NULL|>|<|>=|<=)\s*(\?)?/gi;
  let m: RegExpExecArray | null;
  while ((m = condRe.exec(where)) !== null) {
    const rawField = m[1].includes(".") ? m[1].split(".").pop()! : m[1];
    const op = m[2].toUpperCase();
    if (op === "IS NOT NULL") { filter[rawField] = { $ne: null }; continue; }
    if (op === "IS NULL")     { filter[rawField] = null; continue; }
    if (m[3] !== "?") continue;
    const val = params[pIdx++];
    if (op === "LIKE") {
      const s = String(val).replace(/^%|%$/g, "");
      filter[rawField] = { $regex: s, $options: "i" };
    } else if (op === "=" || op === "!=") {
      const num = Number(val);
      const coerced = !isNaN(num) && val !== "" && val !== null ? num : val;
      filter[rawField] = op === "!=" ? { $ne: coerced } : coerced;
    } else {
      filter[rawField] = val;
    }
  }

  // Handle OR groups: (f1 LIKE ? OR f2 LIKE ?)
  const orMatch = where.match(/\(([^)]+(?:LIKE|=)[^)]+OR[^)]+)\)/i);
  if (orMatch) {
    const orParts = orMatch[1].split(/\s+OR\s+/i);
    const orClauses = orParts.map(part => {
      const pm = part.match(/(\w+(?:\.\w+)?)\s*(LIKE|=)\s*\?/i);
      if (!pm) return null;
      const f = pm[1].includes(".") ? pm[1].split(".").pop()! : pm[1];
      const v = params[pIdx++];
      if (pm[2].toUpperCase() === "LIKE") {
        const s = String(v).replace(/^%|%$/g, "");
        return { [f]: { $regex: s, $options: "i" } };
      }
      return { [f]: v };
    }).filter(Boolean);
    if (orClauses.length) {
      delete filter[Object.keys(filter).find(k => orClauses.some(c => c && k in c)) ?? ""];
      Object.assign(filter, { $or: orClauses });
    }
  }

  return filter;
}

function buildSort(sql: string): Record<string, 1 | -1> {
  const m = sql.match(/ORDER BY\s+([\w.,\s]+?)(?:\s+LIMIT|\s+$)/i);
  if (!m) return { id: 1 };
  const parts = m[1].split(",").map(p => p.trim());
  const sort: Record<string, 1 | -1> = {};
  for (const p of parts) {
    const [field, dir] = p.split(/\s+/);
    const f = field.includes(".") ? field.split(".").pop()! : field;
    sort[f] = dir?.toUpperCase() === "DESC" ? -1 : 1;
  }
  return sort;
}

function extractLimitOffset(sql: string, params: unknown[]): { limit: number; skip: number; paramOffset: number } {
  // Count ? before LIMIT to find param index
  const beforeLimit = sql.split(/LIMIT\s*\?/i)[0];
  const qBefore = (beforeLimit.match(/\?/g) || []).length;
  const hasLimit = /LIMIT\s*\?/i.test(sql);
  const hasOffset = /OFFSET\s*\?/i.test(sql);
  const limit = hasLimit ? Number(params[qBefore]) || 1000 : 1000;
  const skip  = hasOffset ? Number(params[qBefore + 1]) || 0 : 0;
  return { limit, skip, paramOffset: qBefore };
}

async function mongoQuery(sql: string, params: unknown[] = []): Promise<QueryResult> {
  const trimmed = sql.trim();

  try {
    const db = await getDb();
    const col = extractCollection(trimmed);
    if (!col) return [[], null];

    // ── SELECT ──────────────────────────────────────────────────────────────
    if (/^\s*SELECT/i.test(trimmed)) {
      const collection = db.collection(col);

      // COUNT(*) — single or subquery
      if (/SELECT\s+COUNT\(\*\)/i.test(trimmed) && !/SELECT[\s\S]+,[\s\S]+COUNT/i.test(trimmed)) {
        const filter = buildFilter(trimmed, params);
        const count = await collection.countDocuments(filter);
        const alias = trimmed.match(/COUNT\(\*\)\s+AS\s+(\w+)/i)?.[1] ?? "cnt";
        return [[{ [alias]: count, total: count, cnt: count }], null];
      }

      // Multi-count subquery (dashboard stats)
      if (/\(SELECT COUNT\(\*\)/i.test(trimmed)) {
        const result: Record<string, unknown> = {};
        const subRe = /\(SELECT COUNT\(\*\) FROM (\w+)(?:\s+WHERE\s+([^)]+))?\)\s+AS\s+(\w+)/gi;
        let sm: RegExpExecArray | null;
        while ((sm = subRe.exec(trimmed)) !== null) {
          const subCol = sm[1];
          const subWhere = sm[2] || "";
          const alias = sm[3];
          const subFilter: Record<string, unknown> = {};
          if (/isactive\s*=\s*1/i.test(subWhere)) subFilter.isactive = 1;
          if (/status\s*=\s*1/i.test(subWhere))   subFilter.status = 1;
          if (/status\s*=\s*['"]pending['"]/i.test(subWhere)) subFilter.status = "pending";
          result[alias] = await db.collection(subCol).countDocuments(subFilter);
        }
        return [[result], null];
      }

      // Regular SELECT with possible JOIN (we query primary table only)
      const filter = buildFilter(trimmed, params);
      const sort   = buildSort(trimmed);
      const { limit, skip } = extractLimitOffset(trimmed, params);

      const rows = await collection.find(filter).sort(sort).skip(skip).limit(limit).toArray();
      const cleanRows = rows.map(({ _id, ...rest }: any) => rest);
      return [cleanRows as Record<string, unknown>[], null];
    }

    // ── INSERT ──────────────────────────────────────────────────────────────
    if (/^\s*INSERT INTO/i.test(trimmed)) {
      const collection = db.collection(col);
      const fieldsMatch = trimmed.match(/INSERT INTO \w+\s*\(([^)]+)\)/i);
      if (!fieldsMatch) return [[], null];
      const fields = fieldsMatch[1].split(",").map(f => f.trim());
      const doc: Record<string, unknown> = {};
      // Get next id
      const last = await collection.find({}, { projection: { id: 1 } }).sort({ id: -1 }).limit(1).toArray();
      doc.id = ((last[0]?.id as number) ?? 0) + 1;
      let pIdx = 0;
      for (const f of fields) {
        if (f === "created_at" || f === "updated_at") { doc[f] = new Date().toISOString(); continue; }
        doc[f] = params[pIdx++] ?? null;
      }
      await collection.insertOne(doc);
      const { _id, ...cleanDoc } = doc as any;
      return [[{ ...cleanDoc, insertId: doc.id as number, affectedRows: 1 }], null];
    }

    // ── UPDATE ──────────────────────────────────────────────────────────────
    if (/^\s*UPDATE/i.test(trimmed)) {
      const collection = db.collection(col);
      const setMatch = trimmed.match(/SET\s+([\s\S]+?)\s+WHERE/i);
      if (!setMatch) return [[], null];
      const setParts = setMatch[1].split(",").map(p => p.trim());
      const $set: Record<string, unknown> = {};
      let pIdx = 0;
      for (const part of setParts) {
        const fm = part.match(/(\w+)\s*=\s*\?/);
        if (!fm) continue;
        const f = fm[1];
        if (f === "updated_at") { $set[f] = new Date().toISOString(); continue; }
        $set[f] = params[pIdx++];
      }
      // WHERE id = ? (last param)
      const idParam = params[pIdx];
      if (idParam !== undefined) {
        await collection.updateOne({ id: Number(idParam) }, { $set });
      }
      return [[], null];
    }

    // ── DELETE ──────────────────────────────────────────────────────────────
    if (/^\s*DELETE FROM/i.test(trimmed)) {
      const collection = db.collection(col);
      const filter = buildFilter(trimmed, params);
      await collection.deleteOne(filter);
      return [[], null];
    }

  } catch (err) {
    console.error("[db-shim] Error executing query:", err);
  }

  return [[], null];
}

interface MockConnection {
  query: (sql: string, params?: unknown[]) => Promise<QueryResult>;
  release: () => void;
}

async function getConnection(): Promise<MockConnection> {
  return { query: mongoQuery, release: () => {} };
}

const pool = { query: mongoQuery, getConnection };
export default pool;
  