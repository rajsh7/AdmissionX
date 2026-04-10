const { MongoClient } = require('mongodb');

async function testSingleShard() {
  // Trying only one shard directly
  const uri = "mongodb://admissionx:Adx%23%21eg2026@ac-6eb5m0g-shard-00-00.apn7pcl.mongodb.net:27017/?authSource=admin&ssl=true";
  const client = new MongoClient(uri);

  try {
    console.log("Connecting to single shard...");
    await client.connect();
    console.log("Connected to single shard successfully!");
    const db = client.db('admissionx');
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
  } catch (err) {
    console.error("Single shard connection failed:", err);
  } finally {
    await client.close();
  }
}

testSingleShard();
