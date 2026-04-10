const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'admissionx',
  });
  
  const [cCount] = await connection.execute('SELECT COUNT(*) as c FROM course');
  const [ccdCount] = await connection.execute('SELECT COUNT(*) as c FROM counseling_courses_details');
  console.log('course count:', cCount[0].c);
  console.log('ccd count:', ccdCount[0].c);
  
  const [cSample] = await connection.execute('SELECT * FROM course LIMIT 1');
  console.log('\ncourse sample:', cSample[0]);
  
  connection.end();
}

main().catch(console.error);
