import pool from './lib/db';
async function run() {
  try {
    const [rows] = await pool.query('SELECT * FROM collegeprofile LIMIT 1') as any;
    console.log("Columns:", Object.keys(rows[0]));
    
    const cols = Object.keys(rows[0]).filter(k => k.toLowerCase().includes('image') || k.toLowerCase().includes('banner') || k.toLowerCase().includes('cover') || k.toLowerCase().includes('pic') || k.toLowerCase().includes('logo'));
    console.log("Image related columns:", cols);
    
    const [rows3] = await pool.query(`SELECT id, slug, ${cols.join(', ')} FROM collegeprofile LIMIT 5`) as any;
    console.log("Sample data:", rows3);
    
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
run();
