import pool from "@/lib/db";
import Link from "next/link";
import { RowDataPacket } from "mysql2";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { revalidatePath } from "next/cache";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function deleteAdmissionXQuery(id: number) {
  "use server";
  try {
    console.log("Delete AdmissionX query ID:", id);
  } catch (e) {
    console.error("[admin/queries/admissionx deleteAction]", e);
  }
  revalidatePath("/admin/queries/admissionx");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/queries/admissionx safeQuery]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface QueryRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  created_at: Date;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdmissionXQueryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp   = await searchParams;
  const q    = (sp.q ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const where = q 
    ? "AND (COALESCE(u.firstname, q.guestname) LIKE ? OR COALESCE(u.email, q.guestemail) LIKE ? OR q.subject LIKE ?)" 
    : "";
  const params = q ? [`%${q}%`, `%${q}%`, `%${q}%`, PAGE_SIZE, offset] : [PAGE_SIZE, offset];

  const queries = await safeQuery<QueryRow>(
    `SELECT 
      q.id, 
      COALESCE(u.firstname, q.guestname, 'Anonymous') as name, 
      COALESCE(u.email, q.guestemail) as email, 
      COALESCE(u.phone, q.guestphone) as phone,
      q.subject, 
      q.message, 
      q.created_at
     FROM query q
     LEFT JOIN users u ON q.student_id = u.id
     WHERE q.queryflowtype = 'student-to-admin'
     ${where}
     ORDER BY q.created_at DESC
     LIMIT ? OFFSET ?`,
    params,
  );

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>support_agent</span>
            Query To Admission X 844
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Support requests and inquiries directed to the AdmissionX team.</p>
        </div>
        <div className="flex items-center gap-3">
          <form method="GET" action="/admin/queries/admissionx" className="w-full sm:w-80">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none" style={ICO}>search</span>
              <input 
                type="text" 
                name="q" 
                defaultValue={q}
                placeholder="Search inquiries..." 
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-medium"
              />
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Contact Details</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Query Topic</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Message</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {queries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-slate-400">
                     No queries found.
                  </td>
                </tr>
              ) : (
                queries.map((r) => (
                  <tr key={r.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{r.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{r.email}</span>
                        <span className="text-[10px] text-slate-400 font-mono italic">{r.phone}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-semibold text-slate-700">{r.subject}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-slate-500 truncate block max-w-[400px]">{r.message}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                       <DeleteButton action={deleteAdmissionXQuery.bind(null, r.id)} size="sm" />
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
