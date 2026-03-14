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
  
  // Destination query
  console.time('DestinationQuery');
  await pool.query(`
    SELECT
      c.id, c.name, c.pageslug, c.logoimage,
      (SELECT COUNT(*) FROM collegeprofile cp WHERE cp.registeredAddressCountryId = c.id OR cp.campusAddressCountryId = c.id) AS college_count
    FROM country c
    WHERE c.id != 1 AND c.name IS NOT NULL AND c.name != ''
    ORDER BY c.isShowOnHome DESC, c.name ASC
    LIMIT 12
  `);
  console.timeEnd('DestinationQuery');

  // Stream query
  console.time('StreamQuery');
  await pool.query(`
    SELECT
      fa.id, fa.name, fa.pageslug,
      (SELECT COUNT(*) FROM collegemaster cm
       INNER JOIN collegeprofile cp ON cp.id = cm.collegeprofile_id
       WHERE cm.functionalarea_id = fa.id AND (cp.registeredAddressCountryId != 1 OR cp.campusAddressCountryId != 1)) AS college_count
    FROM functionalarea fa
    WHERE fa.name IS NOT NULL AND fa.name != ''
    ORDER BY fa.isShowOnTop DESC, fa.name ASC
    LIMIT 20
  `);
  console.timeEnd('StreamQuery');

  // College section query id check
  console.time('CollegeSectionQuery');
  await pool.query(`
    SELECT COUNT(*) AS total
    FROM collegeprofile cp
    WHERE (cp.registeredAddressCountryId != 1 OR cp.campusAddressCountryId != 1) AND (cp.registeredAddressCountryId IS NOT NULL OR cp.campusAddressCountryId IS NOT NULL)
  `);
  console.timeEnd('CollegeSectionQuery');

  pool.end();
}

run().catch(console.error);
