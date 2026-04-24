const { MongoClient } = require('mongodb');

async function testConnection() {
  // Use the URI the user has
  const uri = "mongodb://admissionx:Adx%23%21eg2026@ac-6eb5m0g-shard-00-00.apn7pcl.mongodb.net:27017/admissionx?authSource=admin&ssl=true";
  console.log("Testing connection...");
  const client = new MongoClient(uri, { 
    connectTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000 
  });
  
  try {
    await client.connect();
    console.log("CONNECTED");
    const admin = client.db().admin();
    const info = await admin.command({ isMaster: 1 });
    console.log("Is Master:", info.ismaster);
    console.log("Primary:", info.primary);
    console.log("Me:", info.me);
    console.log("Hosts:", info.hosts);
    if (info.setName) console.log("ReplicaSet Name:", info.setName);
  } catch (err) {
    console.error("CONNECTION ERROR:", err.message);
  } finally {
    await client.close();
  }
}

testConnection();
