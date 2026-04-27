import { getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";

const PAGE_SIZE = 20;
const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

async function replyToSession(formData: FormData): Promise<void> {
  "use server";
  const sessionId = formData.get("sessionId") as string;
  const reply = (formData.get("reply") as string)?.trim();
  if (!sessionId || !reply) return;

  const db = await getDb();
  await db.collection("chatbot_sessions").updateOne(
    { sessionId },
    {
      $push: {
        messages: {
          $each: [{ role: "admin", text: reply, time: new Date() }],
        },
      } as never,
      $set: { status: "replied", updated_at: new Date() },
    }
  );
  revalidatePath("/admin/queries/admissionx");
}

async function closeSession(formData: FormData): Promise<void> {
  "use server";
  const sessionId = formData.get("sessionId") as string;
  if (!sessionId) return;
  const db = await getDb();
  await db.collection("chatbot_sessions").updateOne(
    { sessionId },
    { $set: { status: "closed", updated_at: new Date() } }
  );
  revalidatePath("/admin/queries/admissionx");
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function AdmissionXQueryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const statusFilter = sp.status ?? "all";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;
  const selected = sp.session ?? "";

  const db = await getDb();

  const filter: Record<string, unknown> = {};
  if (q) filter.$or = [
    { email: { $regex: q, $options: "i" } },
    { phone: { $regex: q, $options: "i" } },
    { "messages.text": { $regex: q, $options: "i" } },
  ];
  if (statusFilter !== "all") filter.status = statusFilter;

  const [sessions, total, openCount, repliedCount, closedCount] = await Promise.all([
    db.collection("chatbot_sessions").find(filter).sort({ updated_at: -1 }).skip(offset).limit(PAGE_SIZE).toArray(),
    db.collection("chatbot_sessions").countDocuments(filter),
    db.collection("chatbot_sessions").countDocuments({ status: "open" }),
    db.collection("chatbot_sessions").countDocuments({ status: "replied" }),
    db.collection("chatbot_sessions").countDocuments({ status: "closed" }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const selectedSession = selected ? sessions.find((s) => s.sessionId === selected) : null;

  function buildUrl(overrides: Record<string, string | number>) {
    const merged = { q, status: statusFilter, page: "1", session: selected, ...overrides };
    const qs = Object.entries(merged).filter(([, v]) => v !== "" && v !== "1" && v !== "all").map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
    return `/admin/queries/admissionx${qs ? `?${qs}` : ""}`;
  }

  const STATUS_BADGE: Record<string, string> = {
    open: "bg-amber-100 text-amber-700",
    replied: "bg-emerald-100 text-emerald-700",
    closed: "bg-slate-100 text-slate-500",
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto w-full">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-primary text-[22px]" style={ICO_FILL}>chat</span>
            Chatbot Queries
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Student queries submitted via the AdmissionX chatbot.</p>
        </div>
        <form method="GET" action="/admin/queries/admissionx" className="w-full sm:w-72">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none" style={ICO}>search</span>
            <input type="text" name="q" defaultValue={q} placeholder="Search email, phone, message…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
            {statusFilter !== "all" && <input type="hidden" name="status" value={statusFilter} />}
          </div>
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Open", count: openCount, color: "text-amber-600", bg: "bg-amber-50", status: "open" },
          { label: "Replied", count: repliedCount, color: "text-emerald-600", bg: "bg-emerald-50", status: "replied" },
          { label: "Closed", count: closedCount, color: "text-slate-500", bg: "bg-slate-50", status: "closed" },
        ].map((s) => (
          <a key={s.status} href={buildUrl({ status: s.status, session: "" })}
            className={`rounded-2xl border p-4 flex items-center gap-3 transition-all hover:shadow-sm ${statusFilter === s.status ? "border-primary/30 ring-2 ring-primary/10" : "border-slate-100"} bg-white`}>
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
              <span className={`text-xl font-black ${s.color}`}>{s.count}</span>
            </div>
            <span className="text-sm font-semibold text-slate-600">{s.label}</span>
          </a>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {["all", "open", "replied", "closed"].map((s) => (
          <a key={s} href={buildUrl({ status: s, session: "" })}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${statusFilter === s ? "bg-primary text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-primary/50"}`}>
            {s}
          </a>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Sessions list */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {sessions.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <span className="material-symbols-rounded text-5xl block mb-3" style={ICO}>chat_bubble</span>
              <p className="text-sm font-semibold">No queries found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {sessions.map((s) => {
                const lastMsg = s.messages?.slice(-1)[0];
                const isSelected = s.sessionId === selected;
                return (
                  <a key={s.sessionId} href={buildUrl({ session: s.sessionId })}
                    className={`block px-4 py-3.5 hover:bg-slate-50 transition-colors ${isSelected ? "bg-primary/5 border-l-2 border-primary" : ""}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{s.name || s.email}</p>
                        <p className="text-xs text-slate-500 truncate">{s.email}</p>
                        <p className="text-xs text-slate-400 font-mono">{s.phone}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_BADGE[s.status] ?? "bg-slate-100 text-slate-500"}`}>
                        {s.status}
                      </span>
                    </div>
                    {lastMsg && (
                      <p className="text-xs text-slate-400 mt-1 truncate">{lastMsg.text?.slice(0, 60)}</p>
                    )}
                    <p className="text-[10px] text-slate-300 mt-1">{formatDate(s.updated_at)}</p>
                  </a>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
              {page > 1 && <a href={buildUrl({ page: page - 1 })} className="text-xs font-semibold text-slate-500 hover:text-primary">← Prev</a>}
              <span className="text-xs text-slate-400">{page} / {totalPages}</span>
              {page < totalPages && <a href={buildUrl({ page: page + 1 })} className="text-xs font-semibold text-slate-500 hover:text-primary">Next →</a>}
            </div>
          )}
        </div>

        {/* Session detail + reply */}
        <div className="lg:col-span-3">
          {selectedSession ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col" style={{ height: "600px" }}>

              {/* Session header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">{selectedSession.name || selectedSession.email}</p>
                  <p className="text-xs text-slate-500">{selectedSession.email} · {selectedSession.phone} · Started {formatDate(selectedSession.created_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${STATUS_BADGE[selectedSession.status] ?? "bg-slate-100 text-slate-500"}`}>
                    {selectedSession.status}
                  </span>
                  {selectedSession.status !== "closed" && (
                    <form action={closeSession}>
                      <input type="hidden" name="sessionId" value={selectedSession.sessionId} />
                      <button type="submit" className="text-xs font-semibold text-slate-400 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                        Close
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3" style={{ background: "#f8fafc" }}>
                {(selectedSession.messages || []).map((msg: { role: string; text: string; time: Date }, i: number) => (
                  <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-black text-white mt-0.5 ${msg.role === "admin" ? "bg-emerald-500" : msg.role === "user" ? "bg-slate-400" : "bg-primary"}`}>
                      {msg.role === "admin" ? "AD" : msg.role === "user" ? "U" : "A"}
                    </div>
                    <div className={`max-w-[75%] px-3 py-2 rounded-xl text-xs leading-relaxed ${msg.role === "user" ? "bg-slate-200 text-slate-700 rounded-tr-sm" : msg.role === "admin" ? "bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-tl-sm" : "bg-white text-slate-700 border border-slate-100 rounded-tl-sm"}`}>
                      {msg.role === "admin" && <p className="text-[9px] font-bold text-emerald-600 mb-1 uppercase tracking-wide">Admin Reply</p>}
                      <p>{msg.text}</p>
                      <p className="text-[9px] text-slate-400 mt-1">{formatDate(msg.time)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply form */}
              {selectedSession.status !== "closed" && (
                <div className="px-5 py-4 border-t border-slate-100 bg-white">
                  <form action={replyToSession} className="flex gap-3">
                    <input type="hidden" name="sessionId" value={selectedSession.sessionId} />
                    <input name="reply" placeholder="Type your reply to the student…"
                      className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all bg-slate-50"
                      required />
                    <button type="submit"
                      className="px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all flex items-center gap-1.5"
                      style={{ background: "linear-gradient(135deg, #FF3C3C, #c0392b)" }}>
                      <span className="material-symbols-outlined text-[16px]" style={ICO_FILL}>send</span>
                      Reply
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center" style={{ height: "600px" }}>
              <div className="text-center text-slate-400">
                <span className="material-symbols-rounded text-6xl block mb-3" style={ICO}>chat_bubble_outline</span>
                <p className="text-sm font-semibold">Select a session to view</p>
                <p className="text-xs mt-1">Click any query from the list</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
