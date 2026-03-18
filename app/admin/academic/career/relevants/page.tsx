import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { revalidatePath } from "next/cache";

async function deleteRelevant(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM counseling_career_relevants WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/academic/career/relevants deleteAction]", e);
  }
  revalidatePath("/admin/academic/career/relevants");
}

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number | boolean)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/academic/career/relevants safeQuery]", err);
    return [];
  }
}

interface RelevantRow extends RowDataPacket {
  id: number;
  title: string;
  salery: string | null;
  stream: string | null;
  academicDifficulty: string | null;
  status: number;
  interestTitle: string | null;
  functionalArea: string | null;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default async function CareerRelevantsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();

  const where = q ? "WHERE cr.title LIKE ? OR cr.stream LIKE ? OR ci.title LIKE ? OR fa.name LIKE ?" : "";
  const params = q ? [`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`] : [];

  const data = await safeQuery<RelevantRow>(
    `SELECT 
      cr.id, 
      cr.title, 
      cr.salery, 
      cr.stream, 
      cr.academicDifficulty,
      cr.status,
      ci.title as interestTitle,
      fa.name as functionalArea
     FROM counseling_career_relevants cr
     LEFT JOIN counseling_career_interests ci ON ci.id = cr.careerInterest
     LEFT JOIN functionalarea fa ON fa.id = cr.functionalarea_id
     ${where}
     ORDER BY cr.id DESC
     LIMIT 100`,
    params
  );

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-rose-600 text-[22px]" style={ICO_FILL}>work</span>
            Career Relevant Posts
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage detailed career posts, requirements, and salary information.</p>
        </div>
        <form method="GET" className="relative max-w-sm w-full">
           <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[20px]" style={ICO}>search</span>
           <input 
             name="q" 
             defaultValue={q}
             placeholder="Search posts, streams or interests..." 
             className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
           />
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Post Title / Stream</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Interest / Area</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Salary / Difficulty</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                     No career posts found.
                  </td>
                </tr>
              ) : (
                data.map((r) => (
                  <tr key={r.id} className="hover:bg-rose-50/20 transition-colors group">
                    <td className="px-5 py-4 min-w-[200px]">
                      <p className="font-bold text-slate-800">{r.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{r.stream || "General"}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-0.5">
                        <p className="font-medium text-slate-700">{r.interestTitle || "—"}</p>
                        <p className="text-[10px] text-slate-400">{r.functionalArea || "—"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-0.5">
                        <p className="text-slate-600 font-medium">₹ {r.salery || "—"}</p>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                          r.academicDifficulty === 'Hard' ? 'bg-red-50 text-red-600' :
                          r.academicDifficulty === 'Medium' ? 'bg-orange-50 text-orange-600' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {r.academicDifficulty || "Easy"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                       <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${r.status ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                          <span className="material-symbols-rounded text-[14px]" style={ICO_FILL}>{r.status ? 'check_circle' : 'pending'}</span>
                          {r.status ? 'Active' : 'Inactive'}
                       </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                       <DeleteButton action={deleteRelevant.bind(null, r.id)} size="sm" />
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
