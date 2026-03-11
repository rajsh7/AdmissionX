import mysql from 'mysql2/promise';
import fs from 'fs';

async function run() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'admissionx'
  });

  const [courseCols] = await conn.query('SHOW COLUMNS FROM course');
  fs.writeFileSync('/tmp/course_cols_full.txt', courseCols.map(r => r.Field).join('\n'));

  // Also check some sample data
  const [rows] = await conn.query('SELECT * FROM course LIMIT 1');
  fs.writeFileSync('/tmp/course_sample.json', JSON.stringify(rows[0], null, 2));

  await conn.end();
}

run();
