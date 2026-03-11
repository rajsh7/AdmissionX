import mysql from 'mysql2/promise';

async function checkDb() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'admissionx'
    });
    
    console.log("Connected successfully!");
    
    const [tables] = await connection.query('SHOW TABLES');
    console.log("Tables in database:", tables);
    
    for (const row of tables) {
      const tableName = Object.values(row)[0];
      console.log(`\n--- Schema for table: ${tableName} ---`);
      const [columns] = await connection.query(`SHOW COLUMNS FROM \`${tableName}\``);
      console.log(columns);
    }
    
    await connection.end();
  } catch (error) {
    console.error("Database connection failed:", error);
  }
}

checkDb();
