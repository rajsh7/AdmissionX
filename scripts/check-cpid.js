const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://admissionx:Adx%23%21eg2026@admissionx.apn7pcl.mongodb.net/?appName=Admissionx';
async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('admissionx');

  // Find a collegeprofile that HAS courses in collegemaster
  const cm = await db.collection('collegemaster').findOne({});
  console.log('collegemaster sample - id:', cm.id, 'collegeprofile_id:', cm.collegeprofile_id, typeof cm.collegeprofile_id);

  // Find the matching collegeprofile
  const cp = await db.collection('collegeprofile').findOne({ id: cm.collegeprofile_id });
  console.log('collegeprofile found by id match:', cp ? 'YES slug=' + cp.slug : 'NO');

  // Check faculty
  const fac = await db.collection('faculty').findOne({});
  console.log('faculty sample - collegeprofile_id:', fac?.collegeprofile_id, typeof fac?.collegeprofile_id);

  // Check gallery
  const gal = await db.collection('gallery').findOne({});
  console.log('gallery sample - users_id:', gal?.users_id, typeof gal?.users_id);

  // Check college_faqs
  const faq = await db.collection('college_faqs').findOne({});
  console.log('college_faqs sample - collegeprofile_id:', faq?.collegeprofile_id, typeof faq?.collegeprofile_id);

  // Find a cp with courses
  const cpWithCourses = await db.collection('collegeprofile').findOne({ id: cm.collegeprofile_id });
  if (cpWithCourses) {
    const courses = await db.collection('collegemaster').find({ collegeprofile_id: cpWithCourses.id }).limit(3).toArray();
    console.log('courses for cp.id', cpWithCourses.id, ':', courses.length);
  }

  await client.close();
}
main().catch(e => { console.error(e.message); process.exit(1); });
