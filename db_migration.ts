import pool from "./lib/db";

async function run() {
  const conn = await pool.getConnection();
  try {
    console.log("Starting Phase 5 schema verification (v2)...");

    // 1. Ensure next_student_signups has all columns
    await conn.query(`
      CREATE TABLE IF NOT EXISTS next_student_signups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(32) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Add is_active if missing
    try {
      await conn.query("ALTER TABLE next_student_signups ADD COLUMN is_active TINYINT(1) DEFAULT 1;");
      console.log("Added is_active to next_student_signups");
    } catch (e: any) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e;
    }

    // Add updated_at if missing
    try {
      await conn.query("ALTER TABLE next_student_signups ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;");
      console.log("Added updated_at to next_student_signups");
    } catch (e: any) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e;
    }

    // 2. Ensure next_college_signups exists
    await conn.query(`
      CREATE TABLE IF NOT EXISTS next_college_signups (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        college_name  VARCHAR(255) NOT NULL,
        email         VARCHAR(255) NOT NULL UNIQUE,
        contact_name  VARCHAR(255) NOT NULL,
        phone         VARCHAR(32)  NOT NULL,
        address       TEXT NOT NULL,
        courses       TEXT NOT NULL,
        password_hash VARCHAR(255) DEFAULT NULL,
        status        VARCHAR(20)  NOT NULL DEFAULT 'pending',
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log("Ensured next_college_signups exists.");

    // 3. Ensure users table has is_active
    try {
      await conn.query("ALTER TABLE users ADD COLUMN is_active TINYINT(1) DEFAULT 1;");
      console.log("Added is_active to users table");
    } catch (e: any) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e;
    }

    console.log("Phase 5 database schema is now up to date.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    conn.release();
  }
  process.exit();
}

run();
