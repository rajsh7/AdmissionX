const { MongoClient } = require('mongodb');
const uri = 'mongodb://admissionx:Adx%23%21eg2026@ac-6eb5m0g-shard-00-00.apn7pcl.mongodb.net:27017/admissionx?authSource=admin&ssl=true&directConnection=true';

async function checkData() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('admissionx');
    const col = db.collection('collegeprofile');
    
    // Find doc with isShowOnHome and users_id
    const doc = await col.findOne({ isShowOnHome: 1, users_id: { $exists: true } });
    if (doc) {
      console.log('Sample users_id value:', JSON.stringify(doc.users_id), 'Type:', typeof doc.users_id);
    } else {
      console.log('No doc with isShowOnHome:1 and users_id exists!');
    }
    
    // Check if any doc has users_id
    const anyWithUsersId = await col.findOne({ users_id: { $exists: true, $ne: null } });
    if (anyWithUsersId) {
      console.log('Any doc with users_id sample:', JSON.stringify(anyWithUsersId.users_id));
    }

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

checkData();
