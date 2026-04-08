import pool from "@/lib/db";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { fetchCollegeOptions } from "../_components/college-options";
import CollegeFilterBar from "../_components/CollegeFilterBar";
import EventListClient from "./EventListClient";

async function createEvent(formData: FormData) {
  "use server";
  try {
    await pool.query(
      `INSERT INTO event (collegeprofile_id, name, datetime, venue, description, link, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [formData.get("collegeprofile_id"), formData.get("name"), formData.get("datetime") || null, formData.get("venue") || null, formData.get("description") || null, formData.get("link") || null],
    );
  } catch (e) { console.error("[admin/colleges/events createAction]", e); }
  revalidatePath("/admin/colleges/events");
}

async function updateEvent(formData: FormData) {
  "use server";
  try {
    await pool.query(
      `UPDATE event SET collegeprofile_id=?, name=?, datetime=?, venue=?, description=?, link=?, updated_at=NOW() WHERE id=?`,
      [formData.get("collegeprofile_id"), formData.get("name"), formData.get("datetime") || null, formData.get("venue") || null, formData.get("description") || null, formData.get("link") || null, formData.get("id")],
    );
  } catch (e) { console.error("[admin/colleges/events updateAction]", e); }
  revalidatePath("/admin/colleges/events");
}

async function deleteEventRow(id: number) {
  "use server";
  try { await pool.query("DELETE FROM event WHERE id = ?", [id]); }
  catch (e) { console.error("[admin/colleges/events deleteAction]", e); }
  revalidatePath("/admin/colleges/events");
}

const PAGE_SIZE = 25;

async function safeQuery<T>(sql: string, params: (string | number)[] = []): Promise<T[]> {
  try { const [rows] = (await pool.query(sql, params)) as [T[], unknown]; return rows; }
  catch (err) { console.error("[admin/colleges/events safeQuery]", err); return []; }
}

interface EventRow { id: number; collegeprofile_id: number; name: string; datetime: string; venue: string; description: string; link: string; college_name: string; }
interface CountRow { total: number; }
interface OptionRow { id: number; name: string; }

export default async function CollegeEventsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp         = await searchParams;
  const q          = (sp.q ?? "").trim();
  const collegeId  = sp.collegeId ?? "";
  const page       = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset     = (page - 1) * PAGE_SIZE;

  const conditions: string[] = [];
  const params: (string | number)[] = [];
  if (q) { conditions.push("(e.name LIKE ? OR e.venue LIKE ? OR u.firstname LIKE ?)"); params.push(`%${q}%`, `%${q}%`, `%${q}%`); }
  if (collegeId) { conditions.push("e.collegeprofile_id = ?"); params.push(collegeId); }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [events, countRows, collegeOptions] = await Promise.all([
    safeQuery<EventRow>(
      `SELECT e.id, e.collegeprofile_id, e.name, e.datetime, e.venue, e.description, e.link, COALESCE(u.firstname,'Unnamed College') as college_name
       FROM event e JOIN collegeprofile cp ON cp.id=e.collegeprofile_id JOIN users u ON u.id=cp.users_id ${where} ORDER BY e.datetime DESC LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total FROM event e JOIN collegeprofile cp ON cp.id=e.collegeprofile_id JOIN users u ON u.id=cp.users_id ${where}`,
      params,
    ),
    fetchCollegeOptions(),
  ]);

  const total      = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const colleges   = collegeOptions as OptionRow[];

  function pageUrl(p: number) {
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    if (collegeId) qs.set("collegeId", collegeId);
    qs.set("page", String(p));
    return `/admin/colleges/events?${qs.toString()}`;
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <CollegeFilterBar
        colleges={collegeOptions}
        selectedId={collegeId}
        total={total}
        label="College Events"
        icon="event"
        description="Manage events and workshops — filter by college to see classified data."
      />

      <EventListClient events={events} colleges={colleges} offset={offset} onAdd={createEvent} onEdit={updateEvent} onDelete={deleteEventRow} />

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <p className="text-xs text-slate-500">Showing <strong>{offset + 1}–{Math.min(offset + PAGE_SIZE, total)}</strong> of <strong>{total.toLocaleString()}</strong> events</p>
          <div className="flex items-center gap-1">
            {page > 1 ? <Link href={pageUrl(page - 1)} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">← Prev</Link> : <span className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">← Prev</span>}
            <span className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-blue-50 border border-blue-100 rounded-lg">{page} / {totalPages}</span>
            {page < totalPages ? <Link href={pageUrl(page + 1)} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Next →</Link> : <span className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">Next →</span>}
          </div>
        </div>
      )}
    </div>
  );
}
