import { getDb } from "@/lib/db";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { verifyAdminToken, ADMIN_COOKIE } from "@/lib/auth";
import { Filter, Document } from "mongodb";

async function toggleUserAction(formData: FormData): Promise<void> {
  "use server";
  const id = formData.get("id") as string;
  const cur = parseInt(formData.get("cur") as string, 10);
  if (!id) return;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE)?.value;
    if (token) {
      const payload = await verifyAdminToken(token);
      if (payload && payload.id === id) {
        console.warn("[admin/users] Cannot deactivate your own account.");
        return;
      }
    }
  } catch (e) {
    console.error("[admin/users toggleUser — jwt check]", e);
  }

  try {
    const db = await getDb();
    await db.collection("next_admin_users").updateOne(
      { _id: id } as unknown as Filter<Document>,
      { $set: { is_active: cur ? false : true, updated_at: new Date() } }
    );
  } catch (e) {
    console.error("[admin/users toggleUser]", e);
  }
  revalidatePath("/admin/users");
  revalidatePath("/", "layout");
}

const PAGE_SIZE = 25;
const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch { return "—"; }
}

function fmtAdminId(id: string): string {
  return `ADX-A-${String(id).slice(-4).toUpperCase()}`;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const filter = sp.filter ?? "all";
  const offset = (page - 1) * PAGE_SIZE;

  let currentAdminId: string | null = null;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE)?.value;
    if (token) {
      const payload = await verifyAdminToken(token);
      if (payload) currentAdminId = payload.id;
    }
  } catch { /* non-fatal */ }

  const db = await getDb();

  const matchFilter: Record<string, unknown> = {};
  if (q) matchFilter.$or = [{ name: { $regex: q, $options: "i" } }, { email: { $regex: q, $options: "i" } }];
  if (filter === "active") matchFilter.is_active = true;
  if (filter === "inactive") matchFilter.is_active = false;

  const [users, total, totalAll, totalActive, totalInactive] = await Promise.all([
    db.collection("next_admin_users").find(matchFilter).sort({ _id: 1 }).skip(offset).limit(PAGE_SIZE)
      .project({ _id: 1, name: 1, email: 1, is_active: 1, created_at: 1, updated_at: 1 }).toArray(),
    db.collection("next_admin_users").countDocuments(matchFilter),
    db.collection("next_admin_users").countDocuments({}),
    db.collection("next_admin_users").countDocuments({ is_active: true }),
    db.collection("next_admin_users").countDocuments({ is_active: false }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function buildUrl(overrides: Record<string, string | number>) {
    const merged = { q, page: "1", filter, ...overrides };
    const qs = Object.entries(merged)
      .filter(([, v]) => v !== "" && v !== "1" && v !== "all")
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    return `/admin/users${qs ? `?${qs}` : ""}`;
  }

  const FILTER_TABS = [
    { value: "all", label: "All Admins", count: totalAll },
    { value: "active", label: "Active", count: totalActive },
    { value: "inactive", label: "Inactive", count: totalInactive },
  ];

  const STAT_CARDS = [
    { label: "Total Admins", count: totalAll, icon: "shield_person" },
    { label: "Active", count: totalActive, icon: "check_circle" },
    { label: "Inactive", count: totalInactive, icon: "cancel" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-slate-700 text-[22px]" style={ICO_FILL}>shield_person</span>
            Admin Users
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage administrator accounts and access status.</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl">{totalAll.toLocaleString()} total</span>
          <Link href="/admin/users/new" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-slate-700 hover:bg-slate-800 px-4 py-2 rounded-xl transition-colors shadow-sm">
            <span className="material-symbols-rounded text-[16px]" style={ICO_FILL}>add</span>
            New Admin
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {STAT_CARDS.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div className="bg-slate-100 text-slate-700 p-2.5 rounded-xl flex-shrink-0">
              <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>{card.icon}</span>
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-slate-800 leading-tight">{card.count}</p>
              <p className="text-xs font-semibold text-slate-500 truncate">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl flex-shrink-0">
          {FILTER_TABS.map((tab) => (
            <Link key={tab.value} href={buildUrl({ filter: tab.value, page: 1 })}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${filter === tab.value ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              {tab.label}<span className="ml-1.5 text-[10px] font-bold opacity-60">({tab.count})</span>
            </Link>
          ))}
        </div>
        <form method="GET" action="/admin/users" className="flex-1 max-w-sm">
          {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none" style={ICO}>search</span>
            <input name="q" defaultValue={q} placeholder="Search name or email…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-500/30 focus:border-slate-400 transition" />
          </div>
        </form>
        {q && (
          <Link href={buildUrl({ q: "", page: 1 })} className="text-xs font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1">
            <span className="material-symbols-rounded text-[15px]" style={ICO}>close</span>Clear
          </Link>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {users.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-symbols-rounded text-6xl text-slate-200 block mb-4" style={ICO_FILL}>shield_person</span>
            <p className="text-sm font-semibold text-slate-500">{q ? `No admins matching "${q}"` : "No admin users found."}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3 text-left w-10">#</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">Email</th>
                    <th className="px-4 py-3 text-left hidden sm:table-cell">Admin ID</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-left hidden lg:table-cell">Created</th>
                    <th className="px-4 py-3 text-left hidden lg:table-cell">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((user, idx) => {
                    const userId = user._id.toString();
                    const isSelf = userId === currentAdminId;
                    return (
                      <tr key={userId} className={`transition-colors group ${isSelf ? "bg-slate-50/60" : "hover:bg-slate-50/40"}`}>
                        <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">{offset + idx + 1}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                              <span className="material-symbols-rounded text-slate-600 text-[16px]" style={ICO_FILL}>person</span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 truncate max-w-[180px]">{user.name}</p>
                              {isSelf && <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded-full">You</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          <span className="text-xs text-slate-500 truncate block max-w-[220px]">{user.email}</span>
                        </td>
                        <td className="px-4 py-3.5 hidden sm:table-cell">
                          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full tracking-wide">{fmtAdminId(userId)}</span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {isSelf ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 cursor-not-allowed opacity-70">
                              <span className="material-symbols-rounded text-[13px]" style={ICO_FILL}>check_circle</span>Active
                            </span>
                          ) : (
                            <form action={toggleUserAction} className="inline-block">
                              <input type="hidden" name="id" value={userId} />
                              <input type="hidden" name="cur" value={user.is_active ? "1" : "0"} />
                              <button type="submit" title={user.is_active ? "Deactivate admin" : "Activate admin"}
                                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full transition-colors ${user.is_active ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}>
                                <span className="material-symbols-rounded text-[13px]" style={ICO_FILL}>{user.is_active ? "check_circle" : "cancel"}</span>
                                {user.is_active ? "Active" : "Inactive"}
                              </button>
                            </form>
                          )}
                        </td>
                        <td className="px-4 py-3.5 hidden lg:table-cell">
                          <span className="text-xs text-slate-400 whitespace-nowrap">{formatDate(user.created_at)}</span>
                        </td>
                        <td className="px-4 py-3.5 hidden lg:table-cell">
                          <span className="text-xs text-slate-400 whitespace-nowrap">{formatDate(user.updated_at)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/50">
                <p className="text-xs text-slate-500">
                  Showing <strong className="text-slate-700">{offset + 1}–{Math.min(offset + PAGE_SIZE, total)}</strong> of <strong className="text-slate-700">{total}</strong> admins
                </p>
                <div className="flex items-center gap-1">
                  {page > 1 && <Link href={buildUrl({ page: page - 1 })} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">← Prev</Link>}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                    const p = start + i;
                    if (p > totalPages) return null;
                    return (
                      <Link key={p} href={buildUrl({ page: p })}
                        className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${p === page ? "bg-slate-700 text-white shadow-sm" : "text-slate-500 bg-white border border-slate-200 hover:bg-slate-50"}`}>
                        {p}
                      </Link>
                    );
                  })}
                  {page < totalPages && <Link href={buildUrl({ page: page + 1 })} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Next →</Link>}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-sm text-amber-800">
        <span className="material-symbols-rounded text-[18px] mt-0.5 flex-shrink-0" style={ICO_FILL}>info</span>
        <p><strong>Safety:</strong> Admin accounts cannot be deleted from this panel. Deactivate an account to revoke access. You cannot deactivate your own account.</p>
      </div>
    </div>
  );
}




