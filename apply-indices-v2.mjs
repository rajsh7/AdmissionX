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
    // 1. next_college_signups
    "ALTER TABLE next_college_signups ADD INDEX idx_status (status)",
    "ALTER TABLE next_college_signups ADD INDEX idx_created_at (created_at)",
    "ALTER TABLE next_college_signups ADD INDEX idx_college_name (college_name)",
    "ALTER TABLE next_college_signups ADD INDEX idx_phone (phone)",

    // 2. Users (college name search)
    "ALTER TABLE users ADD INDEX idx_firstname (firstname)",
    "ALTER TABLE users ADD INDEX idx_email (email)",

    // 3. Lookup tables (names are searched/sorted)
    "ALTER TABLE city ADD INDEX idx_name (name)",
    "ALTER TABLE state ADD INDEX idx_name (name)",
    "ALTER TABLE country ADD INDEX idx_name (name)",
    "ALTER TABLE course ADD INDEX idx_name (name)",
    "ALTER TABLE degree ADD INDEX idx_name (name)",
    "ALTER TABLE functionalarea ADD INDEX idx_name (name)",
    "ALTER TABLE collegemaster ADD INDEX idx_created_at (created_at)",
    
    // 4. Heavy subquery tables
    "ALTER TABLE collegemaster ADD INDEX idx_collegeprofile_id (collegeprofile_id)", // Double check
    "ALTER TABLE collegefacilities ADD INDEX idx_collegeprofile_id (collegeprofile_id)",
    "ALTER TABLE faculty ADD INDEX idx_collegeprofile_id (collegeprofile_id)",
    "ALTER TABLE placement ADD INDEX idx_collegeprofile_id (collegeprofile_id)",
    "ALTER TABLE college_admission_procedures ADD INDEX idx_collegeprofile_id (collegeprofile_id)",
    "ALTER TABLE event ADD INDEX idx_collegeprofile_id (collegeprofile_id)",
    "ALTER TABLE college_faqs ADD INDEX idx_collegeprofile_id (collegeprofile_id)",
    "ALTER TABLE college_reviews ADD INDEX idx_collegeprofile_id (collegeprofile_id)",
    "ALTER TABLE college_scholarships ADD INDEX idx_collegeprofile_id (collegeprofile_id)"
  ];

  console.log("--- Applying Comprehensive Indices ---");
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

applyIndices().catch(console.error);
