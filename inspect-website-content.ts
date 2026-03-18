const mysql = require('mysql2/promise');

async function run() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'admissionx'
  });

  try {
    const tables = ['slider_managers', 'what_we_offers', 'latest_updates'];
    for (const table of tables) {
      const [rows] = await pool.query(`DESCRIBE ${table}`);
      console.log(`--- ${table} ---`);
      console.log(JSON.stringify(rows, null, 2));
    }
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

run();
