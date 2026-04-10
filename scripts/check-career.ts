import { getDb } from "./lib/db";

async function check() {
  const db = await getDb();
  const career = await db.collection("counseling_career_details").findOne({ slug: "chemistry-engineering" });
  console.log("CAREER FOUND:", JSON.stringify(career, null, 2));
}

check().catch(console.error);
