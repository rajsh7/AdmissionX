import pool from "./lib/db";

async function run() {
  try {
    console.log("Adding is_active to users table...");
    await pool.query("ALTER TABLE users ADD COLUMN is_active TINYINT(1) DEFAULT 1;");
    console.log("Successfully added is_active to users table.");
  } catch (error: any) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log("Column is_active already exists in users table.");
    } else {
      console.error("Failed to add column to users table:", error);
    }
  }
  process.exit();
}

run();
