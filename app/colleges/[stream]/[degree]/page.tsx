import { getDb } from "@/lib/db";
import type { Metadata } from "next";
import SearchClient from "@/app/search/SearchClient";
import type { CollegeResult } from "@/app/api/search/colleges/route";

interface FilterOption {
  id: string | number;
  name: string;
  slug?: string;
  count?: number;
}

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=600";

function buildImageUrl(raw: string | null): string {
  if (!raw) return DEFAULT_IMAGE;
  if (raw.startsWith("http") || raw.startsWith("/")) return raw;
  return `${IMAGE_BASE}${raw}`;
}

function slugToName(slug: string): string {
  return slug.replace(/-\d+$/, "").split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

interface PageProps {
  params: Promise<{ stream: string; degree: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { stream: streamSlug, degree: degreeSlug } = await params;
  const db = await getDb();
  const [fa, deg] = await Promise.all([
    db.collection("functionalarea").findOne({ pageslug: streamSlug }, { projection: { name: 1 } }),
    db.collection("degree").findOne({ pageslug: degreeSlug }, { projection: { name: 1 } }),
  ]);
  const streamName = fa?.name ?? slugToName(streamSlug);
  const degreeName = deg?.name ?? slugToName(degreeSlug);
  return {
    title: `Top ${degreeName} Colleges in ${streamName} 2024 | AdmissionX`,
    description: `Find the best ${degreeName} colleges in ${streamName}. Compare fees, placements, ratings, and facilities.`,
  };
}

export default async function CollegesByStreamDegreePage({ params, searchParams }: PageProps) {
  const { stream: streamSlug, degree: degreeSlug } = await params;
  const sp = await searchParams;

  const getString = (key: string, fallback = "") =>
    typeof sp[key] === "string" ? (sp[key] as string) : fallback;

  const cityId = getString("city_id");
  const stateId = getString("state_id");
  const feesMax = getString("fees_max");
  const sort = getString("sort", "rating");
  const page = Math.max(1, parseInt(getString("page", "1")));
  const limit = 12;
  const offset = (page - 1) * limit;

  const db = await getDb();

  // Resolve slugs to integer ids
  const [faDoc, degDoc] = await Promise.all([
    db.collection("functionalarea").findOne({ pageslug: streamSlug }, { projection: { id: 1, name: 1 } }),
    db.collection("degree").findOne({ pageslug: degreeSlug }, { projection: { id: 1, name: 1 } }),
  ]);

  const streamName = faDoc?.name ?? slugToName(streamSlug);
  const degreeName = degDoc?.name ?? slugToName(degreeSlug);

  let colleges: CollegeResult[] = [];
  let total = 0;
  let totalPages = 0;

  if (faDoc && degDoc) {
    // Find matching collegeprofile_ids via collegemaster
    const cmFilter: Record<string, unknown> = { functionalarea_id: faDoc.id, degree_id: degDoc.id };
    if (feesMax && !isNaN(parseInt(feesMax))) cmFilter.fees = { $lte: parseInt(feesMax) };
    let cpIds = [...new Set(
      (await db.collection("collegemaster").find(cmFilter).project({ collegeprofile_id: 1 }).toArray())
        .map((c) => c.collegeprofile_id)
    )];

    // City/state filter
    if (cityId && !isNaN(parseInt(cityId))) {
      const filtered = await db.collection("collegeprofile").find({ id: { $in: cpIds }, registeredAddressCityId: parseInt(cityId) }).project({ id: 1 }).toArray();
      cpIds = filtered.map((c) => c.id);
    }
    if (stateId && !isNaN(parseInt(stateId))) {
      const cityIds = (await db.collection("city").find({ state_id: parseInt(stateId) }).project({ id: 1 }).toArray()).map((c) => c.id);
      const filtered = await db.collection("collegeprofile").find({ id: { $in: cpIds }, registeredAddressCityId: { $in: cityIds } }).project({ id: 1 }).toArray();
      cpIds = filtered.map((c) => c.id);
    }

    total = cpIds.length;
    totalPages = Math.ceil(total / limit);

    const mongoSort: Record<string, 1 | -1> =
      sort === "ranking" ? { ranking: 1 } :
      sort === "newest" ? { created_at: -1 } :
      { rating: -1, totalRatingUser: -1 };

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

    colleges = cpDocs.map((row) => ({
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
      universityType: row.universityType || null, collegetype_id: row.collegetype_id ? parseInt(String(row.collegetype_id)) : null,
      estyear: row.estyear || null, verified: row.verified ?? 0,
      totalStudent: row.totalStudent ? parseInt(String(row.totalStudent)) : null,
      streams: [], min_fees: null, max_fees: null, avg_package: null,
    }));
  }

  // Filter options
  const [streamDocs, degreeDocs, cityDocs] = await Promise.all([
    db.collection("functionalarea").aggregate([
      { $lookup: { from: "collegemaster", localField: "id", foreignField: "functionalarea_id", as: "cm" } },
      { $project: { id: 1, name: 1, pageslug: 1, college_count: { $size: { $setUnion: ["$cm.collegeprofile_id", []] } } } },
      { $match: { name: { $exists: true, $ne: "" } } },
      { $sort: { college_count: -1 } },
      { $limit: 20 },
    ]).toArray(),
    faDoc ? db.collection("degree").aggregate([
      { $match: { functionalarea_id: faDoc.id, name: { $exists: true, $ne: "" } } },
      { $lookup: { from: "collegemaster", localField: "id", foreignField: "degree_id", as: "cm" } },
      { $project: { id: 1, name: 1, pageslug: 1, college_count: { $size: "$cm" } } },
      { $sort: { college_count: -1 } },
      { $limit: 50 },
    ]).toArray() : Promise.resolve([]),
    (faDoc && degDoc) ? (async () => {
      const cpIds2 = [...new Set(
        (await db.collection("collegemaster").find({ functionalarea_id: faDoc.id, degree_id: degDoc.id }).project({ collegeprofile_id: 1 }).toArray())
          .map((c) => c.collegeprofile_id)
      )];
      const cityIds2 = [...new Set(
        (await db.collection("collegeprofile").find({ id: { $in: cpIds2 } }).project({ registeredAddressCityId: 1 }).toArray())
          .map((c) => c.registeredAddressCityId).filter(Boolean)
      )];
      return db.collection("city").find({ id: { $in: cityIds2 }, name: { $exists: true, $ne: "" } }).sort({ name: 1 }).limit(80).project({ id: 1, name: 1 }).toArray();
    })() : Promise.resolve([]),
  ]);

  const streamOptions: FilterOption[] = streamDocs.map((r) => ({ id: r.id, name: r.name, slug: r.pageslug ?? r.name.toLowerCase().replace(/\s+/g, "-"), count: r.college_count }));
  const degreeOptions: FilterOption[] = degreeDocs.map((r) => ({ id: r.id, name: r.name, slug: r.pageslug ?? r.name.toLowerCase().replace(/\s+/g, "-"), count: r.college_count }));
  const cityOptions: FilterOption[] = cityDocs.map((r) => ({ id: r.id, name: r.name }));

  const pageSubtitle = `${total.toLocaleString()} ${degreeName} colleges in ${streamName}`;

  return (
    <SearchClient
      initialColleges={colleges}
      initialTotal={total}
      initialTotalPages={totalPages}
      streams={streamOptions}
      degrees={degreeOptions}
      cities={cityOptions}
      initQ=""
      initStream={streamSlug}
      initDegree={degreeSlug}
      initCityId={cityId}
      initStateId={stateId}
      initFeesMax={feesMax}
      initSort={sort}
      initPage={page}
      initType=""
      pageTitle={`${degreeName} Colleges — ${streamName}`}
      pageSubtitle={pageSubtitle}
    />
  );
}
