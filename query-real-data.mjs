import mysql from 'mysql2/promise';

async function queryRealData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'admissionx'
  });
  
  console.log("--- CollegeMaster ---");
  try {
    const [colleges] = await connection.query('SELECT * FROM collegemaster LIMIT 1');
    console.log(colleges);
  } catch(e) { console.error(e.message) }
  
  console.log("\n--- Course ---");
  try {
    const [courses] = await connection.query('SELECT * FROM course LIMIT 1');
    console.log(courses);
  } catch(e) { console.error(e.message) }
  
  console.log("\n--- News ---");
  try {
    const [news] = await connection.query('SELECT * FROM news LIMIT 1');
    console.log(news);
  } catch(e) { console.error(e.message) }
  
  await connection.end();
}

queryRealData();
