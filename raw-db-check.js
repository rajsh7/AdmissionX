const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

async function inspect() {
  const envContent = fs.readFileSync('.env', 'utf8');
  const uriMatch = envContent.match(/MONGODB_URI=(.*)/);
  if (!uriMatch) {
    console.error("No MONGODB_URI in .env");
    process.exit(1);
  }
  const uri = uriMatch[1].trim();

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const ads = await db.collection("ads_managements").find({}).toArray();
    
    console.log(`--- RAW DATABASE INSPECTION ---`);
    console.log(`Total ads: ${ads.length}`);
    
    ads.forEach(ad => {
       console.log(`ID: ${ad.id} | Pos: "${ad.ads_position}" | Active: ${ad.isactive} (${typeof ad.isactive}) | Title: ${ad.title}`);
    });
    
    const activeHome = ads.filter(ad => {
       const posMatch = /^\s*(home|default)\s*$/i.test(ad.ads_position || "");
       const activeMatch = (ad.isactive === 1 || ad.isactive === "1" || /^\s*1\s*$/.test(String(ad.isactive)));
       return posMatch && activeMatch;
    });

    console.log(`--- MATCHED FOR "home/default" ---`);
    console.log(`Count: ${activeHome.length}`);
    
    const tickerAds = ads.filter(ad => {
       const posMatch = /^\s*home_ticker\s*$/i.test(ad.ads_position || "");
       const activeMatch = (ad.isactive === 1 || ad.isactive === "1" || /^\s*1\s*$/.test(String(ad.isactive)));
       return posMatch && activeMatch;
    });
    
    console.log(`--- MATCHED FOR "home_ticker" ---`);
    console.log(`Count: ${tickerAds.length}`);

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

inspect();
