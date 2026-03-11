import mysql from 'mysql2/promise';

async function run() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'admissionx'
  });

  const [tables] = await conn.query('SHOW TABLES');
  const tableNames = tables.map(r => Object.values(r)[0]);
  console.log('ALL TABLES:');
  console.log(tableNames.join(', '));

  const courseTables = tableNames.filter(t => t.toLowerCase().includes('course'));
  console.log('\nCOURSE RELATED TABLES:');
  console.log(courseTables.join(', '));

  await conn.end();
}

run();
