const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://admissionx:Adx%23%21eg2026@admissionx.apn7pcl.mongodb.net/?appName=Admissionx';

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('admissionx');

  const cols = await db.listCollections().toArray();
  console.log('Collections:', cols.map(c => c.name).join(', '));

  const total = await db.collection('collegeprofile').countDocuments();
  console.log('Total collegeprofile docs:', total);

  const sample = await db.collection('collegeprofile').findOne({});
  if (sample) {
    console.log('All fields in sample doc:', Object.keys(sample).join(', '));
    console.log('isShowOnTop:', sample.isShowOnTop, '| isTopUniversity:', sample.isTopUniversity, '| isShowOnHome:', sample.isShowOnHome);
  }

  const showOnTop = await db.collection('collegeprofile').countDocuments({ isShowOnTop: 1 });
  const showOnTop_num = await db.collection('collegeprofile').countDocuments({ isShowOnTop: { $exists: true } });
  const topUni = await db.collection('collegeprofile').countDocuments({ isTopUniversity: 1 });
  const showOnHome = await db.collection('collegeprofile').countDocuments({ isShowOnHome: 1 });
  console.log('isShowOnTop=1:', showOnTop, '| isShowOnTop exists:', showOnTop_num, '| isTopUniversity=1:', topUni, '| isShowOnHome=1:', showOnHome);

  // Check distinct values
  const vals = await db.collection('collegeprofile').distinct('isShowOnTop');
  console.log('Distinct isShowOnTop values:', JSON.stringify(vals.slice(0, 10)));
  const vals2 = await db.collection('collegeprofile').distinct('isTopUniversity');
  console.log('Distinct isTopUniversity values:', JSON.stringify(vals2.slice(0, 10)));

  await client.close();
}
main().catch(e => { console.error(e.message); process.exit(1); });
