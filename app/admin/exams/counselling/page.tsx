import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { revalidatePath } from "next/cache";

async function deleteCounselling(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM exam_counselling_forms WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/exams/counselling deleteAction]", e);
  }
  revalidatePath("/admin/exams/counselling");
}

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number | boolean)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/exams/counselling safeQuery]", err);
    return [];
  }
}

interface CounsellingRow extends RowDataPacket {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  exam_id: number | null;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default async function ExamCounsellingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();

  const where = q ? "WHERE name LIKE ? OR email LIKE ? OR phone LIKE ?" : "";
  const params = q ? [`%${q}%`, `%${q}%`, `%${q}%`] : [];

  const data = await safeQuery<CounsellingRow>(
    `SELECT id, name, email, phone, exam_id
     FROM exam_counselling_forms
     ${where}
     ORDER BY id DESC
     LIMIT 100`,
    params
  );

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>support_agent</span>
            Exam Counselling Form
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage counselling inquiries for examinations.</p>
        </div>
        <form method="GET" className="relative max-w-sm w-full">
           <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[20px]" style={ICO}>search</span>
           <input 
             name="q" 
             defaultValue={q}
             placeholder="Search inquiries..." 
             className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
           />
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Candidate</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Exam ID</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-slate-400">
                     No counselling inquiries found.
                  </td>
                </tr>
              ) : (
                data.map((r) => (
                  <tr key={r.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-5 py-4 font-bold text-slate-800">{r.name}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col text-[10px] text-slate-500">
                         <span>{r.email || "No email"}</span>
                         <span>{r.phone || "No phone"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-50 text-slate-500">
                        {r.exam_id || "—"}
                      </span>
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
