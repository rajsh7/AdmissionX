import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

function slugToName(slug: string) {
  return slug.replace(/-\d+$/, "").split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default async function FacilitiesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();

  const cp = await db.collection("collegeprofile").findOne({ slug }, { projection: { _id: 1, id: 1, users_id: 1 } });
  if (!cp) notFound();

  const cpId = cp.id ? Number(cp.id) : cp._id.toString();

  const [user, enabledRows, allFacilities] = await Promise.all([
    cp.users_id ? db.collection("users").findOne({ $or: [{ _id: cp.users_id }, { id: cp.users_id }] }, { projection: { firstname: 1 } }) : null,
    db.collection("collegefacilities").find({ collegeprofile_id: cpId }).toArray(),
    db.collection("facilities").find({}).sort({ name: 1 }).toArray(),
  ]);

  const collegeName = user?.firstname?.trim() || slugToName(slug);

  const enabledMap = new Map(enabledRows.map((f: any) => [Number(f.facilities_id), f.description ?? null]));
  const facilities = allFacilities
    .filter((f: any) => enabledMap.has(Number(f.id)))
    .map((f: any) => ({
      id: Number(f.id),
      name: String(f.name ?? ""),
      iconname: f.iconname ?? "check_circle",
      description: enabledMap.get(Number(f.id)),
    }));

  return (
    <div className="max-w-[1920px] mx-auto px-4 md:px-10 lg:px-12 py-10">
      <div className="mb-8">
        <h1 className="text-[28px] font-black text-slate-900">Campus Facilities</h1>
        <p className="text-slate-500 text-sm mt-1">{collegeName} — {facilities.length} facilit{facilities.length !== 1 ? "ies" : "y"} available</p>
      </div>

      {facilities.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-20 text-center">
          <span className="material-symbols-outlined text-6xl text-slate-200 block mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>apartment</span>
          <p className="text-slate-400 font-bold text-lg">No facilities published yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {facilities.map((f) => (
            <div key={f.id} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2">
              <span className="material-symbols-outlined text-[#FF3C3C] text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>{f.iconname}</span>
              <p className="text-[14px] font-bold text-slate-800">{f.name}</p>
              {f.description && <p className="text-[12px] text-slate-500 leading-relaxed">{f.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
