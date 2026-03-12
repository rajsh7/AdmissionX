const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function run() {
    console.log("Using database:", process.env.DB_NAME || "admissionx");
    const pool = mysql.createPool({
        host: process.env.DB_HOST || "127.0.0.1",
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "web_admissionx_upgrade",
    });

    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('super admin', 'ceo', 'councellor') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("Table created.");

        const hash = await bcrypt.hash("admin123", 10);
        await pool.query(`
            INSERT INTO admins (email, password_hash, role)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = VALUES(role)
        `, ["ceo@admissionx.com", hash, "ceo"]);
        console.log("CEO created.");

        const hash2 = await bcrypt.hash("admin123", 10);
        await pool.query(`
            INSERT INTO admins (email, password_hash, role)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = VALUES(role)
        `, ["councellor@admissionx.com", hash2, "councellor"]);
        console.log("Councellor created.");

        const hash3 = await bcrypt.hash("admin", 10);
        await pool.query(`
            INSERT INTO admins (email, password_hash, role)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = VALUES(role)
        `, ["admin@admissionx.com", hash3, "super admin"]);
        console.log("Super Admin created.");


    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
run();

