// seed-student.mjs
// Run with:  node seed-student.mjs
//
// Dummy credentials created:
//   Email    : alex@admissionx.com
//   Password : Student@123

import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "admissionx",
  connectionLimit: 3,
});

const STUDENT = {
  name: "Alex Rivers",
  email: "alex@admissionx.com",
  phone: "9876543210",
  password: "Student@123",
};

async function seed() {
  const conn = await pool.getConnection();
  try {
    // 1. Ensure table exists
    await conn.query(`
      CREATE TABLE IF NOT EXISTS next_student_signups (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        name          VARCHAR(255)  NOT NULL,
        email         VARCHAR(255)  NOT NULL UNIQUE,
        phone         VARCHAR(32)   NOT NULL,
        password_hash VARCHAR(255)  NOT NULL,
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log("✔  Table `next_student_signups` ready.");

    // 2. Check if dummy student already exists
    const [existing] = await conn.query(
      "SELECT id FROM next_student_signups WHERE email = ? LIMIT 1",
      [STUDENT.email],
    );

    if (existing.length > 0) {
      const id = existing[0].id;
      console.log(`ℹ  Student already exists — skipping insert.`);
      console.log("\n──────────────────────────────────────────");
      console.log("  Use these credentials to log in");
      console.log("──────────────────────────────────────────");
      console.log(`  Name     : ${STUDENT.name}`);
      console.log(`  Email    : ${STUDENT.email}`);
      console.log(`  Password : ${STUDENT.password}`);
      console.log(`  ID       : ADX-${String(id).padStart(5, "0")}`);
      console.log("──────────────────────────────────────────");
      console.log("  URL  →  http://localhost:3000/login/student\n");
      return;
    }

    // 3. Hash password
    console.log("⏳  Hashing password…");
    const hash = await bcrypt.hash(STUDENT.password, 10);

    // 4. Insert
    const [result] = await conn.query(
      `INSERT INTO next_student_signups (name, email, phone, password_hash)
       VALUES (?, ?, ?, ?)`,
      [STUDENT.name, STUDENT.email, STUDENT.phone, hash],
    );

    const id = result.insertId;
    console.log(`✔  Dummy student inserted  →  DB id: ${id}`);
    console.log("\n══════════════════════════════════════════");
    console.log("  Student Dashboard — Login Credentials");
    console.log("══════════════════════════════════════════");
    console.log(`  Name     : ${STUDENT.name}`);
    console.log(`  Email    : ${STUDENT.email}`);
    console.log(`  Password : ${STUDENT.password}`);
    console.log(`  ID       : ADX-${String(id).padStart(5, "0")}`);
    console.log("══════════════════════════════════════════");
    console.log("  URL  →  http://localhost:3000/login/student\n");
  } catch (err) {
    console.error("✖  Seed failed:", err.message);
    process.exit(1);
  } finally {
    conn.release();
    await pool.end();
  }
}

seed();
