import pool from "@/lib/db";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { revalidatePath } from "next/cache";
import DegreeListClient from "./DegreeListClient";

// ─── Server Actions ────────────────────────────────────────────────────────────

async function deleteDegree(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM degree WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/other-info/degrees deleteAction]", e);
  }
  revalidatePath("/admin/other-info/degrees");
  revalidatePath("/", "layout");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 75;

async function safeQuery<T >(
  sql: string,
  params: (string | number | boolean)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/other-info/degrees safeQuery]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface DegreeRow  {
  id: number;
  name: string;
}

interface CountRow  {
  total: number;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DegreesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp     = await searchParams;
  const q      = (sp.q || "").trim();
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const where = q ? "WHERE name LIKE ?" : "";
  const params = q ? [`%${q}%`] : [];

  const [degrees, countRows] = await Promise.all([
    safeQuery<DegreeRow>(
      `SELECT id, name
       FROM degree
       ${where}
       ORDER BY name ASC
       LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total FROM degree ${where}`,
      params,
    ),
  ]);

  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
  const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-indigo-600 text-[22px]" style={ICO_FILL}>history_edu</span>
            Degrees Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage academic degrees (e.g., B.Tech, MBA, MBBS).</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
            {total.toLocaleString()} records
          </span>
          <form method="GET" className="relative max-w-sm w-full">
             <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[20px]" style={ICO}>search</span>
             <input 
               name="q" 
               defaultValue={q}
               placeholder="Search degrees..." 
               className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
             />
          </form>
        </div>
      </div>

      <DegreeListClient 
        data={degrees}
        total={total}
        page={page}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
        offset={offset}
        deleteAction={deleteDegree}
      />
    </div>
  );
}
