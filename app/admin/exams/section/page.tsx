import pool from "@/lib/db";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { revalidatePath } from "next/cache";

async function deleteSection(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM exam_sections WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/exams/section deleteAction]", e);
  }
  revalidatePath("/admin/exams/section");
  revalidatePath("/", "layout");
}

async function safeQuery<T >(
  sql: string,
  params: (string | number | boolean)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/exams/section safeQuery]", err);
    return [];
  }
}

interface SectionRow  {
  id: number;
  name: string;
  functionalArea: string | null;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default async function ExamSectionPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();

  const { getDb } = await import("@/lib/db");
  const db = await getDb();
  const filter = q ? { name: { $regex: q, $options: "i" } } : {};
  const docs = await db.collection("exam_sections").find(filter).sort({ id: -1 }).limit(100).toArray();
  const faIds = [...new Set(docs.map((d: any) => Number(d.functionalarea_id)).filter(Boolean))];
  const faDocs = faIds.length ? await db.collection("functionalarea").find({ id: { $in: faIds } }, { projection: { id: 1, name: 1 } }).toArray() : [];
  const faMap = new Map(faDocs.map((d: any) => [Number(d.id), String(d.name ?? "").trim()]));
  const data: SectionRow[] = docs.map((d: any) => ({
    id: Number(d.id ?? 0),
    name: String(d.name ?? "").trim(),
    functionalArea: faMap.get(Number(d.functionalarea_id)) || null,
  }));

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>view_quilt</span>
            Examination Section
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage specific sections within various examinations.</p>
        </div>
        <form method="GET" className="relative max-w-sm w-full">
           <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[20px]" style={ICO}>search</span>
           <input 
             name="q" 
             defaultValue={q}
             placeholder="Search sections..." 
             className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
           />
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Section Name</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Functional Area</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50" suppressHydrationWarning>
              {data.length > 0 ? (
                data.map((r) => (
                  <tr key={r.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-5 py-4 font-bold text-slate-800">{r.name}</td>
                    <td className="px-4 py-4">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-50 text-slate-500">
                        {r.functionalArea || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                       <DeleteButton action={deleteSection.bind(null, r.id)} size="sm" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-slate-400">
                     No exam sections found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}




