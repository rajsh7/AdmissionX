const fs = require("fs");
const path = require("path");
const env = fs.readFileSync(path.join(__dirname, "../.env.local"), "utf8");
env.split("\n").forEach((l) => {
  const [k, ...v] = l.split("=");
  if (k && v.length) process.env[k.trim()] = v.join("=").trim();
});

const { MongoClient } = require("mongodb");

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB);

  // 1. Top colleges query explain
  const e1 = await db.collection("collegeprofile")
    .find({ isShowOnTop: 1 })
    .sort({ rating: -1, totalRatingUser: -1 })
    .limit(12)
    .explain("executionStats");
  const s1 = e1.executionStats;
  console.log("=== TOP COLLEGES QUERY ===");
  console.log("  docsExamined :", s1.totalDocsExamined);
  console.log("  keysExamined :", s1.totalKeysExamined);
  console.log("  docsReturned :", s1.nReturned);
  console.log("  execTimeMs   :", s1.executionTimeMillis);
  console.log("  winningStage :", e1.queryPlanner?.winningPlan?.stage);

  // 2. Slug lookup
  const e2 = await db.collection("collegeprofile")
    .find({ slug: "galgotias-university-91" })
    .explain("executionStats");
  const s2 = e2.executionStats;
  console.log("\n=== SLUG LOOKUP ===");
  console.log("  docsExamined :", s2.totalDocsExamined);
  console.log("  execTimeMs   :", s2.executionTimeMillis);
  console.log("  winningStage :", e2.queryPlanner?.winningPlan?.stage);

  // 3. collegemaster join
  const e3 = await db.collection("collegemaster")
    .find({ collegeprofile_id: { $in: [1, 2, 3, 4, 5] } })
    .explain("executionStats");
  const s3 = e3.executionStats;
  console.log("\n=== COLLEGEMASTER JOIN ===");
  console.log("  docsExamined :", s3.totalDocsExamined);
  console.log("  keysExamined :", s3.totalKeysExamined);
  console.log("  execTimeMs   :", s3.executionTimeMillis);
  console.log("  winningStage :", e3.queryPlanner?.winningPlan?.stage);

  // 4. gallery — missing index check
  const e4 = await db.collection("gallery")
    .find({ users_id: 100, fullimage: { $exists: true, $ne: "" } })
    .sort({ _id: -1 })
    .limit(24)
    .explain("executionStats");
  const s4 = e4.executionStats;
  console.log("\n=== GALLERY QUERY ===");
  console.log("  docsExamined :", s4.totalDocsExamined);
  console.log("  keysExamined :", s4.totalKeysExamined);
  console.log("  execTimeMs   :", s4.executionTimeMillis);
  console.log("  winningStage :", e4.queryPlanner?.winningPlan?.stage);

  // 5. collegeprofile — check if id field has index (used in $lookup joins)
  const e5 = await db.collection("collegeprofile")
    .find({ id: 100 })
    .explain("executionStats");
  const s5 = e5.executionStats;
  console.log("\n=== COLLEGEPROFILE id LOOKUP ===");
  console.log("  docsExamined :", s5.totalDocsExamined);
  console.log("  execTimeMs   :", s5.executionTimeMillis);
  console.log("  winningStage :", e5.queryPlanner?.winningPlan?.stage);

  // 6. users join
  const e6 = await db.collection("users")
    .find({ id: 100 })
    .explain("executionStats");
  const s6 = e6.executionStats;
  console.log("\n=== USERS id LOOKUP ===");
  console.log("  docsExamined :", s6.totalDocsExamined);
  console.log("  execTimeMs   :", s6.executionTimeMillis);
  console.log("  winningStage :", e6.queryPlanner?.winningPlan?.stage);

  // 7. city join
  const e7 = await db.collection("city")
    .find({ id: 100 })
    .explain("executionStats");
  const s7 = e7.executionStats;
  console.log("\n=== CITY id LOOKUP ===");
  console.log("  docsExamined :", s7.totalDocsExamined);
  console.log("  execTimeMs   :", s7.executionTimeMillis);
  console.log("  winningStage :", e7.queryPlanner?.winningPlan?.stage);

  // 8. collegeprofile text search (no text index)
  const e8 = await db.collection("collegeprofile")
    .find({ slug: { $regex: "iit", $options: "i" } })
    .explain("executionStats");
  const s8 = e8.executionStats;
  console.log("\n=== SLUG REGEX SEARCH ===");
  console.log("  docsExamined :", s8.totalDocsExamined);
  console.log("  execTimeMs   :", s8.executionTimeMillis);
  console.log("  winningStage :", e8.queryPlanner?.winningPlan?.stage);

  // 9. Check collegeprofile for missing id index
  const cpIndexes = await db.collection("collegeprofile").indexes();
  const hasIdIndex = cpIndexes.some(i => i.key && i.key.id !== undefined);
  console.log("\n=== COLLEGEPROFILE id INDEX ===");
  console.log("  hasIdIndex:", hasIdIndex);
  cpIndexes.forEach(i => console.log("  -", JSON.stringify(i.key)));

  await client.close();
}

main().catch(console.error);
