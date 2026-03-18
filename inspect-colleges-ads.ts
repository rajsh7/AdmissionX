import pool from "./lib/db";

async function inspectColleges() {
  try {
    const [rows] = await pool.query("SHOW TABLES");
    const tables = rows.map(r => Object.values(r)[0]);
    console.log("TABLES:", tables.join(", "));
    
    // Check next_college_signups
    const [cols] = await pool.query("DESCRIBE next_college_signups");
    console.log("\nnext_college_signups Columns:");
    console.log(JSON.stringify(cols, null, 2));
    
    // Check ads_managements again to see if it has college references
    const [adCols] = await pool.query("DESCRIBE ads_managements");
    console.log("\nads_managements Columns:");
    console.log(JSON.stringify(adCols, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

inspectColleges();
