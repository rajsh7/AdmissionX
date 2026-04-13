require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB ?? "admissionx");

  // Check degree with pageslug b-sc-
  const deg = await db.collection("degree").findOne({ pageslug: "b-sc-" });
  console.log("degree (b-sc-):", JSON.stringify(deg, null, 2));

  // Check sample course document
  const course = await db.collection("course").findOne({ pageslug: { $exists: true, $ne: "" } });
  console.log("\nSample course:", JSON.stringify({ id: course?.id, degree_id: course?.degree_id, name: course?.name, pageslug: course?.pageslug }, null, 2));

  // Count courses with this degree_id
  if (deg) {
    const countById = await db.collection("course").countDocuments({ degree_id: deg.id });
    const countByObjectId = await db.collection("course").countDocuments({ degree_id: deg._id });
    console.log(`\nCourses with degree_id = deg.id (${deg.id}):`, countById);
    console.log(`Courses with degree_id = deg._id (${deg._id}):`, countByObjectId);
  }

  await client.close();
}
main().catch(console.error);
