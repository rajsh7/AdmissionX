require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");
async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB ?? "admissionx");
  const cols = await db.listCollections().toArray();
  for (const col of cols) {
    const count = await db.collection(col.name).countDocuments();
    if (count > 0) console.log(col.name, ":", count);
  }
  await client.close();
}
main().catch(console.error);
