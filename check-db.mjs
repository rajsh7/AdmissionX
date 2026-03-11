import mysql from 'mysql2/promise';
import { writeFileSync } from 'fs';

async function run() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1', port: 3306, user: 'root', password: '', database: 'admissionx'
  });
  
  const [tables] = await conn.query('SHOW TABLES');
  const names = tables.map(r => Object.values(r)[0]);
  
  const output = { tables: names, schemas: {} };
  
  for (const name of names) {
    const [cols] = await conn.query(`SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='admissionx' AND TABLE_NAME='${name}'`);
    output.schemas[name] = cols.map(c => c.COLUMN_NAME);
  }
  
  // Sample data from key tables
  output.samples = {};
  for (const t of ['country', 'countries', 'state', 'states', 'city', 'cities', 'course', 'courses', 'degree', 'degrees', 'stream', 'streams', 'collegeprofile']) {
    if (names.includes(t)) {
      const [r] = await conn.query(`SELECT * FROM \`${t}\` LIMIT 5`);
      output.samples[t] = r;
    }
  }
  
  writeFileSync('db-schema.json', JSON.stringify(output, null, 2));
  console.log('Done. Tables count:', names.length);
  await conn.end();
}

run().catch(e => { console.error('ERR:', e.message); process.exit(1); });
