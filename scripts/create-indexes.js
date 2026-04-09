/**
 * Run once: node scripts/create-indexes.js
 * Creates indexes to speed up college/university filter queries.
 */
const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8").split("\n").forEach((line) => {
    const [k, ...v] = line.split("=");
    if (k && v.length) process.env[k.trim()] = v.join("=").trim();
  });
}

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "admissionx");

  const indexes = [
    // collegeprofile — main filter fields
    { col: "collegeprofile", spec: { isShowOnTop: 1, rating: -1 } },
    { col: "collegeprofile", spec: { isTopUniversity: 1, rating: -1 } },
    { col: "collegeprofile", spec: { registeredAddressCityId: 1 } },
    { col: "collegeprofile", spec: { id: 1 }, opts: { unique: true } },
    { col: "collegeprofile", spec: { users_id: 1 } },
    { col: "collegeprofile", spec: { slug: 1 } },

    // collegemaster — join + filter fields
    { col: "collegemaster", spec: { functionalarea_id: 1, collegeprofile_id: 1 } },
    { col: "collegemaster", spec: { degree_id: 1, collegeprofile_id: 1 } },
    { col: "collegemaster", spec: { collegeprofile_id: 1 } },
    { col: "collegemaster", spec: { fees: 1, collegeprofile_id: 1 } },

    // functionalarea — slug lookup
    { col: "functionalarea", spec: { pageslug: 1 }, opts: { unique: true, sparse: true } },
    { col: "functionalarea", spec: { id: 1 } },

    // degree — slug lookup
    { col: "degree", spec: { pageslug: 1 }, opts: { sparse: true } },
    { col: "degree", spec: { id: 1 } },

    // city — join field
    { col: "city", spec: { id: 1 } },

    // users — join field
    { col: "users", spec: { id: 1 } },
  ];

  for (const { col, spec, opts = {} } of indexes) {
    try {
      await db.collection(col).createIndex(spec, { background: true, ...opts });
      console.log(`✓ ${col}:`, JSON.stringify(spec));
    } catch (e) {
      console.warn(`⚠ ${col}:`, e.message);
    }
  }

  await client.close();
  console.log("\nDone.");
}

main().catch(console.error);
