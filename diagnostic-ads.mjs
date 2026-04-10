import { getDb } from "./lib/db.js";
import 'dotenv/config';

async function checkAds() {
  try {
    const db = await getDb();
    
    // 1. Check all positions used in the DB
    const positions = await db.collection("ads_managements").distinct("ads_position");
    console.log(`Available Positions in DB:`, positions.map(p => `"${p}"`).join(", "));

    // 2. Check general ads
    const allAds = await db.collection("ads_managements").find({}).toArray();
    console.log(`Total ads in DB: ${allAds.length}`);
    
    const relevantAds = await db.collection("ads_managements").find({
      ads_position: { $regex: /^\s*(home|default|home_partner|home_featured|home_ticker)\s*$/i }
    }).toArray();
    
    console.log(`Potential Home Page Ads: ${relevantAds.length}`);
    relevantAds.forEach(ad => {
        console.log(`- ID: ${ad.id}, Title: "${ad.title}", Pos: "${ad.ads_position}", Active: ${ad.isactive} (${typeof ad.isactive})`);
    });

    // 3. Check what the query actually finds
    const activeHomeAds = await db.collection("ads_managements").find({
      ads_position: { $regex: /^\s*(home|default)\s*$/i },
      $or: [{ isactive: 1 }, { isactive: "1" }, { isactive: /^\s*1\s*$/ }]
    }).toArray();

    console.log(`\nACTIVE "home/default" Ads found: ${activeHomeAds.length}`);
    
    const tickerAds = await db.collection("ads_managements").find({
      ads_position: { $regex: /^\s*home_ticker\s*$/i },
      $or: [{ isactive: 1 }, { isactive: "1" }, { isactive: /^\s*1\s*$/ }]
    }).toArray();
    console.log(`ACTIVE "home_ticker" Ads found: ${tickerAds.length}`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkAds();
