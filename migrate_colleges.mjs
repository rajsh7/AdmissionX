import mysql from 'mysql2/promise';

async function migrate() {
  const pool = mysql.createPool({ 
    host: 'localhost', 
    user: 'root', 
    password: '', 
    database: 'admissionx' 
  });
  
  try {
    const [rows] = await pool.query('SELECT * FROM next_college_signups');
    console.log(`Found ${rows.length} existing college signups.`);
    
    for (const row of rows) {
      const emailLower = row.email ? row.email.trim().toLowerCase() : '';
      if (!emailLower) continue;

      // check if exists
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [emailLower]);
      if (existing.length > 0) {
        console.log(`User already exists for ${emailLower}, skipping...`);
        continue;
      }

      await pool.query(
        `INSERT INTO users
           (firstname, lastname, email, phone, password, type_of_user, userstatus_id, created_at)
         VALUES (?, ?, ?, ?, ?, 'COLLEGE', 2, ?)`,
        [
          (row.college_name || '').trim(),
          (row.contact_name || '').trim(),
          emailLower,
          (row.phone || '').trim(),
          row.password_hash,
          row.created_at || new Date()
        ]
      );
      console.log(`Migrated: ${emailLower}`);
    }
  } catch (err) {
    console.error("Migration Error:", err.message);
  }
  process.exit();
}
migrate();
