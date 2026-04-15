require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");
async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB ?? "admissionx");
  const names = ["placement","college_scholarships","college_cut_offs","college_sports_activities","collegemaster"];
  for (const n of names) {
    const cnt = await db.collection(n).countDocuments().catch(() => 0);
    const s = cnt > 0 ? await db.collection(n).findOne({}) : null;
    console.log(`\n${n}: ${cnt}`);
    if (s) console.log("sample keys:", Object.keys(s).join(", "));
  }
  await client.close();
}
main().catch(console.error);
