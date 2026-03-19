import mysql from "mysql2/promise";

async function run() {
  console.log("Starting Application Schema definitions...");

  // We create a fresh connection specifically for the seed instead of depending on the HMR guard in lib/db.ts
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "admissionx",
  });

  try {
    // Drop in safe order
    await conn.query("DROP TABLE IF EXISTS documents");
    await conn.query("DROP TABLE IF EXISTS applications");
    console.log("✅ Dropped existing tables.");

    // applications — no hard FKs (legacy DB has no PK on referenced tables)
    // Referential integrity is enforced at the application level
    await conn.query(`
      CREATE TABLE applications (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        applicationRef VARCHAR(20) NOT NULL UNIQUE,
        studentId INT UNSIGNED NOT NULL,
        collegeId INT UNSIGNED NOT NULL,
        courseId INT UNSIGNED NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY idx_student_course (studentId, courseId),
        KEY idx_studentId (studentId),
        KEY idx_collegeId (collegeId),
        KEY idx_courseId (courseId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
    `);
    console.log("✅ Table 'applications' created.");

    // documents — FK to applications is safe as we own that table
    await conn.query(`
      CREATE TABLE documents (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        applicationId INT UNSIGNED NOT NULL,
        type VARCHAR(50) NOT NULL,
        fileUrl VARCHAR(255) NOT NULL,
        uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        KEY idx_applicationId (applicationId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
    `);
    console.log("✅ Table 'documents' created.");

    console.log("✅ Seed complete.");


  } catch (error) {
    console.error("❌ Schema creation failed:", error);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

run();
