import mysql from 'mysql2/promise';

async function queryColleges() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'admissionx'
  });
  
  console.log("--- CollegeProfile ---");
  try {
    const [profiles] = await connection.query('SELECT * FROM collegeprofile LIMIT 1');
    console.log(profiles);
  } catch(e) { console.error(e.message) }
  
  await connection.end();
}

queryColleges();
