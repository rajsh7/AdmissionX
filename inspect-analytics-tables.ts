import pool from "./lib/db";

async function findRelatedTables() {
  try {
    const [rows] = await pool.query("SHOW TABLES");
    const tables = rows.map(r => Object.values(r)[0]);
    const keywords = ["ads", "analytic", "transaction", "metric", "stat", "view"];
    const matches = tables.filter(t => keywords.some(k => t.toLowerCase().includes(k)));
    console.log("Matched Tables:", matches.join(", "));
    
    for (const table of ["next_college_signups", "transaction", "homepage_stats"]) {
      if (tables.includes(table)) {
        const [cols] = await pool.query(`DESCRIBE ${table}`);
        console.log(`\nTable: ${table}`);
        console.log(JSON.stringify(cols, null, 2));
      }
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

findRelatedTables();
