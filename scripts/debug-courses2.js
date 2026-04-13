require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB ?? "admissionx");

  const deg = await db.collection("degree").findOne({ pageslug: "b-sc-" });
  console.log("degree id:", deg?.id);

  // Check courses with pageslug existing AND degree_id = 125
  const courses = await db.collection("course")
    .find({ pageslug: { $exists: true, $ne: "" }, degree_id: deg.id })
    .limit(10)
    .toArray();
  console.log("\nCourses with pageslug + degree_id=125:", courses.length);
  courses.forEach(c => console.log(" -", c.name, "| pageslug:", c.pageslug));

  // Check total courses with pageslug
  const totalWithSlug = await db.collection("course").countDocuments({ pageslug: { $exists: true, $ne: "" } });
  console.log("\nTotal courses with pageslug:", totalWithSlug);

  // Check total courses overall
  const total = await db.collection("course").countDocuments({});
  console.log("Total courses:", total);

  // Sample courses without degree filter
  const sample = await db.collection("course").find({ pageslug: { $exists: true, $ne: "" } }).limit(5).toArray();
  console.log("\nSample courses (no filter):");
  sample.forEach(c => console.log(" -", c.name, "| degree_id:", c.degree_id));

  await client.close();
}
main().catch(console.error);
