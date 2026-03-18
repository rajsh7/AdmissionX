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
    console.log('--- TABLES ---');
    console.log(JSON.stringify(tables, null, 2));

    const targetTables = [
        'college_reviews',
        'college_faqs',
        'college_scholarships',
        'placement',
        'faculty',
        'gallery',
        'collegeprofile',
        'collegemaster',
        'admission_procedure',
        'cutoffs',
        'cut_offs',
        'sports_activity',
        'events',
        'facilities'
    ];

    for(const table of targetTables) {
        try {
            const [rows] = await conn.query(`DESCRIBE \`${table}\``);
            console.log(`\n--- DESCRIBE ${table} ---`);
            console.log(JSON.stringify(rows, null, 2));
        } catch(e) {
            // Table might not exist
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
