import { MongoClient, Db } from "mongodb";

declare global {
  var _mongoClient: MongoClient | undefined;
}

const uri = process.env.MONGODB_URI!;
if (!uri) throw new Error("MONGODB_URI is not defined in environment variables");

const client: MongoClient = globalThis._mongoClient ?? new MongoClient(uri);

if (process.env.NODE_ENV !== "production") {
  globalThis._mongoClient = client;
}

let _db: Db | null = null;

export async function getDb(): Promise<Db> {
  if (!_db) {
    await client.connect();
    _db = client.db(process.env.MONGODB_DB ?? "admissionx");
  }
  return _db;
}

// ── MySQL2-compatible shim ────────────────────────────────────────────────────
// Allows legacy files that use pool.query() / pool.getConnection() to work
// against MongoDB without individual rewrites. Each file should be migrated
// to use getDb() directly over time.

type QueryResult = [unknown, unknown];

async function mongoQuery(sql: string, params: unknown[] = []): Promise<QueryResult> {
  // This shim returns empty results — legacy pages will show empty state
  // until they are individually migrated to use getDb() directly.
  console.warn("[db-shim] Legacy SQL query intercepted — migrate to getDb():", sql.trim().slice(0, 80));
  return [[], null];
}

interface MockConnection {
  query: (sql: string, params?: unknown[]) => Promise<QueryResult>;
  release: () => void;
}

async function getConnection(): Promise<MockConnection> {
  return {
    query: mongoQuery,
    release: () => {},
  };
}

// Default export mimics mysql2 pool interface
const pool = {
  query: mongoQuery,
  getConnection,
};

export default pool;
