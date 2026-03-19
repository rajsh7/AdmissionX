import pool from "./lib/db";

async function run() {
  try {
    const [rows] = await pool.query("SELECT COUNT(*) as count FROM users");
    console.log("Users count:", JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error("Failed to count users:", error);
  }
  process.exit();
}

run();
