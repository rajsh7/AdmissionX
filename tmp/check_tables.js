
const mysql = require('mysql2/promise');

async function checkTables() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || "127.0.0.1",
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "admissionx",
    });

    try {
        const [rows] = await connection.query('SHOW TABLES');
        console.log('Tables in database:');
        rows.forEach(row => {
            console.log(Object.values(row)[0]);
        });
    } catch (err) {
        console.error('Error checking tables:', err);
    } finally {
        await connection.end();
    }
}

checkTables();
