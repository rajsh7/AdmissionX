import mysql from "mysql2/promise";

// Create a connection pool instead of a single connection
// This is critical for Next.js API routes over connection reliability and performance.
const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "admissionx",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
