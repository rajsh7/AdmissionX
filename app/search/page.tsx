import { getDb } from "@/lib/db";
import SearchClient from "./SearchClient";
import type { CollegeResult } from "@/app/api/search/colleges/route";

interface FilterOption { id: string | number; name: string; slug?: string; count?: number; }
interface StreamRow { id: number; name: string; pageslug: string | null; college_count: number; }
interface DegreeRow { id: number; name: string; pageslug: string | null; }
interface CityRow { id: number; name: string; state_id: number | null; }
interface StateRow { id: number; name: string; country_id: number | null; }
interface CountryRow { id: number; name: string; }

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=600";

function buildImageUrl(raw: string | null): string {
  if (!raw || String(raw).trim().toLowerCase() === "null") return DEFAULT_IMAGE;
  const s = String(raw).trim();
  if (s.startsWith("http")) return s;
  return s.startsWith("/") ? s : `${IMAGE_BASE}${s}`;
}

function slugToName(slug: string): string {
  return slug.replace(/-\d+$/, "").split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export const dynamic = "force-dynamic";

const ALIASES: Record<string, string> = {
  "btech": "b.tech|be/b.tech|b tech", "b.tech": "b.tech|be/b.tech",
  "mtech": "m.tech|me/m.tech|m tech", "m.tech": "m.tech|me/m.tech",
  "bsc": "b.sc|bachelor of science", "b.sc": "b.sc|bachelor of science",
  "msc": "m.sc|master of science", "m.sc": "m.sc|master of science",
  "bca": "bca", "mca": "mca", "bba": "bba", "mba": "mba", "mbbs": "mbbs",
  "bcom": "b.com|bachelor of commerce", "b.com": "b.com|bachelor of commerce",
  "mcom": "m.com|master of commerce", "m.com": "m.com|master of commerce",
  "ba": "bachelor of arts|b\\.a\\.", "ma": "master of arts|m\\.a\\.",
  "llb": "ll.b|bachelor of laws", "llm": "ll.m|master of laws",
  "barch": "b.arch|bachelor of architecture",
  "phd": "ph.d|doctor of philosophy|m.phil", "pgdm": "pgdm",
  "bpharma": "b.pharma", "mpharma": "m.pharma",
  "bds": "bachelor of dental", "bed": "bachelor of education|b.ed",
  "med": "master of education|m.ed", "bhm": "bachelor of hotel management",
  "bfa": "bachelor of fine arts", "bdes": "bachelor of design", "diploma": "diploma",
  "engineering": "engineering|be/b.tech|b.tech",
  "medical": "mbbs|medical|bds|bams",
  "management": "mba|bba|management|pgdm",
  "law": "ll.b|ll.m|bachelor of laws|master of laws",
  "architecture": "b.arch|m.arch|architecture",
  "pharmacy": "b.pharma|m.pharma|pharmacy",
  "nursing": "nursing", "bams": "bams|ayurved",
};

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function fetchColleges(opts: {
  q: string; stream: string; degree: string; cityId: string; stateId: string;
  countryId: string; feesMax: string; sort: string; type: string; page: number; limit: number;
}): Promise<{ colleges: CollegeResult[]; total: number; totalPages: number }> {
  const { q, stream, degree, cityId, stateId, countryId, feesMax, sort, type, page, limit } = opts;
  const db = await getDb();

  const match: Record<string, unknown> = {};
  let queryDegreeIds: number[] = [];
  let queryStreamIds: number[] = [];

  if (q.length >= 2) {
    const qLower = q.toLowerCase().replace(/\s+/g, "");
    const aliasPattern = ALIASES[qLower] ?? q;
    const courseRegex = { $regex: aliasPattern, $options: "i" };

    const [matchedDegrees, matchedStreams] = await Promise.all([
      db.collection("degree").find({ name: courseRegex }).project({ id: 1 }).toArray(),
      db.collection("functionalarea").find({ name: courseRegex }).project({ id: 1 }).toArray(),
    ]);

    if (matchedDegrees.length > 0 || matchedStreams.length > 0) {
      queryDegreeIds = matchedDegrees.map((d: any) => d.id);
      queryStreamIds = matchedStreams.map((s: any) => s.id);
      const cmFilter: Record<string, unknown>[] = [];
      if (queryDegreeIds.length > 0) cmFilter.push({ degree_id: { $in: queryDegreeIds } });
      if (queryStreamIds.length > 0) cmFilter.push({ functionalarea_id: { $in: queryStreamIds } });
      const cpIds = await db.collection("collegemaster")
        .find(cmFilter.length === 1 ? cmFilter[0] : { $or: cmFilter }, { projection: { collegeprofile_id: 1 } })
        .limit(10000).toArray()
        .then((r) => [...new Set(r.map((x: any) => Number(x.collegeprofile_id)))]);
      match.$and = [...((match.$and as any[]) ?? []), { id: { $in: cpIds } }];
    } else {
      match.$or = [
        { slug: { $regex: escapeRegex(q), $options: "i" } },
        { registeredSortAddress: { $regex: escapeRegex(q), $options: "i" } },
        { college_name: { $regex: escapeRegex(q), $options: "i" } },
      ];
    }
  }

  if (type === "top") match.isShowOnTop = 1;
  else if (type === "university") match.isTopUniversity = 1;
  else if (type === "abroad") match.registeredAddressCountryId = { $ne: 1 };

  if (cityId) {
    const cityDoc = await db.collection("city").findOne({ id: Number(cityId) }, { projection: { name: 1 } });
    const cityNameForMatch = String(cityDoc?.name ?? "").trim();
    // Expand to all sibling city IDs (e.g. "Delhi" → New Delhi, Central Delhi, South Delhi…)
    // This prevents false positives from registeredFullAddress (e.g. "Mathura–Delhi Highway")
    const siblingCities = cityNameForMatch
      ? await db.collection("city")
          .find({ name: { $regex: escapeRegex(cityNameForMatch), $options: "i" } })
          .project({ id: 1 })
          .toArray()
      : [];
    const allCityIds = [...new Set([Number(cityId), ...siblingCities.map((c: any) => Number(c.id))])];
    const cityOrConditions: Record<string, unknown>[] = [
      { registeredAddressCityId: { $in: allCityIds } },
    ];
    if (cityNameForMatch) {
      cityOrConditions.push({ registeredSortAddress: { $regex: `^\\s*${escapeRegex(cityNameForMatch)}`, $options: "i" } });
      cityOrConditions.push({ campusSortAddress: { $regex: `^\\s*${escapeRegex(cityNameForMatch)}`, $options: "i" } });
    }
    match.$and = [...((match.$and as any[]) ?? []), { $or: cityOrConditions }];
  } else if (stateId) {
    const stateCities = await db.collection("city").find({ state_id: Number(stateId) }, { projection: { _id: 0, id: 1 } }).toArray();
    match.registeredAddressCityId = { $in: stateCities.map((c: any) => Number(c.id)) };
  } else if (countryId) {
    match.registeredAddressCountryId = Number(countryId);
  }

  const [faDoc, degDoc] = await Promise.all([
    stream ? db.collection("functionalarea").findOne({ pageslug: stream }, { projection: { _id: 1, id: 1 } }) : null,
    degree ? db.collection("degree").findOne({ pageslug: degree }, { projection: { _id: 1, id: 1 } }) : null,
  ]);

  const [streamIds, degreeIds] = await Promise.all([
    faDoc ? db.collection("collegemaster").find({ functionalarea_id: faDoc.id }, { projection: { collegeprofile_id: 1 } }).limit(5000).toArray()
      .then((r) => [...new Set(r.map((x: any) => x.collegeprofile_id))]) : null,
    degDoc ? db.collection("collegemaster").find({ degree_id: degDoc.id }, { projection: { collegeprofile_id: 1 } }).limit(5000).toArray()
      .then((r) => [...new Set(r.map((x: any) => x.collegeprofile_id))]) : null,
  ]);

  if (streamIds) match.$and = [...((match.$and as any[]) ?? []), { id: { $in: streamIds } }];
  if (degreeIds) {
    const existing = ((match.$and as any[]) ?? []).find((c: any) => c.id?.$in);
    if (existing) {
      existing.id.$in = existing.id.$in.filter((id: unknown) => (degreeIds as unknown[]).some(d => String(d) === String(id)));
    } else {
      match.$and = [...((match.$and as any[]) ?? []), { id: { $in: degreeIds } }];
    }
  }

  if (feesMax && !isNaN(Number(feesMax))) {
    const feeIds = await db.collection("collegemaster")
      .find({ fees: { $gte: 500, $lte: Number(feesMax) } }, { projection: { collegeprofile_id: 1 } })
      .limit(5000).toArray().then((r) => [...new Set(r.map((x: any) => Number(x.collegeprofile_id)))]);
    match.$and = [...((match.$and as any[]) ?? []), { id: { $in: feeIds } }];
  }

  const effectiveSort = (q.length >= 2 && (queryDegreeIds.length > 0 || queryStreamIds.length > 0) && sort === "rating") ? "fees" : sort;
  const isFeeSort = effectiveSort === "fees";

  const preSortStage: Record<string, 1 | -1> =
    effectiveSort === "ranking" ? { ranking: 1, rating: -1 }
    : effectiveSort === "newest" ? { created_at: -1 }
    : { rating: -1, totalRatingUser: -1 };

  const total = await db.collection("collegeprofile").countDocuments(match);

  const fetchLimit = isFeeSort ? Math.max(limit * 20, 240) : limit;
  const fetchSkip = isFeeSort ? 0 : (page - 1) * limit;

  const idRows = await db.collection("collegeprofile")
    .find(match).sort(preSortStage).skip(fetchSkip).limit(fetchLimit).project({ _id: 1 }).toArray();

  if (!idRows.length) return { colleges: [], total, totalPages: Math.ceil(total / limit) };

  const topIds = idRows.map((r: any) => r._id);

  const filteredCmExpr = (queryDegreeIds.length > 0 || queryStreamIds.length > 0)
    ? {
        $filter: {
          input: "$cm", as: "c",
          cond: {
            $and: [
              { $gte: ["$$c.fees", 500] },
              { $or: [
                ...(queryDegreeIds.length > 0 ? [{ $in: ["$$c.degree_id", queryDegreeIds] }] : []),
                ...(queryStreamIds.length > 0 ? [{ $in: ["$$c.functionalarea_id", queryStreamIds] }] : []),
              ]},
            ],
          },
        },
      }
    : { $filter: { input: "$cm", as: "c", cond: { $gte: ["$$c.fees", 500] } } };

  const dataRows = await db.collection("collegeprofile").aggregate([
    { $match: { _id: { $in: topIds } } },
    { $lookup: { from: "users", localField: "users_id", foreignField: "id", as: "user" } },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    { $lookup: { from: "city", localField: "registeredAddressCityId", foreignField: "id", as: "city" } },
    { $unwind: { path: "$city", preserveNullAndEmptyArrays: true } },
    { $lookup: { from: "collegemaster", localField: "id", foreignField: "collegeprofile_id", as: "cm" } },
    { $lookup: { from: "functionalarea", localField: "cm.functionalarea_id", foreignField: "id", as: "fa" } },
    { $addFields: { filtered_cm: filteredCmExpr } },
    { $project: {
      slug: 1, bannerimage: 1, rating: 1, totalRatingUser: 1, ranking: 1,
      isTopUniversity: 1, topUniversityRank: 1, universityType: 1, collegetype_id: 1,
      estyear: 1, verified: 1, totalStudent: 1, registeredSortAddress: 1,
      name: { $ifNull: [{ $trim: { input: "$user.firstname" } }, "$slug"] },
      city_name: "$city.name",
      state_id: "$city.state_id",
      streams: { $setUnion: ["$fa.name", []] },
      min_fees: { $min: "$filtered_cm.fees" },
      max_fees: { $max: "$filtered_cm.fees" },
    }},
    ...(isFeeSort ? [{ $match: { min_fees: { $gte: 500 } } }] : []),
    ...(isFeeSort ? [
      { $sort: { min_fees: 1 as const } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ] : []),
  ]).toArray();

  const colleges: CollegeResult[] = dataRows.map((row: any) => ({
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

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const sp = await searchParams;
  const getString = (key: string, fallback = "") =>
    typeof sp[key] === "string" ? (sp[key] as string) : fallback;

  const q = getString("q");
  const stream = getString("stream");
  const degree = getString("degree");
  const cityId = getString("city_id");
  const cityText = getString("city");
  const stateId = getString("state_id");
  const countryId = getString("country_id");
  const feesMax = getString("fees_max");
  const sort = getString("sort", "rating");
  const type = getString("type");
  const page = Math.max(1, parseInt(getString("page", "1")));
  const limit = 12;

  // Resolve ?city=text to a city ID — try exact match first, then partial
  let resolvedCityId = cityId;
  let resolvedCityName = "";
  if (!cityId && cityText) {
    const db = await getDb();
    const escaped = escapeRegex(cityText);
    const cityDoc =
      await db.collection("city").findOne(
        { name: { $regex: `^\\s*${escaped}\\s*$`, $options: "i" } },
        { projection: { id: 1, name: 1 } }
      ) ??
      await db.collection("city").findOne(
        { name: { $regex: escaped, $options: "i" } },
        { projection: { id: 1, name: 1 } }
      );
    if (cityDoc) {
      resolvedCityId = String(cityDoc.id);
      resolvedCityName = String(cityDoc.name).trim();
    } else {
      resolvedCityName = cityText;
    }
  }

  const [{ colleges, total, totalPages }, streamRows, degreeRows, cityRows, stateRows, countryRows] =
    await Promise.all([
      fetchColleges({ q, stream, degree, cityId: resolvedCityId, stateId, countryId, feesMax, sort, type, page, limit }),

      (async (): Promise<StreamRow[]> => {
        try {
          const db = await getDb();
          const rows = await db.collection("functionalarea")
            .find({ name: { $exists: true, $ne: "" } }).sort({ name: 1 }).limit(30)
            .project({ _id: 0, id: 1, name: 1, pageslug: 1 }).toArray();
          return rows.map((r: any) => ({ id: r.id, name: r.name, pageslug: r.pageslug, college_count: 0 }));
        } catch { return []; }
      })(),

      (async (): Promise<DegreeRow[]> => {
        try {
          const db = await getDb();
          const rows = await db.collection("degree")
            .find({ name: { $exists: true, $ne: "" }, isShowOnTop: 1 }).sort({ name: 1 }).limit(50)
            .project({ _id: 0, id: 1, name: 1, pageslug: 1 }).toArray();
          return rows.map((r: any) => ({ id: r.id, name: r.name, pageslug: r.pageslug }));
        } catch { return []; }
      })(),

      (async (): Promise<CityRow[]> => {
        try {
          const db = await getDb();
          const collegeCityIds = await db.collection("collegeprofile").distinct("registeredAddressCityId");
          const cities = await db.collection("city").find(
            { id: { $in: collegeCityIds.map(Number).filter(Boolean) } },
            { projection: { _id: 0, id: 1, name: 1, state_id: 1 } }
          ).sort({ name: 1 }).limit(500).toArray();
          return cities.map((c: any) => ({ id: c.id, name: String(c.name).trim(), state_id: c.state_id }));
        } catch { return []; }
      })(),

      (async (): Promise<StateRow[]> => {
        try {
          const db = await getDb();
          const collegeCityIds = await db.collection("collegeprofile").distinct("registeredAddressCityId");
          const cities = await db.collection("city").find(
            { id: { $in: collegeCityIds.map(Number).filter(Boolean) } },
            { projection: { _id: 0, state_id: 1 } }
          ).toArray();
          const stateIds = [...new Set(cities.map((c: any) => Number(c.state_id)).filter(Boolean))];
          const states = await db.collection("state").find(
            { id: { $in: stateIds } }, { projection: { _id: 0, id: 1, name: 1, country_id: 1 } }
          ).sort({ name: 1 }).toArray();
          return states.map((s: any) => ({ id: s.id, name: String(s.name).trim(), country_id: Number(s.country_id) }));
        } catch { return []; }
      })(),

      (async (): Promise<CountryRow[]> => {
        try {
          const db = await getDb();
          const countryIds = await db.collection("collegeprofile").distinct("registeredAddressCountryId");
          const countries = await db.collection("country").find(
            { id: { $in: countryIds.map(Number).filter(Boolean) } },
            { projection: { _id: 0, id: 1, name: 1 } }
          ).sort({ name: 1 }).toArray();
          return countries.map((c: any) => ({ id: c.id, name: String(c.name).trim() }));
        } catch { return []; }
      })(),
    ]);

  const streamOptions: FilterOption[] = streamRows.map((r) => ({
    id: r.id, name: r.name,
    slug: r.pageslug ?? r.name.toLowerCase().replace(/\s+/g, "-"),
    count: r.college_count,
  }));
  const degreeOptions: FilterOption[] = degreeRows.map((r) => ({
    id: r.id, name: r.name,
    slug: r.pageslug ?? r.name.toLowerCase().replace(/\s+/g, "-"),
  }));
  const cityOptions: FilterOption[] = cityRows.map((r) => ({
    id: r.id, name: r.name, slug: r.state_id ? String(r.state_id) : undefined,
  }));
  const stateOptions: FilterOption[] = stateRows.map((r) => ({
    id: r.id, name: r.name, slug: r.country_id ? String(r.country_id) : undefined,
  }));
  const countryOptions: FilterOption[] = countryRows.map((r) => ({ id: r.id, name: r.name }));

  let pageTitle = "Search Colleges";
  let pageSubtitle = "Find and filter from thousands of colleges across India";

  if (type === "top") {
    pageTitle = "Top Colleges in India";
    pageSubtitle = "Explore the highest-rated and most sought-after colleges";
  } else if (type === "university") {
    pageTitle = "Top Universities";
    pageSubtitle = "India's leading universities ranked by excellence";
  } else if (type === "abroad") {
    pageTitle = "Study Abroad Colleges";
    pageSubtitle = "Explore international colleges and universities worldwide";
  } else if (q) {
    const cityLabel = resolvedCityName || (cityText ?? "");
    pageTitle = cityLabel ? `"${q}" Colleges in ${cityLabel}` : `Search: "${q}"`;
    pageSubtitle = `${total.toLocaleString()} colleges match your search`;
  } else if (stream) {
    const streamName = streamOptions.find((s) => s.slug === stream)?.name ?? stream;
    pageTitle = `${streamName} Colleges`;
    pageSubtitle = `Browse all ${streamName} colleges in India`;
  }

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
      initQ={q}
      initStream={stream}
      initDegree={degree}
      initCityId={resolvedCityId}
      initStateId={stateId}
      initFeesMax={feesMax}
      initSort={sort}
      initPage={page}
      initType={type}
      pageTitle={pageTitle}
      pageSubtitle={pageSubtitle}
      heroImage="/Background-images/student-hero-bg.png"
    />
  );
}
