import pool from "./lib/db";

async function run() {
  try {
    await pool.query(
      "INSERT INTO query (subject, message, guestname, guestemail, guestphone, queryflowtype) VALUES (?, ?, ?, ?, ?, ?)",
      [
        "Question about Admissions",
        "Hi, I would like to know the last date for application.",
        "John Doe",
        "john.doe@example.com",
        "+1234567890",
        "guest-to-admin"
      ]
    );
    console.log("Seed data inserted successfully.");
  } catch (e) {
    console.error("Error inserting seed data:", e);
  }
  process.exit(0);
}

run();
