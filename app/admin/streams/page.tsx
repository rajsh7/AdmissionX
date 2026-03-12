import pool from "@/lib/db";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { RowDataPacket } from "mysql2";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function toggleStreamTop(formData: FormData) {
  "use server";
  const id  = parseInt(formData.get("id")  as string, 10);
  const cur = parseInt(formData.get("cur") as string, 10);
  if (!id) return;
  try {
    await pool.query("UPDATE functionalarea SET isShowOnTop = ? WHERE id = ?", [
      cur ? 0 : 1,
      id,
    ]);
  } catch (e) {
    console.error("[admin/streams toggleTop]", e);
  }
  revalidatePath("/admin/streams");
}

async function toggleStreamHome(formData: FormData) {
  "use server";
  const id  = parseInt(formData.get("id")  as string, 10);
  const cur = parseInt(formData.get("cur") as string, 10);
  if (!id) return;
  try {
    await pool.query("UPDATE functionalarea SET isShowOnHome = ? WHERE id = ?", [
      cur ? 0 : 1,
      id,
    ]);
  } catch (e) {
    console.error("[admin/streams toggleHome]", e);
  }
  revalidatePath("/admin/streams");
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
    console.error("[admin/streams safeQuery]", err);
    return [];
  }
}

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch { return "—"; }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface StreamRow extends RowDataPacket {
  id: number;
  name: string;
  pageslug: string | null;
  logoimage: string | null;
  bannerimage: string | null;
  isShowOnTop: number;
  isShowOnHome: number;
  created_at: string;
  updated_at: string;
}

interface CountRow extends RowDataPacket { total: number; }

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminStreamsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp     = await searchParams;
  const q      = (sp.q ?? "").trim();
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const filter = sp.filter ?? "all"; // all | top | home
  const offset = (page - 1) * PAGE_SIZE;

  // ── WHERE ──────────────────────────────────────────────────────────────────
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (q) {
    conditions.push("(name LIKE ? OR pageslug LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }
  if (filter === "top")  conditions.push("isShowOnTop = 1");
  if (filter === "home") conditions.push("isShowOnHome = 1");

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  // ── Parallel queries ───────────────────────────────────────────────────────
  const [streams, countRows, totalRow, topRow, homeRow] = await Promise.all([
    safeQuery<StreamRow>(
      `SELECT id, name, pageslug, logoimage, bannerimage,
              isShowOnTop, isShowOnHome, created_at, updated_at
       FROM functionalarea
       ${where}
       ORDER BY isShowOnTop DESC, name ASC
       LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total FROM functionalarea ${where}`,
      params,
    ),
    safeQuery<CountRow>("SELECT COUNT(*) AS total FROM functionalarea"),
    safeQuery<CountRow>("SELECT COUNT(*) AS total FROM functionalarea WHERE isShowOnTop = 1"),
    safeQuery<CountRow>("SELECT COUNT(*) AS total FROM functionalarea WHERE isShowOnHome = 1"),
  ]);

  const total      = countRows[0]?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  function buildUrl(overrides: Record<string, string | number>) {
    const merged = { q, page: "1", filter, ...overrides };
    const qs = Object.entries(merged)
      .filter(([, v]) => v !== "" && v !== "1" && v !== "all")
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    return `/admin/streams${qs ? `?${qs}` : ""}`;
  }

  const FILTER_TABS = [
    { value: "all",  label: "All Streams", count: totalRow[0]?.total ?? 0 },
    { value: "top",  label: "Show on Top", count: topRow[0]?.total  ?? 0 },
    { value: "home", label: "On Homepage", count: homeRow[0]?.total ?? 0 },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-teal-600 text-[22px]" style={ICO_FILL}>
              hub
            </span>
            Streams
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage functional area streams and their homepage visibility.
          </p>
        </div>
        <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl flex-shrink-0">
          {(totalRow[0]?.total ?? 0).toLocaleString()} total
        </span>
      </div>

      {/* ── Stat mini-cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {FILTER_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={buildUrl({ filter: tab.value, page: 1 })}
            className={`bg-white rounded-2xl border p-5 flex items-center gap-4 hover:shadow-md transition-all ${
              filter === tab.value
                ? "border-teal-200 ring-2 ring-teal-100"
                : "border-slate-100 shadow-sm"
            }`}
          >
            <div className="bg-teal-50 text-teal-600 p-2.5 rounded-xl flex-shrink-0">
              <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>
                {tab.value === "top" ? "star" : tab.value === "home" ? "home" : "hub"}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-slate-800 leading-tight">{tab.count}</p>
              <p className="text-xs font-semibold text-slate-500 truncate">{tab.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Filter tabs + Search ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl flex-shrink-0">
          {FILTER_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={buildUrl({ filter: tab.value, page: 1 })}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                filter === tab.value
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <form method="GET" action="/admin/streams" className="flex-1 max-w-sm">
          {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none"
              style={ICO}
            >
              search
            </span>
            <input
              name="q"
              defaultValue={q}
              placeholder="Search stream name or slug…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition"
            />
          </div>
        </form>

        {q && (
          <Link
            href={buildUrl({ q: "", page: 1 })}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1"
          >
            <span className="material-symbols-rounded text-[15px]" style={ICO}>close</span>
            Clear
          </Link>
        )}
      </div>

      {/* ── Table card ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {streams.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-symbols-rounded text-6xl text-slate-200 block mb-4" style={ICO_FILL}>
              hub
            </span>
            <p className="text-sm font-semibold text-slate-500">
              {q ? `No streams matching "${q}"` : "No streams found."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3 text-left w-10">#</th>
                    <th className="px-4 py-3 text-left">Stream Name</th>
                    <th className="px-4 py-3 text-left hidden lg:table-cell">Slug</th>
                    <th className="px-4 py-3 text-center hidden md:table-cell">Assets</th>
                    <th className="px-4 py-3 text-center">Show on Top</th>
                    <th className="px-4 py-3 text-center">Show on Home</th>
                    <th className="px-4 py-3 text-left hidden sm:table-cell">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {streams.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-teal-50/20 transition-colors group">

                      {/* # */}
                      <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">
                        {offset + idx + 1}
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-rounded text-teal-600 text-[16px]" style={ICO_FILL}>
                              hub
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 truncate max-w-[200px]">
                              {row.name}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              ID: {row.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        {row.pageslug ? (
                          <span className="text-xs font-mono text-slate-500 truncate block max-w-[160px]">
                            /{row.pageslug}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300 italic">no slug</span>
                        )}
                      </td>

                      {/* Assets */}
                      <td className="px-4 py-3.5 hidden md:table-cell text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span
                            title="Logo"
                            className={`text-[13px] material-symbols-rounded ${row.logoimage ? "text-teal-500" : "text-slate-200"}`}
                            style={ICO_FILL}
                          >
                            image
                          </span>
                          <span
                            title="Banner"
                            className={`text-[13px] material-symbols-rounded ${row.bannerimage ? "text-teal-500" : "text-slate-200"}`}
                            style={ICO_FILL}
                          >
                            panorama
                          </span>
                        </div>
                      </td>

                      {/* isShowOnTop toggle */}
                      <td className="px-4 py-3.5 text-center">
                        <form action={toggleStreamTop} className="inline-block">
                          <input type="hidden" name="id"  value={row.id} />
                          <input type="hidden" name="cur" value={row.isShowOnTop} />
                          <button
                            type="submit"
                            title={row.isShowOnTop ? "Remove from top" : "Add to top"}
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                              row.isShowOnTop
                                ? "bg-teal-100 text-teal-700 hover:bg-teal-200"
                                : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                            }`}
                          >
                            <span className="material-symbols-rounded text-[13px]" style={ICO_FILL}>
                              {row.isShowOnTop ? "star" : "star_border"}
                            </span>
                            {row.isShowOnTop ? "Yes" : "No"}
                          </button>
                        </form>
                      </td>

                      {/* isShowOnHome toggle */}
                      <td className="px-4 py-3.5 text-center">
                        <form action={toggleStreamHome} className="inline-block">
                          <input type="hidden" name="id"  value={row.id} />
                          <input type="hidden" name="cur" value={row.isShowOnHome} />
                          <button
                            type="submit"
                            title={row.isShowOnHome ? "Remove from homepage" : "Add to homepage"}
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                              row.isShowOnHome
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                            }`}
                          >
                            <span className="material-symbols-rounded text-[13px]" style={ICO_FILL}>
                              home
                            </span>
                            {row.isShowOnHome ? "Yes" : "No"}
                          </button>
                        </form>
                      </td>

                      {/* Updated */}
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <span className="text-xs text-slate-400 whitespace-nowrap">
                          {formatDate(row.updated_at || row.created_at)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/50">
                <p className="text-xs text-slate-500">
                  Showing{" "}
                  <strong className="text-slate-700">{offset + 1}–{Math.min(offset + PAGE_SIZE, total)}</strong>{" "}
                  of <strong className="text-slate-700">{total}</strong> streams
                </p>
                <div className="flex items-center gap-1">
                  {page > 1 && (
                    <Link
                      href={buildUrl({ page: page - 1 })}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      ← Prev
                    </Link>
                  )}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                    const p = start + i;
                    if (p > totalPages) return null;
                    return (
                      <Link
                        key={p}
                        href={buildUrl({ page: p })}
                        className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                          p === page
                            ? "bg-teal-600 text-white shadow-sm"
                            : "text-slate-500 bg-white border border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {p}
                      </Link>
                    );
                  })}
                  {page < totalPages && (
                    <Link
                      href={buildUrl({ page: page + 1 })}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Next →
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
