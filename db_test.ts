import pool from "./lib/db";

async function test() {
  console.log("Testing connection to 127.0.0.1:3306...");
  try {
    const [rows] = await pool.query("SELECT 1 as result");
    console.log("Success! Result:", rows);
  } catch (err) {
    console.error("Failed to connect:", err);
  } finally {
    process.exit();
  }
}

test();
