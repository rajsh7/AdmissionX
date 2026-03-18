import mysql from "mysql2/promise";

const connectionConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "admissionx",
};

async function checkPerformance() {
  const pool = mysql.createPool(connectionConfig);
  const tables = [
    "collegeprofile",
    "collegemaster",
    "next_student_signups",
    "users",
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
    "college_sports_activities"
  ];

  console.log("--- Performance Analysis ---");
  
  for (const table of tables) {
    try {
      // Get count
      const [countResult] = await pool.query(`SELECT COUNT(*) as cnt FROM ${table}`);
      const count = (countResult as any)[0].cnt;
      
      // Get indices
      const [indexResult] = await pool.query(`SHOW INDEX FROM ${table}`);
      const indices = (indexResult as any).map((r: any) => `${r.Key_name}(${r.Column_name})`);
      const uniqueIndices = Array.from(new Set(indices)).join(", ");
      
      console.log(`Table: ${table}`);
      console.log(`  Rows: ${count}`);
      console.log(`  Indices: ${uniqueIndices}`);
      console.log("----------------------------");
    } catch (e) {
      console.log(`Table: ${table} - Error: ${e.message}`);
    }
  }

  await pool.end();
}

checkPerformance().catch(console.error);
