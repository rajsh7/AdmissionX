const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'admissionx',
  });
  
  const [degreeCount] = await connection.execute('SELECT COUNT(*) as c FROM degree');
  const [elCount] = await connection.execute('SELECT COUNT(*) as c FROM educationlevel');
  console.log('degree count:', degreeCount[0].c);
  console.log('educationlevel count:', elCount[0].c);
  
  connection.end();
}

main().catch(console.error);
