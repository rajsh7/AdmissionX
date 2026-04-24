import { getDb } from "@/lib/db";
import HomepageClient from "./HomepageClient";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 75;

export default async function HomepageAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const q = (sp.q ?? "").trim();
  const offset = (page - 1) * PAGE_SIZE;

  const db = await getDb();

  const raw = await db.collection("homepage_settings").findOne({ key: "main" }) ?? {};
  const settings = JSON.parse(JSON.stringify(raw));

  // Build match stage for search
  const matchStage: Record<string, any> = {};
  if (q) {
    matchStage.$or = [
      { slug: { $regex: q, $options: "i" } },
    ];
  }

  const pipeline: any[] = [
    ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),
    { $sort: { isShowOnHome: -1, isTopUniversity: -1, rating: -1 } },
    { $project: {
      slug: 1, rating: 1,
      isShowOnHome: 1, isTopUniversity: 1, topUniversityRank: 1,
      registeredSortAddress: 1,
      users_id: 1,
      collegeName: 1,
      bannerimage: 1,
    }},
    { $lookup: {
      from: "users",
      localField: "users_id",
      foreignField: "id",
      as: "u",
      pipeline: [{ $project: { firstname: 1, _id: 0 } }],
    }},
    { $unwind: { path: "$u", preserveNullAndEmptyArrays: true } },
  ];

  // Count total
  const countResult = await db.collection("collegeprofile").aggregate([
    ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),
    { $count: "total" },
  ], { maxTimeMS: 15000 }).toArray();
  const total = countResult[0]?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const colleges = await db.collection("collegeprofile").aggregate([
    ...pipeline,
    { $skip: offset },
    { $limit: PAGE_SIZE },
  ], { maxTimeMS: 15000 }).toArray();

  const collegeList = colleges.map(c => {
    // Clean bannerimage: strip leading spaces, treat "NULL" as null
    let img: string | null = null;
    if (c.bannerimage) {
      const trimmed = String(c.bannerimage).trim();
      if (trimmed && trimmed.toUpperCase() !== "NULL") {
        img = trimmed;
      }
    }
    return {
      slug: String(c.slug ?? ""),
      name: String(c.u?.firstname ?? c.collegeName ?? c.slug ?? "Unnamed").trim(),
      location: String(c.registeredSortAddress ?? ""),
      bannerimage: img,
      isShowOnHome: c.isShowOnHome === 1 || c.isShowOnHome === true ? 1 : 0,
      isTopUniversity: c.isTopUniversity === 1 || c.isTopUniversity === true ? 1 : 0,
      topUniversityRank: c.topUniversityRank ? Number(c.topUniversityRank) : null,
      rating: parseFloat(String(c.rating ?? 0)) || 0,
    };
  });

  return (
    <HomepageClient
      settings={settings}
      colleges={collegeList}
      total={total}
      page={page}
      totalPages={totalPages}
      pageSize={PAGE_SIZE}
      q={q}
    />
  );
}
