import mysql from "mysql2/promise";

type MySqlPool = mysql.Pool;

const globalForDb = globalThis as unknown as { mysqlPool?: MySqlPool };

// Create a connection pool instead of a single connection.
// Cache it across hot reloads to avoid exhausting MySQL connections in dev.
const pool =
  globalForDb.mysqlPool ??
  mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "admissionx",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.mysqlPool = pool;
}

export default pool;
