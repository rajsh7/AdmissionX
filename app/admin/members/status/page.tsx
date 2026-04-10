import pool from "@/lib/db";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import StatusListClient from "./StatusListClient";

const PAGE_SIZE = 25;

// ─── Server Actions ───────────────────────────────────────────────────────────

async function createStatus(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  if (!name) return;
  try {
    await pool.query(
      "INSERT INTO userstatus (name, created_at, updated_at) VALUES (?, NOW(), NOW())",
      [name]
    );
  } catch (e) {
    console.error("[admin/members/status createAction]", e);
  }
  revalidatePath("/admin/members/status");
  revalidatePath("/", "layout");
}

async function updateStatus(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string, 10);
  const name = formData.get("name") as string;
  if (isNaN(id) || !name) return;
  try {
    await pool.query(
      "UPDATE userstatus SET name = ?, updated_at = NOW() WHERE id = ?",
      [name, id]
    );
  } catch (e) {
    console.error("[admin/members/status updateAction]", e);
  }
  revalidatePath("/admin/members/status");
  revalidatePath("/", "layout");
}

async function deleteStatus(id: number) {
  "use server";
  if (isNaN(id)) return;
  try {
    await pool.query("DELETE FROM userstatus WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/members/status deleteAction]", e);
  }
  revalidatePath("/admin/members/status");
  revalidatePath("/", "layout");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function safeQuery<T >(
  sql: string,
  params: (string | number)[] = []
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/members/status safeQuery]", err);
    return [];
  }
}

interface StatusRow  {
  id: number;
  name: string;
  created_at: string;
}

interface CountRow  {
  total: number;
}

export default async function MembersStatusPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const sort = sp.sort || "newest";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (q) {
    conditions.push("name LIKE ?");
    params.push(`%${q}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const sortSql = sort === "oldest" ? "created_at ASC" : 
                sort === "name"   ? "name ASC" : 
                                  "created_at DESC";

  const [statuses, countRows] = await Promise.all([
    safeQuery<StatusRow>(
      `SELECT * FROM userstatus ${where} ORDER BY ${sortSql} LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset]
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total FROM userstatus ${where}`,
      params
    ),
  ]);

  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  function buildUrl(overrides: Record<string, string | number>) {
    const merged = { q, page: "1", sort, ...overrides };
    const qs = Object.entries(merged)
      .filter(([, v]) => String(v) !== "" && String(v) !== "1" && String(v) !== "newest")
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    return `/admin/members/status${qs ? `?${qs}` : ""}`;
  }

  const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

  return (
    <div className="p-6 space-y-6 max-w-[1000px]">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <form method="GET" className="flex-1 flex gap-2">
          {sort !== "newest" && <input type="hidden" name="sort" value={sort} />}
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[18px]" style={ICO}>
              search
            </span>
            <input
              name="q"
              defaultValue={q}
              placeholder="Search statuses..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-slate-50"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors">
            Search
          </button>
          {q && (
            <Link href={buildUrl({ q: "" })} className="px-4 py-2.5 bg-slate-100 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-colors">
              Clear
            </Link>
          )}
        </form>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {[{ v: "newest", l: "Newest" }, { v: "oldest", l: "Oldest" }, { v: "name", l: "A-Z" }].map(opt => (
            <Link
              key={opt.v}
              href={buildUrl({ sort: opt.v, page: 1 })}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                sort === opt.v ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {opt.l}
            </Link>
          ))}
        </div>
      </div>

      <StatusListClient 
        statuses={statuses} 
        offset={offset}
        createStatus={createStatus}
        updateStatus={updateStatus}
        deleteStatus={deleteStatus}
      />

      {totalPages > 1 && (
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between rounded-b-2xl shadow-sm">
          <p className="text-xs text-slate-500">
            Showing <strong>{offset + 1}</strong> to <strong>{Math.min(offset + PAGE_SIZE, total)}</strong> of <strong>{total}</strong> status records
          </p>
          <div className="flex gap-1">
            {page > 1 && (
              <Link href={buildUrl({ page: page - 1 })} className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                Prev
              </Link>
            )}
            {page < totalPages && (
              <Link href={buildUrl({ page: page + 1 })} className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}




