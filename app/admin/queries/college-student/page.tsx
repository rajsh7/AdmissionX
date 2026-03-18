import pool from "@/lib/db";
import Link from "next/link";
import { RowDataPacket } from "mysql2";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { revalidatePath } from "next/cache";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function deleteQueryRecord(id: number) {
  "use server";
  try {
    // Placeholder action
    console.log("Delete query record ID:", id);
  } catch (e) {
    console.error("[admin/queries/college-student deleteAction]", e);
  }
  revalidatePath("/admin/queries/college-student");
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
    console.error("[admin/queries/college-student safeQuery]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface QueryRow extends RowDataPacket {
  id: number;
  student_name: string;
  college_name: string;
  subject: string;
  message: string;
  status: string;
  created_at: Date;
}

interface CountRow extends RowDataPacket {
  total: number;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CollegeStudentQueryPage({
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

  // Note: This matches a hypothetical 'college_student_queries' table or similar logic
  if (q) {
    conditions.push("(student_name LIKE ? OR college_name LIKE ? OR subject LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  // ── Query records ──────────────────────────────────────────────────────────
  // Using a placeholder query for now as the exact table name is unknown
  const [queries, countRows] = await Promise.all([
    safeQuery<QueryRow>(
      `SELECT 
        1 as id, 
        'John Doe' as student_name, 
        'MIT' as college_name, 
        'Admission Doubt' as subject, 
        'I have a doubt regarding admission.' as message, 
        'Pending' as status, 
        NOW() as created_at
       LIMIT ? OFFSET ?`,
      [PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT 1 as total`,
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
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>forum</span>
            Query Between College & Student
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage interactions and inquiries between students and institutions.</p>
        </div>
        <div className="flex items-center gap-3">
          <form method="GET" action="/admin/queries/college-student" className="w-full sm:w-80">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none" style={ICO}>search</span>
              <input 
                type="text" 
                name="q" 
                defaultValue={q}
                placeholder="Search queries..." 
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-medium"
              />
            </div>
          </form>
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {queries.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-slate-500 font-semibold text-sm">No query records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Student & College</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Subject & Message</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {queries.map((r) => (
                  <tr key={r.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{r.student_name}</span>
                        <span className="text-[10px] text-blue-600 font-bold uppercase truncate max-w-[150px]">{r.college_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-700">{r.subject}</span>
                        <span className="text-xs text-slate-400 line-clamp-1 truncate max-w-[300px]">{r.message}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 uppercase">
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                       <DeleteButton action={deleteQueryRecord.bind(null, r.id)} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
