import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

function slugToName(slug: string) {
  return slug.replace(/-\d+$/, "").split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

const TYPE_COLORS: Record<string, string> = {
  Sports: "bg-blue-50 text-blue-700 border-blue-200",
  Cultural: "bg-purple-50 text-purple-700 border-purple-200",
  Technical: "bg-orange-50 text-orange-700 border-orange-200",
  Academic: "bg-green-50 text-green-700 border-green-200",
  Other: "bg-slate-50 text-slate-600 border-slate-200",
};

const TYPE_ICONS: Record<string, string> = {
  Sports: "sports_soccer",
  Cultural: "theater_comedy",
  Technical: "computer",
  Academic: "school",
  Other: "category",
};

export default async function SportsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();

  const cp = await db.collection("collegeprofile").findOne({ slug }, { projection: { _id: 1, id: 1, users_id: 1 } });
  if (!cp) notFound();

  const cpId = cp.id ? Number(cp.id) : cp._id.toString();

  const [user, activities] = await Promise.all([
    cp.users_id ? db.collection("users").findOne({ $or: [{ _id: cp.users_id }, { id: cp.users_id }] }, { projection: { firstname: 1 } }) : null,
    db.collection("college_sports_activities").find({ collegeprofile_id: cpId }).sort({ typeOfActivity: 1, name: 1 }).toArray(),
  ]);

  const collegeName = user?.firstname?.trim() || slugToName(slug);

  const TYPES = ["Sports", "Cultural", "Technical", "Academic", "Other"];
  const grouped: Record<string, any[]> = {};
  for (const t of TYPES) grouped[t] = activities.filter((a: any) => a.typeOfActivity === t);

  return (
    <div className="max-w-[1920px] mx-auto px-4 md:px-10 lg:px-12 py-10">
      <div className="mb-8">
        <h1 className="text-[28px] font-black text-slate-900">Sports & Activities</h1>
        <p className="text-slate-500 text-sm mt-1">{collegeName} — {activities.length} activit{activities.length !== 1 ? "ies" : "y"}</p>
      </div>

      {activities.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-20 text-center">
          <span className="material-symbols-outlined text-6xl text-slate-200 block mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>sports_soccer</span>
          <p className="text-slate-400 font-bold text-lg">No activities published yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {TYPES.filter(t => grouped[t]?.length > 0).map(t => (
            <div key={t} className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[20px] text-[#FF3C3C]" style={{ fontVariationSettings: "'FILL' 1" }}>{TYPE_ICONS[t]}</span>
                <h2 className="text-[14px] font-black text-slate-700 uppercase tracking-wider">{t} ({grouped[t].length})</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {grouped[t].map((a: any) => (
                  <span key={a._id?.toString() ?? a.id} className={`px-3 py-1.5 rounded-full border text-[13px] font-semibold ${TYPE_COLORS[t] ?? TYPE_COLORS.Other}`}>
                    {a.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
