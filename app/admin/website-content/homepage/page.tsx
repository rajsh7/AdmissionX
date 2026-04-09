import { getDb } from "@/lib/db";
import HomepageClient from "./HomepageClient";

export const dynamic = "force-dynamic";

export default async function HomepageAdminPage() {
  const db = await getDb();

  const raw = await db.collection("homepage_settings").findOne({ key: "main" }) ?? {};
  const settings = JSON.parse(JSON.stringify(raw));

  const colleges = await db.collection("collegeprofile")
    .aggregate([
      // Sort & limit BEFORE the $lookup so we only join 100 docs, not the whole collection
      { $sort: { isShowOnHome: -1, isTopUniversity: -1, rating: -1 } },
      { $limit: 100 },
      { $project: {
        slug: 1, rating: 1,
        isShowOnHome: 1, isTopUniversity: 1, topUniversityRank: 1,
        registeredSortAddress: 1,
        users_id: 1,
        collegeName: 1,
      }},
      { $lookup: {
        from: "users",
        localField: "users_id",
        foreignField: "id",
        as: "u",
        pipeline: [{ $project: { firstname: 1, _id: 0 } }],
      }},
      { $unwind: { path: "$u", preserveNullAndEmptyArrays: true } },
    ], { maxTimeMS: 15000 }).toArray();

  const collegeList = colleges.map(c => ({
    slug: String(c.slug ?? ""),
    name: String(c.u?.firstname ?? c.collegeName ?? c.slug ?? "Unnamed"),
    location: String(c.registeredSortAddress ?? ""),
    isShowOnHome: c.isShowOnHome === 1 || c.isShowOnHome === true ? 1 : 0,
    isTopUniversity: c.isTopUniversity === 1 || c.isTopUniversity === true ? 1 : 0,
    topUniversityRank: c.topUniversityRank ? Number(c.topUniversityRank) : null,
    rating: parseFloat(String(c.rating ?? 0)) || 0,
  }));

  return <HomepageClient settings={settings} colleges={collegeList} />;
}
