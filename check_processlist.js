const mysql = require("mysql2/promise");
const fs = require("fs");

async function run() {
  const connection = await mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "admissionx"
  });

  try {
    const [rows] = await connection.query("SHOW PROCESSLIST");
    fs.writeFileSync("processlist.json", JSON.stringify(rows, null, 2));
    console.log("Wrote processlist.json");
  } catch (error) {
    console.error("Failed to show process list:", error);
  } finally {
    await connection.end();
  }
  process.exit();
}

run();
