require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");
async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB ?? "admissionx");
  const cols = await db.listCollections().toArray();
  const mgmt = cols.filter(c => c.name.toLowerCase().includes("manag"));
  console.log("Management collections:", mgmt.map(c => c.name));
  // Also check collegemanagement
  for (const name of ["collegemanagement", "management", "college_management", "managementdetails"]) {
    const count = await db.collection(name).countDocuments().catch(() => "N/A");
    if (count !== "N/A" && count > 0) {
      const sample = await db.collection(name).findOne({});
      console.log(`\n${name} count:`, count);
      console.log("sample:", JSON.stringify(sample, null, 2));
    }
  }
  await client.close();
}
main().catch(console.error);
