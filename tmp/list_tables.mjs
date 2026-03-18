import mysql from 'mysql2/promise';

async function main() {
  const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "admissionx"
  });
  
  const conn = await pool.getConnection();
  try {
    const [tables] = await conn.query('SHOW TABLES');
    for(const table of tables) {
        console.log(Object.values(table)[0]);
    }
  } catch (err) {
    console.error(err);
  } finally {
    conn.release();
    await pool.end();
  }
}

main();
