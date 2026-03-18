import pool from "@/lib/db";
import Link from "next/link";
import { RowDataPacket } from "mysql2";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { revalidatePath } from "next/cache";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function deleteReviewRow(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM college_reviews WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/colleges/reviews deleteAction]", e);
  }
  revalidatePath("/admin/colleges/reviews");
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
    console.error("[admin/colleges/reviews safeQuery]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReviewRow extends RowDataPacket {
  id: number;
  college_name: string;
  title: string;
  description: string;
  academic: number;
  infrastructure: number;
  placement: number;
  social: number;
}

interface CountRow extends RowDataPacket {
  total: number;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CollegeReviewsPage({
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
      "(u.firstname LIKE ? OR r.title LIKE ? OR r.description LIKE ?)",
    );
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  // ── Query reviews ─────────────────────────────────────────────────────────
  const [reviews, countRows] = await Promise.all([
    safeQuery<ReviewRow>(
      `SELECT 
        r.id,
        COALESCE(u.firstname, 'Unnamed College') as college_name,
        r.title,
        r.description,
        r.academic,
        r.infrastructure,
        r.placement,
        r.social
       FROM college_reviews r
       JOIN collegeprofile cp ON cp.id = r.collegeprofile_id
       JOIN users u ON u.id = cp.users_id
       ${where}
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total 
       FROM college_reviews r 
       JOIN collegeprofile cp ON cp.id = r.collegeprofile_id
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
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>forum</span>
            College reviews
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage student feedback and ratings across various categories.</p>
        </div>
        <div className="flex items-center gap-3">
          <form method="GET" action="/admin/colleges/reviews" className="w-full sm:w-80">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none" style={ICO}>search</span>
              <input 
                type="text" 
                name="q" 
                defaultValue={q}
                placeholder="Search reviews, colleges..." 
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            </div>
          </form>
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {reviews.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-symbols-rounded text-6xl text-slate-200 block mb-4" style={ICO_FILL}>forum</span>
            <p className="text-slate-500 font-semibold text-sm">No review records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-left">
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-10">#</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Review Title</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">College Name</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ratings</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {reviews.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="px-5 py-4 text-xs text-slate-400 font-mono">{offset + idx + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 leading-snug">{r.title || "Untitled Review"}</span>
                        <span className="text-xs text-slate-400 italic line-clamp-1 mt-0.5">"{r.description || "No detail"}"</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-slate-600 font-medium truncate max-w-[200px] block">{r.college_name}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] font-bold uppercase tracking-tighter text-slate-400">
                        <div className="flex justify-between gap-2"><span>Acad:</span><span className="text-blue-600">{r.academic}</span></div>
                        <div className="flex justify-between gap-2"><span>Infra:</span><span className="text-amber-600">{r.infrastructure}</span></div>
                        <div className="flex justify-between gap-2"><span>Place:</span><span className="text-green-600">{r.placement}</span></div>
                        <div className="flex justify-between gap-2"><span>Social:</span><span className="text-purple-600">{r.social}</span></div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Update">
                           <span className="material-symbols-rounded text-[18px]">edit</span>
                        </button>
                        <DeleteButton action={deleteReviewRow.bind(null, r.id)} size="sm" />
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
              Showing <strong>{offset + 1}–{Math.min(offset + PAGE_SIZE, total)}</strong> of <strong>{total.toLocaleString()}</strong> reviews
            </p>
            <div className="flex items-center gap-1">
              {page > 1 ? (
                <Link href={`/admin/colleges/reviews?page=${page - 1}${q ? `&q=${q}` : ''}`} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">← Prev</Link>
              ) : (
                <span className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">← Prev</span>
              )}
              {page < totalPages ? (
                <Link href={`/admin/colleges/reviews?page=${page + 1}${q ? `&q=${q}` : ''}`} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Next →</Link>
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
