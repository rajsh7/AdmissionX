
const mysql = require('mysql2/promise');

async function checkCollegeMaster() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'web_admissionx_upgrade'
  });

  try {
    const [columns] = await connection.query("SHOW COLUMNS FROM collegemaster");
    console.log('Columns in collegemaster table:');
    console.log(JSON.stringify(columns.map(c => c.Field), null, 2));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await connection.end();
  }
}

checkCollegeMaster();
