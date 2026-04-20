import { getDb } from "./lib/db.ts";

async function run() {
  try {
    const db = await getDb();
    const targetCollections = [
      "entranceexam", 
      "examination_details", 
      "engineeringexams", 
      "exam_list_multiple_degrees", 
      "pages"
    ];
    
    for (const colName of targetCollections) {
      console.log(`Checking ${colName}...`);
      const results = await db.collection(colName).find({
        $or: [
          { exam_name: /AIEA/i },
          { name: /AIEA/i },
          { slug: /aiea/i },
          { short_name: /AIEA/i },
          { title: /AIEA/i }
        ]
      }).toArray();
      
      if (results.length > 0) {
        console.log(`Found in ${colName}:`, JSON.stringify(results, null, 2));
      }
    }
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

run();
