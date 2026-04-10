/**
 * fix-string-numbers.js
 * Converts " 1" / " 0" string values to proper integers across key collections.
 * Run: node scripts/fix-string-numbers.js
 */
const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://admissionx:Adx%23%21eg2026@admissionx.apn7pcl.mongodb.net/?appName=Admissionx';

// Fields that should be integers, stored as " 0"/" 1" strings
const COLLEGEPROFILE_INT_FIELDS = [
  'isShowOnTop', 'isShowOnHome', 'isTopUniversity', 'verified',
  'topUniversityRank', 'ranking', 'totalRatingUser', 'totalStudent',
  'CCTVSurveillance', 'ACCampus', 'advertisement',
  'registeredAddressCityId', 'registeredAddressStateId', 'registeredAddressCountryId',
  'campusAddressCityId', 'campusAddressStateId', 'campusAddressCountryId',
  'collegetype_id', 'university_id', 'users_id',
];

const FLOAT_FIELDS = ['rating'];

async function fixCollection(db, collectionName, intFields, floatFields = []) {
  const col = db.collection(collectionName);
  const total = await col.countDocuments();
  console.log(`\n[${collectionName}] ${total} docs — fixing fields: ${[...intFields, ...floatFields].join(', ')}`);

  let fixed = 0;
  const cursor = col.find({});
  const BATCH = 500;
  let ops = [];

  for await (const doc of cursor) {
    const set = {};
    for (const field of intFields) {
      const val = doc[field];
      if (typeof val === 'string') {
        const trimmed = val.trim();
        const n = parseInt(trimmed, 10);
        if (!isNaN(n)) set[field] = n;
      }
    }
    for (const field of floatFields) {
      const val = doc[field];
      if (typeof val === 'string') {
        const trimmed = val.trim();
        const n = parseFloat(trimmed);
        if (!isNaN(n)) set[field] = n;
      }
    }
    if (Object.keys(set).length > 0) {
      ops.push({ updateOne: { filter: { _id: doc._id }, update: { $set: set } } });
      fixed++;
    }
    if (ops.length >= BATCH) {
      await col.bulkWrite(ops, { ordered: false });
      process.stdout.write(`\r  ${fixed} fixed...`);
      ops = [];
    }
  }
  if (ops.length > 0) {
    await col.bulkWrite(ops, { ordered: false });
  }
  console.log(`\r  Done — ${fixed} docs updated`);
}

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('admissionx');

  await fixCollection(db, 'collegeprofile', COLLEGEPROFILE_INT_FIELDS, FLOAT_FIELDS);

  // Also fix collegemaster fees/ids
  await fixCollection(db, 'collegemaster', [
    'collegeprofile_id', 'functionalarea_id', 'degree_id', 'course_id', 'seats',
  ], ['fees']);

  // Fix functionalarea / degree flags
  await fixCollection(db, 'functionalarea', ['isShowOnTop', 'isShowOnHome']);
  await fixCollection(db, 'degree', ['isShowOnTop', 'isShowOnHome', 'functionalarea_id']);

  // Fix city / state ids
  await fixCollection(db, 'city', ['state_id', 'isShowOnTop', 'isShowOnHome']);

  // Fix blogs / news active flags
  await fixCollection(db, 'blogs', ['isactive']);
  await fixCollection(db, 'news', ['isactive']);

  // Fix examination_details
  await fixCollection(db, 'examination_details', ['status', 'totalViews', 'functionalarea_id']);

  // Fix users ids
  await fixCollection(db, 'users', ['id']);

  console.log('\n✅ All done. Restart your Next.js server to clear the data cache.');
  await client.close();
}

main().catch(e => { console.error(e); process.exit(1); });
