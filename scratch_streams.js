const { MongoClient } = require('mongodb');
async function run() {
  const client = new MongoClient('mongodb+srv://admissionx:Adx%23%21eg2026@admissionx.apn7pcl.mongodb.net/?appName=Admissionx');
  try {
    await client.connect();
    const db = client.db('admissionx');
    const rows = await db.collection('functionalarea').find({}).limit(10).toArray();
    console.log(JSON.stringify(rows.map(r => ({
      id: r.id, name: r.name, logoimage: r.logoimage, bannerimage: r.bannerimage
    })), null, 2));
    const total = await db.collection('functionalarea').countDocuments();
    console.log('Total:', total);
  } finally {
    client.close();
  }
}
run();
