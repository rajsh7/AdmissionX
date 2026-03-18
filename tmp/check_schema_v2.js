const mysql = require('mysql2/promise');

async function checkSchema() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'admissionx'
  });

  const tables = [
    'city',
    'careers',
    'news_types',
    'faculty_departments',
    'users',
    'collegeprofile',
    'landing_page_query_forms'
  ];

  for (const table of tables) {
    try {
      const [columns] = await connection.query(`DESCRIBE ${table}`);
      const fields = columns.map(c => c.Field);
      console.log(`Table: ${table} | Fields: ${fields.join(', ')}`);
    } catch (e) {
      console.log(`Table: ${table} | Error: ${e.message}`);
    }
  }

  // Also search for something similar to 'courses'
  try {
    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    console.log(`All tables: ${tableNames.join(', ')}`);
    
    const coursesLike = tableNames.filter(t => t.toLowerCase().includes('course'));
    console.log(`Tables like 'course': ${coursesLike.join(', ')}`);
  } catch (e) {
    console.log(`Error listing tables: ${e.message}`);
  }

  await connection.end();
}

checkSchema();
