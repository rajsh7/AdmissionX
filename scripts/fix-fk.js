const mysql = require('mysql2/promise');

async function main() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'admissionx'
  });

  try {
    console.log("Attempting to add FK to collegeprofile...");
    await pool.query("ALTER TABLE applications ADD CONSTRAINT fk_college_new FOREIGN KEY (collegeId) REFERENCES collegeprofile(id) ON DELETE CASCADE");
    console.log("✅ Success!");
  } catch (err) {
    console.error("❌ Failed:", err.message);
    const [tables] = await pool.query("SHOW TABLES");
    console.log("Existing tables:", tables.map(t => Object.values(t)[0]));
  } finally {
    process.exit(0);
  }
}

main();
