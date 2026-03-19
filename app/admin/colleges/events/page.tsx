import pool from "@/lib/db";
import Link from "next/link";
import { RowDataPacket } from "mysql2";
import { revalidatePath } from "next/cache";
import EventListClient from "./EventListClient";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function createEvent(formData: FormData) {
  "use server";
  const collegeprofile_id = formData.get("collegeprofile_id");
  const name              = formData.get("name");
  const datetime          = formData.get("datetime") || null;
  const venue             = formData.get("venue")    || null;
  const description       = formData.get("description") || null;
  const link              = formData.get("link")    || null;

  try {
    await pool.query(
      `INSERT INTO event 
        (collegeprofile_id, name, datetime, venue, description, link, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [collegeprofile_id, name, datetime, venue, description, link],
    );
  } catch (e) {
    console.error("[admin/colleges/events createAction]", e);
  }
  revalidatePath("/admin/colleges/events");
}

async function updateEvent(formData: FormData) {
  "use server";
  const id                = formData.get("id");
  const collegeprofile_id = formData.get("collegeprofile_id");
  const name              = formData.get("name");
  const datetime          = formData.get("datetime") || null;
  const venue             = formData.get("venue")    || null;
  const description       = formData.get("description") || null;
  const link              = formData.get("link")    || null;

  try {
    await pool.query(
      `UPDATE event 
          SET collegeprofile_id = ?, name = ?, datetime = ?, venue = ?, 
              description = ?, link = ?, updated_at = NOW()
        WHERE id = ?`,
      [collegeprofile_id, name, datetime, venue, description, link, id],
    );
  } catch (e) {
    console.error("[admin/colleges/events updateAction]", e);
  }
  revalidatePath("/admin/colleges/events");
}

async function deleteEventRow(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM event WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/colleges/events deleteAction]", e);
  }
  revalidatePath("/admin/colleges/events");
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
    console.error("[admin/colleges/events safeQuery]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface EventRow extends RowDataPacket {
  id: number;
  collegeprofile_id: number;
  name: string;
  datetime: string;
  venue: string;
  description: string;
  link: string;
  college_name: string;
}

interface CountRow extends RowDataPacket {
  total: number;
}

interface OptionRow extends RowDataPacket {
  id: number;
  name: string;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CollegeEventsPage({
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
  const filterParams: (string | number)[] = [];

  if (q) {
    conditions.push(
      "(e.name LIKE ? OR e.venue LIKE ? OR u.firstname LIKE ?)",
    );
    filterParams.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  // ── Fetch metadata + data ──────────────────────────────────────────────────
  const [events, countRows, colleges] = await Promise.all([
    safeQuery<EventRow>(
      `SELECT 
        e.id,
        e.collegeprofile_id,
        e.name,
        e.datetime,
        e.venue,
        e.description,
        e.link,
        COALESCE(u.firstname, 'Unnamed College') as college_name
       FROM event e
       JOIN collegeprofile cp ON cp.id = e.collegeprofile_id
       JOIN users u ON u.id = cp.users_id
       ${where}
       ORDER BY e.datetime DESC
       LIMIT ? OFFSET ?`,
      [...filterParams, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total 
       FROM event e 
       JOIN collegeprofile cp ON cp.id = e.collegeprofile_id
       JOIN users u ON u.id = cp.users_id
       ${where}`,
      filterParams,
    ),
    safeQuery<OptionRow>(
      "SELECT cp.id, u.firstname AS name FROM collegeprofile cp JOIN users u ON u.id = cp.users_id ORDER BY u.firstname ASC"
    )
  ]);

  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>event</span>
            College events
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage events and workshops across colleges.</p>
        </div>
        <div className="flex items-center gap-3">
          <form method="GET" action="/admin/colleges/events" className="w-full sm:w-80">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none" style={ICO}>search</span>
              <input 
                type="text" 
                name="q" 
                defaultValue={q}
                placeholder="Search events, venues..." 
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            </div>
          </form>
        </div>
      </div>

      <EventListClient
        events={events}
        colleges={colleges}
        offset={offset}
        onAdd={createEvent}
        onEdit={updateEvent}
        onDelete={deleteEventRow}
      />

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <p className="text-xs text-slate-500">
            Showing <strong>{offset + 1}–{Math.min(offset + PAGE_SIZE, total)}</strong> of <strong>{total.toLocaleString()}</strong> events
          </p>
          <div className="flex items-center gap-1">
            {page > 1 ? (
              <Link href={`/admin/colleges/events?page=${page - 1}${q ? `&q=${q}` : ''}`} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">← Prev</Link>
            ) : (
              <span className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">← Prev</span>
            )}
            <span className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-blue-50 border border-blue-100 rounded-lg">
              {page} / {totalPages}
            </span>
            {page < totalPages ? (
              <Link href={`/admin/colleges/events?page=${page + 1}${q ? `&q=${q}` : ''}`} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Next →</Link>
            ) : (
              <span className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">Next →</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
