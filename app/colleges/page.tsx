import pool from "@/lib/db";
import Header from "../components/Header";
import CollegeListItem from "../components/CollegeListItem";
import type { CollegeResult } from "@/app/api/search/colleges/route";

export const dynamic = "force-dynamic";

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=600";

function buildImageUrl(raw: string | null): string {
  if (!raw) return DEFAULT_IMAGE;
  if (raw.startsWith("http")) return raw;
  return `${IMAGE_BASE}${raw}`;
}

function slugToName(slug: string): string {
  return slug.replace(/-\d+$/, "").split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default async function CollegesPage() {
  const conn = await pool.getConnection();
  let colleges: CollegeResult[] = [];
  try {
    const [rows] = await conn.query(`
      SELECT
        cp.id,
        cp.slug,
        COALESCE(NULLIF(TRIM(u.firstname), ''), NULLIF(TRIM(cp.slug), ''), 'College') AS name,
        COALESCE(cp.registeredSortAddress, '') AS location,
        c.name AS city_name,
        c.state_id,
        cp.bannerimage AS image,
        COALESCE(cp.rating, 0) AS rating,
        COALESCE(cp.totalRatingUser, 0) AS totalRatingUser,
        cp.ranking,
        cp.isTopUniversity,
        cp.topUniversityRank,
        cp.universityType,
        cp.estyear,
        cp.verified,
        cp.totalStudent,
        GROUP_CONCAT(DISTINCT fa.name ORDER BY fa.name SEPARATOR '|') AS streams_raw,
        MIN(CASE WHEN cm.fees > 0 THEN cm.fees END) AS min_fees,
        MAX(CASE WHEN cm.fees > 0 THEN cm.fees END) AS max_fees
      FROM collegeprofile cp
      LEFT JOIN users u ON u.id = cp.users_id
      LEFT JOIN city c ON c.id = cp.registeredAddressCityId
      LEFT JOIN collegemaster cm ON cm.collegeprofile_id = cp.id
      LEFT JOIN functionalarea fa ON fa.id = cm.functionalarea_id
      GROUP BY cp.id, cp.slug, u.firstname, cp.registeredSortAddress, c.name, c.state_id,
               cp.bannerimage, cp.rating, cp.totalRatingUser, cp.ranking, cp.isTopUniversity,
               cp.topUniversityRank, cp.universityType, cp.estyear, cp.verified, cp.totalStudent
      ORDER BY cp.rating DESC, cp.totalRatingUser DESC
      LIMIT 20
    `);

    const dataRows = rows as any[];
    colleges = dataRows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name && row.name !== row.slug ? row.name : slugToName(row.slug || "college"),
      location: row.location || row.city_name || "India",
      city_name: row.city_name,
      state_id: row.state_id,
      image: buildImageUrl(row.image),
      rating: parseFloat(String(row.rating)) || 0,
      totalRatingUser: parseInt(String(row.totalRatingUser)) || 0,
      ranking: row.ranking ? parseInt(String(row.ranking)) : null,
      isTopUniversity: row.isTopUniversity ?? 0,
      topUniversityRank: row.topUniversityRank ? parseInt(String(row.topUniversityRank)) : null,
      universityType: row.universityType || null,
      estyear: row.estyear || null,
      verified: row.verified ?? 0,
      totalStudent: row.totalStudent ? parseInt(String(row.totalStudent)) : null,
      streams: row.streams_raw ? row.streams_raw.split("|").map((s: string) => s.trim()).filter(Boolean) : [],
      min_fees: row.min_fees ? parseInt(String(row.min_fees)) : null,
      max_fees: row.max_fees ? parseInt(String(row.max_fees)) : null,
    }));
  } catch (err) {
    console.error("Colleges page DB error:", err);
  } finally {
    conn.release();
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-display">
      <Header />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 mt-16">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Explore Colleges</h1>
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
    </div>
  );
}
