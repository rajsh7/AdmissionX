import pool from "@/lib/db";
import Link from "next/link";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { revalidatePath } from "next/cache";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function deleteMediaRecord(id: number) {
  "use server";
  try {
    // This is a placeholder action. In a real scenario, you might delete from a specific media table.
    // For now, we'll just revalidate.
    console.log("Delete media for college ID:", id);
  } catch (e) {
    console.error("[admin/media deleteAction]", e);
  }
  revalidatePath("/admin/media");
  revalidatePath("/", "layout");
}

import MediaListClient from "./MediaListClient";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 75;

async function safeQuery<T >(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/media safeQuery]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface MediaRow  {
  id: number;
  college_name: string;
  banner_image: string | null;
  slug: string;
  created_at: string | null;
  updated_at: string | null;
}

interface CountRow  {
  total: number;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function MediaInformationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp   = await searchParams;
  const q    = (sp.q ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  // ── Build WHERE clause ─────────────────────────────────────────────────────
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (q) {
    conditions.push(
      "(u.firstname LIKE ? OR cp.slug LIKE ?)",
    );
    params.push(`%${q}%`, `%${q}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  // ── Query profiles ─────────────────────────────────────────────────────────
  const [profiles, countRows] = await Promise.all([
    safeQuery<MediaRow>(
      `SELECT 
        cp.id,
        cp.slug,
        COALESCE(u.firstname, REPLACE(cp.slug, '-', ' '), 'Unnamed College') as college_name,
        cp.bannerimage as banner_image,
        cp.created_at
       FROM collegeprofile cp
       LEFT JOIN users u ON u.id = cp.users_id
       ${where}
       ORDER BY cp.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total FROM collegeprofile cp LEFT JOIN users u ON u.id = cp.users_id ${where}`,
      params,
    ),
  ]);

  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Clean trailing slug ID numbers from fallback names
  profiles.forEach(p => {
    if (p.college_name && p.college_name === p.slug.replace(/-/g, ' ')) {
       p.college_name = p.college_name.split(' ').filter(part => isNaN(Number(part))).join(' ');
    }
  });

  return (
    <div className="p-6 space-y-6 mx-auto max-w-[1400px]">
      
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>image</span>
            Media Information
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage college banners, brochures, and visual assets.</p>
        </div>
        <div className="flex items-center gap-3">
          <form method="GET" action="/admin/media" className="w-full sm:w-80">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none" style={ICO}>search</span>
              <input 
                type="text" 
                name="q" 
                defaultValue={q}
                placeholder="Search colleges..." 
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-medium"
              />
            </div>
          </form>
        </div>
      </div>

      <MediaListClient 
        profiles={profiles}
        total={total}
        page={page}
        totalPages={totalPages}
        offset={offset}
        pageSize={PAGE_SIZE}
        q={q}
        deleteAction={deleteMediaRecord}
      />
    </div>
  );
}




