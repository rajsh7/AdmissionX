const mysql = require("mysql2/promise");
require("dotenv").config({ path: ".env.local" });

const connectionConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "admissionx",
};

async function describeTable() {
  const connection = await mysql.createConnection(connectionConfig);
  try {
    const [cols] = await connection.query("DESCRIBE address");
    console.log(JSON.stringify(cols, null, 2));
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await connection.end();
  }
}

describeTable().catch(console.error);
