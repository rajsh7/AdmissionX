import mysql from 'mysql2/promise';

async function init() {
  console.log('Initializing database tables...');
  const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "admissionx"
  });
  const conn = await pool.getConnection();
  try {
    console.log('Creating next_college_signups table...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS next_college_signups (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        college_name  VARCHAR(255) NOT NULL,
        email         VARCHAR(255) NOT NULL UNIQUE,
        contact_name  VARCHAR(255) NOT NULL,
        phone         VARCHAR(32)  NOT NULL,
        password_hash VARCHAR(255) DEFAULT NULL,
        status        VARCHAR(20)  NOT NULL DEFAULT 'pending',
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('Creating next_student_signups table...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS next_student_signups (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        name          VARCHAR(255) NOT NULL,
        email         VARCHAR(255) NOT NULL UNIQUE,
        phone         VARCHAR(32)  NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('Database initialization complete.');
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    conn.release();
    await pool.end();
    process.exit(0);
  }
}

init();
