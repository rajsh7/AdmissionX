const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'admissionx',
  });
  
  for (let table of ['degree', 'educationlevel']) {
    try {
      const [desc] = await connection.execute(`DESCRIBE ${table}`);
      console.log(`\nTable ${table} schema:`);
      console.log(desc);
    } catch(e) {
      console.log(`\nTable ${table} not found or error`, e.message);
    }
  }
  
  connection.end();
}

main().catch(console.error);
