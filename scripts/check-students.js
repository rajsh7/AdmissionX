require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB ?? "admissionx");

  const signupCount = await db.collection("next_student_signups").countDocuments();
  const profileCount = await db.collection("next_student_profiles").countDocuments();

  console.log("next_student_signups count:", signupCount);
  console.log("next_student_profiles count:", profileCount);

  // Sample signup
  const sample = await db.collection("next_student_signups").findOne({});
  console.log("\nSample signup:", JSON.stringify({ _id: sample?._id, name: sample?.name, email: sample?.email, phone: sample?.phone, is_active: sample?.is_active }, null, 2));

  // Sample profile
  const sampleProf = await db.collection("next_student_profiles").findOne({});
  console.log("\nSample profile:", JSON.stringify(sampleProf, null, 2));

  await client.close();
}
main().catch(console.error);
