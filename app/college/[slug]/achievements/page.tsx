import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

function slugToName(slug: string) {
  return slug.replace(/-\d+$/, "").split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

const CATEGORY_COLORS: Record<string, string> = {
  Award: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Ranking: "bg-blue-50 text-blue-700 border-blue-200",
  Accreditation: "bg-green-50 text-green-700 border-green-200",
  Recognition: "bg-purple-50 text-purple-700 border-purple-200",
  Other: "bg-slate-50 text-slate-600 border-slate-200",
};

export default async function AchievementsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();

  const cp = await db.collection("collegeprofile").findOne({ slug }, { projection: { _id: 1, users_id: 1 } });
  if (!cp) notFound();

  const [user, achievements] = await Promise.all([
    cp.users_id ? db.collection("users").findOne({ $or: [{ _id: cp.users_id }, { id: cp.users_id }] }, { projection: { firstname: 1 } }) : null,
    db.collection("college_achievements").find({ college_slug: slug }).sort({ year: -1, _id: -1 }).toArray(),
  ]);

  const collegeName = user?.firstname?.trim() || slugToName(slug);

  return (
    <div className="max-w-[1920px] mx-auto px-4 md:px-10 lg:px-12 py-10">
      <div className="mb-8">
        <h1 className="text-[28px] font-black text-slate-900">Achievements & Awards</h1>
        <p className="text-slate-500 text-sm mt-1">{collegeName} — recognitions, rankings and accreditations</p>
      </div>

      {achievements.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-20 text-center">
          <span className="material-symbols-outlined text-6xl text-slate-200 block mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
          <p className="text-slate-400 font-bold text-lg">No achievements published yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {achievements.map((a: any) => (
            <div key={a._id.toString()} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-yellow-500 text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="text-[15px] font-bold text-slate-800">{a.title}</p>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[a.category] ?? CATEGORY_COLORS.Other}`}>
                    {a.category}
                  </span>
                  {a.year && <span className="text-[11px] font-semibold text-slate-400">{a.year}</span>}
                </div>
                {a.description && <p className="text-[13px] text-slate-500 leading-relaxed">{a.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
