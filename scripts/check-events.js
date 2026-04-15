require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");
async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB ?? "admissionx");
  const names = ["event", "events", "college_events", "collegeevents", "college_event"];
  for (const n of names) {
    const cnt = await db.collection(n).countDocuments().catch(() => 0);
    if (cnt > 0) {
      const s = await db.collection(n).findOne({});
      console.log(n, "count:", cnt);
      console.log("sample:", JSON.stringify(s, null, 2));
    }
  }
  await client.close();
}
main().catch(console.error);
