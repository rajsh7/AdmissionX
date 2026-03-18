import mysql from "mysql2/promise";

const connectionConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "admissionx",
};

async function applyIndices() {
  const pool = mysql.createPool(connectionConfig);

  const sqls = [
    "ALTER TABLE collegeprofile ADD INDEX idx_created_at (created_at)",
    "ALTER TABLE collegeprofile ADD INDEX idx_slug (slug)",
    "ALTER TABLE next_student_signups ADD INDEX idx_created_at (created_at)",
    "ALTER TABLE next_student_signups ADD INDEX idx_name (name)",
    "ALTER TABLE next_student_signups ADD INDEX idx_email (email)",
    "ALTER TABLE next_student_signups ADD INDEX idx_phone (phone)"
  ];

  console.log("--- Applying Indices ---");
  for (const sql of sqls) {
    try {
      console.log(`Executing: ${sql}`);
      await pool.query(sql);
      console.log("  [SUCCESS]");
    } catch (e) {
      console.log(`  [ERROR] ${e.message}`);
    }
  }

  await pool.end();
}

applyIndices().catch(console.error);
