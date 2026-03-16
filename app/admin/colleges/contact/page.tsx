import pool from "@/lib/db";
import Link from "next/link";
import { RowDataPacket } from "mysql2";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 24;

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/colleges/contact safeQuery]", err);
    return [];
  }
}

function formatPhone(p: string | null): string {
    if (!p) return "—";
    const cleaned = p.replace(/\D/g, "");
    if (cleaned.length === 10) {
        return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return p;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContactRow extends RowDataPacket {
  id: number;
  college_name: string;
  contact_name: string;
  email: string;
  phone: string;
}

interface CountRow extends RowDataPacket {
  total: number;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CollegeContactPage({
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
      "(college_name LIKE ? OR contact_name LIKE ? OR email LIKE ? OR phone LIKE ?)",
    );
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  // ── Query contacts ─────────────────────────────────────────────────────────
  const [contacts, countRows] = await Promise.all([
    safeQuery<ContactRow>(
      `SELECT id, college_name, contact_name, email, phone
       FROM next_college_signups
       ${where}
       ORDER BY college_name ASC
       LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total FROM next_college_signups ${where}`,
      params,
    ),
  ]);

  const total = countRows[0]?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 space-y-8 max-w-[1400px]">
      
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
            <span className="material-symbols-rounded text-amber-500 text-[28px]" style={ICO_FILL}>contact_phone</span>
            College Contact Cards
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Directory of all registered colleges and their primary contact persons.
          </p>
        </div>
        <form method="GET" action="/admin/colleges/contact" className="w-full sm:w-80">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none" style={ICO}>search</span>
            <input 
              type="text" 
              name="q" 
              defaultValue={q}
              placeholder="Search contacts..." 
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </form>
      </div>

      {/* ── Grid ─────────────────────────────────────────────────────────── */}
      {contacts.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl py-20 text-center shadow-sm">
             <span className="material-symbols-rounded text-6xl text-slate-200 block mb-4" style={ICO_FILL}>contact_phone</span>
             <p className="text-slate-500 font-medium">No contacts found.</p>
             {q && (
                 <Link href="/admin/colleges/contact" className="text-blue-600 text-sm mt-2 hover:underline">Clear search</Link>
             )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {contacts.map((c) => (
            <div key={c.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 group-hover:border-blue-100 transition-colors">
                  <span className="material-symbols-rounded text-[24px]" style={ICO_FILL}>apartment</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-800 truncate leading-tight group-hover:text-blue-600 transition-colors">{c.college_name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-medium">
                    <span className="material-symbols-rounded text-[14px]" style={ICO_FILL}>person</span>
                    <span className="truncate">{c.contact_name || "No Contact Person"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mt-auto">
                <a href={`mailto:${c.email}`} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors bg-slate-50/50">
                  <span className="material-symbols-rounded text-slate-400 text-[16px]" style={ICO}>mail</span>
                  <span className="truncate">{c.email}</span>
                </a>
                <a href={`tel:${c.phone}`} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors bg-slate-50/50">
                  <span className="material-symbols-rounded text-slate-400 text-[16px]" style={ICO}>call</span>
                  <span className="truncate font-mono">{formatPhone(c.phone)}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center pt-8">
             <div className="flex items-center gap-2 bg-white border border-slate-100 p-1.5 rounded-2xl shadow-sm">
                {Array.from({ length: totalPages }).map((_, i) => {
                    const p = i + 1;
                    const active = p === page;
                    return (
                        <Link 
                            key={p} 
                            href={`/admin/colleges/contact?page=${p}${q ? `&q=${q}` : ''}`}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                                active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            {p}
                        </Link>
                    )
                })}
             </div>
        </div>
      )}

    </div>
  );
}
