const mysql = require("mysql2/promise");

const connectionConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "admissionx",
};

async function auditExtra() {
  const pool = mysql.createPool(connectionConfig);
  const tables = ["next_college_signups", "city", "state", "country", "course", "degree", "functionalarea"];
  
  console.log("--- Extra Table Audit ---");
  for (const table of tables) {
    try {
      const [rows] = await pool.query("SHOW INDEX FROM " + table);
      const cols = Array.from(new Set(rows.map(r => r.Column_name)));
      console.log(`Table: ${table} - Indices: ${cols.join(", ")}`);
    } catch (e) {
      console.log(`Table: ${table} - Error: ${e.message}`);
    }
  }
  await pool.end();
}

auditExtra().catch(console.error);
