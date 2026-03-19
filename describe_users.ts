import pool from "./lib/db";
import fs from "fs";

async function run() {
  try {
    const [cols] = await pool.query("DESCRIBE users");
    fs.writeFileSync("users_cols.json", JSON.stringify(cols, null, 2));
    console.log("Wrote users_cols.json");
  } catch (error) {
    console.error("Failed to describe users:", error);
  }
  process.exit();
}

run();
