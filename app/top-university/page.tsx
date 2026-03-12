import pool from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { RowDataPacket } from "mysql2";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export const metadata = {
  title: "Top Universities in India | AdmissionX",
  description: "Explore top-ranked universities in India. Compare rankings, courses, fees, placements and admission details.",
};

export const revalidate = 300;

interface UniversityRow extends RowDataPacket {
  id: number;
  slug: string;
  name: string | null;
  location: string;
  bannerimage: string | null;
  rating: string | null;
  ranking: number | null;
  isTopUniversity: number;
  topUniversityRank: number | null;
}

export default async function TopUniversityPage() {
  let universities: UniversityRow[] = [];

  try {
    const [rows] = await pool.query(`
      SELECT
        cp.id,
        cp.slug,
        COALESCE(NULLIF(TRIM(u.firstname), ''), cp.slug) AS name,
        COALESCE(cp.registeredSortAddress, '') AS location,
        cp.bannerimage,
        cp.rating,
        cp.ranking,
        cp.isTopUniversity,
        cp.topUniversityRank
      FROM collegeprofile cp
      LEFT JOIN users u ON u.id = cp.users_id
      WHERE cp.isTopUniversity = 1
      ORDER BY cp.topUniversityRank ASC, cp.ranking ASC
      LIMIT 50
    `);
    universities = rows as UniversityRow[];
  } catch (err) {
    console.error("[top-university]", err);
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      <div className="bg-neutral-900 pt-24 pb-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-neutral-300">Top Universities</span>
          </nav>

          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                <span className="material-symbols-outlined text-[13px]">emoji_events</span>
                Top Ranked
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
              Top <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Universities</span> in India
            </h1>
            <p className="text-neutral-400 text-base leading-relaxed mb-8">
              Discover India's leading universities ranked by academic excellence, placements, infrastructure and student satisfaction.
            </p>

            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
              <span className="text-white font-black text-lg">{universities.length}</span>
              <span className="text-neutral-500 text-sm">Top Universities</span>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        {universities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-3xl bg-neutral-100 flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-[36px] text-neutral-300">school</span>
            </div>
            <h2 className="text-lg font-black text-neutral-700 mb-2">No universities found</h2>
            <p className="text-sm text-neutral-400 max-w-sm">Top universities data is being updated.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {universities.map((uni, idx) => {
              const name = uni.name && uni.name !== uni.slug ? uni.name : uni.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
              const imgUrl = uni.bannerimage ? `https://admin.admissionx.in/uploads/${uni.bannerimage}` : 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600';
              const rank = uni.topUniversityRank || uni.ranking || idx + 1;

              return (
                <Link key={uni.id} href={`/university/${uni.slug}`} className="group relative bg-white rounded-2xl border border-neutral-100 hover:border-amber-200 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 overflow-hidden">
                  <div className="absolute top-3 left-3 z-10 w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-sm shadow-lg">
                    #{rank}
                  </div>

                  <div className="relative h-40 bg-neutral-100 overflow-hidden">
                    <img src={imgUrl} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>

                  <div className="p-5">
                    <h3 className="text-base font-black text-neutral-900 group-hover:text-amber-600 transition-colors leading-snug mb-2 line-clamp-2">{name}</h3>
                    
                    {uni.location && (
                      <p className="flex items-center gap-1.5 text-xs text-neutral-500 mb-3">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        {uni.location}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                      {uni.rating && (
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          <span className="text-sm font-bold text-neutral-900">{Number(uni.rating).toFixed(1)}</span>
                        </div>
                      )}
                      <span className="text-xs font-bold text-amber-600 group-hover:gap-1.5 flex items-center gap-1 transition-all">
                        View Details
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
