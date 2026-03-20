const mysql = require("mysql2/promise");

async function run() {
  const connection = await mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "admissionx"
  });

  try {
    const [rows] = await connection.query("SHOW PROCESSLIST");
    for (const process of rows) {
      // Kill processes that are sending data for too long or are stuck
      if (process.Time > 300 && (process.State === "Sending data" || process.Command === "Sleep")) {
        console.log(`Killing process ${process.Id} (Time: ${process.Time}, State: ${process.State})`);
        await connection.query(`KILL ${process.Id}`);
      }
      // Kill blocked ALTERS to start fresh
      if (process.Info && process.Info.includes("ALTER TABLE users")) {
         console.log(`Killing blocked ALTER process ${process.Id}`);
         await connection.query(`KILL ${process.Id}`);
      }
    }
    console.log("Cleanup complete.");
  } catch (error) {
    console.error("Failed to kill processes:", error);
  } finally {
    await connection.end();
  }
  process.exit();
}

run();
