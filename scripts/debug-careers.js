require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB ?? "admissionx");

  const level = "b-sc-";

  // Step 1: find degree
  const d = await db.collection("degree").findOne({ pageslug: level }, { projection: { id: 1, name: 1, pageslug: 1 } });
  console.log("degree found:", d);

  const degreeId = d?.id ?? null;
  console.log("degreeId:", degreeId);

  // Step 2: build filter
  const filter = { pageslug: { $exists: true, $ne: "" } };
  if (degreeId !== null) filter.degree_id = degreeId;

  console.log("filter:", JSON.stringify(filter));

  // Step 3: count
  const total = await db.collection("course").countDocuments(filter);
  console.log("total courses matching filter:", total);

  // Step 4: fetch
  const courses = await db.collection("course").find(filter).limit(5).toArray();
  console.log("sample courses:", courses.map(c => ({ id: c.id, name: c.name, degree_id: c.degree_id, pageslug: c.pageslug })));

  // Step 5: check without pageslug filter
  const totalNoPagslug = await db.collection("course").countDocuments({ degree_id: degreeId });
  console.log("\ntotal courses with degree_id (no pageslug filter):", totalNoPagslug);

  // Step 6: check all unique degree_ids in course collection
  const degreeIds = await db.collection("course").distinct("degree_id");
  console.log("\nunique degree_ids in course collection (first 20):", degreeIds.slice(0, 20));
  console.log("does 125 exist?", degreeIds.includes(125));

  await client.close();
}
main().catch(console.error);
