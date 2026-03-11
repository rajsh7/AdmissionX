import mysql from 'mysql2/promise';

async function run() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'admissionx'
  });

  const [courseCols] = await conn.query('SHOW COLUMNS FROM course');
  const [degreeCols] = await conn.query('SHOW COLUMNS FROM degree');

  console.log('COURSE COLUMNS:');
  console.log(courseCols.map(r => r.Field).join(', '));

  console.log('\nDEGREE COLUMNS:');
  console.log(degreeCols.map(r => r.Field).join(', '));

  await conn.end();
}

run();
