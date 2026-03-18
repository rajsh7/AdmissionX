const mysql = require("mysql2/promise");

const connectionConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "admissionx",
};

async function checkTables() {
  const pool = mysql.createPool(connectionConfig);
  try {
    const tables = ["slider_managers", "gallery"];
    for (const table of tables) {
      try {
        const [cols] = await pool.query(`DESCRIBE ${table}`);
        console.log(`${table.toUpperCase()} COLUMNS:`, cols.map(c => c.Field).join(", "));
      } catch (e) {
        console.log(`Error checking ${table}:`, e.message);
      }
    }
  } catch (e) {
    console.error("Error:", e.message);
  }
  await pool.end();
}

checkTables().catch(console.error);
