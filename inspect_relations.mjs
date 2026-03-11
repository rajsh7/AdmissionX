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
  
  let result = '';
  for (const table of tableNames) {
    const [cols] = await conn.query(`SHOW COLUMNS FROM \`${table}\``);
    const colNames = cols.map(c => c.Field);
    if (colNames.includes('course_id') || colNames.includes('college_id') || colNames.includes('collegeprofile_id')) {
        result += `TABLE: ${table}\nCOLUMNS: ${colNames.join(', ')}\n\n`;
    }
  }
  
  fs.writeFileSync('/tmp/relevant_tables.txt', result);
  await conn.end();
}

run();
