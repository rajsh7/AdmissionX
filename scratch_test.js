const { MongoClient } = require('mongodb');

async function run() {
  const client = new MongoClient('mongodb+srv://admissionx:Adx%23%21eg2026@admissionx.apn7pcl.mongodb.net/?appName=Admissionx');
  try {
    await client.connect();
    const db = client.db('admissionx');
    const rows = await db.collection('blogs').find({ featimage: { $exists: true, $ne: null } }).sort({ created_at: -1 }).limit(10).toArray();
    console.log(rows.map(r => r.featimage));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

run();
