import pool from "./lib/db";
import fs from "fs";

async function run() {
  try {
    const [cols] = await pool.query("DESCRIBE next_student_signups");
    fs.writeFileSync("next_student_signups_cols.json", JSON.stringify(cols, null, 2));
    console.log("Wrote next_student_signups_cols.json");
  } catch (error) {
    console.error("Failed to describe table:", error);
  }
  process.exit();
}

run();
