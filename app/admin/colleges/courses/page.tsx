import pool from "@/lib/db";
import Link from "next/link";
import { RowDataPacket } from "mysql2";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { revalidatePath } from "next/cache";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function deleteCourseRow(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM collegemaster WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/colleges/courses deleteAction]", e);
  }
  revalidatePath("/admin/colleges/courses");
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
    console.error("[admin/colleges/courses safeQuery]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CourseRow extends RowDataPacket {
  id: number;
  college_name: string;
  course_name: string;
  degree_name: string | null;
  stream_name: string | null;
  fees: string;
  seats: string;
  duration: string | null;
}

interface CountRow extends RowDataPacket {
  total: number;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CollegeCoursesPage({
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
      "(u.firstname LIKE ? OR c.name LIKE ? OR d.name LIKE ? OR fa.name LIKE ?)",
    );
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  // ── Query courses ─────────────────────────────────────────────────────────
  const [courses, countRows] = await Promise.all([
    safeQuery<CourseRow>(
      `SELECT 
        cm.id,
        COALESCE(u.firstname, 'Unnamed College') as college_name,
        c.name as course_name,
        d.name as degree_name,
        fa.name as stream_name,
        cm.fees,
        cm.seats,
        cm.courseduration as duration
       FROM collegemaster cm
       JOIN collegeprofile cp ON cp.id = cm.collegeprofile_id
       JOIN users u ON u.id = cp.users_id
       LEFT JOIN course c ON c.id = cm.course_id
       LEFT JOIN degree d ON d.id = cm.degree_id
       LEFT JOIN functionalarea fa ON fa.id = cm.functionalarea_id
       ${where}
       ORDER BY cm.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total 
       FROM collegemaster cm 
       JOIN collegeprofile cp ON cp.id = cm.collegeprofile_id
       JOIN users u ON u.id = cp.users_id
       LEFT JOIN course c ON c.id = cm.course_id
       LEFT JOIN degree d ON d.id = cm.degree_id
       LEFT JOIN functionalarea fa ON fa.id = cm.functionalarea_id
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
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>school</span>
            College courses
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage course programs offered by various colleges.</p>
        </div>
        <div className="flex items-center gap-3">
          <form method="GET" action="/admin/colleges/courses" className="w-full sm:w-80">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none" style={ICO}>search</span>
              <input 
                type="text" 
                name="q" 
                defaultValue={q}
                placeholder="Search colleges, courses..." 
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            </div>
          </form>
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {courses.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-symbols-rounded text-6xl text-slate-200 block mb-4" style={ICO_FILL}>school</span>
            <p className="text-slate-500 font-semibold text-sm">No course records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-left">
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-10">#</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Course Detail</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">College Name</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Fees & Seats</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {courses.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="px-5 py-4 text-xs text-slate-400 font-mono">{offset + idx + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 leading-snug">{c.course_name || "General Program"}</span>
                        <span className="text-[11px] text-blue-600 font-bold uppercase tracking-tighter mt-0.5">
                          {c.degree_name} • {c.stream_name}
                          {c.duration && <span className="text-slate-400 ml-1.5 font-medium">({c.duration})</span>}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-slate-600 font-medium truncate max-w-[200px] block">{c.college_name}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col text-xs space-y-0.5">
                        <span className="text-slate-700 font-bold">₹ {c.fees || "N/A"}</span>
                        <span className="text-slate-400 font-semibold uppercase tracking-widest text-[9px]">{c.seats || "N/A"} Seats</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Update">
                           <span className="material-symbols-rounded text-[18px]">edit</span>
                        </button>
                        <DeleteButton action={deleteCourseRow.bind(null, c.id)} size="sm" />
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
              Showing <strong>{offset + 1}–{Math.min(offset + PAGE_SIZE, total)}</strong> of <strong>{total.toLocaleString()}</strong> courses
            </p>
            <div className="flex items-center gap-1">
              {page > 1 ? (
                <Link href={`/admin/colleges/courses?page=${page - 1}${q ? `&q=${q}` : ''}`} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">← Prev</Link>
              ) : (
                <span className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">← Prev</span>
              )}
              {page < totalPages ? (
                <Link href={`/admin/colleges/courses?page=${page + 1}${q ? `&q=${q}` : ''}`} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Next →</Link>
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
