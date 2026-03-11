import mysql from 'mysql2/promise';
import fs from 'fs';

async function run() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'admissionx'
  });

  const [tables] = await conn.query('SHOW TABLES');
  const tableNames = tables.map(r => Object.values(r)[0]);
  const courseTables = tableNames.filter(t => t.toLowerCase().includes('course'));
  
  let output = 'COURSE RELATED TABLES AND THEIR COLUMNS:\n\n';
  
  for (const table of courseTables) {
    const [cols] = await conn.query(`SHOW COLUMNS FROM ${table}`);
    output += `TABLE: ${table}\n`;
    output += cols.map(c => `  - ${c.Field} (${c.Type})`).join('\n') + '\n\n';
  }

  fs.writeFileSync('/tmp/course_db_structure.txt', output);
  await conn.end();
}

run();
