import pool from "@/lib/db";
import { getDb } from "@/lib/db";
import SearchClient from "./SearchClient";
import type { CollegeResult } from "@/app/api/search/colleges/route";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FilterOption {
  id: string | number;
  name: string;
  slug?: string;
  count?: number;
}

interface CollegeRow  {
  id: number;
  slug: string;
  name: string;
  location: string | null;
  city_name: string | null;
  state_id: number | null;
  image: string | null;
  rating: string | null;
  totalRatingUser: string | null;
  ranking: string | null;
  isTopUniversity: number;
  topUniversityRank: string | null;
  universityType: string | null;
  estyear: string | null;
  verified: number;
  totalStudent: string | null;
  streams_raw: string | null;
  min_fees: string | null;
  max_fees: string | null;
}

interface StreamRow  {
  id: number;
  name: string;
  pageslug: string | null;
  college_count: number;
}

interface DegreeRow  {
  id: number;
  name: string;
  pageslug: string | null;
}

interface CityRow  {
  id: number;
  name: string;
  state_id: number | null;
}

interface StateRow {
  id: number;
  name: string;
  country_id: number | null;
}

interface CountryRow {
  id: number;
  name: string;
}

interface CountRow  {
  total: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=600";

function buildImageUrl(raw: string | null): string {
  if (!raw) return DEFAULT_IMAGE;
  if (raw.startsWith("http")) return raw;
  if (raw.startsWith("/")) return raw;
  return `${IMAGE_BASE}${raw}`;
}

function slugToName(slug: string): string {
  return slug
    .replace(/-\d+$/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

async function safeQuery<T >(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[search/page.tsx safeQuery]", err);
    return [];
  }
}

function buildColleges(rows: CollegeRow[]): CollegeResult[] {
  return rows.map((row) => {
    const name =
      row.name && row.name !== row.slug
        ? row.name
        : slugToName(row.slug || "college");

    const streams = row.streams_raw
      ? row.streams_raw
          .split("|")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    return {
      id: row.id,
      slug: row.slug,
      name,
      location: row.location || row.city_name || "India",
      city_name: row.city_name,
      state_id: row.state_id,
      image: buildImageUrl(row.image),
      rating: parseFloat(String(row.rating)) || 0,
      totalRatingUser: parseInt(String(row.totalRatingUser)) || 0,
      ranking: row.ranking ? parseInt(String(row.ranking)) : null,
      isTopUniversity: row.isTopUniversity ?? 0,
      topUniversityRank: row.topUniversityRank
        ? parseInt(String(row.topUniversityRank))
        : null,
      universityType: row.universityType || null,
      estyear: row.estyear || null,
      verified: row.verified ?? 0,
      totalStudent: row.totalStudent
        ? parseInt(String(row.totalStudent))
        : null,
      streams,
      min_fees: row.min_fees ? parseInt(String(row.min_fees)) : null,
      max_fees: row.max_fees ? parseInt(String(row.max_fees)) : null,
      avg_package: null,
    };
  });
}

export const dynamic = 'force-dynamic';

// ─── Core DB fetch ────────────────────────────────────────────────────────────

async function fetchColleges(opts: {
  q: string;
  stream: string;
  degree: string;
  cityId: string;
  stateId: string;
  countryId: string;
  feesMax: string;
  sort: string;
  type: string;
  page: number;
  limit: number;
}): Promise<{ colleges: CollegeResult[]; total: number; totalPages: number }> {
  const { q, stream, degree, cityId, stateId, countryId, feesMax, sort, type, page, limit } = opts;
  const db = await getDb();

  const match: Record<string, unknown> = {};

  if (q.length >= 2) {
    match.$or = [
      { slug: { $regex: q, $options: "i" } },
      { registeredSortAddress: { $regex: q, $options: "i" } },
    ];
  }
  if (type === "top") match.isShowOnTop = 1;
  else if (type === "university") match.isTopUniversity = 1;
  else if (type === "abroad") match.registeredAddressCountryId = { $ne: 1 };

  if (cityId) match.registeredAddressCityId = Number(cityId);
  else if (stateId) {
    const stateCities = await db.collection("city").find({ state_id: Number(stateId) }, { projection: { _id: 0, id: 1 } }).toArray();
    match.registeredAddressCityId = { $in: stateCities.map((c: any) => Number(c.id)) };
  } else if (countryId) {
    match.registeredAddressCountryId = Number(countryId);
  }

  // Resolve stream + degree to numeric ids
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

  if (streamIds) match.id = { $in: streamIds };
  if (degreeIds) {
    const existing = (match.id as { $in: unknown[] } | undefined)?.$in;
    match.id = { $in: existing ? existing.filter((id) => (degreeIds as unknown[]).some(d => String(d) === String(id))) : degreeIds };
  }

  if (feesMax && !isNaN(Number(feesMax))) {
    const feeIds = await db.collection("collegemaster")
      .find({ fees: { $gt: 0, $lte: Number(feesMax) } }, { projection: { collegeprofile_id: 1 } })
      .limit(5000).toArray().then((r) => [...new Set(r.map((x: any) => x.collegeprofile_id))]);
    const existing = (match.id as { $in: unknown[] } | undefined)?.$in;
    match.id = { $in: existing ? existing.filter((id) => feeIds.some((f: unknown) => String(f) === String(id))) : feeIds };
  }

  const sortStage: Record<string, 1 | -1> =
    sort === "ranking" ? { ranking: 1, rating: -1 }
    : sort === "newest" ? { created_at: -1 }
    : { rating: -1, totalRatingUser: -1 };

  const [total, idRows] = await Promise.all([
    db.collection("collegeprofile").countDocuments(match),
    db.collection("collegeprofile").find(match).sort(sortStage).skip((page - 1) * limit).limit(limit).project({ _id: 1 }).toArray(),
  ]);

  if (!idRows.length) return { colleges: [], total, totalPages: Math.ceil(total / limit) };

  const topIds = idRows.map((r: any) => r._id);
  const dataRows = await db.collection("collegeprofile").aggregate([
    { $match: { _id: { $in: topIds } } },
    { $lookup: { from: "users", localField: "users_id", foreignField: "id", as: "user" } },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    { $lookup: { from: "city", localField: "registeredAddressCityId", foreignField: "id", as: "city" } },
    { $unwind: { path: "$city", preserveNullAndEmptyArrays: true } },
    { $lookup: { from: "collegemaster", localField: "id", foreignField: "collegeprofile_id", as: "cm" } },
    { $lookup: { from: "functionalarea", localField: "cm.functionalarea_id", foreignField: "id", as: "fa" } },
    { $project: {
      slug: 1, bannerimage: 1, rating: 1, totalRatingUser: 1, ranking: 1,
      isTopUniversity: 1, topUniversityRank: 1, universityType: 1, estyear: 1, verified: 1, totalStudent: 1,
      registeredSortAddress: 1,
      name: { $ifNull: [{ $trim: { input: "$user.firstname" } }, "$slug"] },
      city_name: "$city.name",
      state_id: "$city.state_id",
      streams: { $setUnion: ["$fa.name", []] },
      min_fees: { $min: { $filter: { input: "$cm.fees", as: "f", cond: { $gt: ["$$f", 0] } } } },
      max_fees: { $max: { $filter: { input: "$cm.fees", as: "f", cond: { $gt: ["$$f", 0] } } } },
    }},
  ]).toArray();

  const orderMap = new Map(topIds.map((id: any, i: number) => [String(id), i]));
  dataRows.sort((a: any, b: any) => (orderMap.get(String(a._id)) ?? 0) - (orderMap.get(String(b._id)) ?? 0));

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

// ─── Page component ───────────────────────────────────────────────────────────

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
  const stateId = getString("state_id");
  const countryId = getString("country_id");
  const feesMax = getString("fees_max");
  const sort = getString("sort", "rating");
  const type = getString("type");
  const page = Math.max(1, parseInt(getString("page", "1")));
  const limit = 12;

  // ── Parallel: initial college results + filter options ─────────────────────
  const [{ colleges, total, totalPages }, streamRows, degreeRows, cityRows, stateRows, countryRows] =
    await Promise.all([
      // 1. College results
      fetchColleges({
        q,
        stream,
        degree,
        cityId,
        stateId,
        countryId,
        feesMax,
        sort,
        type,
        page,
        limit,
      }),

      // 2. Streams with college counts
      (async (): Promise<StreamRow[]> => {
        try {
          const db = await getDb();
          const rows = await db.collection("functionalarea")
            .find({ name: { $exists: true, $ne: "" } })
            .sort({ name: 1 }).limit(30)
            .project({ _id: 0, id: 1, name: 1, pageslug: 1 })
            .toArray();
          return rows.map((r: any) => ({ id: r.id, name: r.name, pageslug: r.pageslug, college_count: 0 }));
        } catch { return []; }
      })(),

      // 3. Popular degrees
      (async (): Promise<DegreeRow[]> => {
        try {
          const db = await getDb();
          const rows = await db.collection("degree")
            .find({ name: { $exists: true, $ne: "" }, isShowOnTop: 1 })
            .sort({ name: 1 }).limit(50)
            .project({ _id: 0, id: 1, name: 1, pageslug: 1 })
            .toArray();
          return rows.map((r: any) => ({ id: r.id, name: r.name, pageslug: r.pageslug }));
        } catch { return []; }
      })(),

      // 4. Cities that have colleges — direct MongoDB
      (async (): Promise<CityRow[]> => {
        try {
          const db = await getDb();
          const collegeCityIds = await db.collection("collegeprofile").distinct("registeredAddressCityId");
          const numericIds = collegeCityIds.map(Number).filter(Boolean);
          const cities = await db.collection("city").find(
            { id: { $in: numericIds } },
            { projection: { _id: 0, id: 1, name: 1, state_id: 1 } }
          ).sort({ name: 1 }).limit(500).toArray();
          return cities.map((c: any) => ({ id: c.id, name: String(c.name).trim(), state_id: c.state_id })) as CityRow[];
        } catch { return []; }
      })(),

      // 5. States that have colleges — direct MongoDB
      (async (): Promise<StateRow[]> => {
        try {
          const db = await getDb();
          const collegeCityIds = await db.collection("collegeprofile").distinct("registeredAddressCityId");
          const numericCityIds = collegeCityIds.map(Number).filter(Boolean);
          const cities = await db.collection("city").find(
            { id: { $in: numericCityIds } },
            { projection: { _id: 0, state_id: 1 } }
          ).toArray();
          const stateIds = [...new Set(cities.map((c: any) => Number(c.state_id)).filter(Boolean))];
          const states = await db.collection("state").find(
            { id: { $in: stateIds } },
            { projection: { _id: 0, id: 1, name: 1, country_id: 1 } }
          ).sort({ name: 1 }).toArray();
          return states.map((s: any) => ({ id: s.id, name: String(s.name).trim(), country_id: Number(s.country_id) })) as StateRow[];
        } catch { return []; }
      })(),

      // 6. Countries that have colleges — direct MongoDB
      (async (): Promise<CountryRow[]> => {
        try {
          const db = await getDb();
          const countryIds = await db.collection("collegeprofile").distinct("registeredAddressCountryId");
          const numericIds = countryIds.map(Number).filter(Boolean);
          const countries = await db.collection("country").find(
            { id: { $in: numericIds } },
            { projection: { _id: 0, id: 1, name: 1 } }
          ).sort({ name: 1 }).toArray();
          return countries.map((c: any) => ({ id: c.id, name: String(c.name).trim() })) as CountryRow[];
        } catch { return []; }
      })(),
    ]);

  // ── Build filter option lists ──────────────────────────────────────────────
  const streamOptions: FilterOption[] = streamRows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.pageslug ?? r.name.toLowerCase().replace(/\s+/g, "-"),
    count: r.college_count,
  }));

  const degreeOptions: FilterOption[] = degreeRows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.pageslug ?? r.name.toLowerCase().replace(/\s+/g, "-"),
  }));

  const cityOptions: FilterOption[] = cityRows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.state_id ? String(r.state_id) : undefined, // slug = parent state_id
  }));

  const stateOptions: FilterOption[] = stateRows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.country_id ? String(r.country_id) : undefined, // slug = parent country_id
  }));

  const countryOptions: FilterOption[] = countryRows.map((r) => ({
    id: r.id,
    name: r.name,
  }));

  // ── Dynamic page title ─────────────────────────────────────────────────────
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
    pageTitle = `Search: "${q}"`;
    pageSubtitle = `${total.toLocaleString()} colleges match your search`;
  } else if (stream) {
    const streamName =
      streamOptions.find((s) => s.slug === stream)?.name ?? stream;
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
      initCityId={cityId}
      initStateId={stateId}
      initFeesMax={feesMax}
      initSort={sort}
      initPage={page}
      initType={type}
      pageTitle={pageTitle}
      pageSubtitle={pageSubtitle}
    />
  );
}




