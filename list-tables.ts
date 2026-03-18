import pool from "./lib/db";

async function listTables() {
  try {
    const [rows] = await pool.query("SHOW TABLES");
    const tables = rows.map(r => Object.values(r)[0]);
    console.log(tables.sort().join("\n"));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

listTables();
