import pool from "@/lib/db";
import Link from "next/link";
import { RowDataPacket } from "mysql2";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { revalidatePath } from "next/cache";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function deleteAdmissionRow(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM college_admission_procedures WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/colleges/admission deleteAction]", e);
  }
  revalidatePath("/admin/colleges/admission");
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
    console.error("[admin/colleges/admission safeQuery]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdmissionRow extends RowDataPacket {
  id: number;
  college_name: string;
  title: string;
  description: string;
}

interface CountRow extends RowDataPacket {
  total: number;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CollegeAdmissionPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp   = await searchParams;
  const q    = (sp.q ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  // ── Build WHERE clause ─────────────────────────────────────────────────────
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (q) {
    conditions.push(
      "(u.firstname LIKE ? OR ap.title LIKE ? OR ap.description LIKE ?)",
    );
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  // ── Query admissions ───────────────────────────────────────────────────────
  const [admissions, countRows] = await Promise.all([
    safeQuery<AdmissionRow>(
      `SELECT 
        ap.id,
        COALESCE(u.firstname, 'Unnamed College') as college_name,
        ap.title,
        ap.description
       FROM college_admission_procedures ap
       JOIN collegeprofile cp ON cp.id = ap.collegeprofile_id
       JOIN users u ON u.id = cp.users_id
       ${where}
       ORDER BY ap.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total 
       FROM college_admission_procedures ap 
       JOIN collegeprofile cp ON cp.id = ap.collegeprofile_id
       JOIN users u ON u.id = cp.users_id
       ${where}`,
      params,
    ),
  ]);

  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>assignment_ind</span>
            Admission procedures
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage enrollment workflows and step-by-step admission guidelines.</p>
        </div>
        <div className="flex items-center gap-3">
          <form method="GET" action="/admin/colleges/admission" className="w-full sm:w-80">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none" style={ICO}>search</span>
              <input 
                type="text" 
                name="q" 
                defaultValue={q}
                placeholder="Search procedures, colleges..." 
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            </div>
          </form>
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {admissions.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-symbols-rounded text-6xl text-slate-200 block mb-4" style={ICO_FILL}>assignment_ind</span>
            <p className="text-slate-500 font-semibold text-sm">No admission records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-left">
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-10">#</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Procedure Title</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">College Name</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {admissions.map((a, idx) => (
                  <tr key={a.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="px-5 py-4 text-xs text-slate-400 font-mono">{offset + idx + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 leading-snug">{a.title}</span>
                        <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-0.5">Enrollment Workflow</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-slate-600 font-medium truncate max-w-[200px] block">{a.college_name}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-slate-500 line-clamp-1 max-w-[350px]">{a.description || "No description provided"}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Update">
                           <span className="material-symbols-rounded text-[18px]">edit</span>
                        </button>
                        <DeleteButton action={deleteAdmissionRow.bind(null, a.id)} size="sm" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ───────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500">
              Showing <strong>{offset + 1}–{Math.min(offset + PAGE_SIZE, total)}</strong> of <strong>{total.toLocaleString()}</strong> procedures
            </p>
            <div className="flex items-center gap-1">
              {page > 1 ? (
                <Link href={`/admin/colleges/admission?page=${page - 1}${q ? `&q=${q}` : ''}`} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">← Prev</Link>
              ) : (
                <span className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">← Prev</span>
              )}
              {page < totalPages ? (
                <Link href={`/admin/colleges/admission?page=${page + 1}${q ? `&q=${q}` : ''}`} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Next →</Link>
              ) : (
                <span className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">Next →</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
