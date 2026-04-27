import { getDb } from "@/lib/db";
import pool from "@/lib/db";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { revalidatePath } from "next/cache";

async function deleteCounselling(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM counseling_boards WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/exams/counselling deleteAction]", e);
  }
  revalidatePath("/admin/exams/counselling");
  revalidatePath("/", "layout");
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default async function ExamCounsellingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q  = (sp.q || "").trim();

  const db  = await getDb();
  const col = db.collection("counseling_boards");

  const filter = q
    ? { $or: [{ title: { $regex: q, $options: "i" } }, { name: { $regex: q, $options: "i" } }, { slug: { $regex: q, $options: "i" } }] }
    : {};

  const [docs, total] = await Promise.all([
    col.find(filter).sort({ id: 1 }).toArray(),
    col.countDocuments(filter),
  ]);

  const data = docs.map((d: any) => ({
    id: Number(d.id ?? 0),
    title: String(d.title ?? "").trim(),
    name: String(d.name ?? "").trim(),
    slug: d.slug ? String(d.slug).trim() : null,
    status: String(d.status ?? "").trim(),
    misc: d.misc ? String(d.misc).trim() : null,
    created_at: d.created_at ? String(d.created_at).trim() : "",
  })).filter(d => d.title || d.name);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>support_agent</span>
            Counselling Boards
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage counselling boards for examinations.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
            {total.toLocaleString()} records
          </span>
          <form method="GET" className="relative max-w-sm w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[20px]" style={ICO}>search</span>
            <input
              name="q"
              defaultValue={q}
              placeholder="Search boards..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </form>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-left">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-12">#</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Board Name</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Short Name</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Slug</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-24 text-center">
                    <span className="material-symbols-rounded text-6xl text-slate-200 mb-4 block" style={ICO_FILL}>support_agent</span>
                    <p className="text-slate-500 font-semibold text-sm">No counselling boards found.</p>
                  </td>
                </tr>
              ) : (
                data.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="px-5 py-4 text-xs text-slate-400 font-mono italic">
                      {String(idx + 1).padStart(2, "0")}
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-800">{r.title}</td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{r.name || "—"}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-mono text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded">
                        {r.slug || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-500">{r.misc || "—"}</td>
                    <td className="px-4 py-4">
                      {r.status === "1" ? (
                        <span className="text-[10px] font-bold bg-green-50 text-green-600 px-2 py-0.5 rounded-full ring-1 ring-inset ring-green-600/20 uppercase">Active</span>
                      ) : (
                        <span className="text-[10px] font-bold bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full ring-1 ring-inset ring-slate-400/20 uppercase">Inactive</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <DeleteButton action={deleteCounselling.bind(null, r.id)} size="sm" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
