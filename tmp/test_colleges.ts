import pool from "@/lib/db";

async function test() {
  try {
    const [rows] = await pool.query(
      `SELECT cp.id, COALESCE(u.firstname, 'Unnamed College') as name 
       FROM collegeprofile cp JOIN users u ON u.id = cp.users_id 
       ORDER BY u.firstname ASC LIMIT 10`
    );
    console.log("Colleges found:", rows);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

test();
