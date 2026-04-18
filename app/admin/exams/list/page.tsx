import pool from "@/lib/db";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { revalidatePath } from "next/cache";

async function deleteExam(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM entranceexam WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/exams/list deleteAction]", e);
  }
  revalidatePath("/admin/exams/list");
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
    console.error("[admin/exams/list safeQuery]", err);
    return [];
  }
}

interface ExamRow  {
  id: number;
  name: string;
  description: string | null;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default async function ExamListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();

  const where = q ? "WHERE name LIKE ? OR description LIKE ?" : "";
  const params = q ? [`%${q}%`, `%${q}%`] : [];

  const data = await safeQuery<ExamRow>(
    `SELECT id, name, description
     FROM entranceexam
     ${where}
     ORDER BY id DESC
     LIMIT 100`,
    params
  );

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-emerald-600 text-[22px]" style={ICO_FILL}>format_list_bulleted</span>
            List of Examination
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">View and manage all active entrance examinations in the system.</p>
        </div>
        <form method="GET" className="relative max-w-sm w-full">
           <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[20px]" style={ICO}>search</span>
           <input 
             name="q" 
             defaultValue={q}
             placeholder="Search examinations..." 
             className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
           />
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Exam Name</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-slate-400">
                     No examinations found.
                  </td>
                </tr>
              ) : (
                data.map((r) => (
                  <tr key={r.id} className="hover:bg-emerald-50/20 transition-colors group">
                    <td className="px-5 py-4 min-w-[200px] font-bold text-slate-800">
                      {r.name}
                    </td>
                    <td className="px-4 py-4 text-slate-500 max-w-[500px]">
                      <p className="line-clamp-2 text-xs" title={r.description || ""}>
                        {r.description || "No description available."}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-right border-l border-transparent group-hover:border-slate-50">
                       <DeleteButton action={deleteExam.bind(null, r.id)} size="sm" />
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




