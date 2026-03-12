import pool from "@/lib/db";
import Link from "next/link";
import { RowDataPacket } from "mysql2";
import { revalidatePath } from "next/cache";
import DeleteButton from "@/app/admin/_components/DeleteButton";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function approveCollegeAction(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string, 10);
  if (!id) return;
  try {
    await pool.query(
      "UPDATE next_college_signups SET status = 'approved', updated_at = NOW() WHERE id = ?",
      [id],
    );
  } catch (e) {
    console.error("[admin/colleges approveAction]", e);
  }
  revalidatePath("/admin/colleges");
}

async function rejectCollegeAction(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string, 10);
  if (!id) return;
  try {
    await pool.query(
      "UPDATE next_college_signups SET status = 'rejected', updated_at = NOW() WHERE id = ?",
      [id],
    );
  } catch (e) {
    console.error("[admin/colleges rejectAction]", e);
  }
  revalidatePath("/admin/colleges");
}

async function pendingCollegeAction(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string, 10);
  if (!id) return;
  try {
    await pool.query(
      "UPDATE next_college_signups SET status = 'pending', updated_at = NOW() WHERE id = ?",
      [id],
    );
  } catch (e) {
    console.error("[admin/colleges pendingAction]", e);
  }
  revalidatePath("/admin/colleges");
}

async function deleteCollegeById(id: number): Promise<void> {
  "use server";
  try {
    await pool.query("DELETE FROM next_college_signups WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/colleges deleteAction]", e);
  }
  revalidatePath("/admin/colleges");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/colleges safeQuery]", err);
    return [];
  }
}

function formatDate(d: string | null | undefined): string {
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

interface CollegeRow extends RowDataPacket {
  id: number;
  college_name: string;
  email: string;
  contact_name: string;
  phone: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface CountRow extends RowDataPacket {
  total: number;
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

  // ── Build WHERE clause ─────────────────────────────────────────────────────
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (q) {
    conditions.push(
      "(college_name LIKE ? OR email LIKE ? OR contact_name LIKE ? OR phone LIKE ?)",
    );
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (status !== "all") {
    conditions.push("status = ?");
    params.push(status);
  }

  const where = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  // ── Parallel queries ───────────────────────────────────────────────────────
  const [colleges, countRows, totals] = await Promise.all([
    safeQuery<CollegeRow>(
      `SELECT id, college_name, email, contact_name, phone, status, created_at, updated_at
       FROM next_college_signups
       ${where}
       ORDER BY
         FIELD(status, 'pending', 'approved', 'rejected'),
         created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total FROM next_college_signups ${where}`,
      params,
    ),
    safeQuery<CountRow & { status: string }>(
      `SELECT status, COUNT(*) AS total
       FROM next_college_signups
       GROUP BY status`,
    ),
  ]);

  const total      = countRows[0]?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Build status counts map
  const statusCounts: Record<string, number> = { pending: 0, approved: 0, rejected: 0 };
  let grandTotal = 0;
  for (const row of totals) {
    const key = (row as unknown as { status: string; total: number }).status;
    const cnt = (row as unknown as { status: string; total: number }).total;
    if (key in statusCounts) statusCounts[key] = cnt;
    grandTotal += cnt;
  }

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
    <div className="p-6 space-y-6 max-w-[1400px]">

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
        <form method="GET" action="/admin/colleges" className="flex-1 max-w-sm">
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
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider px-5 py-3 w-8">
                      #
                    </th>
                    <th className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3">
                      College
                    </th>
                    <th className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">
                      Contact
                    </th>
                    <th className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">
                      Phone
                    </th>
                    <th className="text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3">
                      Status
                    </th>
                    <th className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">
                      Signed Up
                    </th>
                    <th className="text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider px-5 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-50">
                  {colleges.map((college, idx) => {
                    const cfg =
                      STATUS_CONFIG[college.status] ?? STATUS_CONFIG.pending;

                    return (
                      <tr
                        key={college.id}
                        className="hover:bg-blue-50/20 transition-colors group"
                      >
                        {/* Row # */}
                        <td className="px-5 py-4 text-xs text-slate-400 font-mono">
                          {offset + idx + 1}
                        </td>

                        {/* College info */}
                        <td className="px-4 py-4 max-w-[220px]">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 text-sm font-bold text-blue-700">
                              {college.college_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 truncate leading-tight">
                                {college.college_name}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                {college.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Contact name */}
                        <td className="px-4 py-4 hidden md:table-cell">
                          <span className="text-sm text-slate-600">
                            {college.contact_name || "—"}
                          </span>
                        </td>

                        {/* Phone */}
                        <td className="px-4 py-4 hidden sm:table-cell">
                          <span className="text-sm text-slate-600 font-mono">
                            {college.phone || "—"}
                          </span>
                        </td>

                        {/* Status badge */}
                        <td className="px-4 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${cfg.dot} flex-shrink-0`}
                            />
                            {cfg.label}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <span className="text-xs text-slate-400 whitespace-nowrap">
                            {formatDate(college.created_at)}
                          </span>
                        </td>

                        {/* Action buttons */}
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2 flex-wrap">

                            {/* Approve */}
                            {college.status !== "approved" && (
                              <form action={approveCollegeAction}>
                                <input
                                  type="hidden"
                                  name="id"
                                  value={college.id}
                                />
                                <button
                                  type="submit"
                                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors border border-green-200"
                                  title="Approve this college"
                                >
                                  Approve
                                </button>
                              </form>
                            )}

                            {/* Reject */}
                            {college.status !== "rejected" && (
                              <form action={rejectCollegeAction}>
                                <input
                                  type="hidden"
                                  name="id"
                                  value={college.id}
                                />
                                <button
                                  type="submit"
                                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-200"
                                  title="Reject this college"
                                >
                                  Reject
                                </button>
                              </form>
                            )}

                            {/* Reset to pending */}
                            {college.status !== "pending" && (
                              <form action={pendingCollegeAction}>
                                <input
                                  type="hidden"
                                  name="id"
                                  value={college.id}
                                />
                                <button
                                  type="submit"
                                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors border border-slate-200"
                                  title="Reset to pending"
                                >
                                  Reset
                                </button>
                              </form>
                            )}

                            {/* Delete */}
                            <DeleteButton
                              action={deleteCollegeById.bind(null, college.id)}
                              size="sm"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
