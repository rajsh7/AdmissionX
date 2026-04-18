import pool from "./lib/db.ts";

async function checkImages() {
  try {
    const [rows] = await pool.query("SELECT image FROM course LIMIT 1000");
    const total = rows.length;
    const haveImage = rows.filter(r => r.image && r.image !== "NULL" && r.image !== "").length;
    console.log(JSON.stringify({ total, haveImage, samples: rows.filter(r => r.image && r.image !== "NULL").slice(0, 5).map(r => r.image) }));
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

checkImages();
