require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB ?? "admissionx");

  // Check functionalarea for engineering
  const fa = await db.collection("functionalarea").findOne({ pageslug: "engineering" });
  console.log("functionalarea (engineering):", JSON.stringify(fa, null, 2));

  // Check a sample collegemaster row
  const cm = await db.collection("collegemaster").findOne({});
  console.log("\ncollegemaster sample:", JSON.stringify(cm, null, 2));

  // Check how many collegemaster rows have functionalarea_id matching fa.id vs fa._id
  if (fa) {
    const byId = await db.collection("collegemaster").countDocuments({ functionalarea_id: fa.id });
    const byObjectId = await db.collection("collegemaster").countDocuments({ functionalarea_id: fa._id });
    console.log(`\ncollegemaster rows with functionalarea_id = fa.id (${fa.id}):`, byId);
    console.log(`collegemaster rows with functionalarea_id = fa._id (${fa._id}):`, byObjectId);
  }

  await client.close();
}
main().catch(console.error);
