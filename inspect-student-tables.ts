import pool from "./lib/db";

async function inspectTables() {
  try {
    for (const table of ["student_reviews", "studentmarks"]) {
      const [cols] = await pool.query(`DESCRIBE ${table}`);
      console.log(`Table: ${table}`);
      console.log(JSON.stringify(cols, null, 2));
      const [rows] = await pool.query(`SELECT * FROM ${table} LIMIT 1`);
      console.log(`Sample Row:`);
      console.log(JSON.stringify(rows, null, 2));
      console.log("\n---\n");
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

inspectTables();
