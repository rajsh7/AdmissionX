import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import bcrypt from "bcryptjs";
import { sendCollegeApprovalEmail } from "@/lib/email";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function approveCollegeAction(formData: FormData) {
  "use server";
  const id  = formData.get("id")  as string;
  const src = formData.get("src") as string;
  if (!id) return;
  try {
    const db  = await getDb();
    const col = src === "old" ? "request_for_create_college_accounts" : "next_college_signups";
    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id: parseInt(id, 10) };

    // Generate temp password: Adx@{year}#{random6}
    const year = new Date().getFullYear();
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    const tempPassword = `Adx@${year}#${rand}`;
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const newStatus = src === "old" ? "1" : "approved";
    await db.collection(col).updateOne(filter, {
      $set: { status: newStatus, password_hash: hashedPassword, updated_at: new Date() }
    });

    // Send approval email with temp password
    const college = await db.collection(col).findOne(filter);
    if (college?.email) {
      const collegeName = String(college.college_name || college.collegeName || "Your College");
      const contactName = String(college.contact_name || college.contactPersonName || "Admin");
      try {
        await sendCollegeApprovalEmail(college.email, collegeName, contactName, tempPassword);
      } catch (emailErr) {
        console.error("[approveCollege] email failed:", emailErr);
      }
    }
  } catch (e) { console.error("[admin/colleges approveAction]", e); }
  revalidatePath("/admin/colleges");
  revalidatePath("/", "layout");
}

async function rejectCollegeAction(formData: FormData) {
  "use server";
  const id  = formData.get("id")  as string;
  const src = formData.get("src") as string;
  if (!id) return;
  try {
    const db  = await getDb();
    const col = src === "old" ? "request_for_create_college_accounts" : "next_college_signups";
    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id: parseInt(id, 10) };
    const newStatus = src === "old" ? "0" : "rejected";
    await db.collection(col).updateOne(filter, { $set: { status: newStatus, updated_at: new Date() } });
  } catch (e) { console.error("[admin/colleges rejectAction]", e); }
  revalidatePath("/admin/colleges");
  revalidatePath("/", "layout");
}

async function pendingCollegeAction(formData: FormData) {
  "use server";
  const id  = formData.get("id")  as string;
  const src = formData.get("src") as string;
  if (!id) return;
  try {
    const db  = await getDb();
    const col = src === "old" ? "request_for_create_college_accounts" : "next_college_signups";
    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id: parseInt(id, 10) };
    const newStatus = src === "old" ? "2" : "pending";
    await db.collection(col).updateOne(filter, { $set: { status: newStatus, updated_at: new Date() } });
  } catch (e) { console.error("[admin/colleges pendingAction]", e); }
  revalidatePath("/admin/colleges");
  revalidatePath("/", "layout");
}

async function deleteCollegeById(id: string, src: string): Promise<void> {
  "use server";
  try {
    const db  = await getDb();
    const col = src === "old" ? "request_for_create_college_accounts" : "next_college_signups";
    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id: parseInt(id, 10) };
    await db.collection(col).deleteOne(filter);
  } catch (e) { console.error("[admin/colleges deleteAction]", e); }
  revalidatePath("/admin/colleges");
  revalidatePath("/", "layout");
}

async function toggleCollegeLoginAction(formData: FormData): Promise<void> {
  "use server";
  const email = formData.get("email") as string;
  const cur   = parseInt(formData.get("cur") as string, 10);
  if (!email) return;
  try {
    const db = await getDb();
    await db.collection("users").updateOne(
      { email },
      { $set: { userstatus_id: cur === 1 ? 2 : 1 } },
    );
  } catch (e) {
    console.error("[admin/colleges toggleLoginAction]", e);
  }
  revalidatePath("/admin/colleges");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

function formatDate(d: string | Date | null | undefined): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CollegeRow {
  _id: string;
  college_name: string;
  email: string;
  contact_name: string;
  phone: string;
  status: string;
  created_at: Date | string;
  updated_at: Date | string;
  user_is_active?: number;
  _source?: "old" | "new";
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  pending: {
    label: "Pending",
    bg: "bg-amber-100",
    text: "text-amber-700",
    dot: "bg-amber-400",
  },
  approved: {
    label: "Approved",
    bg: "bg-green-100",
    text: "text-green-700",
    dot: "bg-green-500",
  },
  rejected: {
    label: "Rejected",
    bg: "bg-red-100",
    text: "text-red-700",
    dot: "bg-red-400",
  },
};

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminCollegesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp     = await searchParams;
  const q      = (sp.q ?? "").trim();
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const status = sp.status ?? "all"; // all | pending | approved | rejected
  const offset = (page - 1) * PAGE_SIZE;

  // ── MongoDB queries ────────────────────────────────────────────────────────
  const db = await getDb();

  // Normalize old `request_for_create_college_accounts` docs to CollegeRow shape
  // Old status: " 1" = approved, " 0" = rejected, anything else = pending
  function normalizeOld(doc: Record<string, unknown>): CollegeRow {
    const rawStatus = String(doc.status ?? "").trim();
    const mappedStatus = rawStatus === "1" ? "approved" : rawStatus === "0" ? "rejected" : "pending";
    return {
      _id:          String(doc._id),
      college_name: String(doc.collegeName  ?? doc.college_name ?? "").trim(),
      email:        String(doc.email        ?? "").trim(),
      contact_name: String(doc.contactPersonName ?? doc.contact_name ?? "").trim(),
      phone:        String(doc.phone        ?? "").trim(),
      status:       mappedStatus,
      created_at:   doc.created_at ? new Date(doc.created_at as any).toISOString() : "",
      updated_at:   doc.updated_at ? new Date(doc.updated_at as any).toISOString() : "",
      _source:      "old",
    } as CollegeRow;
  }

  function normalizeNew(doc: Record<string, unknown>): CollegeRow {
    return {
      _id:          String(doc._id),
      college_name: String(doc.college_name ?? ""),
      email:        String(doc.email        ?? ""),
      contact_name: String(doc.contact_name ?? ""),
      phone:        String(doc.phone        ?? ""),
      status:       String(doc.status       ?? "pending"),
      created_at:   doc.created_at ? new Date(doc.created_at as any).toISOString() : "",
      updated_at:   doc.updated_at ? new Date(doc.updated_at as any).toISOString() : "",
      _source:      "new",
    } as CollegeRow;
  }

  const [oldDocs, newDocs] = await Promise.all([
    db.collection("request_for_create_college_accounts").find({}).toArray(),
    db.collection("next_college_signups").find({}).toArray(),
  ]);

  let allDocs: CollegeRow[] = [
    ...newDocs.map(d => normalizeNew(d as Record<string, unknown>)),
    ...oldDocs.map(d => normalizeOld(d as Record<string, unknown>)),
  ];

  // Apply search filter
  if (q) {
    try {
      const re = new RegExp(q, "i");
      allDocs = allDocs.filter(c =>
        re.test(c.college_name) || re.test(c.email) || re.test(c.contact_name) || re.test(c.phone)
      );
    } catch {
      // invalid regex — fall back to plain string match
      const lq = q.toLowerCase();
      allDocs = allDocs.filter(c =>
        c.college_name.toLowerCase().includes(lq) ||
        c.email.toLowerCase().includes(lq) ||
        c.contact_name.toLowerCase().includes(lq) ||
        c.phone.toLowerCase().includes(lq)
      );
    }
  }
  if (status !== "all") {
    allDocs = allDocs.filter(c => c.status === status);
  }

  // Status counts (from full unfiltered set)
  const allNormalized: CollegeRow[] = [
    ...newDocs.map(d => normalizeNew(d as Record<string, unknown>)),
    ...oldDocs.map(d => normalizeOld(d as Record<string, unknown>)),
  ];
  const statusCounts = { pending: 0, approved: 0, rejected: 0 };
  for (const c of allNormalized) {
    if (c.status in statusCounts) statusCounts[c.status as keyof typeof statusCounts]++;
  }
  const grandTotal = allNormalized.length;

  // Sort: pending first, then approved, then rejected; newest first within each
  const STATUS_ORDER: Record<string, number> = { pending: 0, approved: 1, rejected: 2 };
  allDocs.sort((a, b) => {
    const sa = STATUS_ORDER[a.status] ?? 3;
    const sb = STATUS_ORDER[b.status] ?? 3;
    if (sa !== sb) return sa - sb;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const total      = allDocs.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const colleges   = allDocs.slice(offset, offset + PAGE_SIZE);

  // ── URL builder ────────────────────────────────────────────────────────────
  function buildUrl(overrides: Record<string, string | number>) {
    const merged = { q, page: "1", status, ...overrides };
    const qs = Object.entries(merged)
      .filter(([, v]) => v !== "" && v !== "1" && v !== "all")
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    return `/admin/colleges${qs ? `?${qs}` : ""}`;
  }

  // ── Tab strip data ─────────────────────────────────────────────────────────
  const TABS = [
    { value: "all",      label: "All",      count: grandTotal,               badge: "" },
    { value: "pending",  label: "Pending",  count: statusCounts.pending,     badge: statusCounts.pending > 0 ? "bg-amber-500 text-white" : "" },
    { value: "approved", label: "Approved", count: statusCounts.approved,    badge: "" },
    { value: "rejected", label: "Rejected", count: statusCounts.rejected,    badge: "" },
  ];

  return (
    <div className="p-6 space-y-6 w-full">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span
              className="material-symbols-rounded text-blue-600 text-[22px]"
              style={ICO_FILL}
            >
              apartment
            </span>
            College Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Review and manage college signup requests. Approve, reject, or remove accounts.
          </p>
        </div>
        {statusCounts.pending > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl flex-shrink-0">
            <span
              className="material-symbols-rounded text-amber-500 text-[18px]"
              style={ICO_FILL}
            >
              notification_important
            </span>
            <span className="text-sm font-bold text-amber-700">
              {statusCounts.pending} pending approval
            </span>
          </div>
        )}
      </div>

      {/* ── Stat mini-cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total Colleges",
            value: grandTotal,
            icon: "apartment",
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Pending",
            value: statusCounts.pending,
            icon: "pending",
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
          {
            label: "Approved",
            value: statusCounts.approved,
            icon: "check_circle",
            color: "text-green-600",
            bg: "bg-green-50",
          },
          {
            label: "Rejected",
            value: statusCounts.rejected,
            icon: "cancel",
            color: "text-red-600",
            bg: "bg-red-50",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3"
          >
            <div className={`${s.bg} ${s.color} p-2.5 rounded-xl flex-shrink-0`}>
              <span
                className="material-symbols-rounded text-[20px]"
                style={ICO_FILL}
              >
                {s.icon}
              </span>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800 leading-tight">
                {s.value.toLocaleString()}
              </p>
              <p className="text-xs font-semibold text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter tabs + Search ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">

        {/* Status tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl flex-shrink-0">
          {TABS.map((tab) => (
            <Link
              key={tab.value}
              href={buildUrl({ status: tab.value, page: 1 })}
              className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                status === tab.value
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  tab.badge
                    ? tab.badge
                    : status === tab.value
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {tab.count}
              </span>
            </Link>
          ))}
        </div>

        {/* Search box */}
        <form method="GET" action="/admin/colleges" className="flex-1">
          {status !== "all" && (
            <input type="hidden" name="status" value={status} />
          )}
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none"
              style={ICO}
            >
              search
            </span>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search college name, email, contact…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
          </div>
        </form>

        {q && (
          <Link
            href={buildUrl({ q: "", page: 1 })}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1"
          >
            <span
              className="material-symbols-rounded text-[15px]"
              style={ICO}
            >
              close
            </span>
            Clear
          </Link>
        )}
      </div>

      {/* ── Table card ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

        {colleges.length === 0 ? (
          /* Empty state */
          <div className="py-20 text-center">
            <span
              className="material-symbols-rounded text-6xl text-slate-200 block mb-4"
              style={ICO_FILL}
            >
              apartment
            </span>
            <p className="text-slate-500 font-semibold text-sm">
              {q
                ? `No colleges matching "${q}"`
                : status !== "all"
                ? `No ${status} colleges.`
                : "No college signups yet."}
            </p>
            {(q || status !== "all") && (
              <Link
                href="/admin/colleges"
                className="mt-3 inline-block text-sm text-blue-600 hover:underline"
              >
                View all colleges
              </Link>
            )}
          </div>
        ) : (
          <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 px-1 mb-1">
          {colleges.map((college) => {
            const cfg = STATUS_CONFIG[college.status] ?? STATUS_CONFIG.pending;
            return (
              <div 
                key={String(college._id)} 
                className="group relative bg-white border border-slate-200/60 rounded-[2rem] p-6 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-200 transition-all duration-500 flex flex-col h-full bg-gradient-to-b from-white to-slate-50/30"
              >
                {/* Status Badge + Date */}
                <div className="flex items-center justify-between mb-6">
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${cfg.bg} ${cfg.text} ring-1 ring-inset ring-black/5`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
                    {cfg.label}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                    {formatDate(college.created_at)}
                  </span>
                </div>

                {/* College Info */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 rounded-[1.25rem] bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm flex-shrink-0">
                    <span className="text-2xl font-black">{(college.college_name || "?").charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="min-w-0 flex-1 pt-1">
                    <h3 className="font-extrabold text-slate-800 line-clamp-2 leading-[1.2] group-hover:text-indigo-600 transition-colors text-lg">
                      {college.college_name}
                    </h3>
                    <p className="text-xs text-slate-400 truncate mt-1.5 font-bold flex items-center gap-1">
                      <span className="material-symbols-rounded text-[14px]" style={ICO}>mail</span>
                      {college.email}
                    </p>
                  </div>
                </div>

                {/* Contact Person */}
                <div className="mb-6 space-y-3">
                   <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-100/50 border border-slate-200/30 group-hover:bg-white transition-colors">
                      <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                        <span className="material-symbols-rounded text-[18px]" style={ICO_FILL}>person</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Contact Person</p>
                        <p className="text-xs font-bold text-slate-700 truncate">{college.contact_name || "—"}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-100/50 border border-slate-200/30 group-hover:bg-white transition-colors">
                      <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                        <span className="material-symbols-rounded text-[18px]" style={ICO_FILL}>call</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Phone Number</p>
                        <p className="text-xs font-bold text-slate-700 truncate font-mono">{college.phone || "—"}</p>
                      </div>
                   </div>
                </div>

                {/* Actions */}
                <div className="mt-auto pt-6 border-t border-slate-100 space-y-3">
                  {/* Login toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Login Access</span>
                    <form action={toggleCollegeLoginAction} className="inline-block">
                      <input type="hidden" name="email" value={college.email} />
                      <input type="hidden" name="cur"   value={college.user_is_active ?? 1} />
                      <button
                        type="submit"
                        className={`inline-flex items-center gap-1 text-[10px] font-black px-3 py-1.5 rounded-xl transition-all ${
                          (college.user_is_active ?? 1) === 1
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            : "bg-red-100 text-red-600 hover:bg-red-200"
                        }`}
                      >
                        <span className="material-symbols-rounded text-[12px]" style={ICO_FILL}>
                          {(college.user_is_active ?? 1) === 1 ? "lock_open" : "lock"}
                        </span>
                        {(college.user_is_active ?? 1) === 1 ? "Enabled" : "Disabled"}
                      </button>
                    </form>
                  </div>

                  {/* Approve/Reject/Reset + Delete */}
                  <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
                    {college.status !== "approved" && (
                      <form action={approveCollegeAction}>
                        <input type="hidden" name="id"  value={String(college._id)} />
                        <input type="hidden" name="src" value={college._source ?? "new"} />
                        <button type="submit" className="text-[10px] font-black px-3 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 hover:shadow-lg hover:shadow-green-500/30 transition-all uppercase tracking-tighter">
                          Approve
                        </button>
                      </form>
                    )}
                    {college.status !== "rejected" && (
                      <form action={rejectCollegeAction}>
                        <input type="hidden" name="id"  value={String(college._id)} />
                        <input type="hidden" name="src" value={college._source ?? "new"} />
                        <button type="submit" className="text-[10px] font-black px-3 py-2 rounded-xl bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-all uppercase tracking-tighter">
                          Reject
                        </button>
                      </form>
                    )}
                    {college.status !== "pending" && (
                      <form action={pendingCollegeAction}>
                        <input type="hidden" name="id"  value={String(college._id)} />
                        <input type="hidden" name="src" value={college._source ?? "new"} />
                        <button type="submit" className="text-[10px] font-black px-3 py-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all uppercase tracking-tighter">
                          Reset
                        </button>
                      </form>
                    )}
                  </div>
                  <DeleteButton action={deleteCollegeById.bind(null, String(college._id), college._source ?? "new")} size="sm" />
                </div>
              </div>
            );
          })}
        </div>

            {/* ── Pagination ──────────────────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/50">
                <p className="text-xs text-slate-500">
                  Showing{" "}
                  <strong className="text-slate-700">
                    {offset + 1}–{Math.min(offset + PAGE_SIZE, total)}
                  </strong>{" "}
                  of{" "}
                  <strong className="text-slate-700">
                    {total.toLocaleString()}
                  </strong>{" "}
                  colleges
                </p>
                <div className="flex items-center gap-1">
                  {/* Prev */}
                  {page > 1 ? (
                    <Link
                      href={buildUrl({ page: page - 1 })}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      ← Prev
                    </Link>
                  ) : (
                    <span className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">
                      ← Prev
                    </span>
                  )}

                  {/* Page numbers */}
                  {Array.from(
                    { length: Math.min(5, totalPages) },
                    (_, i) => {
                      const start = Math.max(
                        1,
                        Math.min(page - 2, totalPages - 4),
                      );
                      const p = start + i;
                      if (p > totalPages) return null;
                      return (
                        <Link
                          key={p}
                          href={buildUrl({ page: p })}
                          className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                            p === page
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-slate-600 bg-white border border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {p}
                        </Link>
                      );
                    },
                  )}

                  {/* Next */}
                  {page < totalPages ? (
                    <Link
                      href={buildUrl({ page: page + 1 })}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Next →
                    </Link>
                  ) : (
                    <span className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">
                      Next →
                    </span>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}




