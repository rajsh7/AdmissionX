const mysql = require("mysql2/promise");

const connectionConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "admissionx",
};

async function auditFacilities() {
  const pool = mysql.createPool(connectionConfig);
  try {
    const [cfIndices] = await pool.query("SHOW INDEX FROM collegefacilities");
    console.log("--- collegefacilities Indices ---");
    cfIndices.forEach(idx => console.log(`${idx.Key_name}: ${idx.Column_name}`));

    const [fIndices] = await pool.query("SHOW INDEX FROM facilities");
    console.log("\n--- facilities Indices ---");
    fIndices.forEach(idx => console.log(`${idx.Key_name}: ${idx.Column_name}`));

    const [cfCols] = await pool.query("DESCRIBE collegefacilities");
    console.log("\n--- collegefacilities Columns ---");
    cfCols.forEach(col => console.log(`${col.Field}: ${col.Type}`));

  } catch (e) {
    console.error("Error:", e.message);
  }
  await pool.end();
}

auditFacilities().catch(console.error);
