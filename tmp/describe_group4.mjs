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
    const targetTables = [
        'college_reviews',
        'college_faqs'
    ];

    for(const table of targetTables) {
        try {
            const [rows] = await conn.query(`DESCRIBE \`${table}\``);
            console.log(`\n--- DESCRIBE ${table} ---`);
            console.log(JSON.stringify(rows, null, 2));
        } catch(e) {
            console.log(`\n--- TABLE ${table} NOT FOUND ---`);
        }
    }
  } catch (err) {
    console.error(err);
  } finally {
    conn.release();
    await pool.end();
  }
}

main();
