import pool from "@/lib/db";
import Link from "next/link";
import { RowDataPacket } from "mysql2";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;
const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/colleges/ads-list safeQuery]", err);
    return [];
  }
}

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CollegeAdSignupRow extends RowDataPacket {
  id: number;
  college_name: string;
  email: string;
  contact_name: string;
  phone: string;
  status: string;
  created_at: string;
}

interface CountRow extends RowDataPacket { total: number; }

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdsCollegesListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp     = await searchParams;
  const q      = (sp.q ?? "").trim();
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const status = sp.status ?? "all";
  const offset = (page - 1) * PAGE_SIZE;

  // ── WHERE ──────────────────────────────────────────────────────────────────
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (q) {
    conditions.push("(college_name LIKE ? OR email LIKE ? OR contact_name LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (status !== "all") {
    conditions.push("status = ?");
    params.push(status);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  // ── Queries ────────────────────────────────────────────────────────────────
  const [colleges, countRows, statsRows] = await Promise.all([
    safeQuery<CollegeAdSignupRow>(
      `SELECT * FROM next_college_signups ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total FROM next_college_signups ${where}`,
      params,
    ),
    safeQuery<RowDataPacket>(`
      SELECT 
        COUNT(*) AS total,
        SUM(status = 'pending') AS pending,
        SUM(status = 'active') AS active
      FROM next_college_signups
    `),
  ]);

  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const stats      = statsRows[0];

  function buildUrl(overrides: Record<string, string | number>) {
    const merged = { q, page: "1", status, ...overrides };
    const qs = Object.entries(merged)
      .filter(([, v]) => v !== "" && v !== "1" && v !== "all")
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    return `/admin/colleges/ads-list${qs ? `?${qs}` : ""}`;
  }

  const STAT_CARDS = [
    { label: "Total Signups", value: stats?.total ?? 0, icon: "list_alt", accent: "bg-blue-50 text-blue-600" },
    { label: "Pending", value: stats?.pending ?? 0, icon: "pending", accent: "bg-amber-50 text-amber-600" },
    { label: "Active", value: stats?.active ?? 0, icon: "check_circle", accent: "bg-emerald-50 text-emerald-600" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>list_alt</span>
            ADS Colleges List
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Colleges registered for advertisement services.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STAT_CARDS.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`${card.accent} p-2.5 rounded-xl flex-shrink-0`}>
              <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>{card.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 leading-tight">{card.value}</p>
              <p className="text-xs font-semibold text-slate-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-center">
        <form method="GET" action="/admin/colleges/ads-list" className="flex-1 w-full">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400" style={ICO}>search</span>
            <input 
              name="q" defaultValue={q} placeholder="Search college, email, or contact..." 
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
            />
          </div>
        </form>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {["all", "pending", "active"].map((s) => (
            <Link 
              key={s} href={buildUrl({ status: s })} 
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${status === s ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              {s}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {colleges.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <span className="material-symbols-rounded text-6xl block mb-4" style={ICO}>list_alt</span>
            <p className="text-sm font-semibold">No colleges found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3 w-10">#</th>
                  <th className="px-4 py-3">College</th>
                  <th className="px-4 py-3">Contact Person</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3">Signup Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-600">
                {colleges.map((col, idx) => (
                  <tr key={col.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 text-xs font-mono text-slate-400">{offset + idx + 1}</td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-800">{col.college_name}</p>
                      <p className="text-xs text-slate-400">{col.email}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium">{col.contact_name}</p>
                      <p className="text-xs text-slate-400">{col.phone}</p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        col.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {col.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs">{formatDate(col.created_at)}</td>
                    <td className="px-4 py-4 text-right">
                      <button className="text-blue-600 hover:text-blue-700 font-bold text-xs">Verify</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <p className="text-xs text-slate-500">Showing <strong>{offset + 1}-{Math.min(offset + PAGE_SIZE, total)}</strong> of <strong>{total}</strong></p>
            <div className="flex gap-1">
              {page > 1 && <Link href={buildUrl({ page: page - 1 })} className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Prev</Link>}
              {page < totalPages && <Link href={buildUrl({ page: page + 1 })} className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Next</Link>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
