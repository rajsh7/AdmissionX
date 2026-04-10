const fs = require("fs");
const path = require("path");

function patchFile(filePath, patches) {
  let src = fs.readFileSync(filePath, "utf8");
  for (const [find, replace] of patches) {
    const idx = src.indexOf(find);
    if (idx === -1) { console.log("NOT FOUND:", find.slice(0, 60)); continue; }
    src = src.slice(0, idx) + replace + src.slice(idx + find.length);
    console.log("Patched:", find.slice(0, 60));
  }
  fs.writeFileSync(filePath, src, "utf8");
  console.log("pool remaining:", (src.match(/\bpool\b/g) || []).length);
  console.log("safeQuery remaining:", (src.match(/safeQuery/g) || []).length);
}

// ── careers/opportunities/[stream]/page.tsx ──────────────────────────────────
const f1 = path.join(__dirname, "../app/careers/opportunities/[stream]/page.tsx");
let s1 = fs.readFileSync(f1, "utf8");

// Fix imports
s1 = s1.replace('import pool from "@/lib/db";', 'import { getDb } from "@/lib/db";');
s1 = s1.replace(/import \{ RowDataPacket \} from "mysql2";\r?\n/, "");

// Remove safeQuery function
s1 = s1.replace(/async function safeQuery[\s\S]*?}\r?\n}\r?\n/, "");

// Fix interface declarations
s1 = s1.replace("interface StreamRow extends RowDataPacket {", "interface StreamRow {");
s1 = s1.replace("interface CareerRelevantRow extends RowDataPacket {", "interface CareerRelevantRow {");
s1 = s1.replace("interface RelatedStreamRow extends RowDataPacket {", "interface RelatedStreamRow {");

// Fix generateMetadata
const oldMeta1 = s1.indexOf("export async function generateMetadata({\n  params,\n}");
const oldMeta1b = s1.indexOf("export async function generateMetadata({\r\n  params,\r\n}");
const metaStart = oldMeta1 !== -1 ? oldMeta1 : oldMeta1b;
const metaEnd = s1.indexOf("\nexport default async function", metaStart);
if (metaStart !== -1 && metaEnd !== -1) {
  const newMeta = `export async function generateMetadata({ params }: { params: Promise<{ stream: string }> }): Promise<Metadata> {
  const { stream } = await params;
  const db = await getDb();
  const fa = await db.collection("functionalarea").findOne({ pageslug: stream }, { projection: { name: 1 } });
  const name = fa?.name ?? stream.replace(/-/g, " ").replace(/\\b\\w/g, (c) => c.toUpperCase());
  return {
    title: \`\${name} Career Opportunities — Paths, Salary & More | AdmissionX\`,
    description: \`Explore career opportunities in \${name}. Get salary ranges, mandatory subjects, difficulty levels, and more.\`,
  };
}
`;
  s1 = s1.slice(0, metaStart) + newMeta + s1.slice(metaEnd + 1);
}

// Fix page function - find start and end of data fetching block
const pageStart = s1.indexOf("export default async function CareerOpportunitiesByStreamPage(");
const pageBodyStart = s1.indexOf("const { stream } = await params;", pageStart);
const pageBodyEnd = s1.indexOf("const totalCareers = careers.length;", pageBodyStart) + "const totalCareers = careers.length;".length;

if (pageStart !== -1 && pageBodyStart !== -1 && pageBodyEnd !== -1) {
  const newPageSig = `export default async function CareerOpportunitiesByStreamPage({ params }: { params: Promise<{ stream: string }> }) {\n`;
  const newPageBody = `  const { stream } = await params;
  const db = await getDb();

  const faDoc = await db.collection("functionalarea").findOne({ pageslug: stream });
  if (!faDoc) notFound();
  const streamInfo: StreamRow = { id: faDoc.id, name: faDoc.name, pageslug: faDoc.pageslug ?? null, bannerimage: faDoc.bannerimage ?? null, description: faDoc.pagedescription ?? null };
  const streamName = streamInfo.name;

  const [careerDocs, relatedFaDocs] = await Promise.all([
    db.collection("counseling_career_relevants")
      .find({ functionalarea_id: streamInfo.id, status: 1, slug: { $exists: true, $ne: "" } })
      .sort({ id: 1 })
      .project({ id: 1, title: 1, description: 1, image: 1, salery: 1, stream: 1, mandatorySubject: 1, academicDifficulty: 1, careerInterest: 1, slug: 1 })
      .toArray(),
    db.collection("counseling_career_relevants").aggregate([
      { $match: { status: 1, functionalarea_id: { $ne: streamInfo.id } } },
      { $group: { _id: "$functionalarea_id", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: "functionalarea", localField: "_id", foreignField: "id", as: "fa" } },
      { $unwind: "$fa" },
      { $project: { id: "$fa.id", name: "$fa.name", pageslug: "$fa.pageslug", career_count: "$count" } },
    ]).toArray(),
  ]);

  const careers: CareerRelevantRow[] = careerDocs.map((c) => ({
    id: c.id, title: c.title, description: c.description ?? null, image: c.image ?? null,
    salery: c.salery ?? null, stream: c.stream ?? null, mandatorySubject: c.mandatorySubject ?? null,
    academicDifficulty: c.academicDifficulty ?? null, careerInterest: c.careerInterest ?? null, slug: c.slug,
  }));
  const relatedStreams: RelatedStreamRow[] = relatedFaDocs.map((r) => ({ id: r.id, name: r.name, pageslug: r.pageslug ?? null, career_count: r.career_count }));
  const totalCareers = careers.length;`;

  // Find the old function signature line end
  const oldSigEnd = s1.indexOf("\n", s1.indexOf("}) {", pageStart)) + 1;
  s1 = s1.slice(0, pageStart) + newPageSig + newPageBody + s1.slice(pageBodyEnd);
}

fs.writeFileSync(f1, s1, "utf8");
console.log("careers/opportunities/[stream] done");
console.log("pool:", (s1.match(/\bpool\b/g) || []).length, "safeQuery:", (s1.match(/safeQuery/g) || []).length);

// ── colleges/page.tsx ────────────────────────────────────────────────────────
const f2 = path.join(__dirname, "../app/colleges/page.tsx");
let s2 = fs.readFileSync(f2, "utf8");

s2 = s2.replace('import pool from "@/lib/db";', 'import { getDb } from "@/lib/db";');

// Replace the entire data-fetching block
const connStart = s2.indexOf("  const conn = await pool.getConnection();");
const connEnd = s2.indexOf("  return (", connStart);
if (connStart !== -1 && connEnd !== -1) {
  const newFetch = `  const db = await getDb();

  let colleges: CollegeResult[] = [];
  try {
    const rows = await db.collection("collegeprofile").aggregate([
      { $match: q.length >= 2 ? { $or: [{ slug: { $regex: q, $options: "i" } }, { registeredSortAddress: { $regex: q, $options: "i" } }] } : {} },
      { $lookup: { from: "users", localField: "users_id", foreignField: "id", as: "u" } },
      { $unwind: { path: "$u", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "city", localField: "registeredAddressCityId", foreignField: "id", as: "c" } },
      { $unwind: { path: "$c", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "collegemaster", localField: "id", foreignField: "collegeprofile_id", as: "cm" } },
      { $sort: { rating: -1, totalRatingUser: -1 } },
      { $limit: 20 },
      { $project: {
        id: 1, slug: 1, bannerimage: 1, rating: 1, totalRatingUser: 1, ranking: 1,
        isTopUniversity: 1, topUniversityRank: 1, universityType: 1, estyear: 1, verified: 1, totalStudent: 1,
        registeredSortAddress: 1,
        name: "$u.firstname",
        city_name: "$c.name",
        state_id: "$c.state_id",
        cm: 1,
      }},
    ]).toArray();

    colleges = rows.map((row) => {
      const streams = [...new Set((row.cm || []).map((m: Record<string, unknown>) => m.functionalarea_name).filter(Boolean))] as string[];
      const fees = (row.cm || []).map((m: Record<string, unknown>) => Number(m.fees)).filter((f: number) => f > 0);
      return {
        id: row.id,
        slug: row.slug,
        name: row.name && row.name !== row.slug ? row.name : slugToName(row.slug || "college"),
        location: row.registeredSortAddress || row.city_name || "India",
        city_name: row.city_name,
        state_id: row.state_id,
        image: buildImageUrl(row.bannerimage),
        rating: parseFloat(String(row.rating)) || 0,
        totalRatingUser: parseInt(String(row.totalRatingUser)) || 0,
        ranking: row.ranking ? parseInt(String(row.ranking)) : null,
        isTopUniversity: row.isTopUniversity ?? 0,
        topUniversityRank: row.topUniversityRank ? parseInt(String(row.topUniversityRank)) : null,
        universityType: row.universityType || null,
        estyear: row.estyear || null,
        verified: row.verified ?? 0,
        totalStudent: row.totalStudent ? parseInt(String(row.totalStudent)) : null,
        streams,
        min_fees: fees.length ? Math.min(...fees) : null,
        max_fees: fees.length ? Math.max(...fees) : null,
      };
    });
  } catch (err) {
    console.error("Colleges page DB error:", err);
  }

  `;
  s2 = s2.slice(0, connStart) + newFetch + s2.slice(connEnd);
}

fs.writeFileSync(f2, s2, "utf8");
console.log("colleges/page done");
console.log("pool:", (s2.match(/\bpool\b/g) || []).length, "safeQuery:", (s2.match(/safeQuery/g) || []).length);
