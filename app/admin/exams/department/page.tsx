import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { revalidatePath } from "next/cache";

async function deleteDepartment(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM faculty_departments WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/exams/department deleteAction]", e);
  }
  revalidatePath("/admin/exams/department");
}

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number | boolean)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/exams/department safeQuery]", err);
    return [];
  }
}

interface DeptRow extends RowDataPacket {
  id: number;
  collegeName: string | null;
  functionalArea: string | null;
  degree: string | null;
  course: string | null;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default async function ExamDeptPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();

  const where = q ? "WHERE cp.collegename LIKE ? OR fa.name LIKE ? OR d.name LIKE ?" : "";
  const params = q ? [`%${q}%`, `%${q}%`, `%${q}%`] : [];

  const data = await safeQuery<DeptRow>(
    `SELECT 
      fd.id, 
      cp.collegename as collegeName,
      fa.name as functionalArea,
      d.name as degree,
      c.name as course
     FROM faculty_departments fd
     LEFT JOIN collegeprofile cp ON cp.id = fd.collegeprofile_id
     LEFT JOIN functionalarea fa ON fa.id = fd.functionalarea_id
     LEFT JOIN degree d ON d.id = fd.degree_id
     LEFT JOIN courses c ON c.id = fd.course_id
     ${where}
     ORDER BY fd.id DESC
     LIMIT 100`,
    params
  );

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-rose-600 text-[22px]" style={ICO_FILL}>domain</span>
            Exam Department
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage academic departments associated with examinations and colleges.</p>
        </div>
        <form method="GET" className="relative max-w-sm w-full">
           <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[20px]" style={ICO}>search</span>
           <input 
             name="q" 
             defaultValue={q}
             placeholder="Search colleges, areas or degrees..." 
             className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
           />
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">College / Area</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Degree</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Course</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-slate-400">
                     No departments found.
                  </td>
                </tr>
              ) : (
                data.map((r) => (
                  <tr key={r.id} className="hover:bg-rose-50/20 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-800">{r.collegeName || "—"}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{r.functionalArea || "—"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-600">
                      {r.degree || "—"}
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-500">
                      {r.course || "—"}
                    </td>
                    <td className="px-4 py-4 text-right">
                       <DeleteButton action={deleteDepartment.bind(null, r.id)} size="sm" />
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
