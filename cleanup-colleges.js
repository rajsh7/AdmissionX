const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://admissionx:Adx%23%21eg2026@admissionx.apn7pcl.mongodb.net/?appName=Admissionx';

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('admissionx');

  console.log('🔍 Analyzing colleges to remove...\n');

  const totalBefore = await db.collection('collegeprofile').countDocuments();
  console.log('Total before cleanup:', totalBefore);

  // ── Criteria for dummy/invalid colleges ──────────────────────────────────
  // A college is considered dummy/invalid if it meets ANY of these:
  // 1. Slug contains "delete" keyword
  // 2. Has NO bannerimage AND NO description AND NO address
  // 3. Has NO courses AND NO description AND NO address (completely empty profile)

  // Get IDs of colleges that have at least one course
  const cpIdsWithCourses = await db.collection('collegemaster').distinct('collegeprofile_id');

  // Find colleges to remove
  const toRemove = await db.collection('collegeprofile').find({
    $or: [
      // Rule 1: slug contains "delete"
      { slug: { $regex: 'delete', $options: 'i' } },

      // Rule 2: No image + no description + no address (truly empty)
      {
        $and: [
          { $or: [{ bannerimage: null }, { bannerimage: '' }, { bannerimage: { $exists: false } }] },
          { $or: [{ description: null }, { description: '' }, { description: { $exists: false } }] },
          { $or: [{ registeredSortAddress: null }, { registeredSortAddress: '' }, { registeredSortAddress: { $exists: false } }] },
        ]
      },

      // Rule 3: No courses + no description + no address
      {
        $and: [
          { _id: { $nin: cpIdsWithCourses } },
          { $or: [{ description: null }, { description: '' }, { description: { $exists: false } }] },
          { $or: [{ registeredSortAddress: null }, { registeredSortAddress: '' }, { registeredSortAddress: { $exists: false } }] },
        ]
      },
    ]
  }).project({ _id: 1, slug: 1, bannerimage: 1, description: 1, registeredSortAddress: 1 }).toArray();

  console.log(`\nFound ${toRemove.length} colleges to remove:`);
  toRemove.slice(0, 20).forEach(c => console.log(` - "${c.slug}"`));
  if (toRemove.length > 20) console.log(` ... and ${toRemove.length - 20} more`);

  if (toRemove.length === 0) {
    console.log('\n✅ No dummy colleges found. Database is clean!');
    await client.close();
    return;
  }

  const removeIds = toRemove.map(c => c._id);

  // Remove from collegeprofile
  const deleteResult = await db.collection('collegeprofile').deleteMany({ _id: { $in: removeIds } });
  console.log(`\n✅ Removed ${deleteResult.deletedCount} colleges from collegeprofile`);

  // Also clean up related collections
  const relatedCollections = [
    'collegemaster',
    'placement',
    'faculty',
    'faculty_departments',
    'gallery',
    'college_reviews',
    'college_faqs',
    'college_scholarships',
    'college_cut_offs',
    'college_admission_procedures',
    'college_management_details',
    'college_social_media_links',
    'college_sports_activities',
    'collegefacilities',
    'event',
  ];

  for (const col of relatedCollections) {
    try {
      const r = await db.collection(col).deleteMany({ collegeprofile_id: { $in: removeIds } });
      if (r.deletedCount > 0) console.log(`   🗑️  ${col}: removed ${r.deletedCount} records`);
    } catch (e) {
      // Collection may not exist
    }
  }

  const totalAfter = await db.collection('collegeprofile').countDocuments();
  console.log(`\n📊 Summary:`);
  console.log(`   Before: ${totalBefore}`);
  console.log(`   Removed: ${deleteResult.deletedCount}`);
  console.log(`   After: ${totalAfter}`);
  console.log('\n✅ Cleanup complete!');

  await client.close();
}

main().catch(console.error);
