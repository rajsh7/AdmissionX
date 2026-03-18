const mysql = require('mysql2/promise');

async function checkSchema() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'admissionx'
  });

  const tables = [
    'city',
    'state',
    'country',
    'careers',
    'news_types',
    'faculty_departments',
    'course',
    'users',
    'collegeprofile',
    'landing_page_query_forms'
  ];

  for (const table of tables) {
    try {
      const [columns] = await connection.query(`DESCRIBE ${table}`);
      const fields = columns.map(c => c.Field);
      console.log(`TABLE_NAME: ${table}`);
      console.log(`FIELDS: ${fields.join(', ')}`);
      console.log('---');
    } catch (e) {
      console.log(`TABLE_NAME: ${table} | ERROR: ${e.message}`);
      console.log('---');
    }
  }

  await connection.end();
}

checkSchema();
