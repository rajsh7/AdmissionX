const { MongoClient } = require('mongodb');

async function main() {
    const uri = "mongodb://admissionx:Adx%23%21eg2026@ac-6eb5m0g-shard-00-00.apn7pcl.mongodb.net:27017,ac-6eb5m0g-shard-00-01.apn7pcl.mongodb.net:27017,ac-6eb5m0g-shard-00-02.apn7pcl.mongodb.net:27017/admissionx?authSource=admin&replicaSet=atlas-pcjopa-shard-0&tls=true&retryWrites=true&w=majority";
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('admissionx');
        const collection = db.collection('ads_managements');
        
        console.log("Listing ALL ads...");
        const allAds = await collection.find({}).project({ title: 1, ads_position: 1, isactive: 1 }).toArray();
        console.table(allAds);
        
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.close();
    }
}

main();
