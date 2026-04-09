const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testWrite() {
  const uri = process.env.MONGODB_URI;
  console.log("🔍 Testing connection to:", uri.split('@')[1]);

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  });

  try {
    console.log("⏳ Connecting...");
    await client.connect();
    console.log("✅ Connected to cluster.");

    const db = client.db(process.env.MONGODB_DB || 'admissionx');
    const admin = client.db('admin');
    
    // Check replication status
    const isMaster = await admin.command({ isMaster: 1 });
    console.log("📊 Topology Info:");
    console.log("   - Is Primary:", isMaster.ismaster);
    console.log("   - Primary Node:", isMaster.primary);
    console.log("   - Me:", isMaster.me);
    console.log("   - All Nodes:", isMaster.hosts.join(', '));

    console.log("\n🧪 Attempting Test Write...");
    const testCol = db.collection('test_connection_check');
    const result = await testCol.insertOne({ 
      test: true, 
      timestamp: new Date(),
      note: "Diagnostic write test" 
    });

    console.log("🚀 WRITE SUCCESSFUL! Inserted ID:", result.insertedId);

    // Clean up
    await testCol.deleteOne({ _id: result.insertedId });
    console.log("🧹 Cleanup successful.");

  } catch (err) {
    console.error("\n❌ DATABASE ERROR DETECTED:");
    console.error("   Message:", err.message);
    console.error("   Code:", err.code);
    console.error("   Stack:", err.stack);
    
    if (err.message.includes("not primary")) {
      console.log("\n💡 ANALYSIS: Your connection is hitting a SECONDARY node. This usually means the 'replicaSet' name in your .env is wrong or the driver can't see the primary.");
    }
  } finally {
    await client.close();
  }
}

testWrite();
