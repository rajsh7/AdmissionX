require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB ?? "admissionx");

  // 1. Check functionalarea
  const fa = await db.collection("functionalarea").findOne({ pageslug: "engineering" });
  console.log("fa.id:", fa.id, "| fa._id:", fa._id);

  // 2. Check collegemaster rows for this fa
  const cmRows = await db.collection("collegemaster")
    .find({ functionalarea_id: fa.id })
    .limit(5)
    .toArray();
  console.log("\nSample collegemaster rows (functionalarea_id =", fa.id, "):");
  cmRows.forEach(r => console.log("  collegeprofile_id:", r.collegeprofile_id, "type:", typeof r.collegeprofile_id));

  // 3. Check what collegeprofile.id looks like
  const cp = await db.collection("collegeprofile").findOne({});
  console.log("\nSample collegeprofile: id =", cp.id, "| _id =", cp._id, "| isShowOnTop =", cp.isShowOnTop);

  // 4. Try matching collegeprofile by id field
  const sampleCpId = cmRows[0]?.collegeprofile_id;
  console.log("\nLooking up collegeprofile with id =", sampleCpId, "(type:", typeof sampleCpId, ")");
  const cpMatch = await db.collection("collegeprofile").findOne({ id: sampleCpId });
  console.log("Found:", cpMatch ? cpMatch.slug : "NOT FOUND");

  // 5. Check isShowOnTop values
  const topCount = await db.collection("collegeprofile").countDocuments({ isShowOnTop: 1 });
  const topCountStr = await db.collection("collegeprofile").countDocuments({ isShowOnTop: "1" });
  console.log("\ncollegeprofile with isShowOnTop=1:", topCount);
  console.log("collegeprofile with isShowOnTop='1':", topCountStr);

  // 6. Full chain: engineering stream + isShowOnTop
  const allCmIds = await db.collection("collegemaster")
    .find({ functionalarea_id: fa.id }, { projection: { collegeprofile_id: 1 } })
    .limit(5000).toArray();
  const cpIds = [...new Set(allCmIds.map(r => r.collegeprofile_id))];
  console.log("\nTotal unique collegeprofile_ids for engineering:", cpIds.length);

  const matchCount = await db.collection("collegeprofile").countDocuments({ id: { $in: cpIds }, isShowOnTop: 1 });
  const matchCountNoTop = await db.collection("collegeprofile").countDocuments({ id: { $in: cpIds } });
  console.log("Matching collegeprofile with isShowOnTop=1:", matchCount);
  console.log("Matching collegeprofile without isShowOnTop filter:", matchCountNoTop);

  await client.close();
}
main().catch(console.error);
