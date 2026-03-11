import mysql from 'mysql2/promise';
import fs from 'fs';

async function run() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'admissionx'
  });

  const [rows] = await conn.query('SHOW TABLES');
  const tables = rows.map(r => Object.values(r)[0]);
  fs.writeFileSync('/tmp/all_tables.txt', tables.join('\n'));
  
  await conn.end();
}

run();
