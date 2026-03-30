const fs = require("fs");
const path = require("path");

// ── popular-careers/[slug]/page.tsx ─────────────────────────────────────────
const f1 = path.join(__dirname, "../app/popular-careers/[slug]/page.tsx");
let s1 = fs.readFileSync(f1, "utf8");

s1 = s1.replace('import pool from "@/lib/db";', 'import { getDb } from "@/lib/db";');
s1 = s1.replace(/import \{ RowDataPacket \} from "mysql2";\r?\n/, "");
s1 = s1.replace(/async function safeQuery[\s\S]*?}\r?\n}\r?\n/, "");
["CareerDetailRow","JobRoleRow","SkillRow","WhereToStudyRow","RelatedCareerRow"].forEach(n => {
  s1 = s1.replace(`interface ${n} extends RowDataPacket {`, `interface ${n} {`);
});

// Fix generateMetadata
const gm1s = s1.indexOf("export async function generateMetadata(");
const gm1e = s1.indexOf("\nexport default async function CareerDetailPage", gm1s);
if (gm1s !== -1 && gm1e !== -1) {
  s1 = s1.slice(0, gm1s) + `export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const db = await getDb();
  const career = await db.collection("counseling_career_details").findOne({ slug, status: 1 }, { projection: { title: 1, description: 1, jobProfileDesc: 1, functionalarea_id: 1 } });
  if (!career) return { title: "Career Not Found — AdmissionX" };
  const fa = career.functionalarea_id ? await db.collection("functionalarea").findOne({ id: career.functionalarea_id }, { projection: { name: 1 } }) : null;
  const desc = stripHtml(career.description || career.jobProfileDesc).slice(0, 160);
  const stream = fa?.name ? \` in \${fa.name}\` : "";
  return {
    title: \`\${career.title} — Career Profile | AdmissionX\`,
    description: desc || \`Explore the \${career.title} career path\${stream}.\`,
    openGraph: { title: \`\${career.title} | AdmissionX\`, description: desc },
  };
}
` + s1.slice(gm1e + 1);
}

// Fix page function
const pf1s = s1.indexOf("export default async function CareerDetailPage(");
const pf1body = s1.indexOf("const { slug } = await params;", pf1s);
const pf1end = s1.indexOf("if (!career) notFound();", pf1body) + "if (!career) notFound();".length;
if (pf1s !== -1 && pf1body !== -1 && pf1end > 0) {
  s1 = s1.slice(0, pf1s) + `export default async function CareerDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();

  const careerDoc = await db.collection("counseling_career_details").findOne({ slug, status: 1 });
  if (!careerDoc) notFound();

  const fa = careerDoc.functionalarea_id
    ? await db.collection("functionalarea").findOne({ id: careerDoc.functionalarea_id }, { projection: { id: 1, name: 1, pageslug: 1 } })
    : null;

  const [jobRoleDocs, skillDocs, whereToStudyDocs, relatedDocs] = await Promise.all([
    db.collection("counseling_career_job_role_saleries").find({ careerDetailsId: careerDoc.id }).sort({ id: 1 }).toArray(),
    db.collection("counseling_career_skill_requirements").find({ careerDetailsId: careerDoc.id }).sort({ id: 1 }).toArray(),
    db.collection("counseling_career_where_to_studies").find({ careerDetailsId: careerDoc.id }).sort({ id: 1 }).toArray(),
    careerDoc.functionalarea_id
      ? db.collection("counseling_career_details").find({ functionalarea_id: careerDoc.functionalarea_id, id: { $ne: careerDoc.id }, status: 1 }).sort({ totalLikes: -1 }).limit(4).toArray()
      : Promise.resolve([]),
  ]);

  const career: CareerDetailRow = {
    id: careerDoc.id, title: careerDoc.title, description: careerDoc.description ?? null,
    image: careerDoc.image ?? null, jobProfileDesc: careerDoc.jobProfileDesc ?? null,
    totalLikes: Number(careerDoc.totalLikes) || 0, pros: careerDoc.pros ?? null, cons: careerDoc.cons ?? null,
    futureGrowthPurpose: careerDoc.futureGrowthPurpose ?? null, employeeOpportunities: careerDoc.employeeOpportunities ?? null,
    studyMaterial: careerDoc.studyMaterial ?? null, whereToStudy: careerDoc.whereToStudy ?? null, slug: careerDoc.slug,
    purpose_desc: careerDoc.purpose_desc ?? null, eligibility: careerDoc.eligibility ?? null,
    qualification: careerDoc.qualification ?? null, other_details: careerDoc.other_details ?? null,
    functionalarea_id: careerDoc.functionalarea_id ?? null,
    stream_name: fa?.name ?? null, stream_slug: fa?.pageslug ?? null,
  };
  const jobRoles: JobRoleRow[] = jobRoleDocs.map((r) => ({ id: r.id, title: r.title, avgSalery: r.avgSalery ?? null, topCompany: r.topCompany ?? null }));
  const skills: SkillRow[] = skillDocs.map((r) => ({ id: r.id, title: r.title }));
  const whereToStudies: WhereToStudyRow[] = whereToStudyDocs.map((r) => ({ id: r.id, instituteName: r.instituteName ?? null, instituteUrl: r.instituteUrl ?? null, city: r.city ?? null, programmeFees: r.programmeFees ?? null }));
  const relatedCareers: RelatedCareerRow[] = relatedDocs.map((r) => ({ id: r.id, title: r.title, slug: r.slug, description: r.description ?? null, image: r.image ?? null, stream_name: fa?.name ?? null, stream_slug: fa?.pageslug ?? null }));` + s1.slice(pf1end);
}

fs.writeFileSync(f1, s1, "utf8");
console.log("popular-careers/[slug] done. pool:", (s1.match(/\bpool\b/g)||[]).length, "safeQuery:", (s1.match(/safeQuery/g)||[]).length);

// ── colleges/[stream]/[degree]/page.tsx ──────────────────────────────────────
const f2 = path.join(__dirname, "../app/colleges/[stream]/[degree]/page.tsx");
let s2 = fs.readFileSync(f2, "utf8");

s2 = s2.replace('import pool from "@/lib/db";', 'import { getDb } from "@/lib/db";');
s2 = s2.replace(/import \{ RowDataPacket \} from "mysql2";\r?\n/, "");
s2 = s2.replace(/async function safeQuery[\s\S]*?}\r?\n}\r?\n/, "");
["CollegeRow","StreamRow","DegreeRow","CityRow","CountRow","SlugNameRow"].forEach(n => {
  s2 = s2.replace(`interface ${n} extends RowDataPacket {`, `interface ${n} {`);
});

// Replace the entire fetchCollegesByStreamDegree function with a MongoDB version
const fetchStart = s2.indexOf("async function fetchCollegesByStreamDegree(");
const fetchEnd = s2.indexOf("\n// \u2500\u2500\u2500 Page", fetchStart);
if (fetchStart !== -1 && fetchEnd !== -1) {
  const newFetch = `async function fetchCollegesByStreamDegree(opts: {
  streamSlug: string; degreeSlug: string; cityId: string; stateId: string;
  feesMax: string; sort: string; page: number; limit: number;
}): Promise<{ colleges: CollegeResult[]; total: number; totalPages: number }> {
  const { streamSlug, degreeSlug, cityId, stateId, feesMax, sort, page, limit } = opts;
  const offset = (page - 1) * limit;
  try {
    const db = await getDb();
    // Resolve stream and degree ids
    const [faDoc, degDoc] = await Promise.all([
      db.collection("functionalarea").findOne({ pageslug: streamSlug }, { projection: { id: 1 } }),
      db.collection("degree").findOne({ pageslug: degreeSlug }, { projection: { id: 1 } }),
    ]);
    if (!faDoc || !degDoc) return { colleges: [], total: 0, totalPages: 0 };

    // Find collegeprofile_ids that match stream+degree
    const cmFilter: Record<string, unknown> = { functionalarea_id: faDoc.id, degree_id: degDoc.id };
    if (feesMax && !isNaN(parseInt(feesMax))) cmFilter.fees = { $lte: parseInt(feesMax) };
    const cmDocs = await db.collection("collegemaster").find(cmFilter).project({ collegeprofile_id: 1, fees: 1 }).toArray();
    let cpIds = [...new Set(cmDocs.map((c) => c.collegeprofile_id))];

    // Apply city/state filter
    if (cityId && !isNaN(parseInt(cityId))) {
      const cityDocs = await db.collection("collegeprofile").find({ id: { $in: cpIds }, registeredAddressCityId: parseInt(cityId) }).project({ id: 1 }).toArray();
      cpIds = cityDocs.map((c) => c.id);
    }
    if (stateId && !isNaN(parseInt(stateId))) {
      const cityIds = (await db.collection("city").find({ state_id: parseInt(stateId) }).project({ id: 1 }).toArray()).map((c) => c.id);
      const stateDocs = await db.collection("collegeprofile").find({ id: { $in: cpIds }, registeredAddressCityId: { $in: cityIds } }).project({ id: 1 }).toArray();
      cpIds = stateDocs.map((c) => c.id);
    }

    const total = cpIds.length;
    const mongoSort: Record<string, 1 | -1> = sort === "ranking" ? { ranking: 1 } : sort === "fees" ? { rating: -1 } : sort === "newest" ? { created_at: -1 } : { rating: -1, totalRatingUser: -1 };

    const cpDocs = await db.collection("collegeprofile").aggregate([
      { $match: { id: { $in: cpIds } } },
      { $sort: mongoSort },
      { $skip: offset },
      { $limit: limit },
      { $lookup: { from: "users", localField: "users_id", foreignField: "id", as: "u" } },
      { $unwind: { path: "$u", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "city", localField: "registeredAddressCityId", foreignField: "id", as: "c" } },
      { $unwind: { path: "$c", preserveNullAndEmptyArrays: true } },
    ]).toArray();

    const colleges = cpDocs.map((row) => ({
      id: row.id, slug: row.slug,
      name: row.u?.firstname && row.u.firstname !== row.slug ? row.u.firstname : slugToName(row.slug || "college"),
      location: row.registeredSortAddress || row.c?.name || "India",
      city_name: row.c?.name ?? null, state_id: row.c?.state_id ?? null,
      image: buildImageUrl(row.bannerimage),
      rating: parseFloat(String(row.rating)) || 0,
      totalRatingUser: parseInt(String(row.totalRatingUser)) || 0,
      ranking: row.ranking ? parseInt(String(row.ranking)) : null,
      isTopUniversity: row.isTopUniversity ?? 0,
      topUniversityRank: row.topUniversityRank ? parseInt(String(row.topUniversityRank)) : null,
      universityType: row.universityType || null, estyear: row.estyear || null,
      verified: row.verified ?? 0,
      totalStudent: row.totalStudent ? parseInt(String(row.totalStudent)) : null,
      streams: [], min_fees: null, max_fees: null,
    }));
    return { colleges, total, totalPages: Math.ceil(total / limit) };
  } catch (err) {
    console.error("[colleges/[stream]/[degree] fetchColleges]", err);
    return { colleges: [], total: 0, totalPages: 0 };
  }
}

`;
  s2 = s2.slice(0, fetchStart) + newFetch + s2.slice(fetchEnd + 1);
}

// Fix generateMetadata and page function safeQuery calls
s2 = s2.replace(/await safeQuery<SlugNameRow>\(\s*"SELECT name, pageslug FROM functionalarea WHERE pageslug = \? LIMIT 1",\s*\[streamSlug\],\s*\)/g,
  'await (async () => { const db2 = await getDb(); const r = await db2.collection("functionalarea").findOne({ pageslug: streamSlug }, { projection: { name: 1, pageslug: 1 } }); return r ? [r] : []; })()');
s2 = s2.replace(/await safeQuery<SlugNameRow>\(\s*"SELECT name, pageslug FROM degree WHERE pageslug = \? LIMIT 1",\s*\[degreeSlug\],\s*\)/g,
  'await (async () => { const db2 = await getDb(); const r = await db2.collection("degree").findOne({ pageslug: degreeSlug }, { projection: { name: 1, pageslug: 1 } }); return r ? [r] : []; })()');

// Replace the 3 remaining safeQuery calls in the page function (streams, degrees, cities)
const streamsQuery = s2.indexOf("safeQuery<StreamRow>(`");
const degreesQuery = s2.indexOf("safeQuery<DegreeRow>(");
const citiesQuery = s2.indexOf("safeQuery<CityRow>(");

if (streamsQuery !== -1) {
  const streamsEnd = s2.indexOf("),\n\n      //", streamsQuery);
  s2 = s2.slice(0, streamsQuery) + `(async () => {
        const db2 = await getDb();
        const docs = await db2.collection("functionalarea").aggregate([
          { $lookup: { from: "collegemaster", localField: "id", foreignField: "functionalarea_id", as: "cm" } },
          { $project: { id: 1, name: 1, pageslug: 1, college_count: { $size: { $setUnion: ["$cm.collegeprofile_id", []] } } } },
          { $match: { name: { $exists: true, $ne: "" } } },
          { $sort: { college_count: -1 } },
          { $limit: 20 },
        ]).toArray();
        return docs.map((d) => ({ id: d.id, name: d.name, pageslug: d.pageslug, college_count: d.college_count }));
      })()` + s2.slice(streamsEnd);
}

if (degreesQuery !== -1) {
  const degreesEnd = s2.indexOf("),\n\n      //", degreesQuery);
  if (degreesEnd !== -1) {
    s2 = s2.slice(0, degreesQuery) + `(async () => {
        const db2 = await getDb();
        const faDoc2 = await db2.collection("functionalarea").findOne({ pageslug: streamSlug }, { projection: { id: 1 } });
        if (!faDoc2) return [];
        const docs = await db2.collection("degree").aggregate([
          { $match: { functionalarea_id: faDoc2.id, name: { $exists: true, $ne: "" } } },
          { $lookup: { from: "collegemaster", localField: "id", foreignField: "degree_id", as: "cm" } },
          { $project: { id: 1, name: 1, pageslug: 1, college_count: { $size: "$cm" } } },
          { $sort: { college_count: -1 } },
          { $limit: 50 },
        ]).toArray();
        return docs.map((d) => ({ id: d.id, name: d.name, pageslug: d.pageslug, college_count: d.college_count }));
      })()` + s2.slice(degreesEnd);
  }
}

if (citiesQuery !== -1) {
  const citiesEnd = s2.indexOf("),\n    ]);", citiesQuery);
  if (citiesEnd !== -1) {
    s2 = s2.slice(0, citiesQuery) + `(async () => {
        const db2 = await getDb();
        const faDoc2 = await db2.collection("functionalarea").findOne({ pageslug: streamSlug }, { projection: { id: 1 } });
        const degDoc2 = await db2.collection("degree").findOne({ pageslug: degreeSlug }, { projection: { id: 1 } });
        if (!faDoc2 || !degDoc2) return [];
        const cpIds2 = (await db2.collection("collegemaster").find({ functionalarea_id: faDoc2.id, degree_id: degDoc2.id }).project({ collegeprofile_id: 1 }).toArray()).map((c) => c.collegeprofile_id);
        const cityIds2 = (await db2.collection("collegeprofile").find({ id: { $in: cpIds2 } }).project({ registeredAddressCityId: 1 }).toArray()).map((c) => c.registeredAddressCityId).filter(Boolean);
        const cities = await db2.collection("city").find({ id: { $in: [...new Set(cityIds2)] }, name: { $exists: true, $ne: "" } }).sort({ name: 1 }).limit(80).project({ id: 1, name: 1 }).toArray();
        return cities.map((c) => ({ id: c.id, name: c.name }));
      })()` + s2.slice(citiesEnd);
  }
}

fs.writeFileSync(f2, s2, "utf8");
console.log("colleges/[stream]/[degree] done. pool:", (s2.match(/\bpool\b/g)||[]).length, "safeQuery:", (s2.match(/safeQuery/g)||[]).length);

// ── examination/[stream]/[slug]/page.tsx ─────────────────────────────────────
const f3 = path.join(__dirname, "../app/examination/[stream]/[slug]/page.tsx");
let s3 = fs.readFileSync(f3, "utf8");

s3 = s3.replace('import pool from "@/lib/db";', 'import { getDb } from "@/lib/db";');
s3 = s3.replace(/import \{ RowDataPacket \} from "mysql2";\r?\n/, "");
s3 = s3.replace(/async function safeQuery[\s\S]*?}\r?\n}\r?\n/, "");
["ExamBaseRow","ExamDateRow","EligibilityRow","PatternRow","FeeRow","AppProcessRow"].forEach(n => {
  s3 = s3.replace(`interface ${n} extends RowDataPacket {`, `interface ${n} {`);
});

// Fix page function
const ep1s = s3.indexOf("export default async function ExamOverviewPage(");
const ep1body = s3.indexOf("const { slug } = await params;", ep1s);
const ep1end = s3.indexOf("if (!exam) notFound();", ep1body) + "if (!exam) notFound();".length;
if (ep1s !== -1 && ep1body !== -1 && ep1end > 0) {
  s3 = s3.slice(0, ep1s) + `export default async function ExamOverviewPage({ params }: { params: Promise<{ stream: string; slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();

  const examDoc = await db.collection("examination_details").findOne({ slug });
  if (!examDoc) notFound();
  const exam: ExamBaseRow = {
    id: examDoc.id, title: examDoc.title, slug: examDoc.slug,
    description: examDoc.description ?? null, content: examDoc.content ?? null,
    examEligibilityCriteria: examDoc.examEligibilityCriteria ?? null, examDates: examDoc.examDates ?? null,
    admidCardDesc: examDoc.admidCardDesc ?? null, admidCardInstructions: examDoc.admidCardInstructions ?? null,
    examResultDesc: examDoc.examResultDesc ?? null, mockTestDesc: examDoc.mockTestDesc ?? null,
    getMoreInfoLink: examDoc.getMoreInfoLink ?? null,
    applicationFrom: examDoc.applicationFrom ?? null, applicationTo: examDoc.applicationTo ?? null,
    exminationDate: examDoc.exminationDate ?? null, resultAnnounce: examDoc.resultAnnounce ?? null,
  };` + s3.slice(ep1end);
}

// Replace the parallel safeQuery calls
const parallelStart = s3.indexOf("const [dateRows, eligibilityRows, patternRows, feeRows, appProcessRows] =");
const parallelEnd = s3.indexOf("  // \u2500\u2500 Normalize text fields", parallelStart);
if (parallelStart !== -1 && parallelEnd !== -1) {
  s3 = s3.slice(0, parallelStart) + `const [dateRows, eligibilityRows, patternRows, feeRows, appProcessRows] = await Promise.all([
    db.collection("exam_dates").find({ typeOfExaminations_id: exam.id }).sort({ eventDate: 1 }).toArray().then(docs => docs.map(r => ({ id: r.id, degreeId: r.degreeId ?? null, degreeName: r.degreeName ?? null, eventName: r.eventName ?? null, eventDate: r.eventDate ?? null, eventStatus: r.eventStatus ?? null } as ExamDateRow))),
    db.collection("exam_eligibilities").find({ typeOfExaminations_id: exam.id }).sort({ id: 1 }).toArray().then(docs => docs.map(r => ({ id: r.id, degreeId: r.degreeId ?? null, degreeName: r.degreeName ?? null, description: r.description ?? null } as EligibilityRow))),
    db.collection("exam_patterns").find({ typeOfExaminations_id: exam.id }).sort({ id: 1 }).toArray().then(docs => docs.map(r => ({ id: r.id, degreeId: r.degreeId ?? null, degreeName: r.degreeName ?? null, patternDesc: r.patternDesc ?? null, modeOfExam: r.modeOfExam ?? null, examDuration: r.examDuration ?? null, totalQuestion: r.totalQuestion ?? null, totalMarks: r.totalMarks ?? null, section: r.section ?? null, markingSchem: r.markingSchem ?? null, languageofpaper: r.languageofpaper ?? null } as PatternRow))),
    db.collection("exam_application_fees").find({ typeOfExaminations_id: exam.id }).sort({ id: 1 }).toArray().then(docs => docs.map(r => ({ id: r.id, category: r.category ?? null, quota: r.quota ?? null, mode: r.mode ?? null, gender: r.gender ?? null, amount: r.amount ?? null } as FeeRow))),
    db.collection("exam_application_processes").find({ typeOfExaminations_id: exam.id }).sort({ id: 1 }).toArray().then(docs => docs.map(r => ({ id: r.id, modeofapplication: r.modeofapplication ?? null, modeofpayment: r.modeofpayment ?? null, description: r.description ?? null, examinationtype: r.examinationtype ?? null, applicationandexamstatus: r.applicationandexamstatus ?? null, examinationmode: r.examinationmode ?? null, eligibilitycriteria: r.eligibilitycriteria ?? null } as AppProcessRow))),
  ]);

  ` + s3.slice(parallelEnd);
}

fs.writeFileSync(f3, s3, "utf8");
console.log("examination/[stream]/[slug] done. pool:", (s3.match(/\bpool\b/g)||[]).length, "safeQuery:", (s3.match(/safeQuery/g)||[]).length);
