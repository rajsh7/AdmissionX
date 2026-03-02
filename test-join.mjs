import pool from './lib/db.js'; // local test

async function testFetch() {
  const [rows] = await pool.query(`
    SELECT 
      u.firstname AS name,
      cp.registeredSortAddress AS location,
      cp.bannerimage AS image,
      cp.rating AS rating,
      cp.slug
    FROM collegeprofile cp
    JOIN users u ON cp.users_id = u.id
    WHERE cp.isShowOnHome = 1
    LIMIT 5
  `);
  console.log(rows);
  process.exit();
}
testFetch();
