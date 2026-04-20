import { getDb } from "./lib/db.ts";

async function run() {
  try {
    const db = await getDb();
    const collections = await db.listCollections().toArray();
    
    console.log("Searching for 'AIEA' across all collections...");
    
    for (const col of collections) {
      const colName = col.name;
      // Skip very large collections if possible, but let's try small ones first
      const count = await db.collection(colName).countDocuments({
        $or: [
          { exam_name: /AIEA/i },
          { name: /AIEA/i },
          { slug: /aiea/i },
          { title: /AIEA/i },
          { text: /AIEA/i }
        ]
      });
      
      if (count > 0) {
        console.log(`Bingo! Found ${count} matches in '${colName}'`);
        const samples = await db.collection(colName).find({
           $or: [
            { exam_name: /AIEA/i },
            { name: /AIEA/i },
            { slug: /aiea/i },
            { title: /AIEA/i },
            { text: /AIEA/i }
          ]
        }).limit(2).toArray();
        console.log("Samples:", JSON.stringify(samples, null, 2));
      }
    }
    console.log("Search complete.");
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

run();
