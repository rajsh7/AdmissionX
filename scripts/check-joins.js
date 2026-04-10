const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://admissionx:Adx%23%21eg2026@admissionx.apn7pcl.mongodb.net/?appName=Admissionx';

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('admissionx');

  // Check users id field
  const user = await db.collection('users').findOne({});
  console.log('users._id:', user._id, '| users.id:', user.id, typeof user.id);

  // Check collegeprofile id field
  const cp = await db.collection('collegeprofile').findOne({ isShowOnHome: 1 });
  console.log('collegeprofile._id:', cp._id, '| collegeprofile.id:', cp.id, typeof cp.id, '| users_id:', cp.users_id);

  // Try joining via id field
  const joined = await db.collection('collegeprofile').aggregate([
    { $match: { isShowOnHome: 1 } },
    { $limit: 1 },
    { $lookup: { from: 'users', localField: 'users_id', foreignField: 'id', as: 'user' } },
  ]).toArray();
  console.log('\nLookup via users.id — user found:', joined[0]?.user?.[0]?.firstname ?? 'NOT FOUND');

  // Check collegemaster
  const cm = await db.collection('collegemaster').findOne({});
  console.log('\ncollegemaster.id:', cm.id, '| collegeprofile_id:', cm.collegeprofile_id, typeof cm.collegeprofile_id);

  // Try joining collegemaster -> collegeprofile via id
  const cmJoin = await db.collection('collegemaster').aggregate([
    { $limit: 1 },
    { $lookup: { from: 'collegeprofile', localField: 'collegeprofile_id', foreignField: 'id', as: 'cp' } },
  ]).toArray();
  console.log('collegemaster->collegeprofile via id — found:', cmJoin[0]?.cp?.[0]?.slug ?? 'NOT FOUND');

  // Check functionalarea
  const fa = await db.collection('functionalarea').findOne({});
  console.log('\nfunctionalarea._id:', fa._id, '| id:', fa.id, typeof fa.id);

  // Check if collegemaster.functionalarea_id matches functionalarea.id
  const cm2 = await db.collection('collegemaster').findOne({ functionalarea_id: { $exists: true } });
  console.log('collegemaster.functionalarea_id:', cm2?.functionalarea_id, typeof cm2?.functionalarea_id);

  const faJoin = await db.collection('collegemaster').aggregate([
    { $limit: 1 },
    { $lookup: { from: 'functionalarea', localField: 'functionalarea_id', foreignField: 'id', as: 'fa' } },
  ]).toArray();
  console.log('collegemaster->functionalarea via id — found:', faJoin[0]?.fa?.[0]?.name ?? 'NOT FOUND');

  // Check city
  const city = await db.collection('city').findOne({});
  console.log('\ncity._id:', city._id, '| city.id:', city.id, typeof city.id);
  console.log('collegeprofile.registeredAddressCityId:', cp.registeredAddressCityId, typeof cp.registeredAddressCityId);

  const cityJoin = await db.collection('collegeprofile').aggregate([
    { $match: { isShowOnHome: 1 } },
    { $limit: 1 },
    { $lookup: { from: 'city', localField: 'registeredAddressCityId', foreignField: 'id', as: 'city' } },
  ]).toArray();
  console.log('collegeprofile->city via id — found:', cityJoin[0]?.city?.[0]?.name ?? 'NOT FOUND');

  await client.close();
}
main().catch(e => { console.error(e.message); process.exit(1); });
