import pool from "./lib/db.js";
async function run() {
  try {
    const [countries] = await pool.query("SELECT id, name FROM country LIMIT 20");
    console.log("Countries:", countries);
    const [colleges] = await pool.query("SELECT id, registeredAddressCountryId, registeredSortAddress FROM collegeprofile WHERE registeredAddressCountryId IS NOT NULL LIMIT 10");
    console.log("Colleges:", colleges);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
