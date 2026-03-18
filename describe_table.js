const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'admissionx',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function main() {
  const [rows] = await pool.query('DESCRIBE collegeprofile');
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
