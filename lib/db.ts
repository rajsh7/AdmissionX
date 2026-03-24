import mysql from "mysql2/promise";

// ─── Global singleton declaration ─────────────────────────────────────────────
// In Next.js development, Hot Module Replacement (HMR) re-evaluates every
// module on each file save.  Without this guard, a fresh pool (with its own
// set of up-to-N connections) is created on every reload, quickly exhausting
// MySQL's max_connections limit and throwing "Too many connections".
//
// Storing the pool on `globalThis` means the same instance survives across
// HMR cycles in development.  In production the module is only ever evaluated
// once, so the guard is a no-op there — but it costs nothing.
// ─────────────────────────────────────────────────────────────────────────────

declare global {
  var _mysqlPool: mysql.Pool | undefined;
}

function createPool(): mysql.Pool {
  return mysql.createPool({
    host: process.env.DB_HOST || "::1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "admissionx",

    // ── Connection pool tuning ──────────────────────────────────────────────
    // Keep the pool small so we never exhaust MySQL's max_connections.
    // Previous value of 20 × multiple dev-server restarts = 100+ stuck
    // connections that prevented any new connection from being accepted.
    waitForConnections: true, // queue requests instead of throwing immediately
    connectionLimit: 5, // conservative — pages need at most 3 parallel queries
    queueLimit: 20, // fail fast if more than 20 requests are waiting
    idleTimeout: 30000, // release idle connections after 30 s
    enableKeepAlive: true, // prevent stale connections being dropped by MySQL
    keepAliveInitialDelay: 0,
    connectTimeout: 8000, // fail in 8 s instead of 60 s — surfaces DB issues fast
  });
}

// Reuse the existing pool across HMR reloads in development; create once in production.
const pool: mysql.Pool = globalThis._mysqlPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalThis._mysqlPool = pool;
}

export default pool;
