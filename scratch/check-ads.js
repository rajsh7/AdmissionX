const { getDb } = require("./lib/db");

async function checkAds() {
  const db = await getDb();
  const ads = await db.collection("ads_managements").find({
    $or: [{ ads_position: "home" }, { ads_position: " home" }],
  }).toArray();
  console.log("Found Ads for 'home' position:", JSON.stringify(ads, null, 2));
  
  const tickerAds = await db.collection("ads_managements").find({
    $or: [{ ads_position: "home_ticker" }, { ads_position: " home_ticker" }],
  }).toArray();
  console.log("Found Ads for 'home_ticker' position:", JSON.stringify(tickerAds, null, 2));
}

checkAds().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
