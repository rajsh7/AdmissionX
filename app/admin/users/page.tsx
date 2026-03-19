import pool from "@/lib/db";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { RowDataPacket } from "mysql2";
import { cookies } from "next/headers";
import { verifyAdminToken, ADMIN_COOKIE } from "@/lib/auth";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function toggleUserAction(formData: FormData): Promise<void> {
  "use server";
  const id  = parseInt(formData.get("id")  as string, 10);
  const cur = parseInt(formData.get("cur") as string, 10);
  if (!id) return;

  // Safety: never allow deactivating yourself
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
    await pool.query(
      "UPDATE next_admin_users SET is_active = ? WHERE id = ?",
      [cur ? 0 : 1, id],
    );
  } catch (e) {
    console.error("[admin/users toggleUser]", e);
  }
  revalidatePath("/admin/users");
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
    console.error("[admin/users safeQuery]", err);
    return [];
  }
}

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch { return "—"; }
}

function fmtAdminId(id: number): string {
  return `ADX-A-${String(id).padStart(4, "0")}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminUserRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

interface CountRow extends RowDataPacket { total: number; }

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp     = await searchParams;
  const q      = (sp.q ?? "").trim();
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const filter = sp.filter ?? "all"; // all | active | inactive
  const offset = (page - 1) * PAGE_SIZE;

  // Read current admin ID from JWT so we can mark their own row
  let currentAdminId: number | null = null;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE)?.value;
    if (token) {
      const payload = await verifyAdminToken(token);
      if (payload) currentAdminId = payload.id;
    }
  } catch { /* non-fatal */ }

  // ── WHERE ─────────────────────────────────────────────────────────────────
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (q) {
    conditions.push("(name LIKE ? OR email LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }
  if (filter === "active")   conditions.push("is_active = 1");
  if (filter === "inactive") conditions.push("is_active = 0");

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  // ── Parallel queries ──────────────────────────────────────────────────────
  const [users, countRows, totalRow, activeRow, inactiveRow] = await Promise.all([
    safeQuery<AdminUserRow>(
      `SELECT id, name, email, is_active, created_at, updated_at
       FROM next_admin_users
       ${where}
       ORDER BY id ASC
       LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total FROM next_admin_users ${where}`,
      params,
    ),
    safeQuery<CountRow>("SELECT COUNT(*) AS total FROM next_admin_users"),
    safeQuery<CountRow>("SELECT COUNT(*) AS total FROM next_admin_users WHERE is_active = 1"),
    safeQuery<CountRow>("SELECT COUNT(*) AS total FROM next_admin_users WHERE is_active = 0"),
  ]);

  const total      = Number(countRows[0]?.total ?? 0);
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
    { value: "all",      label: "All Admins", count: Number(totalRow[0]?.total   ?? 0) },
    { value: "active",   label: "Active",     count: Number(activeRow[0]?.total   ?? 0) },
    { value: "inactive", label: "Inactive",   count: Number(inactiveRow[0]?.total ?? 0) },
  ];

  const STAT_CARDS = [
    { label: "Total Admins", count: Number(totalRow[0]?.total   ?? 0), icon: "shield_person" },
    { label: "Active",       count: Number(activeRow[0]?.total   ?? 0), icon: "check_circle"  },
    { label: "Inactive",     count: Number(inactiveRow[0]?.total ?? 0), icon: "cancel"        },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-slate-700 text-[22px]" style={ICO_FILL}>
              shield_person
            </span>
            Admin Users
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage administrator accounts and access status.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl">
            {(totalRow[0]?.total ?? 0).toLocaleString()} total
          </span>
          <Link
            href="/admin/users/new"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-slate-700 hover:bg-slate-800 px-4 py-2 rounded-xl transition-colors shadow-sm"
          >
            <span className="material-symbols-rounded text-[16px]" style={ICO_FILL}>add</span>
            New Admin
          </Link>
        </div>
      </div>

      {/* ── Stat mini-cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {STAT_CARDS.map((card, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4"
          >
            <div className="bg-slate-100 text-slate-700 p-2.5 rounded-xl flex-shrink-0">
              <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>
                {card.icon}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-slate-800 leading-tight">{card.count}</p>
              <p className="text-xs font-semibold text-slate-500 truncate">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter tabs + Search ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl flex-shrink-0">
          {FILTER_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={buildUrl({ filter: tab.value, page: 1 })}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                filter === tab.value
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-[10px] font-bold opacity-60">({tab.count})</span>
            </Link>
          ))}
        </div>

        <form method="GET" action="/admin/users" className="flex-1 max-w-sm">
          {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none"
              style={ICO}
            >
              search
            </span>
            <input
              name="q"
              defaultValue={q}
              placeholder="Search name or email…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-500/30 focus:border-slate-400 transition"
            />
          </div>
        </form>

        {q && (
          <Link
            href={buildUrl({ q: "", page: 1 })}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1"
          >
            <span className="material-symbols-rounded text-[15px]" style={ICO}>close</span>
            Clear
          </Link>
        )}
      </div>

      {/* ── Table card ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {users.length === 0 ? (
          <div className="py-20 text-center">
            <span
              className="material-symbols-rounded text-6xl text-slate-200 block mb-4"
              style={ICO_FILL}
            >
              shield_person
            </span>
            <p className="text-sm font-semibold text-slate-500">
              {q ? `No admins matching "${q}"` : "No admin users found."}
            </p>
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
                    const isSelf = user.id === currentAdminId;
                    return (
                      <tr
                        key={user.id}
                        className={`transition-colors group ${
                          isSelf
                            ? "bg-slate-50/60"
                            : "hover:bg-slate-50/40"
                        }`}
                      >
                        {/* # */}
                        <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">
                          {offset + idx + 1}
                        </td>

                        {/* Name */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                              <span
                                className="material-symbols-rounded text-slate-600 text-[16px]"
                                style={ICO_FILL}
                              >
                                person
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 truncate max-w-[180px]">
                                {user.name}
                              </p>
                              {isSelf && (
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded-full">
                                  You
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          <span className="text-xs text-slate-500 truncate block max-w-[220px]">
                            {user.email}
                          </span>
                        </td>

                        {/* Admin ID */}
                        <td className="px-4 py-3.5 hidden sm:table-cell">
                          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full tracking-wide">
                            {fmtAdminId(user.id)}
                          </span>
                        </td>

                        {/* Status toggle */}
                        <td className="px-4 py-3.5 text-center">
                          {isSelf ? (
                            // Cannot deactivate yourself — show static badge
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 cursor-not-allowed opacity-70">
                              <span
                                className="material-symbols-rounded text-[13px]"
                                style={ICO_FILL}
                              >
                                check_circle
                              </span>
                              Active
                            </span>
                          ) : (
                            <form action={toggleUserAction} className="inline-block">
                              <input type="hidden" name="id"  value={user.id} />
                              <input type="hidden" name="cur" value={user.is_active} />
                              <button
                                type="submit"
                                title={user.is_active ? "Deactivate admin" : "Activate admin"}
                                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                                  user.is_active
                                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                    : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                                }`}
                              >
                                <span
                                  className="material-symbols-rounded text-[13px]"
                                  style={ICO_FILL}
                                >
                                  {user.is_active ? "check_circle" : "cancel"}
                                </span>
                                {user.is_active ? "Active" : "Inactive"}
                              </button>
                            </form>
                          )}
                        </td>

                        {/* Created */}
                        <td className="px-4 py-3.5 hidden lg:table-cell">
                          <span className="text-xs text-slate-400 whitespace-nowrap">
                            {formatDate(user.created_at)}
                          </span>
                        </td>

                        {/* Last Updated */}
                        <td className="px-4 py-3.5 hidden lg:table-cell">
                          <span className="text-xs text-slate-400 whitespace-nowrap">
                            {formatDate(user.updated_at)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/50">
                <p className="text-xs text-slate-500">
                  Showing{" "}
                  <strong className="text-slate-700">
                    {offset + 1}–{Math.min(offset + PAGE_SIZE, total)}
                  </strong>{" "}
                  of <strong className="text-slate-700">{total}</strong> admins
                </p>
                <div className="flex items-center gap-1">
                  {page > 1 && (
                    <Link
                      href={buildUrl({ page: page - 1 })}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      ← Prev
                    </Link>
                  )}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                    const p = start + i;
                    if (p > totalPages) return null;
                    return (
                      <Link
                        key={p}
                        href={buildUrl({ page: p })}
                        className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                          p === page
                            ? "bg-slate-700 text-white shadow-sm"
                            : "text-slate-500 bg-white border border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {p}
                      </Link>
                    );
                  })}
                  {page < totalPages && (
                    <Link
                      href={buildUrl({ page: page + 1 })}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Next →
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Safety note ───────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-sm text-amber-800">
        <span className="material-symbols-rounded text-[18px] mt-0.5 flex-shrink-0" style={ICO_FILL}>
          info
        </span>
        <p>
          <strong>Safety:</strong> Admin accounts cannot be deleted from this panel. Deactivate an
          account to revoke access. You cannot deactivate your own account. Password management
          and account creation are available in{" "}
          <span className="font-semibold">Phase 11</span>.
        </p>
      </div>
    </div>
  );
}
