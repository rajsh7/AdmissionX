import pool from "./lib/db";

async function inspectStudentReviews() {
  try {
    const [cols] = await pool.query("DESCRIBE student_reviews");
    console.log("Cols:", JSON.stringify(cols, null, 2));
    const [rows] = await pool.query("SELECT * FROM student_reviews LIMIT 5");
    console.log("Rows:", JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

inspectStudentReviews();
