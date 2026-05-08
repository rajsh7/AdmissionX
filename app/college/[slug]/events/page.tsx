import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

function slugToName(slug: string) {
  return slug.replace(/-\d+$/, "").split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function formatDate(dt: string) {
  if (!dt) return null;
  try { return new Date(dt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
  catch { return dt; }
}

export default async function EventsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();

  const cp = await db.collection("collegeprofile").findOne({ slug }, { projection: { _id: 1, id: 1, users_id: 1 } });
  if (!cp) notFound();

  const cpId = cp.id ? Number(cp.id) : cp._id.toString();

  const [user, events] = await Promise.all([
    cp.users_id ? db.collection("users").findOne({ $or: [{ _id: cp.users_id }, { id: cp.users_id }] }, { projection: { firstname: 1 } }) : null,
    db.collection("event").find({ collegeprofile_id: cpId }).sort({ datetime: 1, _id: -1 }).toArray(),
  ]);

  const collegeName = user?.firstname?.trim() || slugToName(slug);
  const now = new Date();
  const upcoming = events.filter((e: any) => !e.datetime || new Date(e.datetime) >= now);
  const past = events.filter((e: any) => e.datetime && new Date(e.datetime) < now);

  return (
    <div className="max-w-[1920px] mx-auto px-4 md:px-10 lg:px-12 py-10">
      <div className="mb-8">
        <h1 className="text-[28px] font-black text-slate-900">Events</h1>
        <p className="text-slate-500 text-sm mt-1">{collegeName} — campus events and activities</p>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-20 text-center">
          <span className="material-symbols-outlined text-6xl text-slate-200 block mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>event</span>
          <p className="text-slate-400 font-bold text-lg">No events published yet.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-[13px] font-black text-slate-500 uppercase tracking-widest mb-4">Upcoming Events ({upcoming.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {upcoming.map((ev: any) => (
                  <div key={ev._id.toString()} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[#FF3C3C] text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>event</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-bold text-slate-800">{ev.name}</p>
                        {ev.datetime && <p className="text-[12px] text-emerald-600 font-semibold mt-0.5">{formatDate(ev.datetime)}</p>}
                        {ev.venue && <p className="text-[12px] text-slate-500 mt-0.5 flex items-center gap-1"><span className="material-symbols-outlined text-[13px]">location_on</span>{ev.venue}</p>}
                        {ev.description && <p className="text-[13px] text-slate-500 mt-2 line-clamp-2">{ev.description}</p>}
                        {ev.link && <a href={ev.link} target="_blank" rel="noopener noreferrer" className="text-[12px] text-blue-600 hover:underline mt-2 inline-block">Register →</a>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="text-[13px] font-black text-slate-500 uppercase tracking-widest mb-4">Past Events ({past.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 opacity-70">
                {past.map((ev: any) => (
                  <div key={ev._id.toString()} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-slate-400 text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>event</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-bold text-slate-700">{ev.name}</p>
                        {ev.datetime && <p className="text-[12px] text-slate-400 font-semibold mt-0.5">{formatDate(ev.datetime)}</p>}
                        {ev.venue && <p className="text-[12px] text-slate-400 mt-0.5">{ev.venue}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
