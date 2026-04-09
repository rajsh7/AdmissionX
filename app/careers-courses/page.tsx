import { getDb } from "@/lib/db";
import type { Metadata } from "next";
import ListingSearchV4NoSSR from "@/app/components/ListingSearchV4NoSSR";
import type { CourseResult } from "@/app/api/search/courses/route";

export const metadata: Metadata = {
  title: "Career Courses — Find the Right Course for Your Future | AdmissionX",
  description:
    "Explore top career-oriented courses across engineering, medicine, management, law, arts and more. Get details on eligibility, job scope, and top colleges.",
};

function buildImageUrl(raw: string | null | undefined): string | null {
  if (!raw || !raw.trim()) return null;
  if (raw.startsWith("http") || raw.startsWith("/")) return raw;
  return `/uploads/${raw}`;
}

interface FilterOption {
  id: string | number;
  name: string;
  slug?: string;
  count?: number;
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CareerCoursesPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const getString = (key: string, fallback = "") =>
    typeof sp[key] === "string" ? (sp[key] as string) : fallback;

  const q = getString("q");
  const level = getString("level");
  const stream = getString("stream");
  const page = Math.max(1, parseInt(getString("page", "1")));
  const limit = 12;
  const offset = (page - 1) * limit;

  const db = await getDb();

  // Resolve level/stream slugs to integer ids
  let degreeId: number | null = null;
  if (level) {
    const d = await db.collection("degree").findOne({ pageslug: level }, { projection: { id: 1 } });
    degreeId = d?.id ?? null;
  }
  let faId: number | null = null;
  if (stream) {
    const fa = await db.collection("functionalarea").findOne({ pageslug: stream }, { projection: { id: 1 } });
    faId = fa?.id ?? null;
  }

  const filter: Record<string, unknown> = { pageslug: { $exists: true, $ne: "" } };
  if (q.length >= 2) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { pagedescription: { $regex: q, $options: "i" } },
    ];
  }
  if (degreeId !== null) filter.degree_id = degreeId;
  if (faId !== null) filter.functionalarea_id = faId;

  const [levelRows, streamRows, courseRows, total] = await Promise.all([
    db.collection("degree")
      .find({ name: { $exists: true, $ne: "" } })
      .sort({ isShowOnTop: -1, name: 1 })
      .project({ id: 1, name: 1, pageslug: 1 })
      .toArray(),
    db.collection("functionalarea")
      .find({ name: { $exists: true, $ne: "" } })
      .sort({ name: 1 })
      .project({ id: 1, name: 1, pageslug: 1 })
      .toArray(),
    db.collection("course").aggregate([
      { $match: filter },
      { $sort: { id: -1 } },
      { $skip: offset },
      { $limit: limit },
      { $lookup: { from: "degree", localField: "degree_id", foreignField: "id", as: "deg" } },
      { $lookup: { from: "functionalarea", localField: "functionalarea_id", foreignField: "id", as: "fa" } },
      { $unwind: { path: "$deg", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$fa", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          id: 1, name: 1, pageslug: 1, logoimage: 1, pagedescription: 1,
          level_name: "$deg.name", level_slug: "$deg.pageslug",
          stream_name: "$fa.name", stream_slug: "$fa.pageslug",
        },
      },
    ]).toArray(),
    db.collection("course").countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  const initialCourses: CourseResult[] = courseRows.map((row) => ({
    id: row.id,
    title: row.name,
    slug: row.pageslug,
    image: buildImageUrl(row.logoimage),
    description: row.pagedescription,
    level_name: row.level_name ?? null,
    level_slug: row.level_slug ?? null,
    stream_name: row.stream_name ?? null,
    stream_slug: row.stream_slug ?? null,
    bestChoiceOfCourse: null,
    jobsCareerOpportunityDesc: null,
  }));

  const levels: FilterOption[] = levelRows.map((r) => ({ id: r.id, name: r.name, slug: r.pageslug }));
  const streams: FilterOption[] = streamRows.map((r) => ({ id: r.id, name: r.name, slug: r.pageslug }));

  return (
    <ListingSearchV4NoSSR
      initialCourses={initialCourses}
      initialTotal={total}
      initialTotalPages={totalPages}
      levels={levels}
      streams={streams}
      initQ={q}
      initLevel={level}
      initStream={stream}
      initPage={page}
      heroImage="/Background-images/student-hero-bg.png"
      heroRightImage="/images/2999ec4e5233aa8cb9dbf010e3c51149ae41f951.png"
      heroHeight="700px"
      heroObjectPosition="center"
      heroFit="cover"
    />
  );
}




