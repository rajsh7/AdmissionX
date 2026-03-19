import pool from "./lib/db";
import fs from "fs";

async function run() {
  const [tables] = await pool.query("SHOW TABLES");
  fs.writeFileSync("tables.json", JSON.stringify(tables, null, 2));
  console.log("Wrote tables.json");
  process.exit(0);
}

run();
