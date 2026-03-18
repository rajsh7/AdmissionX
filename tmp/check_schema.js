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
    'courses',
    'users',
    'collegeprofile',
    'landing_page_query_forms'
  ];

  const results = {};

  for (const table of tables) {
    try {
      const [columns] = await connection.query(`DESCRIBE ${table}`);
      results[table] = columns;
    } catch (e) {
      results[table] = { error: e.message };
    }
  }

  console.log(JSON.stringify(results, null, 2));

  await connection.end();
}

checkSchema();
