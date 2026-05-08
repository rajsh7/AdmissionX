import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

function slugToName(slug: string) {
  return slug.replace(/-\d+$/, "").split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default async function ScholarshipsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();

  const cp = await db.collection("collegeprofile").findOne({ slug }, { projection: { _id: 1, id: 1, users_id: 1 } });
  if (!cp) notFound();

  const cpId = cp.id ? Number(cp.id) : cp._id.toString();

  const [user, scholarships] = await Promise.all([
    cp.users_id ? db.collection("users").findOne({ $or: [{ _id: cp.users_id }, { id: cp.users_id }] }, { projection: { firstname: 1 } }) : null,
    db.collection("college_scholarships").find({ collegeprofile_id: cpId }).sort({ id: 1 }).toArray(),
  ]);

  const collegeName = user?.firstname?.trim() || slugToName(slug);

  return (
    <div className="max-w-[1920px] mx-auto px-4 md:px-10 lg:px-12 py-10">
      <div className="mb-8">
        <h1 className="text-[28px] font-black text-slate-900">Scholarships</h1>
        <p className="text-slate-500 text-sm mt-1">{collegeName} — financial aid and scholarship programs</p>
      </div>

      {scholarships.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-20 text-center">
          <span className="material-symbols-outlined text-6xl text-slate-200 block mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
          <p className="text-slate-400 font-bold text-lg">No scholarships published yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {scholarships.map((s: any) => (
            <div key={s._id.toString()} className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-green-600 text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[16px] font-bold text-slate-800 mb-1">{s.title}</p>
                {s.description && <p className="text-[13px] text-slate-500 leading-relaxed">{s.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-white font-black text-base mb-1">Apply for a Scholarship</p>
          <p className="text-slate-400 text-sm">Submit your application and mention the scholarship you are applying for.</p>
        </div>
        <a href={`/apply/${slug}`} className="flex-shrink-0 inline-flex items-center gap-2 bg-[#FF3C3C] hover:bg-red-500 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors whitespace-nowrap">
          <span className="material-symbols-outlined text-[17px]">edit_document</span>
          Apply Now
        </a>
      </div>
    </div>
  );
}
