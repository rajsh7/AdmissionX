import { getDb } from "@/lib/db";
import { unstable_cache } from "next/cache";
import type { Metadata } from "next";
import SearchClient from "@/app/search/SearchClient";
import type { CollegeResult } from "@/app/api/search/colleges/route";

export const dynamic = 'force-dynamic';
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
  if (!raw || String(raw).trim().toLowerCase() === "null") return null;
  const s = String(raw).trim();
  if (s.startsWith("http")) return s;
  return s.startsWith("/") ? s : `https://admin.admissionx.in/uploads/${s}`;
}

// ── Filter data ───────────────────────────────────────────────────────────────

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
        .project({ registeredAddressCityId: 1, registeredAddressCountryId: 1 })
        .toArray(),
    ]);

    const countMap = new Map(faCounts.map((r) => [String(r._id), r.count]));
    const sortedStreamRows = [...streamRows].sort(
      (a, b) => (countMap.get(String(b._id)) ?? 0) - (countMap.get(String(a._id)) ?? 0)
    );

    const uniqueCityIds = [...new Set(cityIdRows.map((r) => Number(r.registeredAddressCityId)).filter(Boolean))].slice(0, 400);
    const uniqueCountryIds = [...new Set(cityIdRows.map((r: any) => Number(r.registeredAddressCountryId)).filter(Boolean))];

    const [cityRows, countryRows] = await Promise.all([
      uniqueCityIds.length > 0
        ? db.collection("city")
          .find({ id: { $in: uniqueCityIds } })
          .sort({ name: 1 }).limit(500)
          .project({ _id: 0, id: 1, name: 1, state_id: 1 })
          .toArray()
        : Promise.resolve([]),
      uniqueCountryIds.length > 0
        ? db.collection("country")
          .find({ id: { $in: uniqueCountryIds } })
          .sort({ name: 1 })
          .project({ _id: 0, id: 1, name: 1 })
          .toArray()
        : Promise.resolve([]),
    ]);

    const uniqueStateIds = [...new Set(cityRows.map((c: any) => Number(c.state_id)).filter(Boolean))];
    const stateRows = uniqueStateIds.length > 0
      ? await db.collection("state")
        .find({ id: { $in: uniqueStateIds } })
        .sort({ name: 1 })
        .project({ _id: 0, id: 1, name: 1, country_id: 1 })
        .toArray()
      : [];

    return { streamRows: sortedStreamRows, degreeRows, cityRows, stateRows, countryRows };
  },
  ["top-colleges-filters-mongo-v4"],
  { revalidate: 600 },
);

// collegetype_id: 1=Private College, 2=Government College, 3=Government University, 4=Private University
const OWNERSHIP_MAP: Record<string, number[]> = {
  "Private College":       [1],
  "Government College":    [2],
  "Government University": [3],
  "Private University":    [4],
};

// ── Core fetch ────────────────────────────────────────────────────────────────

async function fetchTopColleges(opts: {
  q: string; stream: string; degree: string; cityId: string; stateId: string; countryId: string;
  feesMax: string; feesRanges: string[]; ratingRanges: string[]; ownerships: string[]; sort: string; page: number; limit: number;
}): Promise<{ colleges: CollegeResult[]; total: number; totalPages: number }> {
  const { q, stream, degree, cityId, stateId, countryId, feesMax, feesRanges, ratingRanges, ownerships, sort, page, limit } = opts;
  const db = await getDb();

  const match: Record<string, unknown> = { isShowOnTop: 1 };

  // ── Natural language query parsing ───────────────────────────────────────
  // Split "Btech in Lucknow" → course part + city part
  const STOP_WORDS = new Set(["in", "at", "near", "for", "of", "the", "and", "college", "colleges", "university", "universities"]);
  const COURSE_ALIASES: Record<string, string> = {
    "btech": "b.tech|be/b.tech|b tech", "b.tech": "b.tech|be/b.tech",
    "mtech": "m.tech|me/m.tech|m tech", "mba": "mba", "bba": "bba",
    "mbbs": "mbbs", "bca": "bca", "mca": "mca",
    "bcom": "b.com|bachelor of commerce", "mcom": "m.com|master of commerce",
    "engineering": "engineering|be/b.tech|b.tech",
    "medical": "mbbs|medical|bds|bams",
    "management": "mba|bba|management|pgdm",
  };

  let resolvedCityIds: number[] | null = null;
  let courseQuery = "";
  let nameQuery = "";

  if (q.length >= 2) {
    const words = q.split(/\s+/).filter(Boolean);
    const cityWords: string[] = [];
    const courseWords: string[] = [];
    const nameWords: string[] = [];

    // Try to match each word (or pair) against city names
    const allCityDocs = await db.collection("city")
      .find({ name: { $regex: words.filter(w => !STOP_WORDS.has(w.toLowerCase())).join("|"), $options: "i" } })
      .project({ id: 1, name: 1 }).limit(50).toArray();

    const cityNameMap = new Map(allCityDocs.map((c: any) => [c.name.trim().toLowerCase(), c.id]));

    for (const word of words) {
      const wl = word.toLowerCase();
      if (STOP_WORDS.has(wl)) continue;
      if (COURSE_ALIASES[wl] || Object.keys(COURSE_ALIASES).some(k => wl.includes(k))) {
        courseWords.push(wl);
      } else if ([...cityNameMap.keys()].some(cn => cn.includes(wl) || wl.includes(cn))) {
        cityWords.push(wl);
      } else {
        nameWords.push(word);
      }
    }

    // Resolve city IDs from matched city words
    if (cityWords.length > 0) {
      const cityRegex = cityWords.join("|");
      const matchedCities = await db.collection("city")
        .find({ name: { $regex: cityRegex, $options: "i" } })
        .project({ id: 1 }).toArray();
      if (matchedCities.length > 0) {
        resolvedCityIds = matchedCities.map((c: any) => Number(c.id));
      }
    }

    courseQuery = courseWords.join(" ");
    nameQuery = nameWords.join(" ");
  }

  // Apply city filter from query (overrides explicit cityId only if not already set)
  if (resolvedCityIds && !cityId && !stateId && !countryId) {
    match.registeredAddressCityId = { $in: resolvedCityIds };
  }

  if (courseQuery.length >= 2 || nameQuery.length >= 2 || (q.length >= 2 && !resolvedCityIds)) {
    const effectiveQ = courseQuery || nameQuery || q;
    const qLower = effectiveQ.toLowerCase().replace(/\s+/g, "");
    const aliasPattern = COURSE_ALIASES[qLower] ?? effectiveQ;
    const courseRegex = { $regex: aliasPattern, $options: "i" };

    const [matchedDegrees, matchedStreams] = await Promise.all([
      db.collection("degree").find({ name: courseRegex }).project({ id: 1 }).toArray(),
      db.collection("functionalarea").find({ name: courseRegex }).project({ id: 1 }).toArray(),
    ]);

    if (matchedDegrees.length > 0 || matchedStreams.length > 0) {
      const cmFilter: Record<string, unknown>[] = [];
      if (matchedDegrees.length > 0) cmFilter.push({ degree_id: { $in: matchedDegrees.map((d: any) => d.id) } });
      if (matchedStreams.length > 0) cmFilter.push({ functionalarea_id: { $in: matchedStreams.map((s: any) => s.id) } });
      const cpIds = await db.collection("collegemaster")
        .find(cmFilter.length === 1 ? cmFilter[0] : { $or: cmFilter }, { projection: { collegeprofile_id: 1 } })
        .limit(10000).toArray()
        .then((r) => [...new Set(r.map((x: any) => Number(x.collegeprofile_id)))]);
      match.id = { $in: cpIds };
    } else if (nameQuery.length >= 2) {
      match.$or = [
        { slug: { $regex: nameQuery, $options: "i" } },
        { registeredSortAddress: { $regex: nameQuery, $options: "i" } },
      ];
    } else if (!resolvedCityIds) {
      // fallback: search by full q in name/address
      match.$or = [
        { slug: { $regex: q, $options: "i" } },
        { registeredSortAddress: { $regex: q, $options: "i" } },
      ];
    }
  }

  if (cityId) {
    match.registeredAddressCityId = Number(cityId);
  } else if (resolvedCityIds && !stateId && !countryId) {
    // already applied above from query parsing
  } else if (stateId) {
    const stateCities = await db.collection("city").find({ state_id: Number(stateId) }, { projection: { _id: 0, id: 1 } }).toArray();
    match.registeredAddressCityId = { $in: stateCities.map((c: any) => Number(c.id)) };
  } else if (countryId) {
    match.registeredAddressCountryId = Number(countryId);
  }

  const feeConditions = [];
  if (feesMax && !isNaN(Number(feesMax))) {
    feeConditions.push({ fees: { $gt: 0, $lte: Number(feesMax) } });
  }
  if (feesRanges && feesRanges.length > 0) {
    for (const rangeStr of feesRanges) {
      const [minStr, maxStr] = rangeStr.split("-");
      const min = parseInt(minStr) || 0;
      const max = parseInt(maxStr) || 999999999;
      feeConditions.push({ fees: { $gt: min, $lte: max } });
    }
  }
  if (feeConditions.length > 0) {
    const feeIds = await db.collection("collegemaster")
      .find({ $or: feeConditions }, { projection: { collegeprofile_id: 1 } })
      .limit(5000).toArray().then((r) => [...new Set(r.map((x) => x.collegeprofile_id))]);
    const existing = (match.id as { $in: unknown[] } | undefined)?.$in;
    match.id = { $in: existing ? existing.filter((id) => feeIds.includes(id)) : feeIds };
  }

  // Resolve stream + degree filters in parallel
  const [faDoc, degDoc] = await Promise.all([
    stream ? db.collection("functionalarea").findOne({ pageslug: stream }, { projection: { _id: 1, id: 1 } }) : null,
    degree ? db.collection("degree").findOne({ pageslug: degree }, { projection: { _id: 1, id: 1 } }) : null,
  ]);

  // Resolve collegemaster IDs in parallel
  const [streamIds, degreeIds] = await Promise.all([
    faDoc ? db.collection("collegemaster").find({ functionalarea_id: faDoc.id }, { projection: { collegeprofile_id: 1 } }).limit(5000).toArray()
      .then((r) => [...new Set(r.map((x) => x.collegeprofile_id))]) : null,
    degDoc ? db.collection("collegemaster").find({ degree_id: degDoc.id }, { projection: { collegeprofile_id: 1 } }).limit(5000).toArray()
      .then((r) => [...new Set(r.map((x) => x.collegeprofile_id))]) : null,
  ]);

  if (streamIds) {
    match.id = { $in: streamIds };
  }
  if (degreeIds) {
    const existing = (match.id as { $in: unknown[] } | undefined)?.$in;
    match.id = { $in: existing ? existing.filter((id) => degreeIds.includes(id)) : degreeIds };
  }

  if (ownerships && ownerships.length > 0) {
    const typeIds = ownerships.flatMap((o) => OWNERSHIP_MAP[o] ?? []);
    if (typeIds.length > 0) match.collegetype_id = { $in: typeIds };
  }

  if (ratingRanges && ratingRanges.length > 0) {
    const ratingOr = ratingRanges.map(r => {
      const [min, max] = r.split("-");
      return { rating: { $gt: parseFloat(min), $lte: parseFloat(max) } };
    });
    match.$or = ratingOr;
  }

  // For fees sorting, aggregate with computed min/max fees first, then sort+paginate
  if (sort === "fees" || sort === "fees_high") {
    const feesPipeline = [
      { $match: match },
      { $lookup: { from: "collegemaster", localField: "id", foreignField: "collegeprofile_id", as: "cm" } },
      {
        $addFields: {
          min_fees: { $min: { $filter: { input: "$cm.fees", as: "f", cond: { $gte: ["$$f", 1000] } } } },
          max_fees: { $max: { $filter: { input: "$cm.fees", as: "f", cond: { $gte: ["$$f", 1000] } } } },
        },
      },
      { $match: sort === "fees" ? { min_fees: { $ne: null, $gte: 1000 } } : { max_fees: { $ne: null, $gte: 1000 } } },
      { $sort: sort === "fees" ? { min_fees: 1 as const } : { max_fees: -1 as const } },
    ];

    const [countResult, feesAgg] = await Promise.all([
      db.collection("collegeprofile").aggregate([...feesPipeline, { $count: "total" }]).toArray(),
      db.collection("collegeprofile").aggregate([
        ...feesPipeline,
        { $skip: (page - 1) * limit },
        { $limit: limit },
        { $lookup: { from: "users", localField: "users_id", foreignField: "id", as: "user" } },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        { $lookup: { from: "city", localField: "registeredAddressCityId", foreignField: "id", as: "city" } },
        { $unwind: { path: "$city", preserveNullAndEmptyArrays: true } },
        { $lookup: { from: "functionalarea", localField: "cm.functionalarea_id", foreignField: "id", as: "fa" } },
        {
          $project: {
            slug: 1, bannerimage: 1, rating: 1, totalRatingUser: 1, ranking: 1,
            isTopUniversity: 1, topUniversityRank: 1, universityType: 1, collegetype_id: 1, estyear: 1,
            verified: 1, totalStudent: 1, registeredSortAddress: 1, min_fees: 1, max_fees: 1,
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
          },
        },
      ]).toArray(),
    ]);

    const total = countResult[0]?.total ?? 0;
    const colleges: CollegeResult[] = feesAgg.map((row) => ({
      id: String(row._id), slug: row.slug,
      name: row.name && row.name !== row.slug ? row.name : slugToName(row.slug || "college"),
      location: row.registeredSortAddress || row.city_name || "India",
      city_name: row.city_name ?? null, state_id: row.state_id ?? null,
      image: buildImageUrl(row.bannerimage),
      rating: parseFloat(String(row.rating)) || 0,
      totalRatingUser: parseInt(String(row.totalRatingUser)) || 0,
      ranking: row.ranking ? parseInt(String(row.ranking)) : null,
      isTopUniversity: row.isTopUniversity ?? 0,
      topUniversityRank: row.topUniversityRank ? parseInt(String(row.topUniversityRank)) : null,
      universityType: row.universityType ?? null,
      collegetype_id: row.collegetype_id ? parseInt(String(row.collegetype_id)) : null,
      estyear: row.estyear ?? null, verified: row.verified ?? 0,
      totalStudent: row.totalStudent ? parseInt(String(row.totalStudent)) : null,
      streams: Array.isArray(row.streams) ? row.streams.filter(Boolean) : [],
      min_fees: row.min_fees ?? null, max_fees: row.max_fees ?? null, avg_package: null,
    }));
    return { colleges, total, totalPages: Math.ceil(total / limit) };
  }

  const sortStage: Record<string, 1 | -1> = { rating: -1, totalRatingUser: -1 };

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
        isTopUniversity: 1, topUniversityRank: 1, universityType: 1, collegetype_id: 1, estyear: 1,
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
        min_fees: { $min: { $filter: { input: "$cm.fees", as: "f", cond: { $gte: ["$$f", 1000] } } } },
        max_fees: { $max: { $filter: { input: "$cm.fees", as: "f", cond: { $gte: ["$$f", 1000] } } } },
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
    collegetype_id: row.collegetype_id ? parseInt(String(row.collegetype_id)) : null,
    estyear: row.estyear ?? null,
    verified: row.verified ?? 0,
    totalStudent: row.totalStudent ? parseInt(String(row.totalStudent)) : null,
    streams: Array.isArray(row.streams) ? row.streams.filter(Boolean) : [],
    min_fees: row.min_fees ?? null,
    max_fees: row.max_fees ?? null,
    avg_package: null,
  }));

  return { colleges, total, totalPages: Math.ceil(total / limit) };
}

const getCachedTopColleges = unstable_cache(
  fetchTopColleges,
  ["top-colleges-mongo-v6"],
  { revalidate: 300 },
);

// ── Page ──────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: "Top Colleges in India 2026 | AdmissionX",
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
  const countryId = getString("country_id");
  const feesMax = getString("fees_max");
  const feesRanges = getString("fees_ranges") ? getString("fees_ranges").split(",") : [];
  const ratingRanges = getString("rating_ranges") ? getString("rating_ranges").split(",") : [];
  const ownerships = getString("ownerships") ? getString("ownerships").split(",") : [];
  const sort = getString("sort", "rating");
  const page = Math.max(1, parseInt(getString("page", "1")));
  const limit = 12;

  const [{ colleges, total, totalPages }, { streamRows, degreeRows, cityRows, stateRows, countryRows }] =
    await Promise.all([
      fetchTopColleges({ q, stream, degree, cityId, stateId, countryId, feesMax, feesRanges, ratingRanges, ownerships, sort, page, limit }),
      getFilterData(),
    ]);

  const streamOptions: FilterOption[] = streamRows.map((r) => ({
    id: String(r._id), name: String(r.name).trim(),
    slug: r.pageslug ? String(r.pageslug).trim() : String(r.name).trim().toLowerCase().replace(/\s+/g, "-"),
  }));

  const degreeOptions: FilterOption[] = degreeRows.map((r) => ({
    id: String(r._id), name: String(r.name).trim(),
    slug: r.pageslug ? String(r.pageslug).trim() : String(r.name).trim().toLowerCase().replace(/\s+/g, "-"),
  }));

  const cityOptions: FilterOption[] = cityRows.map((r: any) => ({
    id: r.id, name: String(r.name).trim(),
    slug: r.state_id ? String(r.state_id) : undefined,
  }));

  const stateOptions: FilterOption[] = (stateRows ?? []).map((r: any) => ({
    id: r.id, name: String(r.name).trim(),
    slug: r.country_id ? String(Number(r.country_id)) : undefined,
  }));

  const countryOptions: FilterOption[] = (countryRows ?? []).map((r: any) => ({
    id: r.id, name: String(r.name).trim(),
  }));

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
      states={stateOptions}
      countries={countryOptions}
      initQ=""
      initStream={stream}
      initDegree={degree}
      initCityId={cityId}
      initStateId={stateId}
      initFeesMax={feesMax}
      initSort={sort}
      initPage={page}
      initType="top"
      pageTitle="Top Colleges in India 2026"
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


