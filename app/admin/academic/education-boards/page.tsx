import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import BoardListClient from "./BoardListClient";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function createBoard(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const misc = formData.get("misc") as string;
  const status = formData.get("status") === "on" ? 1 : 0;

  if (!name) return;

  try {
    await pool.query(
      `INSERT INTO counseling_boards (name, title, slug, misc, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [name, title, slug, misc, status]
    );
  } catch (e) {
    console.error("[admin/academic/education-boards createAction]", e);
  }
  revalidatePath("/admin/academic/education-boards");
  revalidatePath("/", "layout");
}

async function updateBoard(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string, 10);
  const name = formData.get("name") as string;
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const misc = formData.get("misc") as string;
  const status = formData.get("status") === "on" ? 1 : 0;

  if (!id || !name) return;

  try {
    await pool.query(
      `UPDATE counseling_boards SET name = ?, title = ?, slug = ?, misc = ?, status = ?, updated_at = NOW() 
       WHERE id = ?`,
      [name, title, slug, misc, status, id]
    );
  } catch (e) {
    console.error("[admin/academic/education-boards updateAction]", e);
  }
  revalidatePath("/admin/academic/education-boards");
  revalidatePath("/", "layout");
}

async function deleteBoard(id: number) {
  "use server";
  if (!id) return;
  try {
    await pool.query("DELETE FROM counseling_boards WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/academic/education-boards deleteAction]", e);
  }
  revalidatePath("/admin/academic/education-boards");
  revalidatePath("/", "layout");
}

const PAGE_SIZE = 75;

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function safeQuery<T >(
  sql: string,
  params: (string | number | boolean)[] = []
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/academic/education-boards safeQuery]", err);
    return [];
  }
}

interface BoardRow  {
  id: number;
  name: string;
  title: string | null;
  slug: string | null;
  status: number;
  misc: string | null;
  created_at: string;
  updated_at: string;
}

interface CountRow {
  total: number;
}

export default async function EducationBoardsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const where = q ? "WHERE name LIKE ? OR title LIKE ? OR slug LIKE ?" : "";
  const params = q ? [`%${q}%`, `%${q}%`, `%${q}%`] : [];

  const [boards, countRows] = await Promise.all([
    safeQuery<BoardRow>(
      `SELECT id, name, title, slug, status, misc, created_at, updated_at
       FROM counseling_boards
       ${where}
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset]
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total FROM counseling_boards ${where}`,
      params
    )
  ]);

  const total = Number(countRows[0]?.total || 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

  return (
    <div className="p-6 space-y-6 mx-auto max-w-[1400px]">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <form method="GET" className="relative max-w-sm w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[18px]" style={ICO}>search</span>
            <input 
              name="q" 
              defaultValue={q}
              placeholder="Search boards..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
            />
        </form>
      </div>

      <BoardListClient 
        boards={boards}
        total={total}
        page={page}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
        createBoard={createBoard}
        updateBoard={updateBoard}
        deleteBoard={deleteBoard}
      />
    </div>
  );
}




