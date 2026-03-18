import pool from "./lib/db";

async function inspectMoreTables() {
  try {
    for (const table of ["next_college_signups", "transaction"]) {
      const [cols] = await pool.query(`DESCRIBE ${table}`);
      console.log(`\nTable: ${table}`);
      console.log(JSON.stringify(cols, null, 2));
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

inspectMoreTables();
