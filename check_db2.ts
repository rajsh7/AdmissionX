import pool from './lib/db';
async function run() {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM collegeprofile WHERE bannerimage IS NOT NULL AND bannerimage != ""') as any;
    console.log("Count with bannerimage:", rows[0].count);
    
    const [rows2] = await pool.query('SELECT bannerimage FROM collegeprofile WHERE bannerimage IS NOT NULL AND bannerimage != "" LIMIT 5') as any;
    console.log("Samples:", JSON.stringify(rows2, null, 2));

    const [rows3] = await pool.query('SELECT logo FROM collegeprofile WHERE logo IS NOT NULL AND logo != "" LIMIT 5') as any;
    console.log("Logo samples:", JSON.stringify(rows3, null, 2));

  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
run();
