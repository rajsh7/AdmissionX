const mysql = require("mysql2/promise");

const connectionConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "admissionx",
};

async function checkTypes() {
  const pool = mysql.createPool(connectionConfig);
  try {
    const [cols] = await pool.query("DESCRIBE collegeprofile");
    for (const col of cols) {
       if (['isTopUniversity', 'topUniversityRank', 'ranking', 'rating'].includes(col.Field)) {
         console.log(`${col.Field}: ${col.Type}`);
       }
    }
  } catch (e) {
    console.error("Error:", e.message);
  }
  await pool.end();
}

checkTypes().catch(console.error);
