require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB ?? "admissionx");

  // Check all collections with "student" in name
  const collections = await db.listCollections().toArray();
  const studentCols = collections.filter(c => c.name.toLowerCase().includes("student"));
  console.log("Student-related collections:", studentCols.map(c => c.name));

  // Check studentprofile
  const spCount = await db.collection("studentprofile").countDocuments();
  console.log("\nstudentprofile count:", spCount);

  const spSample = await db.collection("studentprofile").findOne({});
  console.log("studentprofile sample:", JSON.stringify(spSample, null, 2));

  await client.close();
}
main().catch(console.error);
