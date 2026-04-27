import { getDb } from "@/lib/db";
import Link from "next/link";
import AdsManagementDashboardClient from "./AdsManagementDashboardClient";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;
const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

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

  // ── MongoDB filter ──────────────────────────────────────────────────────
  const db = await getDb();
  const col = db.collection("ads_managements");

  const mongoFilter: Record<string, any> = {};
  if (q) {
    const regex = { $regex: q, $options: "i" };
    mongoFilter.$or = [
      { title: regex },
      { ads_position: regex },
      { redirectto: regex },
    ];
  }
  if (filter === "active")   mongoFilter.isactive = { $in: [1, true, "1"] };
  if (filter === "inactive") mongoFilter.isactive = { $in: [0, false, "0", null] };

  // ── Parallel queries ───────────────────────────────────────────────────────
  const [ads, total, totalCount, activeCount, inactiveCount] = await Promise.all([
    col.find(mongoFilter).sort({ isactive: -1, created_at: -1 }).skip(offset).limit(PAGE_SIZE).toArray(),
    col.countDocuments(mongoFilter),
    col.countDocuments({}),
    col.countDocuments({ isactive: { $in: [1, true, "1"] } }),
    col.countDocuments({ isactive: { $in: [0, false, "0", null] } }),
  ]);

  const cleanAds = ads.map((a: any) => ({
    id: Number(a.id ?? 0),
    title: a.title ? String(a.title) : null,
    img: a.img ? String(a.img) : null,
    description: a.description ? String(a.description) : null,
    isactive: a.isactive === 1 || a.isactive === true || a.isactive === "1" ? 1 : 0,
    slug: a.slug ? String(a.slug) : null,
    redirectto: a.redirectto ? String(a.redirectto) : null,
    start: a.start ? String(a.start) : null,
    end: a.end ? String(a.end) : null,
    ads_position: a.ads_position ? String(a.ads_position) : null,
    users_id: a.users_id ? Number(a.users_id) : null,
    college_banner: a.college_banner ? String(a.college_banner) : null,
    created_at: a.created_at ? String(a.created_at) : "",
    updated_at: a.updated_at ? String(a.updated_at) : "",
  }));

  function buildUrl(overrides: Record<string, string | number>) {
    const merged = { q, page: "1", filter, ...overrides };
    const qs = Object.entries(merged)
      .filter(([, v]) => v !== "" && v !== "1" && v !== "all")
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    return `/admin/ads/management${qs ? "?" + qs : ""}`;
  }

  const FILTER_TABS = [
    { value: "all",      label: "All Ads",  count: totalCount },
    { value: "active",   label: "Active",   count: activeCount },
    { value: "inactive", label: "Inactive", count: inactiveCount },
  ];

  const STAT_CARDS = [
    { label: "Total Ads", count: totalCount,    icon: "ad_units",     accent: "bg-rose-50 text-rose-600"       },
    { label: "Active",    count: activeCount,   icon: "check_circle", accent: "bg-emerald-50 text-emerald-600" },
    { label: "Inactive",  count: inactiveCount, icon: "cancel",       accent: "bg-slate-50 text-slate-500"    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto w-full">

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
          {totalCount.toLocaleString()} total
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

      <AdsManagementDashboardClient
        ads={cleanAds}
        total={total}
        offset={offset}
        pageSize={PAGE_SIZE}
        q={q}
      />
    </div>
  );
}




