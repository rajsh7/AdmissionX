require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");
async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB ?? "admissionx");
  const sample = await db.collection("faculty").findOne({});
  console.log("faculty sample:", JSON.stringify(sample, null, 2));
  await client.close();
}
main().catch(console.error);
