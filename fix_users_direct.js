const mysql = require("mysql2/promise");

async function run() {
  const connection = await mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "admissionx"
  });

  try {
    console.log("Adding is_active to users table (DIRECT)...");
    await connection.query("ALTER TABLE users ADD COLUMN is_active TINYINT(1) DEFAULT 1;");
    console.log("Successfully added is_active to users table.");
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log("Column is_active already exists in users table.");
    } else {
      console.error("Failed to add column to users table:", error);
    }
  } finally {
    await connection.end();
  }
  process.exit();
}

run();
