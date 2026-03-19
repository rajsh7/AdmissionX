import pool from "@/lib/db";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { RowDataPacket } from "mysql2";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function toggleAdAction(formData: FormData) {
  "use server";
  const id  = parseInt(formData.get("id")  as string, 10);
  const cur = parseInt(formData.get("cur") as string, 10);
  if (!id) return;
  try {
    await pool.query("UPDATE ads_managements SET isactive = ? WHERE id = ?", [
      cur ? 0 : 1,
      id,
    ]);
  } catch (e) {
    console.error("[admin/ads toggleAd]", e);
  }
  revalidatePath("/admin/ads/management");
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
    console.error("[admin/ads/management safeQuery]", err);
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

// ─── Position badge ───────────────────────────────────────────────────────────

const POSITION_STYLE: Record<string, string> = {
  top:     "bg-violet-100 text-violet-700",
  sidebar: "bg-blue-100 text-blue-700",
  banner:  "bg-amber-100 text-amber-700",
  bottom:  "bg-slate-100 text-slate-600",
  popup:   "bg-rose-100 text-rose-700",
  inline:  "bg-teal-100 text-teal-700",
};

function positionStyle(pos: string | null): string {
  if (!pos) return "bg-slate-100 text-slate-500";
  return POSITION_STYLE[pos.toLowerCase().trim()] ?? "bg-slate-100 text-slate-600";
}

// ─── Running badge ────────────────────────────────────────────────────────────

function isRunningNow(
  start: string | Date | null | undefined,
  end: string | Date | null | undefined,
  isactive: number,
): boolean {
  if (!isactive || !start || !end) return false;
  try {
    const now = Date.now();
    return new Date(start).getTime() <= now && new Date(end).getTime() >= now;
  } catch {
    return false;
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdRow extends RowDataPacket {
  id: number;
  title: string | null;
  img: string | null;
  description: string | null;
  isactive: number;
  slug: string | null;
  redirectto: string | null;
  start: string | null;
  end: string | null;
  ads_position: string | null;
  users_id: number | null;
  created_at: string;
  updated_at: string;
}

interface CountRow extends RowDataPacket { total: number; }

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminAdsPage({
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
    conditions.push("(title LIKE ? OR ads_position LIKE ? OR redirectto LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (filter === "active")   conditions.push("isactive = 1");
  if (filter === "inactive") conditions.push("isactive = 0");

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  // ── Parallel queries ───────────────────────────────────────────────────────
  const [ads, countRows, totalRow, activeRow, inactiveRow] = await Promise.all([
    safeQuery<AdRow>(
      `SELECT id, title, img, description, isactive, slug, redirectto,
              start, end, ads_position, users_id, created_at, updated_at
       FROM ads_managements
       ${where}
       ORDER BY isactive DESC, created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total FROM ads_managements ${where}`,
      params,
    ),
    safeQuery<CountRow>("SELECT COUNT(*) AS total FROM ads_managements"),
    safeQuery<CountRow>("SELECT COUNT(*) AS total FROM ads_managements WHERE isactive = 1"),
    safeQuery<CountRow>("SELECT COUNT(*) AS total FROM ads_managements WHERE isactive = 0"),
  ]);

  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  function buildUrl(overrides: Record<string, string | number>) {
    const merged = { q, page: "1", filter, ...overrides };
    const qs = Object.entries(merged)
      .filter(([, v]) => v !== "" && v !== "1" && v !== "all")
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    return `/admin/ads/management${qs ? `?${qs}` : ""}`;
  }

  const FILTER_TABS = [
    { value: "all",      label: "All Ads",  count: totalRow[0]?.total    ?? 0 },
    { value: "active",   label: "Active",   count: activeRow[0]?.total   ?? 0 },
    { value: "inactive", label: "Inactive", count: inactiveRow[0]?.total ?? 0 },
  ];

  const STAT_CARDS = [
    { label: "Total Ads", count: totalRow[0]?.total    ?? 0, icon: "ad_units",       accent: "bg-rose-50 text-rose-600"    },
    { label: "Active",    count: activeRow[0]?.total   ?? 0, icon: "check_circle",   accent: "bg-emerald-50 text-emerald-600" },
    { label: "Inactive",  count: inactiveRow[0]?.total ?? 0, icon: "cancel",         accent: "bg-slate-50 text-slate-500"  },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-rose-600 text-[22px]" style={ICO_FILL}>
              ad_units
            </span>
            Ads Manager
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage advertisement campaigns and their active status.
          </p>
        </div>
        <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl flex-shrink-0">
          {(totalRow[0]?.total ?? 0).toLocaleString()} total
        </span>
      </div>

      {/* ── Stat mini-cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STAT_CARDS.map((card, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4"
          >
            <div className={`${card.accent} p-2.5 rounded-xl flex-shrink-0`}>
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
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl flex-shrink-0">
          {FILTER_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={buildUrl({ filter: tab.value, page: 1 })}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                filter === tab.value
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-[10px] font-black opacity-60">
                {tab.count}
              </span>
            </Link>
          ))}
        </div>

        <form method="GET" action="/admin/ads/management" className="flex-1 max-w-sm ml-auto">
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
              placeholder="Search title, position, or redirect URL…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 transition"
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
        {ads.length === 0 ? (
          <div className="py-20 text-center">
            <span
              className="material-symbols-rounded text-6xl text-slate-200 block mb-4"
              style={ICO_FILL}
            >
              ad_units
            </span>
            <p className="text-sm font-semibold text-slate-500">
              {q ? `No ads matching "${q}"` : "No ads found."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3 text-left w-10">#</th>
                    <th className="px-4 py-3 text-left">Title</th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">Position</th>
                    <th className="px-4 py-3 text-center">Active</th>
                    <th className="px-4 py-3 text-left hidden lg:table-cell">Start</th>
                    <th className="px-4 py-3 text-left hidden lg:table-cell">End</th>
                    <th className="px-4 py-3 text-left hidden xl:table-cell">Redirect URL</th>
                    <th className="px-4 py-3 text-left hidden sm:table-cell">Date Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {ads.map((ad, idx) => {
                    const running = isRunningNow(ad.start, ad.end, ad.isactive);
                    return (
                      <tr
                        key={ad.id}
                        className="hover:bg-rose-50/20 transition-colors group"
                      >
                        {/* # */}
                        <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">
                          {offset + idx + 1}
                        </td>

                        {/* Title + running badge */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span
                                className="material-symbols-rounded text-rose-600 text-[16px]"
                                style={ICO_FILL}
                              >
                                ad_units
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 truncate max-w-[200px]">
                                {ad.title ?? <span className="italic text-slate-400">Untitled</span>}
                              </p>
                              {running && (
                                <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                  <span
                                    className="material-symbols-rounded text-[11px]"
                                    style={ICO_FILL}
                                  >
                                    radio_button_checked
                                  </span>
                                  Running
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Position badge */}
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          {ad.ads_position ? (
                            <span
                              className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${positionStyle(ad.ads_position)}`}
                            >
                              {ad.ads_position}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </td>

                        {/* Active toggle */}
                        <td className="px-4 py-3.5 text-center">
                          <form action={toggleAdAction} className="inline-block">
                            <input type="hidden" name="id"  value={ad.id} />
                            <input type="hidden" name="cur" value={ad.isactive} />
                            <button
                              type="submit"
                              title={ad.isactive ? "Deactivate ad" : "Activate ad"}
                              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                                ad.isactive
                                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                  : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                              }`}
                            >
                              <span
                                className="material-symbols-rounded text-[13px]"
                                style={ICO_FILL}
                              >
                                {ad.isactive ? "toggle_on" : "toggle_off"}
                              </span>
                              {ad.isactive ? "Active" : "Off"}
                            </button>
                          </form>
                        </td>

                        {/* Start */}
                        <td className="px-4 py-3.5 hidden lg:table-cell">
                          <span className="text-xs text-slate-500 whitespace-nowrap">
                            {formatDate(ad.start)}
                          </span>
                        </td>

                        {/* End */}
                        <td className="px-4 py-3.5 hidden lg:table-cell">
                          <span
                            className={`text-xs whitespace-nowrap ${
                              ad.end && new Date(ad.end).getTime() < Date.now()
                                ? "text-red-400 font-semibold"
                                : "text-slate-500"
                            }`}
                          >
                            {formatDate(ad.end)}
                          </span>
                        </td>

                        {/* Redirect URL */}
                        <td className="px-4 py-3.5 hidden xl:table-cell">
                          {ad.redirectto ? (
                            <a
                              href={ad.redirectto}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-rose-600 hover:underline truncate block max-w-[180px]"
                              title={ad.redirectto}
                            >
                              {ad.redirectto}
                            </a>
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </td>

                        {/* Date Added */}
                        <td className="px-4 py-3.5 hidden sm:table-cell">
                          <span className="text-xs text-slate-400 whitespace-nowrap">
                            {formatDate(ad.created_at)}
                          </span>
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
                  of <strong className="text-slate-700">{total}</strong> ads
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
                            ? "bg-rose-600 text-white shadow-sm"
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
