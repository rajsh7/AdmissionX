import mysql from "mysql2/promise";

const connectionConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "admissionx",
};

async function applyFacilitiesIndices() {
  const pool = mysql.createPool(connectionConfig);

  const sqls = [
    // 1. collegefacilities
    "ALTER TABLE collegefacilities ADD INDEX idx_created_at (created_at)",
    "ALTER TABLE collegefacilities ADD INDEX idx_name (name)",
    
    // 2. facilities
    "ALTER TABLE facilities ADD INDEX idx_name (name)",

    // 3. collegeprofile (crucial for join)
    "ALTER TABLE collegeprofile ADD INDEX idx_users_id (users_id)"
  ];

  console.log("--- Applying Facilities Specific Indices ---");
  for (const sql of sqls) {
    try {
      console.log(`Executing: ${sql}`);
      await pool.query(sql);
      console.log("  [SUCCESS]");
    } catch (e) {
      if (e.message.includes("Duplicate key name")) {
         console.log("  [ALREADY EXISTS]");
      } else {
         console.log(`  [ERROR] ${e.message}`);
      }
    }
  }

  await pool.end();
}

applyFacilitiesIndices().catch(console.error);
