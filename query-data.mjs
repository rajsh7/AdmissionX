import mysql from 'mysql2/promise';

async function queryData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'admissionx'
  });
  
  console.log("--- Institutes ---");
  const [institutes] = await connection.query('SELECT id, name, city, state, logo, banner, rating FROM institutes LIMIT 3');
  console.log(institutes);
  
  console.log("\n--- Courses ---");
  const [courses] = await connection.query('SELECT id, name, duration, icon FROM courses LIMIT 3');
  console.log(courses);
  
  console.log("\n--- Articles ---");
  const [articles] = await connection.query('SELECT id, title, defaultImage, short_desc FROM articles LIMIT 3');
  console.log(articles);
  
  await connection.end();
}

queryData();
