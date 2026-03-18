import pool from "./lib/db";

async function run() {
  try {
    const [rows]: any = await pool.query("SHOW TABLES LIKE 'forms'");
    console.log(JSON.stringify(rows));
    
    if (rows.length === 0) {
      console.log("No 'forms' table found.");
      const [allTables]: any = await pool.query("SHOW TABLES");
      console.log("Available tables:", JSON.stringify(allTables));
    }
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}

run();
