import { getDb } from "./lib/db.js";

async function checkAds() {
  try {
    const db = await getDb();
    const allAds = await db.collection("ads_managements").find({}).toArray();
    console.log(`Total ads in DB: ${allAds.length}`);
    
    const relevantAds = await db.collection("ads_managements").find({
      ads_position: { $regex: /^\s*(home|default|home_partner|home_featured|home_ticker)\s*$/i }
    }).toArray();
    
    console.log(`Potential Home Page Ads: ${relevantAds.length}`);
    relevantAds.forEach(ad => {
        console.log(`- ID: ${ad.id}, Pos: "${ad.ads_position}", Active: ${ad.isactive} (${typeof ad.isactive})`);
    });

    const activeHomeAds = await db.collection("ads_managements").find({
      ads_position: { $regex: /^\s*(home|default|home_partner|home_featured|home_ticker)\s*$/i },
      $or: [{ isactive: 1 }, { isactive: "1" }, { isactive: /^\s*1\s*$/ }]
    }).toArray();

    console.log(`ACTIVE Home Page Ads found by current query logic: ${activeHomeAds.length}`);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkAds();
