import { getDb } from "@/lib/db";
import { unstable_cache } from "next/cache";
import type { Metadata } from "next";
import SearchClient from "@/app/search/SearchClient";
import type { CollegeResult } from "@/app/api/search/colleges/route";

export const revalidate = 300;

interface FilterOption {
  id: string | number;
  name: string;
  slug?: string;
  count?: number;
}

function slugToName(slug: string): string {
  return slug.replace(/-\d+$/, "").split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function buildImageUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (raw.startsWith("http") || raw.startsWith("/")) return raw;
  // Legacy bare filenames from old PHP admin server
  return `https://admin.admissionx.in/uploads/${raw}`;
}

// -- Filter data ---------------------------------------------------------------

const getFilterData = unstable_cache(
  async () => {
    const db = await getDb();

    // Top stream IDs by course count
    const faCounts = await db.collection("collegemaster").aggregate([
      { $match: { functionalarea_id: { $ne: null } } },
      { $group: { _id: "$functionalarea_id", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 25 },
    ]).toArray();

    const faIds = faCounts.map((r) => r._id);

    const [streamRows, degreeRows, cityIdRows] = await Promise.all([
      faIds.length > 0
        ? db.collection("functionalarea")
          .find({ _id: { $in: faIds }, name: { $exists: true, $ne: "" } })
          .project({ _id: 1, name: 1, pageslug: 1 })
          .toArray()
        : Promise.resolve([]),

      db.collection("degree")
        .find({ name: { $exists: true, $ne: "" }, isShowOnTop: 1 })
        .sort({ name: 1 })
        .limit(50)
        .project({ _id: 1, name: 1, pageslug: 1 })
        .toArray(),

      db.collection("collegeprofile")
        .find({ isShowOnTop: 1, registeredAddressCityId: { $ne: null } })
        .limit(5000)
        .project({ registeredAddressCityId: 1 })
        .toArray(),
    ]);

    const countMap = new Map(faCounts.map((r) => [String(r._id), r.count]));
    const sortedStreamRows = [...streamRows].sort(
      (a, b) => (countMap.get(String(b._id)) ?? 0) - (countMap.get(String(a._id)) ?? 0)
    );

    const uniqueCityIds = [...new Set(cityIdRows.map((r) => r.registeredAddressCityId))].slice(0, 400);
    const cityRows = uniqueCityIds.length > 0
      ? await db.collection("city")
        .find({ _id: { $in: uniqueCityIds }, name: { $exists: true, $ne: "" } })
        .sort({ name: 1 })
        .limit(100)
        .project({ _id: 1, name: 1 })
        .toArray()
      : [];

    return { streamRows: sortedStreamRows, degreeRows, cityRows };
  },
  ["top-colleges-filters-mongo-v2"],
  { revalidate: 600 },
);

// -- Core fetch ----------------------------------------------------------------

async function fetchTopColleges(opts: {
  q: string; stream: string; degree: string; cityId: string;
  sort: string; page: number; limit: number;
}): Promise<{ colleges: CollegeResult[]; total: number; totalPages: number }> {
  const { q, stream, degree, cityId, sort, page, limit } = opts;
  const db = await getDb();

  const match: Record<string, unknown> = { isShowOnTop: 1 };

  if (q.length >= 2) {
    match.$or = [
      { slug: { $regex: q, $options: "i" } },
      { registeredSortAddress: { $regex: q, $options: "i" } },
    ];
  }

  if (cityId) match.registeredAddressCityId = isNaN(Number(cityId)) ? cityId : Number(cityId);

  // Resolve stream + degree filters in parallel
  const [faDoc, degDoc] = await Promise.all([
    stream ? db.collection("functionalarea").findOne({ pageslug: stream }, { projection: { _id: 1 } }) : null,
    degree ? db.collection("degree").findOne({ pageslug: degree }, { projection: { _id: 1 } }) : null,
  ]);

  // Resolve collegemaster IDs in parallel
  const [streamIds, degreeIds] = await Promise.all([
    faDoc ? db.collection("collegemaster").find({ functionalarea_id: faDoc._id }, { projection: { collegeprofile_id: 1 } }).limit(5000).toArray()
      .then((r) => [...new Set(r.map((x) => x.collegeprofile_id))]) : null,
    degDoc ? db.collection("collegemaster").find({ degree_id: degDoc._id }, { projection: { collegeprofile_id: 1 } }).limit(5000).toArray()
      .then((r) => [...new Set(r.map((x) => x.collegeprofile_id))]) : null,
  ]);

  if (streamIds) {
    match._id = { $in: streamIds };
  }
  if (degreeIds) {
    const existing = (match._id as { $in: unknown[] } | undefined)?.$in;
    match._id = { $in: existing ? existing.filter((id) => degreeIds.includes(id)) : degreeIds };
  }

  const sortStage: Record<string, 1 | -1> =
    sort === "ranking" ? { ranking: 1, rating: -1 }
      : sort === "newest" ? { created_at: -1 }
        : { rating: -1, totalRatingUser: -1 };

  const [total, idRows] = await Promise.all([
    db.collection("collegeprofile").countDocuments(match),
    db.collection("collegeprofile")
      .find(match)
      .sort(sortStage)
      .skip((page - 1) * limit)
      .limit(limit)
      .project({ _id: 1 })
      .toArray(),
  ]);

  if (!idRows.length) return { colleges: [], total, totalPages: Math.ceil(total / limit) };

  const topIds = idRows.map((r) => r._id);

  const dataRows = await db.collection("collegeprofile").aggregate([
    { $match: { _id: { $in: topIds } } },
    { $lookup: { from: "users", localField: "users_id", foreignField: "id", as: "user" } },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    { $lookup: { from: "city", localField: "registeredAddressCityId", foreignField: "id", as: "city" } },
    { $unwind: { path: "$city", preserveNullAndEmptyArrays: true } },
    { $lookup: { from: "collegemaster", localField: "id", foreignField: "collegeprofile_id", as: "cm" } },
    {
      $lookup: {
        from: "functionalarea",
        localField: "cm.functionalarea_id",
        foreignField: "id",
        as: "fa",
      },
    },
    {
      $project: {
        slug: 1, bannerimage: 1, rating: 1, totalRatingUser: 1, ranking: 1,
        isTopUniversity: 1, topUniversityRank: 1, universityType: 1, estyear: 1,
        verified: 1, totalStudent: 1, registeredSortAddress: 1,
        name: {
          $cond: [
            { $and: [{ $ne: ["$user.firstname", null] }, { $ne: [{ $trim: { input: "$user.firstname" } }, ""] }] },
            { $trim: { input: "$user.firstname" } },
            "$slug",
          ],
        },
        city_name: "$city.name",
        state_id: "$city.state_id",
        streams: { $setUnion: ["$fa.name", []] },
        min_fees: { $min: { $filter: { input: "$cm.fees", as: "f", cond: { $gt: ["$$f", 0] } } } },
        max_fees: { $max: { $filter: { input: "$cm.fees", as: "f", cond: { $gt: ["$$f", 0] } } } },
      },
    },
  ]).toArray();

  const orderMap = new Map(topIds.map((id, i) => [String(id), i]));
  dataRows.sort((a, b) => (orderMap.get(String(a._id)) ?? 0) - (orderMap.get(String(b._id)) ?? 0));

  const colleges: CollegeResult[] = dataRows.map((row) => ({
    id: String(row._id),
    slug: row.slug,
    name: row.name && row.name !== row.slug ? row.name : slugToName(row.slug || "college"),
    location: row.registeredSortAddress || row.city_name || "India",
    city_name: row.city_name ?? null,
    state_id: row.state_id ?? null,
    image: buildImageUrl(row.bannerimage),
    rating: parseFloat(String(row.rating)) || 0,
    totalRatingUser: parseInt(String(row.totalRatingUser)) || 0,
    ranking: row.ranking ? parseInt(String(row.ranking)) : null,
    isTopUniversity: row.isTopUniversity ?? 0,
    topUniversityRank: row.topUniversityRank ? parseInt(String(row.topUniversityRank)) : null,
    universityType: row.universityType ?? null,
    estyear: row.estyear ?? null,
    verified: row.verified ?? 0,
    totalStudent: row.totalStudent ? parseInt(String(row.totalStudent)) : null,
    streams: Array.isArray(row.streams) ? row.streams.filter(Boolean) : [],
    min_fees: row.min_fees ?? null,
    max_fees: row.max_fees ?? null,
  }));

  return { colleges, total, totalPages: Math.ceil(total / limit) };
}

const getCachedTopColleges = unstable_cache(
  fetchTopColleges,
  ["top-colleges-mongo-v2"],
  { revalidate: 300 },
);

// -- Page ----------------------------------------------------------------------

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: "Top Colleges in India 2024 | AdmissionX",
  description: "Explore India's top colleges ranked by rating, placement, and student reviews.",
};

export default async function TopCollegesPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const getString = (key: string, fallback = "") =>
    typeof sp[key] === "string" ? (sp[key] as string) : fallback;

  const q = getString("q");
  const stream = getString("stream");
  const degree = getString("degree");
  const cityId = getString("city_id");
  const stateId = getString("state_id");
  const feesMax = getString("fees_max");
  const sort = getString("sort", "rating");
  const page = Math.max(1, parseInt(getString("page", "1")));
  const limit = 12;

  const [{ colleges, total, totalPages }, { streamRows, degreeRows, cityRows }] =
    await Promise.all([
      getCachedTopColleges({ q, stream, degree, cityId, sort, page, limit }),
      getFilterData(),
    ]);

  const streamOptions: FilterOption[] = streamRows.map((r) => ({
    id: String(r._id), name: r.name,
    slug: r.pageslug ?? r.name.toLowerCase().replace(/\s+/g, "-"),
  }));

  const degreeOptions: FilterOption[] = degreeRows.map((r) => ({
    id: String(r._id), name: r.name,
    slug: r.pageslug ?? r.name.toLowerCase().replace(/\s+/g, "-"),
  }));

  const cityOptions: FilterOption[] = cityRows.map((r) => ({ id: String(r._id), name: r.name }));

  const streamName = streamOptions.find((s) => s.slug === stream)?.name ?? stream;
  const pageSubtitle = stream
    ? `${total.toLocaleString()} top ${streamName} colleges`
    : `${total.toLocaleString()} top-ranked colleges across India`;

  return (
    <SearchClient
      initialColleges={colleges}
      initialTotal={total}
      initialTotalPages={totalPages}
      streams={streamOptions}
      degrees={degreeOptions}
      cities={cityOptions}
      initQ=""
      initStream={stream}
      initDegree={degree}
      initCityId={cityId}
      initStateId={stateId}
      initFeesMax={feesMax}
      initSort={sort}
      initPage={page}
      initType="top"
      pageTitle="Top Colleges in India"
      pageSubtitle={pageSubtitle}
      gridCols={4}
      heroImage="/Background-images/student-hero-bg.png"
      heroRightImage="/images/2999ec4e5233aa8cb9dbf010e3c51149ae41f951.png"
      heroHeight="700px"
      heroObjectPosition="center"
      heroFit="cover"
      filterWidth="370px"
    />
  );
}
