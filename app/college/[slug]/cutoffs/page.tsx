import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

function slugToName(slug: string) {
  return slug.replace(/-\d+$/, "").split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default async function CutoffsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();

  const cp = await db.collection("collegeprofile").findOne({ slug }, { projection: { _id: 1, id: 1, users_id: 1 } });
  if (!cp) notFound();

  const cpId = cp.id ? Number(cp.id) : cp._id.toString();

  const [user, cutoffs] = await Promise.all([
    cp.users_id ? db.collection("users").findOne({ $or: [{ _id: cp.users_id }, { id: cp.users_id }] }, { projection: { firstname: 1 } }) : null,
    db.collection("college_cut_offs").find({ collegeprofile_id: cpId }).sort({ id: 1 }).toArray(),
  ]);

  const collegeName = user?.firstname?.trim() || slugToName(slug);

  return (
    <div className="max-w-[1920px] mx-auto px-4 md:px-10 lg:px-12 py-10">
      <div className="mb-8">
        <h1 className="text-[28px] font-black text-slate-900">Cut Offs</h1>
        <p className="text-slate-500 text-sm mt-1">{collegeName} — admission cut-off marks by course and category</p>
      </div>

      {cutoffs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-20 text-center">
          <span className="material-symbols-outlined text-6xl text-slate-200 block mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>assignment</span>
          <p className="text-slate-400 font-bold text-lg">No cut-off data published yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cutoffs.map((c: any) => (
            <div key={c._id.toString()} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-orange-500 text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>assignment</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold text-slate-800 mb-1">{c.title}</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {c.stream_name && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">{c.stream_name}</span>}
                  {c.degree_name && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">{c.degree_name}</span>}
                  {c.course_name && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">{c.course_name}</span>}
                </div>
                {c.description && <p className="text-[13px] text-slate-500 leading-relaxed whitespace-pre-line">{c.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
