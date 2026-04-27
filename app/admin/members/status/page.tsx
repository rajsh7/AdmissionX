import { getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import UserStatusClient from "./UserStatusClient";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

const STATUS_OPTIONS = ["Active", "Inactive", "Disabled", "Blocked", "Deleted"] as const;
export type UserStatus = typeof STATUS_OPTIONS[number];

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: "student" | "college";
  status: UserStatus;
  created_at: string;
}

// ─── Server Action ────────────────────────────────────────────────────────────

async function updateUserStatus(formData: FormData) {
  "use server";
  const id     = formData.get("id") as string;
  const type   = formData.get("type") as string;
  const status = formData.get("status") as UserStatus;

  if (!id || !status) return;

  const db = await getDb();
  const { ObjectId } = await import("mongodb");

  if (type === "student") {
    await db.collection("next_student_signups").updateOne(
      { _id: new ObjectId(id) },
      { $set: { is_active: status === "Active", account_status: status, updated_at: new Date() } }
    );
  } else {
    await db.collection("next_college_signups").updateOne(
      { _id: new ObjectId(id) },
      { $set: { account_status: status, updated_at: new Date() } }
    );
  }

  revalidatePath("/admin/members/status");
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function MembersStatusPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp         = await searchParams;
  const q          = (sp.q ?? "").trim();
  const filterType = sp.type ?? "all";
  const filterStatus = sp.status ?? "all";
  const page       = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const skip       = (page - 1) * PAGE_SIZE;

  const db = await getDb();

  const [studentDocs, collegeDocs] = await Promise.all([
    db.collection("next_student_signups").find({}, {
      projection: { _id: 1, name: 1, email: 1, phone: 1, is_active: 1, account_status: 1, created_at: 1 },
    }).sort({ created_at: -1 }).toArray(),
    db.collection("next_college_signups").find({}, {
      projection: { _id: 1, college_name: 1, email: 1, phone: 1, status: 1, account_status: 1, created_at: 1 },
    }).sort({ created_at: -1 }).toArray(),
  ]);

  let users: PlatformUser[] = [
    ...studentDocs.map(s => ({
      id:         s._id.toString(),
      name:       s.name ?? "",
      email:      s.email ?? "",
      phone:      s.phone ?? "",
      type:       "student" as const,
      status:     (s.account_status as UserStatus) ?? (s.is_active ? "Active" : "Inactive"),
      created_at: s.created_at ? new Date(s.created_at).toISOString() : "",
    })),
    ...collegeDocs.map(c => ({
      id:         c._id.toString(),
      name:       c.college_name ?? "",
      email:      c.email ?? "",
      phone:      c.phone ?? "",
      type:       "college" as const,
      status:     (c.account_status as UserStatus) ?? (c.status === "approved" ? "Active" : "Inactive"),
      created_at: c.created_at ? new Date(c.created_at).toISOString() : "",
    })),
  ];

  // Filters
  if (q) {
    const ql = q.toLowerCase();
    users = users.filter(u =>
      u.name.toLowerCase().includes(ql) ||
      u.email.toLowerCase().includes(ql) ||
      u.phone.includes(ql)
    );
  }
  if (filterType !== "all") users = users.filter(u => u.type === filterType);
  if (filterStatus !== "all") users = users.filter(u => u.status.toLowerCase() === filterStatus.toLowerCase());

  users.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const total      = users.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const paged      = users.slice(skip, skip + PAGE_SIZE);

  // Summary counts
  const counts = {
    total:    users.length,
    active:   users.filter(u => u.status === "Active").length,
    inactive: users.filter(u => u.status === "Inactive").length,
    disabled: users.filter(u => u.status === "Disabled").length,
    blocked:  users.filter(u => u.status === "Blocked").length,
    deleted:  users.filter(u => u.status === "Deleted").length,
  };

  function buildUrl(overrides: Record<string, string | number>) {
    const merged = { q, page: "1", type: filterType, status: filterStatus, ...overrides };
    const qs = Object.entries(merged)
      .filter(([, v]) => String(v) !== "" && String(v) !== "1" && String(v) !== "all")
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    return `/admin/members/status${qs ? `?${qs}` : ""}`;
  }

  const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };
  const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto w-full">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="material-symbols-rounded text-emerald-600 text-[22px]" style={ICO_FILL}>manage_accounts</span>
          User Account Status
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">View and manage account status for all platform users.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {([
          { label: "Total",    value: counts.total,    color: "bg-slate-100 text-slate-700",   status: "all" },
          { label: "Active",   value: counts.active,   color: "bg-green-100 text-green-700",   status: "active" },
          { label: "Inactive", value: counts.inactive, color: "bg-amber-100 text-amber-700",   status: "inactive" },
          { label: "Disabled", value: counts.disabled, color: "bg-orange-100 text-orange-700", status: "disabled" },
          { label: "Blocked",  value: counts.blocked,  color: "bg-red-100 text-red-700",       status: "blocked" },
          { label: "Deleted",  value: counts.deleted,  color: "bg-slate-200 text-slate-500",   status: "deleted" },
        ] as const).map(c => (
          <Link key={c.label} href={buildUrl({ status: c.status, page: 1 })}
            className={`rounded-xl p-3 text-center transition-all border-2 ${filterStatus === c.status ? "border-slate-800" : "border-transparent"} ${c.color}`}>
            <p className="text-xl font-bold">{c.value}</p>
            <p className="text-[11px] font-bold uppercase tracking-wider">{c.label}</p>
          </Link>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <form method="GET" className="flex-1 flex gap-2">
          <input type="hidden" name="type" value={filterType} />
          <input type="hidden" name="status" value={filterStatus} />
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[18px]" style={ICO}>search</span>
            <input name="q" defaultValue={q} placeholder="Search name, email or phone..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-slate-50" />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors">Search</button>
          {q && <Link href={buildUrl({ q: "" })} className="px-4 py-2.5 bg-slate-100 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-colors">Clear</Link>}
        </form>

        {/* Type filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {[{ v: "all", l: "All" }, { v: "student", l: "Students" }, { v: "college", l: "Colleges" }].map(opt => (
            <Link key={opt.v} href={buildUrl({ type: opt.v, page: 1 })}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${filterType === opt.v ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              {opt.l}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <UserStatusClient users={paged} offset={skip} updateUserStatus={updateUserStatus} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-5 py-4 border-t border-slate-100 bg-white flex items-center justify-between rounded-2xl shadow-sm">
          <p className="text-xs text-slate-500">
            Showing <strong>{skip + 1}</strong> to <strong>{Math.min(skip + PAGE_SIZE, total)}</strong> of <strong>{total}</strong> users
          </p>
          <div className="flex gap-1">
            {page > 1 && <Link href={buildUrl({ page: page - 1 })} className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Prev</Link>}
            {page < totalPages && <Link href={buildUrl({ page: page + 1 })} className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Next</Link>}
          </div>
        </div>
      )}
    </div>
  );
}
