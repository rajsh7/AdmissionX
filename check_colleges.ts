import pool from './lib/db';
async function run() {
  try {
    const [rows] = await pool.query('SELECT name, slug, bannerimage, logo, image, cover_image FROM collegeprofile WHERE (name LIKE "%Public Health%" OR name LIKE "%Bhoomaraddi%" OR name LIKE "%Mepco%") LIMIT 5') as any;
    console.log(JSON.stringify(rows, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
run();
