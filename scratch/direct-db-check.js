const { MongoClient } = require('mongodb');

// URI from .env
const uri = "mongodb://admissionx:Adx%23%21eg2026@ac-6eb5m0g-shard-00-00.apn7pcl.mongodb.net:27017,ac-6eb5m0g-shard-00-01.apn7pcl.mongodb.net:27017,ac-6eb5m0g-shard-00-02.apn7pcl.mongodb.net:27017/admissionx?authSource=admin&replicaSet=atlas-pcjopa-shard-0&tls=true&retryWrites=true&w=majority";

async function checkAds() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("admissionx");
    const allAds = await db.collection("ads_managements").find({}).toArray();
    
    console.log("Total Ads in DB:", allAds.length);
    
    const positions = [...new Set(allAds.map(a => a.ads_position?.trim()))];
    console.log("Unique Positions (Raw):", positions);
    
    // Check specific positions
    const partnerAds = allAds.filter(a => a.ads_position?.trim() === "home_partner" && [1, "1"].includes(a.isactive));
    const featuredAds = allAds.filter(a => a.ads_position?.trim() === "home_featured" && [1, "1"].includes(a.isactive));
    const tickerAds = allAds.filter(a => a.ads_position?.trim() === "home_ticker" && [1, "1"].includes(a.isactive));
    const generalHomeAds = allAds.filter(a => ["home", "default"].includes(a.ads_position?.trim()) && [1, "1"].includes(a.isactive));

    console.log(`Active home_partner ads: ${partnerAds.length}`);
    console.log(`Active home_featured ads: ${featuredAds.length}`);
    console.log(`Active home_ticker ads: ${tickerAds.length}`);
    console.log(`Active general home/default ads: ${generalHomeAds.length}`);

    if (allAds.length > 0) {
      console.log("\nSample Ads (Top 5):");
      allAds.slice(0, 5).forEach(ad => {
        console.log(`- [${ad.ads_position}] ${ad.title} (Active: ${ad.isactive})`);
      });
    }

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

checkAds();
