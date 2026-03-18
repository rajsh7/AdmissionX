const pool = require("./lib/db").default;

async function checkColumns() {
  try {
    const tables = ["country", "state", "city"];
    for (const table of tables) {
      try {
        const [cols] = await pool.query(`DESCRIBE ${table}`);
        console.log(`${table} columns:`, cols.map(c => c.Field).join(", "));
      } catch (e) {
        console.log(`Error checking ${table}:`, e.message);
      }
    }
  } catch (err) {
    console.error("Global Error:", err);
  } finally {
    process.exit();
  }
}

checkColumns();
