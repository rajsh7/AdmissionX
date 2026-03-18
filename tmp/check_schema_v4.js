const mysql = require('mysql2/promise');
const fs = require('fs');

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

  let output = '';

  for (const table of tables) {
    try {
      const [columns] = await connection.query(`DESCRIBE ${table}`);
      const fields = columns.map(c => c.Field);
      output += `TABLE: ${table}\nFIELDS: ${fields.join(', ')}\n\n`;
    } catch (e) {
      output += `TABLE: ${table}\nERROR: ${e.message}\n\n`;
    }
  }

  fs.writeFileSync('tmp/schema_results.txt', output);
  await connection.end();
}

checkSchema();
