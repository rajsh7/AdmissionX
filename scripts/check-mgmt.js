require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");
async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB ?? "admissionx");
  const count = await db.collection("college_management_details").countDocuments();
  console.log("college_management_details count:", count);
  const sample = await db.collection("college_management_details").findOne({});
  console.log("sample:", JSON.stringify(sample, null, 2));
  await client.close();
}
main().catch(console.error);
