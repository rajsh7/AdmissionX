import pool from "@/lib/db";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { RowDataPacket } from "mysql2";
import AdminImg from "@/app/admin/_components/AdminImg";
import FacilitiesClient from "./FacilitiesClient";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function deleteFacilityRow(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM collegefacilities WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/colleges/facilities deleteAction]", e);
  }
  revalidatePath("/admin/colleges/facilities");
  revalidatePath("/", "layout");
}

async function createFacility(formData: FormData) {
  "use server";
  const collegeprofile_id = formData.get("collegeprofile_id");
  const facilities_id = formData.get("facilities_id") || null;
  const name = formData.get("name") || null;
  const description = formData.get("description") || null;

  try {
    await pool.query(
      "INSERT INTO collegefacilities (collegeprofile_id, facilities_id, name, description) VALUES (?, ?, ?, ?)",
      [collegeprofile_id, facilities_id, name, description]
    );
  } catch (e) {
    console.error("[admin/colleges/facilities createAction]", e);
  }
  revalidatePath("/admin/colleges/facilities");
  revalidatePath("/", "layout");
}

async function updateFacility(formData: FormData) {
  "use server";
  const id = formData.get("id"); // Make sure to add this hidden field in form or handle differently
  const collegeprofile_id = formData.get("collegeprofile_id");
  const facilities_id = formData.get("facilities_id") || null;
  const name = formData.get("name") || null;
  const description = formData.get("description") || null;

  try {
    await pool.query(
      "UPDATE collegefacilities SET collegeprofile_id = ?, facilities_id = ?, name = ?, description = ? WHERE id = ?",
      [collegeprofile_id, facilities_id, name, description, id]
    );
  } catch (e) {
    console.error("[admin/colleges/facilities updateAction]", e);
  }
  revalidatePath("/admin/colleges/facilities");
  revalidatePath("/", "layout");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/colleges/facilities safeQuery]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface FacilityRow extends RowDataPacket {
  id: number;
  college_name: string;
  facility_name: string;
  facility_name_raw: string | null;
  description: string;
  icon: string | null;
  collegeprofile_id: number;
  facilities_id: number | null;
}

interface CountRow extends RowDataPacket {
  total: number;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CollegeFacilitiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  // ── Build WHERE clause ─────────────────────────────────────────────────────
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (q) {
    conditions.push(
      "(u.firstname LIKE ? OR cf.name LIKE ? OR f.name LIKE ?)",
    );
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  // ── Query facilities ───────────────────────────────────────────────────────
  const [facilitiesList, countRows, colleges, facilityTypes] = await Promise.all([
    q
      ? safeQuery<FacilityRow>(
          `SELECT 
            cf.id,
            cf.collegeprofile_id,
            cf.facilities_id,
            cf.name as facility_name_raw,
            COALESCE(u.firstname, 'Unnamed College') as college_name,
            COALESCE(cf.name, f.name) as facility_name,
            cf.description,
            f.iconname as icon
           FROM collegefacilities cf
           JOIN collegeprofile cp ON cp.id = cf.collegeprofile_id
           JOIN users u ON u.id = cp.users_id
           LEFT JOIN facilities f ON f.id = cf.facilities_id
           ${where}
           ORDER BY cf.created_at DESC
           LIMIT ? OFFSET ?`,
          [...params, PAGE_SIZE, offset],
        )
      : safeQuery<FacilityRow>(
          `SELECT 
            cf.id,
            cf.collegeprofile_id,
            cf.facilities_id,
            cf.name as facility_name_raw,
            COALESCE(u.firstname, 'Unnamed College') as college_name,
            COALESCE(cf.name, f.name) as facility_name,
            cf.description,
            f.iconname as icon
           FROM (
             SELECT id, collegeprofile_id, facilities_id, name, description, created_at
             FROM collegefacilities
             ORDER BY created_at DESC
             LIMIT ? OFFSET ?
           ) cf
           JOIN collegeprofile cp ON cp.id = cf.collegeprofile_id
           JOIN users u ON u.id = cp.users_id
           LEFT JOIN facilities f ON f.id = cf.facilities_id
           ORDER BY cf.created_at DESC`,
          [PAGE_SIZE, offset],
        ),
    q
      ? safeQuery<CountRow>(
          `SELECT COUNT(*) AS total 
           FROM collegefacilities cf 
           JOIN collegeprofile cp ON cp.id = cf.collegeprofile_id
           JOIN users u ON u.id = cp.users_id
           LEFT JOIN facilities f ON f.id = cf.facilities_id
           ${where}`,
          params,
        )
      : safeQuery<CountRow>("SELECT COUNT(*) AS total FROM collegefacilities"),
    safeQuery<{ id: number; name: string } & RowDataPacket>(
      "SELECT cp.id, u.firstname as name FROM collegeprofile cp JOIN users u ON u.id = cp.users_id ORDER BY u.firstname ASC"
    ),
    safeQuery<{ id: number; name: string } & RowDataPacket>(
      "SELECT id, name FROM facilities ORDER BY name ASC"
    ),
  ]);

  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>category</span>
            College facilities
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage campus amenities and infrastructure.</p>
        </div>
        <div className="flex items-center gap-3">
          <form method="GET" action="/admin/colleges/facilities" className="w-full sm:w-80">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none" style={ICO}>search</span>
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search facilities, colleges..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            </div>
          </form>
        </div>
      </div>

      <FacilitiesClient 
         facilitiesList={facilitiesList}
         colleges={colleges}
         facilityTypes={facilityTypes}
         offset={offset}
         onAdd={createFacility}
         onEdit={updateFacility}
         onDelete={deleteFacilityRow}
      />

        {/* ── Pagination ───────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500">
              Showing <strong>{offset + 1}–{Math.min(offset + PAGE_SIZE, total)}</strong> of <strong>{total.toLocaleString()}</strong> facilities
            </p>
            <div className="flex items-center gap-1">
              {page > 1 ? (
                <Link href={`/admin/colleges/facilities?page=${page - 1}${q ? `&q=${q}` : ''}`} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">← Prev</Link>
              ) : (
                <span className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">← Prev</span>
              )}
              {page < totalPages ? (
                <Link href={`/admin/colleges/facilities?page=${page + 1}${q ? `&q=${q}` : ''}`} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Next →</Link>
              ) : (
                <span className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">Next →</span>
              )}
            </div>
          </div>
        )}
    </div>
  );
}
