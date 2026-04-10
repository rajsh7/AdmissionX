import { getDb } from "./lib/db.js";

async function addIndexes() {
  const db = await getDb();
  await db.collection('event').createIndex({ collegeprofile_id: 1 });
  await db.collection('collegeprofile').createIndex({ users_id: 1 });
  await db.collection('collegefacilities').createIndex({ collegeprofile_id: 1 });
  await db.collection('collegefacilities').createIndex({ facilities_id: 1 });
  console.log('Indexes added');
}

addIndexes().catch(console.error);