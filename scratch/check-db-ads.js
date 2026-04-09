const path = require('path');
// Use the exact path to the lib/db.ts
const dbPath = path.resolve(__dirname, '../lib/db.ts');
const { getDb } = require(dbPath);

async function checkAds() {
  try {
    const db = await getDb();
    const allAds = await db.collection("ads_managements").find({}).toArray();
    
    console.log("Total Ads in DB:", allAds.length);
    
    const positions = [...new Set(allAds.map(a => a.ads_position))];
    console.log("Unique Positions (Raw):", positions);
    
    // Check specific positions we added
    const partnerAds = allAds.filter(a => a.ads_position?.trim() === "home_partner");
    const featuredAds = allAds.filter(a => a.ads_position?.trim() === "home_featured");
    const tickerAds = allAds.filter(a => a.ads_position?.trim() === "home_ticker");
    
    console.log(`- Partner Ads (home_partner): ${partnerAds.length} (Active: ${partnerAds.filter(a => [1,"1"].includes(a.isactive)).length})`);
    console.log(`- Featured Ads (home_featured): ${featuredAds.length} (Active: ${featuredAds.filter(a => [1,"1"].includes(a.isactive)).length})`);
    console.log(`- Ticker Ads (home_ticker): ${tickerAds.length} (Active: ${tickerAds.filter(a => [1,"1"].includes(a.isactive)).length})`);

    allAds.slice(0, 10).forEach(ad => {
      console.log(`- [${ad.ads_position}] ${ad.title} (Active: ${ad.isactive})`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkAds();
