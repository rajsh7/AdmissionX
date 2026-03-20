import pool from "@/lib/db";
import Link from "next/link";
import { RowDataPacket } from "mysql2";
import { revalidatePath } from "next/cache";
import AdsCollegeClient from "./AdsCollegeClient";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function toggleAdRowStatus(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string, 10);
  const currentStatus = parseInt(formData.get("status") as string, 10);
  if (!id) return;
  
  try {
    await pool.query("UPDATE ads_top_college_lists SET status = ? WHERE id = ?", [
      currentStatus ? 0 : 1,
      id,
    ]);
  } catch (e) {
    console.error("[admin/colleges/ads-list toggleStatus]", e);
  }
  revalidatePath("/admin/colleges/ads-list");
  revalidatePath("/", "layout");
}

async function deleteAdRow(id: number) {
  "use server";
  if (!id) return;
  
  try {
    await pool.query("DELETE FROM ads_top_college_lists WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/colleges/ads-list deleteRow]", e);
  }
  revalidatePath("/admin/colleges/ads-list");
  revalidatePath("/", "layout");
}

async function createAdRow(formData: FormData) {
  "use server";
  try {
    const method_type = formData.get("method_type") as string;
    const status = formData.get("status") ? 1 : 0;
    
    const getIntOrNull = (name: string) => {
       const val = parseInt(formData.get(name) as string, 10);
       return isNaN(val) ? null : val;
    };

    const collegeprofile_id = getIntOrNull("collegeprofile_id");
    const functionalarea_id = getIntOrNull("functionalarea_id");
    const degree_id = getIntOrNull("degree_id");
    const course_id = getIntOrNull("course_id");
    const educationlevel_id = getIntOrNull("educationlevel_id");
    const city_id = getIntOrNull("city_id");
    const state_id = getIntOrNull("state_id");
    const country_id = getIntOrNull("country_id");
    const university_id = getIntOrNull("university_id");
    const employee_id = getIntOrNull("employee_id");

    await pool.query(
      `INSERT INTO ads_top_college_lists 
       (method_type, status, collegeprofile_id, functionalarea_id, degree_id, course_id, educationlevel_id, city_id, state_id, country_id, university_id, employee_id, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [method_type || null, status, collegeprofile_id, functionalarea_id, degree_id, course_id, educationlevel_id, city_id, state_id, country_id, university_id, employee_id]
    );
  } catch (e) {
    console.error("[admin/colleges/ads-list createRow]", e);
  }
  revalidatePath("/admin/colleges/ads-list");
  revalidatePath("/", "layout");
}

async function updateAdRow(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string, 10);
  if (!id) return;

  try {
    const method_type = formData.get("method_type") as string;
    const status = formData.get("status") ? 1 : 0;
    
    const getIntOrNull = (name: string) => {
       const val = parseInt(formData.get(name) as string, 10);
       return isNaN(val) ? null : val;
    };

    const collegeprofile_id = getIntOrNull("collegeprofile_id");
    const functionalarea_id = getIntOrNull("functionalarea_id");
    const degree_id = getIntOrNull("degree_id");
    const course_id = getIntOrNull("course_id");
    const educationlevel_id = getIntOrNull("educationlevel_id");
    const city_id = getIntOrNull("city_id");
    const state_id = getIntOrNull("state_id");
    const country_id = getIntOrNull("country_id");
    const university_id = getIntOrNull("university_id");
    const employee_id = getIntOrNull("employee_id");

    await pool.query(
      `UPDATE ads_top_college_lists SET 
       method_type = ?, status = ?, collegeprofile_id = ?, functionalarea_id = ?, degree_id = ?, course_id = ?, educationlevel_id = ?, city_id = ?, state_id = ?, country_id = ?, university_id = ?, employee_id = ?, updated_at = NOW() 
       WHERE id = ?`,
      [method_type || null, status, collegeprofile_id, functionalarea_id, degree_id, course_id, educationlevel_id, city_id, state_id, country_id, university_id, employee_id, id]
    );
  } catch (e) {
    console.error("[admin/colleges/ads-list updateRow]", e);
  }
  revalidatePath("/admin/colleges/ads-list");
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
    console.error("[admin/colleges/ads-list safeQuery]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdCollegeRow extends RowDataPacket {
  id: number;
  method_type: string | null;
  status: number;
  created_at: string;
  updated_at: string;
  college_name: string;
  degree_name: string | null;
  course_name: string | null;
  city_name: string | null;
  
  collegeprofile_id: number | null;
  functionalarea_id: number | null;
  degree_id: number | null;
  course_id: number | null;
  educationlevel_id: number | null;
  city_id: number | null;
  state_id: number | null;
  country_id: number | null;
  university_id: number | null;
  employee_id: number | null;
}

interface CountRow extends RowDataPacket {
  total: number;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdsCollegesListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp     = await searchParams;
  const q      = (sp.q ?? "").trim();
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  // ── WHERE ──────────────────────────────────────────────────────────────────
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (q) {
    conditions.push("(u.firstname LIKE ? OR a.method_type LIKE ? OR d.name LIKE ? OR c.name LIKE ? OR ct.name LIKE ?)");
    params.push("%" + q + "%", "%" + q + "%", "%" + q + "%", "%" + q + "%", "%" + q + "%");
  }

  const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

  // ── Queries ────────────────────────────────────────────────────────────────
  const [adsRows, countRows, statsRows] = await Promise.all([
    safeQuery<AdCollegeRow>(
      `SELECT 
         a.*,
         COALESCE(u.firstname, 'Unnamed College') AS college_name,
         d.name AS degree_name,
         c.name AS course_name,
         ct.name AS city_name
       FROM ads_top_college_lists a
       LEFT JOIN collegeprofile cp ON cp.id = a.collegeprofile_id
       LEFT JOIN users u ON u.id = cp.users_id
       LEFT JOIN degree d ON d.id = a.degree_id
       LEFT JOIN course c ON c.id = a.course_id
       LEFT JOIN city ct ON ct.id = a.city_id
       ${where}
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total 
       FROM ads_top_college_lists a
       LEFT JOIN collegeprofile cp ON cp.id = a.collegeprofile_id
       LEFT JOIN users u ON u.id = cp.users_id
       LEFT JOIN degree d ON d.id = a.degree_id
       LEFT JOIN course c ON c.id = a.course_id
       LEFT JOIN city ct ON ct.id = a.city_id
       ${where}`,
      params,
    ),
    safeQuery<RowDataPacket>(`
      SELECT 
        COUNT(*) AS total,
        SUM(status = 0) AS inactive,
        SUM(status = 1) AS active
      FROM ads_top_college_lists
    `),
  ]);

  const total = Number(countRows[0]?.total ?? 0);
  const stats      = statsRows[0];

  const STAT_CARDS = [
    { label: "Total Placements", value: stats?.total ?? 0, icon: "format_list_numbered", accent: "bg-blue-50 text-blue-600" },
    { label: "Active", value: stats?.active ?? 0, icon: "check_circle", accent: "bg-emerald-50 text-emerald-600" },
    { label: "Inactive", value: stats?.inactive ?? 0, icon: "pause_circle", accent: "bg-slate-50 text-slate-500" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>format_list_numbered</span>
            ADS Top Colleges
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage the list of top promoted colleges within ads segments.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STAT_CARDS.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`${card.accent} p-2.5 rounded-xl flex-shrink-0`}>
              <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>{card.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 leading-tight">{card.value}</p>
              <p className="text-xs font-semibold text-slate-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-center">
        <form method="GET" action="/admin/colleges/ads-list" className="flex-1 w-full max-w-md">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400" style={ICO}>search</span>
            <input 
              name="q" defaultValue={q} placeholder="Search college, method, degree..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
            />
          </div>
        </form>
        {q && (
          <Link href="/admin/colleges/ads-list" className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1">
            <span className="material-symbols-rounded text-[16px]">close</span>
            Clear
          </Link>
        )}
      </div>

      <AdsCollegeClient
        adsRows={adsRows}
        total={total}
        offset={offset}
        pageSize={PAGE_SIZE}
        q={q}
        createAction={createAdRow}
        updateAction={updateAdRow}
        deleteAction={deleteAdRow}
        toggleAction={toggleAdRowStatus}
      />
    </div>
  );
}
