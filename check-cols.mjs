import pool from './lib/db.js';
async function run() {
  const [types] = await pool.query("SELECT DISTINCT universityType FROM collegeprofile WHERE universityType IS NOT NULL AND universityType != '' ORDER BY universityType");
  console.log('Types:', types.map(r => r.universityType));
  const [ratings] = await pool.query("SELECT MIN(rating) as minR, MAX(rating) as maxR FROM collegeprofile WHERE rating IS NOT NULL AND rating > 0");
  console.log('Rating range:', ratings[0]);
  process.exit();
}
run();
