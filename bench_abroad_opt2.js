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
  
  // JOIN Optimized Destination query
  console.time('DestinationQueryJoin');
  await pool.query(`
    SELECT
      c.id, c.name, c.pageslug, c.logoimage,
      COUNT(cp.id) AS college_count
    FROM country c
    LEFT JOIN collegeprofile cp ON cp.registeredAddressCountryId = c.id OR cp.campusAddressCountryId = c.id
    WHERE c.id != 1 AND c.name IS NOT NULL AND c.name != ''
    GROUP BY c.id
    ORDER BY c.isShowOnHome DESC, c.name ASC
    LIMIT 12
  `);
  console.timeEnd('DestinationQueryJoin');

  // JOIN Optimized Stream query
  console.time('StreamQueryJoin');
  await pool.query(`
    SELECT
      fa.id, fa.name, fa.pageslug,
      COUNT(cm.collegeprofile_id) AS college_count
    FROM functionalarea fa
    LEFT JOIN collegemaster cm ON cm.functionalarea_id = fa.id
    LEFT JOIN collegeprofile cp ON cp.id = cm.collegeprofile_id AND (cp.registeredAddressCountryId != 1 OR cp.campusAddressCountryId != 1)
    WHERE fa.name IS NOT NULL AND fa.name != ''
    GROUP BY fa.id
    ORDER BY fa.isShowOnTop DESC, fa.name ASC
    LIMIT 20
  `);
  console.timeEnd('StreamQueryJoin');

  pool.end();
}

run().catch(console.error);
