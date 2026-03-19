import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import StreamListClient from "./StreamListClient";

const PAGE_SIZE = 25;

// ─── Server Actions ───────────────────────────────────────────────────────────

async function createStream(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const pageslug = formData.get("pageslug") as string;
  const logoimage = formData.get("logoimage") as string;
  const bannerimage = formData.get("bannerimage") as string;
  const pagetitle = formData.get("pagetitle") as string;
  const pagedescription = formData.get("pagedescription") as string;
  const isShowOnTop = formData.get("isShowOnTop") === "on" ? 1 : 0;
  const isShowOnHome = formData.get("isShowOnHome") === "on" ? 1 : 0;

  if (!name) return;

  try {
    await pool.query(
      `INSERT INTO functionalarea (name, pageslug, logoimage, bannerimage, pagetitle, pagedescription, isShowOnTop, isShowOnHome, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [name, pageslug, logoimage, bannerimage, pagetitle, pagedescription, isShowOnTop, isShowOnHome]
    );
  } catch (e) {
    console.error("[admin/streams createAction]", e);
  }
  revalidatePath("/admin/streams");
  revalidatePath("/", "layout");
}

async function updateStream(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string, 10);
  const name = formData.get("name") as string;
  const pageslug = formData.get("pageslug") as string;
  const logoimage = formData.get("logoimage") as string;
  const bannerimage = formData.get("bannerimage") as string;
  const pagetitle = formData.get("pagetitle") as string;
  const pagedescription = formData.get("pagedescription") as string;
  const isShowOnTop = formData.get("isShowOnTop") === "on" ? 1 : 0;
  const isShowOnHome = formData.get("isShowOnHome") === "on" ? 1 : 0;

  if (!id || !name) return;

  try {
    await pool.query(
      `UPDATE functionalarea SET name = ?, pageslug = ?, logoimage = ?, bannerimage = ?, pagetitle = ?, pagedescription = ?, isShowOnTop = ?, isShowOnHome = ?, updated_at = NOW() 
       WHERE id = ?`,
      [name, pageslug, logoimage, bannerimage, pagetitle, pagedescription, isShowOnTop, isShowOnHome, id]
    );
  } catch (e) {
    console.error("[admin/streams updateAction]", e);
  }
  revalidatePath("/admin/streams");
  revalidatePath("/", "layout");
}

async function deleteStream(id: number) {
  "use server";
  if (!id) return;
  try {
    await pool.query("DELETE FROM functionalarea WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/streams deleteAction]", e);
  }
  revalidatePath("/admin/streams");
  revalidatePath("/", "layout");
}

async function toggleStreamTop(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string, 10);
  const cur = parseInt(formData.get("cur") as string, 10);
  if (!id) return;
  try {
    await pool.query("UPDATE functionalarea SET isShowOnTop = ? WHERE id = ?", [cur ? 0 : 1, id]);
  } catch (e) {
    console.error("[admin/streams toggleTop]", e);
  }
  revalidatePath("/admin/streams");
  revalidatePath("/", "layout");
}

async function toggleStreamHome(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string, 10);
  const cur = parseInt(formData.get("cur") as string, 10);
  if (!id) return;
  try {
    await pool.query("UPDATE functionalarea SET isShowOnHome = ? WHERE id = ?", [cur ? 0 : 1, id]);
  } catch (e) {
    console.error("[admin/streams toggleHome]", e);
  }
  revalidatePath("/admin/streams");
  revalidatePath("/", "layout");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number)[] = []
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/streams safeQuery]", err);
    return [];
  }
}

interface StreamRow extends RowDataPacket {
  id: number;
  name: string;
  pageslug: string | null;
  logoimage: string | null;
  bannerimage: string | null;
  isShowOnTop: number;
  isShowOnHome: number;
  pagetitle: string | null;
  pagedescription: string | null;
  created_at: string;
  updated_at: string;
}

interface CountRow extends RowDataPacket {
  total: number;
}

export default async function AdminStreamsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const filter = sp.filter ?? "all";
  const offset = (page - 1) * PAGE_SIZE;

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (q) {
    conditions.push("(name LIKE ? OR pageslug LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }
  if (filter === "top") conditions.push("isShowOnTop = 1");
  if (filter === "home") conditions.push("isShowOnHome = 1");

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [streams, countRows, totalRow, topRow, homeRow] = await Promise.all([
    safeQuery<StreamRow>(
      `SELECT * FROM functionalarea ${where} ORDER BY isShowOnTop DESC, name ASC LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset]
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total FROM functionalarea ${where}`,
      params
    ),
    safeQuery<CountRow>("SELECT COUNT(*) AS total FROM functionalarea"),
    safeQuery<CountRow>("SELECT COUNT(*) AS total FROM functionalarea WHERE isShowOnTop = 1"),
    safeQuery<CountRow>("SELECT COUNT(*) AS total FROM functionalarea WHERE isShowOnHome = 1"),
  ]);

  const total = Number(countRows[0]?.total ?? 0);
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
    { value: "all", label: "All Streams", count: totalRow[0]?.total ?? 0 },
    { value: "top", label: "Show on Top", count: topRow[0]?.total ?? 0 },
    { value: "home", label: "On Homepage", count: homeRow[0]?.total ?? 0 },
  ];

  const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };
  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Stat mini-cards */}
        <div className="grid grid-cols-3 gap-4 flex-1">
          {FILTER_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={buildUrl({ filter: tab.value, page: 1 })}
              className={`bg-white rounded-2xl border p-4 flex items-center gap-3 hover:shadow-md transition-all ${
                filter === tab.value ? "border-teal-200 ring-2 ring-teal-100 shadow-sm" : "border-slate-100 shadow-sm"
              }`}
            >
              <div className="bg-teal-50 text-teal-600 p-2 rounded-xl">
                <span className="material-symbols-rounded text-[18px]" style={ICO_FILL}>
                  {tab.value === "top" ? "star" : tab.value === "home" ? "home" : "hub"}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold text-slate-800 leading-tight">{(tab.count || 0).toLocaleString()}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{tab.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl flex-shrink-0">
          {FILTER_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={buildUrl({ filter: tab.value, page: 1 })}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === tab.value ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <form method="GET" action="/admin/streams" className="flex-1 max-w-sm ml-auto">
          {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none" style={ICO}>
              search
            </span>
            <input
              name="q"
              defaultValue={q}
              placeholder="Search stream name or slug…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition"
            />
          </div>
        </form>
      </div>

      <StreamListClient 
        streams={streams} 
        offset={offset}
        createStream={createStream}
        updateStream={updateStream}
        deleteStream={deleteStream}
        toggleStreamTop={toggleStreamTop}
        toggleStreamHome={toggleStreamHome}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl shadow-sm">
          <p className="text-xs text-slate-500">
            Showing <strong>{offset + 1}</strong> to <strong>{Math.min(offset + PAGE_SIZE, total)}</strong> of <strong>{total}</strong> streams
          </p>
          <div className="flex items-center gap-1">
            {page > 1 && (
              <Link href={buildUrl({ page: page - 1 })} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                Prev
              </Link>
            )}
            {page < totalPages && (
              <Link href={buildUrl({ page: page + 1 })} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
