import { getDb } from "@/lib/db";
import Header from "@/app/components/Header";
import SearchClient from "@/app/search/SearchClient";
import type { CollegeResult } from "@/app/api/search/colleges/route";
import { unstable_cache } from "next/cache";
import ExploreCards from "@/app/components/ExploreCards";
import type { AdItem } from "@/app/components/AdsSection";

// Premium Components
import HeroSection from "./components/HeroSection";
import TopDestinations from "./components/TopDestinations";
import CostCalculator from "./components/CostCalculator";
import JourneySteps from "./components/JourneySteps";
import Footer from "@/app/components/Footer";

interface FilterOption {
  id: string | number;
  name: string;
  slug?: string;
}

interface CountryOption {
  id: number;
  name: string;
  college_count?: number;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildAdsFilter(positions: string[]) {
  return {
    ads_position: {
      $regex: `^\\s*(?:${positions.map(escapeRegex).join("|")})\\s*$`,
      $options: "i",
    },
    $or: [
      { isactive: 1 },
      { isactive: "1" },
      { isactive: " 1" },
      { isactive: /^\s*1\s*$/ },
    ],
  };
}

// ─── Fetch abroad colleges using MongoDB directly (same logic as API) ─────────

async function fetchAbroadColleges(opts: {
  q: string;
  stream: string;
  degree: string;
  countryId: string;
  feesMax: string;
  sort: string;
  page: number;
  limit: number;
}): Promise<{ colleges: CollegeResult[]; total: number; totalPages: number }> {
  const { q, stream, degree, countryId, feesMax, sort, page, limit } = opts;
  const offset = (page - 1) * limit;

  try {
    const db = await getDb();

    // Build match — same logic as /api/search/colleges
    const match: Record<string, unknown> = {};

    // Always filter: abroad = not India (99), must have a country set
    if (countryId && !isNaN(parseInt(countryId))) {
      match.registeredAddressCountryId = parseInt(countryId);
    } else {
      match.registeredAddressCountryId = { $exists: true, $ne: null, $nin: [99, 0] };
    }

    // Stream filter
    let streamIds: number[] = [];
    if (stream) {
      const faDoc = await db.collection("functionalarea").findOne({ pageslug: stream }, { projection: { id: 1 } });
      if (faDoc?.id) {
        const cmRows = await db.collection("collegemaster")
          .find({ functionalarea_id: faDoc.id }, { projection: { collegeprofile_id: 1 } })
          .limit(5000).toArray();
        streamIds = [...new Set(cmRows.map((c: any) => Number(c.collegeprofile_id)))];
      }
    }

    // Degree filter
    let degreeIds: number[] = [];
    if (degree) {
      const degDoc = await db.collection("degree").findOne({ pageslug: degree }, { projection: { id: 1 } });
      if (degDoc?.id) {
        const cmRows = await db.collection("collegemaster")
          .find({ degree_id: degDoc.id }, { projection: { collegeprofile_id: 1 } })
          .limit(5000).toArray();
        degreeIds = [...new Set(cmRows.map((c: any) => Number(c.collegeprofile_id)))];
      }
    }

    // Fees filter
    let feesFilterIds: number[] | null = null;
    if (feesMax && !isNaN(parseInt(feesMax))) {
      const cmRows = await db.collection("collegemaster")
        .find({ fees: { $gt: 0, $lte: parseInt(feesMax) } }, { projection: { collegeprofile_id: 1 } })
        .limit(5000).toArray();
      feesFilterIds = [...new Set(cmRows.map((c: any) => Number(c.collegeprofile_id)))];
    }

    // Intersect IDs
    let filteredIds: number[] | null = null;
    if (streamIds.length > 0) filteredIds = streamIds;
    if (degreeIds.length > 0) filteredIds = filteredIds ? filteredIds.filter(id => degreeIds.includes(id)) : degreeIds;
    if (feesFilterIds) filteredIds = filteredIds ? filteredIds.filter(id => feesFilterIds!.includes(id)) : feesFilterIds;

    if (filteredIds !== null) {
      match.id = { $in: filteredIds };
    }

    // Text search
    if (q.trim().length >= 2) {
      const qRegex = { $regex: q.trim(), $options: "i" };
      match.$or = [
        { slug: qRegex },
        { registeredSortAddress: qRegex },
      ] as any;
    }

    const sortStage: Record<string, 1 | -1> =
      sort === "name" ? { slug: 1 } :
      sort === "ranking" ? { ranking: 1 } :
      { rating: -1, totalRatingUser: -1 };

    const pipeline = [
      { $match: match },
      { $sort: sortStage },
    ];

    const [countResult, dataRows] = await Promise.all([
      db.collection("collegeprofile").aggregate([...pipeline, { $count: "total" }]).toArray(),
      db.collection("collegeprofile").aggregate([
        ...pipeline,
        { $skip: offset },
        { $limit: limit },
        { $lookup: { from: "users", localField: "users_id", foreignField: "id", as: "user" } },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        { $lookup: { from: "city", localField: "registeredAddressCityId", foreignField: "id", as: "city" } },
        { $unwind: { path: "$city", preserveNullAndEmptyArrays: true } },
        { $lookup: { from: "collegemaster", localField: "id", foreignField: "collegeprofile_id", as: "cm" } },
        { $lookup: { from: "functionalarea", localField: "cm.functionalarea_id", foreignField: "id", as: "fa" } },
        {
          $project: {
            id: 1, slug: 1, bannerimage: 1, rating: 1, totalRatingUser: 1, ranking: 1,
            isTopUniversity: 1, topUniversityRank: 1, universityType: 1, collegetype_id: 1,
            estyear: 1, verified: 1, totalStudent: 1, registeredSortAddress: 1,
            name: { $ifNull: [{ $trim: { input: "$user.firstname" } }, "$slug"] },
            city_name: "$city.name",
            streams: { $setUnion: ["$fa.name", []] },
            min_fees: { $min: { $filter: { input: "$cm.fees", as: "f", cond: { $gte: ["$$f", 1000] } } } },
            max_fees: { $max: { $filter: { input: "$cm.fees", as: "f", cond: { $gte: ["$$f", 1000] } } } },
          },
        },
      ]).toArray(),
    ]);

    const total = countResult[0]?.total ?? 0;

    const colleges: CollegeResult[] = dataRows.map((row: any) => {
      const rawName = row.name?.trim();
      const name = rawName && rawName !== row.slug
        ? rawName
        : row.slug?.replace(/-\d+$/, "").split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") ?? "College";
      const img = row.bannerimage;
      const image = img && img !== "null" ? (img.startsWith("http") ? img : `https://admin.admissionx.in/uploads/${img}`) : null;

      return {
        id: row.id,
        slug: row.slug,
        name,
        location: row.registeredSortAddress || row.city_name || "International",
        city_name: row.city_name ?? null,
        state_id: null,
        image,
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
      };
    });

    return { colleges, total, totalPages: Math.ceil(total / limit) };
  } catch (err) {
    console.error("[study-abroad/page.tsx fetchAbroadColleges]", err);
    return { colleges: [], total: 0, totalPages: 0 };
  }
}

// ─── Fetch filter options & countries ─────────────────────────────────────────

const fetchFilterOptions = unstable_cache(
  async () => {
    try {
      const db = await getDb();
      const [streams, degrees, countries] = await Promise.all([
        db.collection("functionalarea").find({}).sort({ isShowOnTop: -1, name: 1 }).limit(20).toArray(),
        db.collection("degree").find({ isShowOnTop: 1 }).sort({ name: 1 }).limit(50).toArray(),
        db.collection("collegeprofile")
          .aggregate([
            { $match: { registeredAddressCountryId: { $exists: true, $ne: null, $nin: [99, 0] } } },
            { $group: { _id: "$registeredAddressCountryId" } },
            { $lookup: { from: "country", localField: "_id", foreignField: "id", as: "country" } },
            { $unwind: "$country" },
            { $project: { _id: 0, id: "$country.id", name: "$country.name" } },
            { $sort: { name: 1 } },
          ]).toArray(),
      ]);
      return { streams, degrees, countries };
    } catch {
      return { streams: [], degrees: [], countries: [] };
    }
  },
  ["study-abroad-filters-v2"],
  { revalidate: 600 }
);

const fetchCountriesWithCount = unstable_cache(
  async (): Promise<CountryOption[]> => {
    try {
      const db = await getDb();
      const rows = await db.collection("collegeprofile").aggregate([
        { $match: { registeredAddressCountryId: { $exists: true, $ne: null, $nin: [99, 0] } } },
        { $group: { _id: "$registeredAddressCountryId", college_count: { $sum: 1 } } },
        { $lookup: { from: "country", localField: "_id", foreignField: "id", as: "country" } },
        { $unwind: "$country" },
        { $project: { _id: 0, id: "$country.id", name: "$country.name", college_count: 1 } },
        { $sort: { college_count: -1, name: 1 } },
      ]).toArray();
      return rows.map((r: any) => ({ id: r.id, name: String(r.name).trim(), college_count: r.college_count }));
    } catch {
      return [];
    }
  },
  ["study-abroad-countries-v2"],
  { revalidate: 600 }
);

const fetchStudyAbroadAds = unstable_cache(
  async (): Promise<AdItem[]> => {
    try {
      const db = await getDb();
      return await db
        .collection("ads_managements")
        .find(buildAdsFilter(["study_abroad", "study-abroad", "study abroad"]))
        .sort({ created_at: -1 })
        .limit(8)
        .project({ _id: 0, id: 1, title: 1, description: 1, img: 1, redirectto: 1 })
        .toArray() as AdItem[];
    } catch {
      return [];
    }
  },
  ["study-abroad-ads"],
  { revalidate: 300 }
);

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: import("next").Metadata = {
  title: "Study Abroad — International Colleges & Universities | AdmissionX",
  description:
    "Explore top international colleges and universities for study abroad. Find the best programs, fees, and admission details for studying outside India.",
};

interface StudyAbroadPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function StudyAbroadPage({ searchParams }: StudyAbroadPageProps) {
  const sp = await searchParams;

  const getString = (key: string, fallback = "") =>
    typeof sp[key] === "string" ? (sp[key] as string) : fallback;

  const q = getString("q");
  const stream = getString("stream");
  const degree = getString("degree");
  const countryId = getString("country_id");
  const feesMax = getString("fees_max");
  const sort = getString("sort", "rating");
  const page = Math.max(1, parseInt(getString("page", "1")));
  const view = getString("view");
  const showSearchResults = !!(q || stream || degree || countryId || feesMax || page > 1 || view === "all");

  if (showSearchResults) {
    const [{ colleges, total, totalPages }, { streams, degrees, countries }] = await Promise.all([
      fetchAbroadColleges({ q, stream, degree, countryId, feesMax, sort, page, limit: 12 }),
      fetchFilterOptions(),
    ]);

    const streamOptions: FilterOption[] = streams.map((r: any) => ({
      id: r.id,
      name: r.name,
      slug: r.pageslug ?? r.name.toLowerCase().replace(/\s+/g, "-"),
    }));

    const degreeOptions: FilterOption[] = degrees.map((r: any) => ({
      id: r.id,
      name: r.name,
      slug: r.pageslug ?? r.name.toLowerCase().replace(/\s+/g, "-"),
    }));

    const countryOptions: FilterOption[] = countries.map((r: any) => ({
      id: r.id,
      name: String(r.name).trim(),
    }));

    const selectedCountryName =
      countryOptions.find((c) => String(c.id) === countryId)?.name ?? "";

    const pageSubtitle = selectedCountryName
      ? `${total.toLocaleString()} international colleges and universities in ${selectedCountryName}`
      : `${total.toLocaleString()} international colleges and universities`;

    return (
      <SearchClient
        initialColleges={colleges}
        initialTotal={total}
        initialTotalPages={totalPages}
        streams={streamOptions}
        degrees={degreeOptions}
        cities={[]}
        countries={countryOptions}
        initQ={q}
        initStream={stream}
        initDegree={degree}
        initCityId=""
        initStateId=""
        initCountryId={countryId}
        initFeesMax={feesMax}
        initSort={sort}
        initPage={page}
        initType="abroad"
        pageTitle="Study Abroad Colleges"
        pageSubtitle={pageSubtitle}
        heroImage="/images/study-abroad-hero.jpg"
      />
    );
  }

  // ─── Landing page ──────────────────────────────────────────────────────────
  const [countryRows, ads] = await Promise.all([
    fetchCountriesWithCount(),
    fetchStudyAbroadAds(),
  ]);

  const countries = countryRows.sort((a, b) => a.name.localeCompare(b.name));

  const popularCountryIds = [230, 229, 38, 13];
  const quickFilters = popularCountryIds
    .map((id) => countries.find((c) => Number(c.id) === id))
    .filter(Boolean)
    .map((c) => ({ id: c!.id, name: c!.name }));

  return (
    <div className="min-h-screen bg-white flex flex-col relative font-[family-name:var(--font-outfit)]">
      <Header theme="dark" />

      <main className="flex-1">
        <HeroSection countries={countries} quickFilters={quickFilters} />
        <TopDestinations countries={countries} />
        <CostCalculator />
        <JourneySteps ads={ads} />
        <div className="home-page-shell pb-16">
          <ExploreCards />
        </div>
      </main>

      <Footer />
    </div>
  );
}
