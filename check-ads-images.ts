import pool from "./lib/db.js";

async function checkAdsImages() {
  try {
    const [rows] = await pool.query("SELECT id, title, img FROM ads_managements LIMIT 20");
    console.log("Ads Images Data:");
    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error("Error querying database:", err);
  } finally {
    await pool.end();
  }
}

checkAdsImages();
