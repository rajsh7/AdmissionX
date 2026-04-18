const { MongoClient } = require('mongodb');
async function run() {
  const client = new MongoClient('mongodb+srv://admissionx:Adx%23%21eg2026@admissionx.apn7pcl.mongodb.net/?appName=Admissionx');
  try {
    await client.connect();
    const db = client.db('admissionx');
    // Find colleges that have a real (non-null) bannerimage
    const cp = await db.collection('collegeprofile').find({}).toArray();
    const withImg = cp.filter(c => c.bannerimage && c.bannerimage.trim() && c.bannerimage.trim().toUpperCase() !== 'NULL');
    console.log('Total with real image:', withImg.length);
    console.log('Samples:', JSON.stringify(withImg.slice(0,5).map(c=>({ slug: c.slug, bannerimage: c.bannerimage }))));
  } finally {
    client.close();
  }
}
run();
