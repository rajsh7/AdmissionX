const mysql = require("mysql2/promise");

const connectionConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "admissionx",
};

async function checkIndices() {
  const pool = mysql.createPool(connectionConfig);
  const collegeSubTables = [
    "collegemaster", "collegefacilities", "faculty", "placement",
    "college_admission_procedures", "college_cut_offs", "event",
    "college_faqs", "college_management_details", "college_reviews",
    "college_scholarships", "college_sports_activities"
  ];

  console.log("--- Missing Indices Check ---");
  
  // 1. Check collegeprofile_id in sub-tables
  for (const table of collegeSubTables) {
    try {
      const [rows] = await pool.query("SHOW INDEX FROM " + table + " WHERE Column_name = 'collegeprofile_id'");
      if (rows.length === 0) {
        console.log(`[MISSING INDEX] ${table}(collegeprofile_id)`);
      } else {
        console.log(`[OK] ${table}(collegeprofile_id)`);
      }
    } catch (e) {
      console.log(`[ERROR] ${table}: ${e.message}`);
    }
  }

  // 2. Check collegeprofile critical indices
  const cpRows = await pool.query("SHOW INDEX FROM collegeprofile");
  const cpCols = cpRows[0].map(r => r.Column_name);
  if (!cpCols.includes('users_id')) console.log("[MISSING INDEX] collegeprofile(users_id)");
  if (!cpCols.includes('slug')) console.log("[MISSING INDEX] collegeprofile(slug)");
  if (!cpCols.includes('created_at')) console.log("[MISSING INDEX] collegeprofile(created_at)");

  await pool.end();
}

checkIndices().catch(console.error);
