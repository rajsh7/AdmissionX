// Fix leading/trailing spaces on string fields across all collections
const { MongoClient } = require("mongodb");

const URI = "mongodb+srv://admissionx:Adx%23%21eg2026@admissionx.apn7pcl.mongodb.net/?appName=Admissionx";
const DB = "admissionx";

// For each collection: trim string fields and convert numeric-string fields to int
const JOBS = [
  {
    col: "exam_sections",
    strFields: ["name", "title", "slug", "iconImage", "created_at", "updated_at"],
    intFields: ["status", "isShowOnTop", "isShowOnHome"],
  },
  {
    col: "examination_details",
    strFields: ["title", "slug", "description", "applicationFrom", "applicationTo", "exminationDate", "image", "created_at", "updated_at"],
    intFields: ["status"],
  },
  {
    col: "functionalarea",
    strFields: ["name", "pageslug", "pagetitle", "pagedescription", "logoimage", "bannerimage", "created_at", "updated_at"],
    intFields: [],
  },
  {
    col: "degree",
    strFields: ["name", "pageslug", "pagetitle", "pagedescription", "logoimage", "bannerimage", "created_at", "updated_at"],
    intFields: [],
  },
  {
    col: "course",
    strFields: ["name", "pageslug", "pagetitle", "pagedescription", "logoimage", "bannerimage", "created_at", "updated_at"],
    intFields: [],
  },
  {
    col: "news",
    strFields: ["topic", "slug", "featimage", "fullimage", "created_at", "updated_at"],
    intFields: ["isactive"],
  },
  {
    col: "news_types",
    strFields: ["name", "slug", "created_at", "updated_at"],
    intFields: [],
  },
  {
    col: "news_tags",
    strFields: ["name", "slug"],
    intFields: [],
  },
  {
    col: "blogs",
    strFields: ["topic", "slug", "featimage", "fullimage", "created_at", "updated_at"],
    intFields: ["isactive"],
  },
];

async function run() {
  const client = await MongoClient.connect(URI);
  const db = client.db(DB);

  for (const { col, strFields, intFields } of JOBS) {
    const collection = db.collection(col);
    const docs = await collection.find({}).toArray();
    let updated = 0;

    for (const doc of docs) {
      const $set = {};

      for (const f of strFields) {
        const v = doc[f];
        if (typeof v === "string" && v !== v.trim()) {
          $set[f] = v.trim();
        }
        // Also fix "NULL" strings
        if (v === " NULL" || v === "NULL") {
          $set[f] = null;
        }
      }

      for (const f of intFields) {
        const v = doc[f];
        if (typeof v === "string") {
          const n = parseInt(v.trim(), 10);
          if (!isNaN(n)) $set[f] = n;
        }
      }

      if (Object.keys($set).length > 0) {
        await collection.updateOne({ _id: doc._id }, { $set });
        updated++;
      }
    }

    console.log(`${col}: updated ${updated}/${docs.length}`);
  }

  await client.close();
  console.log("Done.");
}

run().catch(console.error);
