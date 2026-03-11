// seed-student.mjs
// Run with: node seed-student.mjs

import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";

const DB_HOST = process.env.DB_HOST || "127.0.0.1";
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_NAME = process.env.DB_NAME || "admissionx";

const STUDENT = {
  name: "Alex Rivers",
  email: "alex@admissionx.com",
  phone: "9876543210",
  password: "Student@123",
};

const DEGREES = ["Bachelor", "Master", "Diploma", "Certificate", "PhD"];

const COURSES = [
  { name: "Computer Science", degreeName: "Bachelor" },
  { name: "Business Administration", degreeName: "Master" },
  { name: "Mechanical Engineering", degreeName: "Bachelor" },
  { name: "Data Science", degreeName: "Master" },
  { name: "Medicine and Health", degreeName: "Bachelor" },
  { name: "Artificial Intelligence", degreeName: "Master" },
  { name: "Civil Engineering", degreeName: "Bachelor" },
  { name: "Finance and Accounting", degreeName: "Master" },
  { name: "Law", degreeName: "Bachelor" },
  { name: "Biotechnology", degreeName: "Master" },
];

const COLLEGES = [
  { name: "Harvard College", country: "USA", city: "Cambridge", ranking: 1, students: "21,000", image: "/Background-images/1.jpg" },
  { name: "Oxford College", country: "UK", city: "Oxford", ranking: 2, students: "24,000", image: "/Background-images/17.jpg" },
  { name: "Stanford College", country: "USA", city: "Stanford", ranking: 3, students: "16,000", image: "/Background-images/18.jpg" },
  { name: "Toronto College", country: "Canada", city: "Toronto", ranking: 4, students: "97,000", image: "/Background-images/19.jpg" },
  { name: "Melbourne College", country: "Australia", city: "Melbourne", ranking: 5, students: "31,000", image: "/Background-images/171.jpg" },
  { name: "Delhi Technical College", country: "India", city: "Delhi", ranking: 6, students: "28,000", image: "/Background-images/18.jpg" },
];

async function ensureDatabase() {
  const conn = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
  });

  try {
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`Database ready: ${DB_NAME}`);
  } finally {
    await conn.end();
  }
}

async function createPool() {
  return mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    connectionLimit: 3,
  });
}

async function ensureStudentTable(conn) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS next_student_signups (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      name          VARCHAR(255) NOT NULL,
      email         VARCHAR(255) NOT NULL UNIQUE,
      phone         VARCHAR(32)  NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function ensureCourseTables(conn) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS degree (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      name       VARCHAR(255) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  const [degreeIndexes] = await conn.query("SHOW INDEX FROM degree WHERE Key_name = 'ux_degree_name'");
  if (!Array.isArray(degreeIndexes) || degreeIndexes.length === 0) {
    await conn.query("ALTER TABLE degree ADD UNIQUE KEY ux_degree_name (name)");
  }

  await conn.query(`
    CREATE TABLE IF NOT EXISTS course (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      name       VARCHAR(255) NOT NULL UNIQUE,
      degree_id  INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_course_degree (degree_id),
      CONSTRAINT fk_course_degree
        FOREIGN KEY (degree_id) REFERENCES degree(id)
        ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  const [courseCols] = await conn.query(`
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'course'
  `);
  const courseColumnSet = new Set(courseCols.map((row) => row.COLUMN_NAME));
  if (!courseColumnSet.has("degree_id")) {
    await conn.query("ALTER TABLE course ADD COLUMN degree_id INT NULL");
  }

  const [courseIndexes] = await conn.query("SHOW INDEX FROM course WHERE Key_name = 'ux_course_name'");
  if (!Array.isArray(courseIndexes) || courseIndexes.length === 0) {
    await conn.query("ALTER TABLE course ADD UNIQUE KEY ux_course_name (name)");
  }
}

async function ensureCollegeTable(conn) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS college (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      name       VARCHAR(255) NOT NULL UNIQUE,
      country    VARCHAR(120) NOT NULL,
      city       VARCHAR(120) NOT NULL,
      ranking    INT NOT NULL DEFAULT 0,
      students   VARCHAR(64) NOT NULL DEFAULT 'N/A',
      image      VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function seedStudent(conn) {
  const [existing] = await conn.query(
    "SELECT id FROM next_student_signups WHERE email = ? LIMIT 1",
    [STUDENT.email]
  );

  if (Array.isArray(existing) && existing.length > 0) {
    const id = existing[0].id;
    console.log(`Student already exists: ADX-${String(id).padStart(5, "0")}`);
    return;
  }

  const hash = await bcrypt.hash(STUDENT.password, 10);
  const [result] = await conn.query(
    `INSERT INTO next_student_signups (name, email, phone, password_hash)
     VALUES (?, ?, ?, ?)`,
    [STUDENT.name, STUDENT.email, STUDENT.phone, hash]
  );

  const id = result.insertId;
  console.log(`Inserted student: ${STUDENT.email} (ADX-${String(id).padStart(5, "0")})`);
}

async function seedDegrees(conn) {
  for (const name of DEGREES) {
    await conn.query(
      `INSERT INTO degree (name) VALUES (?)
       ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      [name]
    );
  }
  console.log(`Seeded degrees: ${DEGREES.length}`);
}

async function seedCourses(conn) {
  const [rows] = await conn.query("SELECT id, name FROM degree");
  const degreeIdByName = new Map();
  for (const row of rows) {
    degreeIdByName.set(row.name, row.id);
  }

  for (const item of COURSES) {
    const degreeId = degreeIdByName.get(item.degreeName) ?? null;
    await conn.query(
      `INSERT INTO course (name, degree_id) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE degree_id = VALUES(degree_id)`,
      [item.name, degreeId]
    );
  }
  console.log(`Seeded courses: ${COURSES.length}`);
}

async function seedColleges(conn) {
  for (const item of COLLEGES) {
    await conn.query(
      `INSERT INTO college (name, country, city, ranking, students, image)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         country = VALUES(country),
         city = VALUES(city),
         ranking = VALUES(ranking),
         students = VALUES(students),
         image = VALUES(image)`,
      [item.name, item.country, item.city, item.ranking, item.students, item.image]
    );
  }
  console.log(`Seeded colleges: ${COLLEGES.length}`);
}

async function seed() {
  await ensureDatabase();
  const pool = await createPool();
  const conn = await pool.getConnection();
  try {
    await ensureStudentTable(conn);
    await ensureCourseTables(conn);
    await ensureCollegeTable(conn);
    await seedStudent(conn);
    await seedDegrees(conn);
    await seedCourses(conn);
    await seedColleges(conn);
    console.log("Seed completed.");
    console.log("Student login: alex@admissionx.com / Student@123");
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  } finally {
    conn.release();
    await pool.end();
  }
}

seed();
