import mysql from 'mysql2/promise';

async function run() {
  const pool = mysql.createPool({ 
    host: 'localhost', 
    user: 'root', 
    password: '', 
    database: 'admissionx' 
  });
  try {
    const [rows] = await pool.query(`
      SELECT 
         a.id,
         a.method_type,
         a.status,
         a.created_at,
         COALESCE(u.firstname, 'Unnamed College') AS college_name,
         d.name AS degree_name,
         c.name AS course_name,
         ct.name AS city_name
       FROM ads_top_college_lists a
       LEFT JOIN collegeprofile cp ON cp.id = a.collegeprofile_id
       LEFT JOIN users u ON u.id = cp.users_id
       LEFT JOIN degree d ON d.id = a.degree_id
       LEFT JOIN course c ON c.id = a.course_id
       LEFT JOIN city ct ON ct.id = a.city_id
       LIMIT 5
    `);
    console.log("Success! Rows:", rows);
  } catch (err) {
    console.error("SQL Error:", err.message);
  }
  process.exit();
}
run();
