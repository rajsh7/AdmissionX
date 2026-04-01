import pool from "@/lib/db";
import Link from "next/link";
// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;
const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

async function safeQuery<T >(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/cities safeQuery]", err);
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

interface CityRow  {
  id: number;
  name: string;
  pageslug: string | null;
  cityStatus: string | null;
  state_id: number | null;
  isShowOnTop: number;
  isShowOnHome: number;
  totalCollegeRegAddress: number | null;
  totalCollegeByCampusAddress: number | null;
  created_at: string;
}

interface CountRow  { total: number; }

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminCitiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp     = await searchParams;
  const q      = (sp.q ?? "").trim();
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const filter = sp.filter ?? "all"; // all | active | inactive
  const offset = (page - 1) * PAGE_SIZE;

  // ── WHERE ──────────────────────────────────────────────────────────────────
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (q) {
    conditions.push("(name LIKE ? OR pageslug LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }
  if (filter === "active")   conditions.push("cityStatus = 'active'");
  if (filter === "inactive") conditions.push("(cityStatus IS NULL OR cityStatus != 'active')");

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  // ── Parallel queries ───────────────────────────────────────────────────────
  const [cities, countRows, totalRow, topRow, homeRow, activeRow, inactiveRow] =
    await Promise.all([
      safeQuery<CityRow>(
        `SELECT id, name, pageslug, cityStatus, state_id, isShowOnTop, isShowOnHome,
                totalCollegeRegAddress, totalCollegeByCampusAddress, created_at
         FROM city
         ${where}
         ORDER BY isShowOnTop DESC, name ASC
         LIMIT ? OFFSET ?`,
        [...params, PAGE_SIZE, offset],
      ),
      safeQuery<CountRow>(`SELECT COUNT(*) AS total FROM city ${where}`, params),
      safeQuery<CountRow>("SELECT COUNT(*) AS total FROM city"),
      safeQuery<CountRow>("SELECT COUNT(*) AS total FROM city WHERE isShowOnTop = 1"),
      safeQuery<CountRow>("SELECT COUNT(*) AS total FROM city WHERE isShowOnHome = 1"),
      safeQuery<CountRow>("SELECT COUNT(*) AS total FROM city WHERE cityStatus = 'active'"),
      safeQuery<CountRow>(
        "SELECT COUNT(*) AS total FROM city WHERE (cityStatus IS NULL OR cityStatus != 'active')",
      ),
    ]);

  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  function buildUrl(overrides: Record<string, string | number>) {
    const merged = { q, page: "1", filter, ...overrides };
    const qs = Object.entries(merged)
      .filter(([, v]) => v !== "" && v !== "1" && v !== "all")
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    return `/admin/cities${qs ? `?${qs}` : ""}`;
  }

  const FILTER_TABS = [
    { value: "all",      label: "All Cities", count: totalRow[0]?.total    ?? 0 },
    { value: "active",   label: "Active",      count: activeRow[0]?.total   ?? 0 },
    { value: "inactive", label: "Inactive",    count: inactiveRow[0]?.total ?? 0 },
  ];

  const STAT_CARDS = [
    { label: "Total Cities", count: totalRow[0]?.total  ?? 0, icon: "location_city" },
    { label: "Show on Top",  count: topRow[0]?.total    ?? 0, icon: "star"           },
    { label: "On Homepage",  count: homeRow[0]?.total   ?? 0, icon: "home"           },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-sky-600 text-[22px]" style={ICO_FILL}>
              location_city
            </span>
            Cities
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Browse cities and their college registration counts.
          </p>
        </div>
        <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl flex-shrink-0">
          {(totalRow[0]?.total ?? 0).toLocaleString()} total
        </span>
      </div>

      {/* ── Stat mini-cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {STAT_CARDS.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4"
          >
            <div className="bg-sky-50 text-sky-600 p-2.5 rounded-xl flex-shrink-0">
              <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>
                {card.icon}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-slate-800 leading-tight">{card.count}</p>
              <p className="text-xs font-semibold text-slate-500 truncate">{card.label}</p>
            </div>
          </div>
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
              <span className="ml-1.5 text-[10px] opacity-60">({tab.count})</span>
            </Link>
          ))}
        </div>

        <form method="GET" action="/admin/cities" className="flex-1 max-w-sm">
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
              placeholder="Search city name or slug…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition"
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
        {cities.length === 0 ? (
          <div className="py-20 text-center">
            <span
              className="material-symbols-rounded text-6xl text-slate-200 block mb-4"
              style={ICO_FILL}
            >
              location_city
            </span>
            <p className="text-sm font-semibold text-slate-500">
              {q ? `No cities matching "${q}"` : "No cities found."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3 text-left w-10">#</th>
                    <th className="px-4 py-3 text-left">City Name</th>
                    <th className="px-4 py-3 text-left hidden lg:table-cell">Slug</th>
                    <th className="px-4 py-3 text-center">City Status</th>
                    <th className="px-4 py-3 text-center hidden md:table-cell">Colleges (Reg)</th>
                    <th className="px-4 py-3 text-center hidden md:table-cell">Colleges (Campus)</th>
                    <th className="px-4 py-3 text-center hidden sm:table-cell">Show Top</th>
                    <th className="px-4 py-3 text-center hidden sm:table-cell">Show Home</th>
                    <th className="px-4 py-3 text-left hidden xl:table-cell">State ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {cities.map((row, idx) => {
                    const isActive = row.cityStatus?.toString().toLowerCase() === "active";
                    return (
                      <tr key={row.id} className="hover:bg-sky-50/20 transition-colors">

                        {/* # */}
                        <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">
                          {offset + idx + 1}
                        </td>

                        {/* City Name */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">
                              <span
                                className="material-symbols-rounded text-sky-600 text-[16px]"
                                style={ICO_FILL}
                              >
                                location_city
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 truncate max-w-[180px]">
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

                        {/* City Status */}
                        <td className="px-4 py-3.5 text-center">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                              isActive
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                isActive ? "bg-emerald-500" : "bg-slate-400"
                              }`}
                            />
                            {row.cityStatus ?? "Unknown"}
                          </span>
                        </td>

                        {/* Colleges (Reg) */}
                        <td className="px-4 py-3.5 text-center hidden md:table-cell">
                          <span className="text-sm font-semibold text-slate-700">
                            {row.totalCollegeRegAddress ?? 0}
                          </span>
                        </td>

                        {/* Colleges (Campus) */}
                        <td className="px-4 py-3.5 text-center hidden md:table-cell">
                          <span className="text-sm font-semibold text-slate-700">
                            {row.totalCollegeByCampusAddress ?? 0}
                          </span>
                        </td>

                        {/* Show Top */}
                        <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              row.isShowOnTop
                                ? "bg-sky-100 text-sky-700"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            <span
                              className="material-symbols-rounded text-[12px]"
                              style={ICO_FILL}
                            >
                              {row.isShowOnTop ? "star" : "star_border"}
                            </span>
                            {row.isShowOnTop ? "Yes" : "No"}
                          </span>
                        </td>

                        {/* Show Home */}
                        <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              row.isShowOnHome
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            <span
                              className="material-symbols-rounded text-[12px]"
                              style={ICO_FILL}
                            >
                              home
                            </span>
                            {row.isShowOnHome ? "Yes" : "No"}
                          </span>
                        </td>

                        {/* State ID */}
                        <td className="px-4 py-3.5 hidden xl:table-cell">
                          {row.state_id != null ? (
                            <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                              #{row.state_id}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/50">
                <p className="text-xs text-slate-500">
                  Showing{" "}
                  <strong className="text-slate-700">
                    {offset + 1}–{Math.min(offset + PAGE_SIZE, total)}
                  </strong>{" "}
                  of <strong className="text-slate-700">{total}</strong> cities
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
                            ? "bg-sky-600 text-white shadow-sm"
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

      {/* ── Read-only notice ──────────────────────────────────────────────── */}
      <p className="text-xs text-slate-400 text-center">
        City data is read-only in this panel. Use the legacy admin for city management.
      </p>
    </div>
  );
}




