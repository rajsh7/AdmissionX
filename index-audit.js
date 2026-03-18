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
  const tablesToCheck = [
    "collegeprofile",
    "collegemaster",
    "collegefacilities",
    "faculty",
    "placement",
    "college_admission_procedures",
    "college_cut_offs",
    "event",
    "college_faqs",
    "college_management_details",
    "college_reviews",
    "college_scholarships",
    "college_sports_activities",
    "next_student_signups"
  ];

  console.log("--- Comprehensive Index Audit ---");
  
  for (const table of tablesToCheck) {
    try {
      const [rows] = await pool.query("SHOW INDEX FROM " + table);
      const indexCols = Array.from(new Set(rows.map(r => r.Column_name)));
      console.log(`Table: ${table}`);
      console.log(`  Indexed Columns: ${indexCols.join(", ")}`);
      
      // Specific checks
      if (table === "collegeprofile") {
        if (!indexCols.includes("created_at")) console.log("  [!!] MISSING: created_at");
        if (!indexCols.includes("users_id")) console.log("  [!!] MISSING: users_id");
      }
      if (table === "next_student_signups") {
        if (!indexCols.includes("created_at")) console.log("  [!!] MISSING: created_at");
      }
      if (table !== "collegeprofile" && table !== "next_student_signups" && table !== "users") {
        if (!indexCols.includes("collegeprofile_id")) console.log("  [!!] MISSING: collegeprofile_id");
      }
    } catch (e) {
      console.log(`Table: ${table} - Error: ${e.message}`);
    }
  }

  await pool.end();
}

checkIndices().catch(console.error);
