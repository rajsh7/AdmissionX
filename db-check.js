const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'admissionx',
  });
  
  const [tables] = await connection.execute('SHOW TABLES');
  console.log('Tables:', tables.map(t => Object.values(t)[0]));
  
  for (let tableObj of tables) {
    const table = Object.values(tableObj)[0];
    if (table.toLowerCase().includes('course')) {
      const [desc] = await connection.execute(`DESCRIBE ${table}`);
      console.log(`\nTable ${table} schema:`);
      console.log(desc);
    }
  }
  
  connection.end();
}

main().catch(console.error);
