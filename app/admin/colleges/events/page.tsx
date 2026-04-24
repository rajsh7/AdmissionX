import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import EventListClient from "./EventListClient";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function createEvent(formData: FormData) {
  "use server";
  const db = await getDb();
  const collegeprofile_id = Number(formData.get("collegeprofile_id"));
  const name              = String(formData.get("name") || "");
  const datetime          = String(formData.get("datetime") || "") || null;
  const venue             = String(formData.get("venue") || "") || null;
  const description       = String(formData.get("description") || "") || null;
  const link              = String(formData.get("link") || "") || null;
  try {
    const last = await db.collection("event").find({}, { projection: { id: 1 } }).sort({ id: -1 }).limit(1).toArray();
    const nextId = ((last[0]?.id as number) ?? 0) + 1;
    await db.collection("event").insertOne({ id: nextId, collegeprofile_id, name, datetime, venue, description, link, created_at: new Date(), updated_at: new Date() });
  } catch (e) { console.error("[admin/colleges/events createAction]", e); }
  revalidatePath("/admin/colleges/events");
}

async function updateEvent(formData: FormData) {
  "use server";
  const db = await getDb();
  const id                = String(formData.get("id") || "");
  const collegeprofile_id = Number(formData.get("collegeprofile_id"));
  const name              = String(formData.get("name") || "");
  const datetime          = String(formData.get("datetime") || "") || null;
  const venue             = String(formData.get("venue") || "") || null;
  const description       = String(formData.get("description") || "") || null;
  const link              = String(formData.get("link") || "") || null;
  try {
    await db.collection("event").updateOne(
      { _id: new ObjectId(id) },
      { $set: { collegeprofile_id, name, datetime, venue, description, link, updated_at: new Date() } }
    );
  } catch (e) { console.error("[admin/colleges/events updateAction]", e); }
  revalidatePath("/admin/colleges/events");
}

async function deleteEventRow(id: string) {
  "use server";
  const db = await getDb();
  try {
    await db.collection("event").deleteOne({ _id: new ObjectId(id) });
  } catch (e) {
    console.error("[admin/colleges/events deleteAction]", e);
  }
  revalidatePath("/admin/colleges/events");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;

// ─── Types ────────────────────────────────────────────────────────────────────

interface EventRow  {
  id: string;
  collegeprofile_id: string;
  name: string;
  datetime: string;
  venue: string;
  description: string;
  link: string;
  college_name: string;
}

interface CountRow  {
  total: number;
}

interface OptionRow  {
  id: string;
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
  const collegeId = sp.collegeId ?? "";
  const eventName = (sp.eventName ?? "").trim();
  const from = sp.from ?? "";
  const to = sp.to ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const db = await getDb();

  // Build match directly on event collection fields
  const eventMatch: any = {};
  if (eventName) eventMatch.name = { $regex: eventName, $options: "i" };
  if (collegeId) eventMatch.collegeprofile_id = Number(collegeId);
  if (q) eventMatch.$or = [
    { name: { $regex: q, $options: "i" } },
    { venue: { $regex: q, $options: "i" } },
  ];
  if (from || to) {
    eventMatch.datetime = {};
    if (from) eventMatch.datetime.$gte = `${from}T00:00:00`;
    if (to) eventMatch.datetime.$lte = `${to}T23:59:59`;
  }

  const [total, eventRows] = await Promise.all([
    db.collection("event").countDocuments(eventMatch),
    db.collection("event").find(eventMatch).sort({ datetime: -1 }).skip(offset).limit(PAGE_SIZE).toArray(),
  ]);

  // Batch lookup college names
  const cpIds = [...new Set(eventRows.map((e: any) => Number(e.collegeprofile_id)).filter(Boolean))];
  const cpRows = cpIds.length > 0
    ? await db.collection("collegeprofile").aggregate([
        { $match: { id: { $in: cpIds } } },
        { $lookup: { from: "users", localField: "users_id", foreignField: "id", as: "user" } },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        { $project: { _id: 0, id: 1, name: { $ifNull: ["$user.firstname", "$slug"] } } },
      ]).toArray()
    : [];
  const cpMap = new Map(cpRows.map((c: any) => [Number(c.id), String(c.name || "").trim()]));

  const events: EventRow[] = eventRows.map((e: any) => ({
    id: String(e._id),
    collegeprofile_id: String(e.collegeprofile_id),
    name: String(e.name || "").trim(),
    datetime: String(e.datetime || "").trim(),
    venue: String(e.venue || "").trim(),
    description: String(e.description || "").trim(),
    link: String(e.link || "").trim(),
    college_name: cpMap.get(Number(e.collegeprofile_id)) || "Unknown College",
  }));

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // College options for dropdown
  const collegeOptions = await db.collection("collegeprofile").aggregate([
    { $lookup: { from: "users", localField: "users_id", foreignField: "id", as: "user" } },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    { $project: { _id: 0, id: 1, name: { $ifNull: [{ $trim: { input: "$user.firstname" } }, "$slug"] } } },
    { $sort: { name: 1 } },
    { $limit: 500 },
  ]).toArray();
  const colleges: OptionRow[] = collegeOptions.map((c: any) => ({ id: String(c.id), name: String(c.name || "").trim() }));

  return (
    <div className="p-6 space-y-6 w-full">
      
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
        q={q}
        collegeId={collegeId}
        eventName={eventName}
        from={from}
        to={to}
        offset={offset}
        total={total}
        pageSize={PAGE_SIZE}
        onAdd={createEvent}
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




