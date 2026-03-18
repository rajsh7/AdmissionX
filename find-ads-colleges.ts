import pool from "./lib/db";

async function findAdsColleges() {
  try {
    const [rows] = await pool.query("SHOW TABLES");
    const tables = (rows as any[]).map(r => Object.values(r)[0]) as string[];
    console.log("All Tables:", tables.sort().join(", "));
    
    // Inspect next_college_signups sample
    const [signupRows] = await pool.query("SELECT * FROM next_college_signups LIMIT 1");
    console.log("\nnext_college_signups Sample:", JSON.stringify(signupRows, null, 2));
    
    // Look for any table with 'ads' or 'college' in it
    const adCollegeTables = tables.filter((t: string) => t.toLowerCase().includes("ads") || t.toLowerCase().includes("college"));
    console.log("\nAds/College related tables:", adCollegeTables.join(", "));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

findAdsColleges();
