import mysql from 'mysql2/promise';

async function listTables() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'admissionx'
  });
  
  const [tables] = await connection.query('SHOW TABLES');
  const tableNames = tables.map(row => Object.values(row)[0]);
  console.log("Tables list:");
  console.log(tableNames.join(", "));
  
  await connection.end();
}

listTables();
