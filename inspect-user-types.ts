import pool from "./lib/db";

async function inspectUserTypes() {
  try {
    const [rows] = await pool.query("SELECT DISTINCT type_of_user FROM users");
    console.log("User Types:", JSON.stringify(rows, null, 2));
    
    // Also check ads_managements users
    const [adUsers] = await pool.query(`
      SELECT DISTINCT u.type_of_user 
      FROM ads_managements am 
      JOIN users u ON am.users_id = u.id
    `);
    console.log("Ad Owner Types:", JSON.stringify(adUsers, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

inspectUserTypes();
