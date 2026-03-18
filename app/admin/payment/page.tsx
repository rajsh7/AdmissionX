import pool from "@/lib/db";
import Link from "next/link";
import { RowDataPacket } from "mysql2";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { revalidatePath } from "next/cache";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function deletePaymentRecord(id: number) {
  "use server";
  try {
    // Placeholder action
    console.log("Delete payment info for course assignment ID:", id);
  } catch (e) {
    console.error("[admin/payment deleteAction]", e);
  }
  revalidatePath("/admin/payment");
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
    console.error("[admin/payment safeQuery]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaymentRow extends RowDataPacket {
  id: number;
  college_name: string;
  course_name: string;
  fees: string;
  seats: string;
}

interface CountRow extends RowDataPacket {
  total: number;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ApplicationPaymentPage({
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
      "(u.firstname LIKE ? OR c.name LIKE ?)",
    );
    params.push(`%${q}%`, `%${q}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  // ── Query courses for fee information ──────────────────────────────────────
  const [payments, countRows] = await Promise.all([
    safeQuery<PaymentRow>(
      `SELECT 
        cm.id,
        COALESCE(u.firstname, 'Unnamed College') as college_name,
        c.name as course_name,
        cm.fees,
        cm.seats
       FROM collegemaster cm
       JOIN collegeprofile cp ON cp.id = cm.collegeprofile_id
       JOIN users u ON u.id = cp.users_id
       LEFT JOIN course c ON c.id = cm.course_id
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
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>payments</span>
            Application & Payment
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage course fees, application costs, and enrollment charges.</p>
        </div>
        <div className="flex items-center gap-3">
          <form method="GET" action="/admin/payment" className="w-full sm:w-80">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none" style={ICO}>search</span>
              <input 
                type="text" 
                name="q" 
                defaultValue={q}
                placeholder="Search colleges, courses..." 
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-medium"
              />
            </div>
          </form>
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {payments.length === 0 ? (
            <div className="py-24 text-center">
              <span className="material-symbols-rounded text-7xl text-slate-200 block mb-4" style={ICO_FILL}>payments</span>
              <p className="text-slate-500 font-semibold text-sm">No payment records found.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-10">#</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">College Name</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Course / Program</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Fee Structure</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {payments.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-5 py-4 text-xs text-slate-400 font-mono">{offset + idx + 1}</td>
                    <td className="px-4 py-4">
                      <span className="font-bold text-slate-800 leading-snug truncate max-w-[200px] block">{p.college_name}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-600 line-clamp-1">{p.course_name || "General Course"}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{p.seats || 0} SEATS AVAILABLE</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-black text-blue-600">₹ {p.fees || "N/A"}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Total Program Fee</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Update Fee">
                           <span className="material-symbols-rounded text-[20px]">edit_note</span>
                        </button>
                        <DeleteButton action={deletePaymentRecord.bind(null, p.id)} size="sm" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Pagination ───────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
            <p className="text-xs text-slate-400 font-medium">
              Showing <span className="text-slate-700 font-bold">{offset + 1}–{Math.min(offset + PAGE_SIZE, total)}</span> of <span className="text-slate-700 font-bold">{total.toLocaleString()}</span> records
            </p>
            <div className="flex items-center gap-1.5">
              {page > 1 ? (
                <Link href={`/admin/payment?page=${page - 1}${q ? `&q=${q}` : ''}`} className="w-9 h-9 flex items-center justify-center text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                   <span className="material-symbols-rounded text-[18px]">chevron_left</span>
                </Link>
              ) : (
                <span className="w-9 h-9 flex items-center justify-center text-slate-300 bg-white border border-slate-100 rounded-xl cursor-not-allowed">
                   <span className="material-symbols-rounded text-[18px]">chevron_left</span>
                </span>
              )}
              
              <div className="flex items-center gap-1 mx-1">
                 <span className="text-xs font-bold text-slate-700 bg-blue-50 w-9 h-9 flex items-center justify-center rounded-xl border border-blue-100">{page}</span>
                 <span className="text-[10px] text-slate-300 font-bold">/</span>
                 <span className="text-xs font-bold text-slate-400 w-9 h-9 flex items-center justify-center">{totalPages}</span>
              </div>

              {page < totalPages ? (
                <Link href={`/admin/payment?page=${page + 1}${q ? `&q=${q}` : ''}`} className="w-9 h-9 flex items-center justify-center text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                   <span className="material-symbols-rounded text-[18px]">chevron_right</span>
                </Link>
              ) : (
                <span className="w-9 h-9 flex items-center justify-center text-slate-300 bg-white border border-slate-100 rounded-xl cursor-not-allowed">
                   <span className="material-symbols-rounded text-[18px]">chevron_right</span>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
