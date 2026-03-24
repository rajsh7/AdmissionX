import pool from "@/lib/db";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { RowDataPacket } from "mysql2";
import AdsManagementDashboardClient from "./AdsManagementDashboardClient";
import { saveUpload } from "@/lib/upload-utils";

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

async function createAdManagement(formData: FormData) {
  "use server";
  try {
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const redirectto = formData.get("redirectto") as string;
    const start = formData.get("start") as string;
    const end = formData.get("end") as string;
    const ads_position = formData.get("ads_position") as string;
    const users_id = parseInt(formData.get("users_id") as string, 10);
    const isactive = formData.get("isactive") ? 1 : 0;

    const imgFile = formData.get("img_file") as File;
    let img = "";

    if (imgFile && imgFile.size > 0) {
      const publicUrl = await saveUpload(imgFile, "ads", "banner");
      img = publicUrl.replace("/uploads/", "");
    }

    await pool.query(
      `INSERT INTO ads_managements (title, slug, description, img, redirectto, start, end, ads_position, users_id, isactive, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [title, slug, description, img, redirectto, start || null, end || null, ads_position, isNaN(users_id) ? null : users_id, isactive]
    );
  } catch (e) {
    console.error("[admin/ads createAd]", e);
  }
  revalidatePath("/admin/ads/management");
  revalidatePath("/", "layout");
}

async function updateAdManagement(formData: FormData) {
  "use server";
  try {
    const id = parseInt(formData.get("id") as string, 10);
    if (!id) return;
    
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const redirectto = formData.get("redirectto") as string;
    const start = formData.get("start") as string;
    const end = formData.get("end") as string;
    const ads_position = formData.get("ads_position") as string;
    const users_id = parseInt(formData.get("users_id") as string, 10);
    const isactive = formData.get("isactive") ? 1 : 0;

    const imgFile = formData.get("img_file") as File;
    let img = formData.get("img_existing") as string;

    if (imgFile && imgFile.size > 0) {
      const publicUrl = await saveUpload(imgFile, "ads", "banner");
      img = publicUrl.replace("/uploads/", "");
    }

    await pool.query(
      `UPDATE ads_managements SET title=?, slug=?, description=?, img=?, redirectto=?, start=?, end=?, ads_position=?, users_id=?, isactive=?, updated_at=NOW() WHERE id=?`,
      [title, slug, description, img, redirectto, start || null, end || null, ads_position, isNaN(users_id) ? null : users_id, isactive, id]
    );
  } catch (e) {
    console.error("[admin/ads updateAd]", e);
  }
  revalidatePath("/admin/ads/management");
  revalidatePath("/", "layout");
}

async function deleteAdManagement(id: number) {
  "use server";
  if (!id) return;
  try {
    await pool.query("DELETE FROM ads_managements WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/ads deleteAd]", e);
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
  college_banner: string | null;
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
      `SELECT a.*, cp.bannerimage AS college_banner
       FROM ads_managements a
       LEFT JOIN collegeprofile cp ON a.users_id = cp.users_id
       ${where ? where.replace(/title|ads_position|redirectto/g, (m) => "a." + m) : ""}
       ORDER BY a.isactive DESC, a.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total FROM ads_managements a ${where ? where.replace(/title|ads_position|redirectto/g, (m) => "a." + m) : ""}`,
      params,
    ),
    safeQuery<CountRow>("SELECT COUNT(*) AS total FROM ads_managements"),
    safeQuery<CountRow>("SELECT COUNT(*) AS total FROM ads_managements WHERE isactive = 1"),
    safeQuery<CountRow>("SELECT COUNT(*) AS total FROM ads_managements WHERE isactive = 0"),
  ]);

  const total = Number(countRows[0]?.total ?? 0);

  function buildUrl(overrides: Record<string, string | number>) {
    const merged = { q, page: "1", filter, ...overrides };
    const qs = Object.entries(merged)
      .filter(([, v]) => v !== "" && v !== "1" && v !== "all")
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    return `/admin/ads/management${qs ? "?" + qs : ""}`;
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

      <AdsManagementDashboardClient
        ads={ads}
        total={total}
        offset={offset}
        pageSize={PAGE_SIZE}
        q={q}
        createAction={createAdManagement}
        updateAction={updateAdManagement}
        deleteAction={deleteAdManagement}
        toggleAction={toggleAdAction}
      />
    </div>
  );
}
