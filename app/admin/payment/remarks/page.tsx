import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { revalidatePath } from "next/cache";

async function deleteRemark(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM applicationstatusmessages WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/payment/remarks deleteAction]", e);
  }
  revalidatePath("/admin/payment/remarks");
  revalidatePath("/", "layout");
}

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number | boolean)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/payment/remarks safeQuery]", err);
    return [];
  }
}

interface RemarkRow extends RowDataPacket {
  id: number;
  application_id: number;
  message: string | null;
  applicationStatus: string | null;
  studentName: string | null;
  collegeName: string | null;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default async function ApplicationRemarksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();

  const where = q ? "WHERE asm.message LIKE ? OR asm.applicationStatus LIKE ?" : "";
  const params = q ? [`%${q}%`, `%${q}%`] : [];

  const data = await safeQuery<RemarkRow>(
    `SELECT 
      asm.id, 
      asm.application_id, 
      asm.message, 
      asm.applicationStatus,
      COALESCE(NULLIF(TRIM(sp.firstname), ''), 'Student') as studentName,
      COALESCE(c.slug, 'College') as collegeName
     FROM applicationstatusmessages asm
     LEFT JOIN users sp ON sp.id = asm.student_id
     LEFT JOIN collegeprofile c ON c.id = asm.college_id
     ${where}
     ORDER BY asm.id DESC
     LIMIT 100`,
    params
  );

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>forum</span>
            Application Remarks
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Review and manage status messages and remarks on student applications.</p>
        </div>
        <form method="GET" className="relative max-w-sm w-full">
           <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[20px]" style={ICO}>search</span>
           <input 
             name="q" 
             defaultValue={q}
             placeholder="Search messages or status..." 
             className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
           />
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Application / Student</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Remark / Message</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-slate-400">
                     No remarks found.
                  </td>
                </tr>
              ) : (
                data.map((r) => (
                  <tr key={r.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-5 py-4">
                       <p className="font-bold text-slate-800">#{r.application_id}</p>
                       <p className="text-[10px] text-slate-500 truncate max-w-[150px]">{r.studentName || "Unknown Student"}</p>
                       <p className="text-[10px] text-slate-400 truncate max-w-[150px]">At: {r.collegeName || "N/A"}</p>
                    </td>
                    <td className="px-4 py-4">
                       <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                         <p className="text-xs text-slate-700 leading-relaxed italic line-clamp-2">
                           "{r.message || "No comment"}"
                         </p>
                       </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                       <span className="inline-flex px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-bold uppercase">
                         {r.applicationStatus || "Pending"}
                       </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                       <DeleteButton action={deleteRemark.bind(null, r.id)} size="sm" />
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
