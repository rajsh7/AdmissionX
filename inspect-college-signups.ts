import pool from "./lib/db";

async function inspectCollegesAds() {
  try {
    const [cols] = await pool.query("DESCRIBE next_college_signups");
    console.log("next_college_signups Columns:", JSON.stringify(cols, null, 2));
    
    const [rows] = await pool.query("SELECT * FROM next_college_signups LIMIT 1");
    console.log("next_college_signups Sample:", JSON.stringify(rows, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

inspectCollegesAds();
