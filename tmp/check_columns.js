
const mysql = require('mysql2/promise');

async function checkColumns() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || "127.0.0.1",
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "admissionx",
    });

    try {
        const [rows] = await connection.query('DESCRIBE next_student_signups');
        console.log('Columns in next_student_signups:');
        rows.forEach(row => {
            console.log(`${row.Field} - ${row.Type}`);
        });
    } catch (err) {
        console.error('Error checking columns:', err);
    } finally {
        await connection.end();
    }
}

checkColumns();
