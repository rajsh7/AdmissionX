import { getDb } from "./lib/db.js";
import 'dotenv/config';

async function peek() {
  try {
    const db = await getDb();
    const doc = await db.collection("collegeprofile").findOne({});
    console.log(JSON.stringify(doc, null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
peek();
