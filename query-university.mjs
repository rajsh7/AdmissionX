import mysql from 'mysql2/promise';

async function queryTables() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'admissionx'
  });
  
  console.log("--- University ---");
  try {
    const [univInfo] = await connection.query('SELECT * FROM university LIMIT 1');
    console.log(univInfo);
  } catch(e) {}

  console.log("--- Users (to see if college name is here) ---");
  try {
    const [usersInfo] = await connection.query('SELECT id, firstname, lastname, email, type_of_user FROM users WHERE type_of_user = "college" OR id = 3 LIMIT 2');
    console.log(usersInfo);
  } catch(e) {}
  
  await connection.end();
}

queryTables();
