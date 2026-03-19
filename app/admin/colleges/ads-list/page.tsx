import pool from "@/lib/db";
import Link from "next/link";
import { RowDataPacket } from "mysql2";
import { revalidatePath } from "next/cache";
import DeleteButton from "@/app/admin/_components/DeleteButton";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function toggleAdRowStatus(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string, 10);
  const currentStatus = parseInt(formData.get("status") as string, 10);
  if (!id) return;
  
  try {
    await pool.query("UPDATE ads_top_college_lists SET status = ? WHERE id = ?", [
      currentStatus ? 0 : 1,
      id,
    ]);
  } catch (e) {
    console.error("[admin/colleges/ads-list toggleStatus]", e);
  }
  revalidatePath("/admin/colleges/ads-list");
  revalidatePath("/", "layout");
}

async function deleteAdRow(id: number) {
  "use server";
  if (!id) return;
  
  try {
    await pool.query("DELETE FROM ads_top_college_lists WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/colleges/ads-list deleteRow]", e);
  }
  revalidatePath("/admin/colleges/ads-list");
  revalidatePath("/", "layout");
}

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

function formatDate(d: string | Date | null | undefined): string {
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

interface AdCollegeRow extends RowDataPacket {
  id: number;
  method_type: string | null;
  status: number;
  created_at: string;
  college_name: string;
  degree_name: string | null;
  course_name: string | null;
  city_name: string | null;
}

interface CountRow extends RowDataPacket {
  total: number;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdsCollegesListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp     = await searchParams;
  const q      = (sp.q ?? "").trim();
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  // ── WHERE ──────────────────────────────────────────────────────────────────
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (q) {
    conditions.push("(u.firstname LIKE ? OR a.method_type LIKE ? OR d.name LIKE ? OR c.name LIKE ? OR ct.name LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  // ── Queries ────────────────────────────────────────────────────────────────
  const [adsRows, countRows, statsRows] = await Promise.all([
    safeQuery<AdCollegeRow>(
      `SELECT 
         a.id,
         a.method_type,
         a.status,
         a.created_at,
         COALESCE(u.firstname, 'Unnamed College') AS college_name,
         d.name AS degree_name,
         c.name AS course_name,
         ct.name AS city_name
       FROM ads_top_college_lists a
       LEFT JOIN collegeprofile cp ON cp.id = a.collegeprofile_id
       LEFT JOIN users u ON u.id = cp.users_id
       LEFT JOIN degree d ON d.id = a.degree_id
       LEFT JOIN course c ON c.id = a.course_id
       LEFT JOIN city ct ON ct.id = a.city_id
       ${where}
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total 
       FROM ads_top_college_lists a
       LEFT JOIN collegeprofile cp ON cp.id = a.collegeprofile_id
       LEFT JOIN users u ON u.id = cp.users_id
       LEFT JOIN degree d ON d.id = a.degree_id
       LEFT JOIN course c ON c.id = a.course_id
       LEFT JOIN city ct ON ct.id = a.city_id
       ${where}`,
      params,
    ),
    safeQuery<RowDataPacket>(`
      SELECT 
        COUNT(*) AS total,
        SUM(status = 0) AS inactive,
        SUM(status = 1) AS active
      FROM ads_top_college_lists
    `),
  ]);

  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const stats      = statsRows[0];

  function buildUrl(overrides: Record<string, string | number>) {
    const merged = { q, page: "1", ...overrides };
    const qs = Object.entries(merged)
      .filter(([, v]) => v !== "" && v !== "1")
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    return `/admin/colleges/ads-list${qs ? `?${qs}` : ""}`;
  }

  const STAT_CARDS = [
    { label: "Total Placements", value: stats?.total ?? 0, icon: "format_list_numbered", accent: "bg-blue-50 text-blue-600" },
    { label: "Active", value: stats?.active ?? 0, icon: "check_circle", accent: "bg-emerald-50 text-emerald-600" },
    { label: "Inactive", value: stats?.inactive ?? 0, icon: "pause_circle", accent: "bg-slate-50 text-slate-500" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>format_list_numbered</span>
            ADS Top Colleges
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage the list of top promoted colleges within ads segments.</p>
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
        <form method="GET" action="/admin/colleges/ads-list" className="flex-1 w-full max-w-md">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400" style={ICO}>search</span>
            <input 
              name="q" defaultValue={q} placeholder="Search college, method, degree..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
            />
          </div>
        </form>
        {q && (
          <Link href="/admin/colleges/ads-list" className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1">
            <span className="material-symbols-rounded text-[16px]">close</span>
            Clear
          </Link>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {adsRows.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <span className="material-symbols-rounded text-6xl block mb-4 text-slate-200" style={ICO}>format_list_numbered</span>
            <p className="text-sm font-semibold">No college ads records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3 w-10">#</th>
                  <th className="px-4 py-3">College</th>
                  <th className="px-4 py-3">Placement Context</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3">Date Added</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-600">
                {adsRows.map((row, idx) => {
                  const items = [row.degree_name, row.course_name, row.city_name].filter(Boolean);
                  const placementCtx = items.join(" • ") || "General";
                  
                  return (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 text-xs font-mono text-slate-400">{offset + idx + 1}</td>
                      <td className="px-4 py-4 min-w-[200px]">
                        <p className="font-semibold text-slate-800">{row.college_name}</p>
                        {row.method_type && (
                          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mt-0.5">{row.method_type}</p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs text-slate-500">{placementCtx}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <form action={toggleAdRowStatus} className="inline-block">
                          <input type="hidden" name="id" value={row.id} />
                          <input type="hidden" name="status" value={row.status} />
                          <button
                            type="submit"
                            title={row.status ? "Set inactive" : "Set active"}
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider transition-colors ${
                              row.status
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                            }`}
                          >
                            <span className="material-symbols-rounded text-[13px]" style={ICO_FILL}>
                              {row.status ? "toggle_on" : "toggle_off"}
                            </span>
                            {row.status ? "Active" : "Inactive"}
                          </button>
                        </form>
                      </td>
                      <td className="px-4 py-4 text-xs whitespace-nowrap">
                        {formatDate(row.created_at)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <DeleteButton action={deleteAdRow.bind(null, row.id)} size="sm" />
                      </td>
                    </tr>
                  );
                })}
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
