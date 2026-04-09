import { getDb } from "@/lib/db";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CollegeListItem from "../components/CollegeListItem";
import CollegeSearch from "./CollegeSearch";
import type { CollegeResult } from "@/app/api/search/colleges/route";

export const dynamic = "force-dynamic";

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=600";

function buildImageUrl(raw: string | null): string {
  if (!raw) return DEFAULT_IMAGE;
  if (raw.startsWith("http")) return raw;
  if (raw.startsWith("/")) return raw;
  return `${IMAGE_BASE}${raw}`;
}

function slugToName(slug: string): string {
  return slug.replace(/-\d+$/, "").split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default async function CollegesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const qRaw = params?.q;
  const qStr = Array.isArray(qRaw) ? qRaw[0] : (qRaw || "");
  const q = qStr.trim();
  const db = await getDb();

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

    return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-display">
      <Header />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 mt-16">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Explore Colleges</h1>
        <p className="text-slate-500 mb-6">Find the perfect institution to shape your future.</p>
        
        <CollegeSearch />

        {colleges.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">search_off</span>
            <h2 className="text-xl font-bold text-slate-700">No colleges found</h2>
            <p className="text-slate-500 mt-2">Try adjusting your database or seeding script.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {colleges.map((col, i) => (
              <CollegeListItem key={col.id} college={col} index={i} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}




