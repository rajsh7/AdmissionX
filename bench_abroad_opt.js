import { createPool } from 'mysql2/promise';

const pool = createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'admissionx',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function run() {
  console.log('Connecting...');
  
  // Optimized Destination query
  console.time('DestinationQueryOpt');
  await pool.query(`
    SELECT
      tmp.id, tmp.name, tmp.pageslug, tmp.logoimage,
      (SELECT COUNT(*) FROM collegeprofile cp WHERE cp.registeredAddressCountryId = tmp.id OR cp.campusAddressCountryId = tmp.id) AS college_count
    FROM (
      SELECT id, name, pageslug, logoimage
      FROM country
      WHERE id != 1 AND name IS NOT NULL AND name != ''
      ORDER BY isShowOnHome DESC, name ASC
      LIMIT 12
    ) tmp
  `);
  console.timeEnd('DestinationQueryOpt');

  // Optimized Stream query
  console.time('StreamQueryOpt');
  await pool.query(`
    SELECT
      tmp.id, tmp.name, tmp.pageslug,
      (SELECT COUNT(*) FROM collegemaster cm
       INNER JOIN collegeprofile cp ON cp.id = cm.collegeprofile_id
       WHERE cm.functionalarea_id = tmp.id AND (cp.registeredAddressCountryId != 1 OR cp.campusAddressCountryId != 1)) AS college_count
    FROM (
      SELECT id, name, pageslug
      FROM functionalarea
      WHERE name IS NOT NULL AND name != ''
      ORDER BY isShowOnTop DESC, name ASC
      LIMIT 20
    ) tmp
  `);
  console.timeEnd('StreamQueryOpt');

  pool.end();
}

run().catch(console.error);
