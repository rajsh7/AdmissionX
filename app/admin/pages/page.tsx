import pool from "@/lib/db";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { revalidatePath } from "next/cache";

async function deletePage(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM pages WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/pages deleteAction]", e);
  }
  revalidatePath("/admin/pages");
  revalidatePath("/", "layout");
}

const PAGE_SIZE = 75;

async function safeQuery<T >(
  sql: string,
  params: (string | number | boolean)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/pages safeQuery]", err);
    return [];
  }
}

interface PageRow  {
  id: number;
  title: string;
  slug: string | null;
  status: number;
  created_at: string | null;
}

interface CountRow {
  total: number;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

import PageListClient from "./PageListClient";

export default async function PageContentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const where = q ? "WHERE title LIKE ? OR slug LIKE ?" : "";
  const params = q ? [`%${q}%`, `%${q}%`] : [];

  const [data, countRows] = await Promise.all([
    safeQuery<PageRow>(
      `SELECT id, title, slug, status, created_at
       FROM pages
       ${where}
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset]
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total FROM pages ${where}`,
      params
    )
  ]);

  const total = Number(countRows[0]?.total || 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 space-y-6 mx-auto max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>article</span>
            Page Contents
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage static and dynamic page content.</p>
        </div>
        <form method="GET" className="relative max-w-sm w-full">
           <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[20px]" style={ICO}>search</span>
           <input 
             name="q" 
             defaultValue={q}
             placeholder="Search pages..." 
             className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
           />
        </form>
      </div>

      <PageListClient 
        data={data}
        deleteAction={deletePage}
        total={total}
        page={page}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
        offset={offset}
      />
    </div>
  );
}
