const { MongoClient } = require('mongodb');

// HARDCODED URI FOR DIAGNOSTIC ONLY
const uri = "mongodb://admissionx:Adx%23%21eg2026@ac-6eb5m0g-shard-00-00.apn7pcl.mongodb.net:27017,ac-6eb5m0g-shard-00-01.apn7pcl.mongodb.net:27017,ac-6eb5m0g-shard-00-02.apn7pcl.mongodb.net:27017/admissionx?authSource=admin&replicaSet=atlas-pcjopa-shard-0&tls=true";

async function run() {
  console.log("🔍 Checking MongoDB Topology...");
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✅ Connection Successful.");

    const admin = client.db('admin');
    const status = await admin.command({ isMaster: 1 });

    console.log("📊 Cluster Info:");
    console.log("   - Is Primary:", status.ismaster);
    console.log("   - Primary Node:", status.primary);
    console.log("   - Me:", status.me);
    console.log("   - Hosts discovered:", status.hosts.join(", "));

    // Attempt a real write
    const db = client.db('admissionx');
    console.log("\n🧪 Attempting write to 'admissionx'...");
    const testResult = await db.collection('test_write').insertOne({ timestamp: new Date() });
    console.log("🚀 Write Successful! ID:", testResult.insertedId);

    // Clean up
    await db.collection('test_write').deleteOne({ _id: testResult.insertedId });
    console.log("🧹 Cleanup done.");

  } catch (err) {
    console.error("\n❌ FAILED:");
    console.error("   - Code:", err.code);
    console.error("   - Message:", err.message);
  } finally {
    await client.close();
  }
}

run();
