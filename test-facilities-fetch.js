const mysql = require('mysql2/promise');

async function testFetch() {
  const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    database: 'admissionx',
    waitForConnections: true,
    connectionLimit: 10,
  });

  const PAGE_SIZE = 25;
  const page = 1;
  const offset = (page - 1) * PAGE_SIZE;

  const sql = `
    SELECT 
      cf.id,
      COALESCE(u.firstname, 'Unnamed College') as college_name,
      COALESCE(cf.name, f.name) as facility_name,
      cf.description,
      f.iconname as icon
    FROM (
      SELECT id, collegeprofile_id, facilities_id, name, description, created_at
      FROM collegefacilities
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    ) cf
    JOIN collegeprofile cp ON cp.id = cf.collegeprofile_id
    JOIN users u ON u.id = cp.users_id
    LEFT JOIN facilities f ON f.id = cf.facilities_id
    ORDER BY cf.created_at DESC
  `;

  try {
    const start = Date.now();
    const [rows] = await pool.query(sql, [PAGE_SIZE, offset]);
    console.log(`Fetch took ${Date.now() - start}ms`);
    console.log(`Fetched ${rows.length} rows`);
    
    // Check for BigInts in rows
    rows.forEach((row, i) => {
      Object.keys(row).forEach(key => {
        if (typeof row[key] === 'bigint') {
          console.log(`Row ${i} has BigInt in ${key}: ${row[key]}`);
        }
      });
    });

    const countSql = "SELECT COUNT(*) AS total FROM collegefacilities";
    const [countRows] = await pool.query(countSql);
    console.log(`Total count:`, countRows[0].total);
    console.log(`Total count type:`, typeof countRows[0].total);

  } catch (err) {
    console.error("FAILD TO FETCH:", err);
  } finally {
    await pool.end();
  }
}

testFetch();
