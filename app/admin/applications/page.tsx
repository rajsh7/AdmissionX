import pool from "@/lib/db";
import Link from "next/link";
import { RowDataPacket } from "mysql2";
import { revalidatePath } from "next/cache";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function updateApplicationStatus(formData: FormData): Promise<void> {
  "use server";
  const id       = parseInt(formData.get("id")     as string, 10);
  const statusId = parseInt(formData.get("status") as string, 10);
  if (!id || !statusId) return;
  try {
    await pool.query(
      "UPDATE application SET applicationstatus_id = ? WHERE id = ?",
      [statusId, id],
    );
  } catch (e) {
    console.error("[admin/applications updateStatus]", e);
  }
  revalidatePath("/admin/applications");
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
    console.error("[admin/applications safeQuery]", err);
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface AppRow extends RowDataPacket {
  id: number;
  applicationRef: string | null;
  student_name: string | null;
  student_email: string | null;
  student_phone: string | null;
  college_name: string | null;
  college_slug: string | null;
  course_name: string | null;
  degree_name: string | null;
  status: string;
  createdAt: string;
}

interface CountRow extends RowDataPacket { total: number; }
interface CollegeFilterRow extends RowDataPacket { slug: string; college_name: string | null; }

// ─── Status badge config ──────────────────────────────────────────────────────

const STATUS_TABS = [
  { value: "all",          label: "All"          },
  { value: "submitted",    label: "Submitted"    },
  { value: "under_review", label: "Under Review" },
  { value: "verified",     label: "Verified"     },
  { value: "rejected",     label: "Rejected"     },
  { value: "enrolled",     label: "Enrolled"     },
];

const STATUS_STYLE: Record<string, { cls: string; dot: string }> = {
  submitted:    { cls: "bg-blue-100 text-blue-700",    dot: "bg-blue-500"    },
  under_review: { cls: "bg-amber-100 text-amber-700",  dot: "bg-amber-500"   },
  verified:     { cls: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  rejected:     { cls: "bg-red-100 text-red-700",      dot: "bg-red-500"     },
  enrolled:     { cls: "bg-purple-100 text-purple-700",dot: "bg-purple-500"  },
  default:      { cls: "bg-slate-100 text-slate-600",  dot: "bg-slate-400"   },
};

function getStatusStyle(name: string | null) {
  const key = (name ?? "").toLowerCase().trim();
  return STATUS_STYLE[key] ?? STATUS_STYLE.default;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string; college?: string }>;
}) {
  const sp           = await searchParams;
  const q            = (sp.q ?? "").trim();
  const page         = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const statusFilter = sp.status ?? "all";
  const collegeFilter = sp.college ?? "";
  const offset       = (page - 1) * PAGE_SIZE;

  // ── Build WHERE conditions ─────────────────────────────────────────────────
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (q) {
    conditions.push(
      `(a.applicationRef LIKE ?
        OR s.name         LIKE ?
        OR s.email        LIKE ?
        OR co.name        LIKE ?)`,
    );
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  }

  if (statusFilter !== "all") {
    conditions.push("a.status = ?");
    params.push(statusFilter);
  }

  if (collegeFilter) {
    conditions.push("cp.slug = ?");
    params.push(collegeFilter);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const JOINS = `
    LEFT JOIN next_student_signups s  ON s.id  = a.studentId
    LEFT JOIN collegeprofile       cp ON cp.id = a.collegeId
    LEFT JOIN users                u  ON u.id  = cp.users_id
    LEFT JOIN collegemaster        cm ON cm.id = a.courseId
    LEFT JOIN course               co ON co.id = cm.course_id
    LEFT JOIN degree               d  ON d.id  = cm.degree_id
  `;

  // ── Parallel queries ───────────────────────────────────────────────────────
  const [appRows, countRows, statusCounts, totalAll, colleges] = await Promise.all([
    safeQuery<AppRow>(
      `SELECT
         a.id,
         a.applicationRef,
         s.name      AS student_name,
         s.email     AS student_email,
         s.phone     AS student_phone,
         COALESCE(NULLIF(TRIM(u.firstname), ''), cp.slug) AS college_name,
         cp.slug     AS college_slug,
         co.name     AS course_name,
         d.name      AS degree_name,
         a.status,
         a.createdAt
       FROM applications a
       ${JOINS}
       ${where}
       ORDER BY a.createdAt DESC
       LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total FROM applications a ${JOINS} ${where}`,
      params,
    ),
    safeQuery<CountRow & { status: string }>(
      `SELECT status, COUNT(*) AS total FROM applications GROUP BY status`,
    ),
    safeQuery<CountRow>(`SELECT COUNT(*) AS total FROM applications`),
    safeQuery<CollegeFilterRow>(
      `SELECT cp.slug,
              COALESCE(NULLIF(TRIM(u.firstname), ''), cp.slug) AS college_name
       FROM collegeprofile cp
       LEFT JOIN users u ON u.id = cp.users_id
       ORDER BY college_name ASC`,
    ),
  ]);

  const total      = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const grandTotal = Number(totalAll[0]?.total ?? 0);

  // Build status→count map
  const statusCountMap: Record<string, number> = {};
  for (const row of statusCounts) {
    const r = row as { status: string; total: number };
    statusCountMap[r.status] = Number(r.total ?? 0);
  }

  // ── URL builder ────────────────────────────────────────────────────────────
  function buildUrl(overrides: Record<string, string | number>) {
    const merged = { q, page: String(page), status: statusFilter, college: collegeFilter, ...overrides };
    const qs = Object.entries(merged)
      .filter(([, v]) => v !== "" && v !== "1" && v !== "all")
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    return `/admin/applications${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-red-600 text-[22px]" style={ICO_FILL}>
              description
            </span>
            Applications
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Read-only view of all applications across all colleges.
          </p>
        </div>
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full flex-shrink-0">
          {grandTotal.toLocaleString()} total
        </span>
      </div>

      {/* ── Mini stat cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {STATUS_TABS.slice(1).map((tab) => {
          const cnt = statusCountMap[tab.value] ?? 0;
          const style = getStatusStyle(tab.value);
          return (
            <Link
              key={tab.value}
              href={buildUrl({ status: tab.value, page: 1 })}
              className={`bg-white rounded-xl border p-3.5 flex flex-col gap-1 hover:shadow-md transition-all ${
                statusFilter === tab.value ? "border-red-200 ring-2 ring-red-100" : "border-slate-100"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${style.dot}`} />
              <p className="text-xl font-bold text-slate-800 leading-none">{cnt.toLocaleString()}</p>
              <p className="text-[10px] font-semibold text-slate-500 truncate">{tab.label}</p>
            </Link>
          );
        })}
      </div>

      {/* ── Filter bar ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 flex-wrap items-start sm:items-center">

        {/* Search & College Filter */}
        <form method="GET" action="/admin/applications" className="flex-1 flex gap-2 min-w-[200px] items-center">
          {statusFilter !== "all" && <input type="hidden" name="status" value={statusFilter} />}
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-semibold text-slate-400 hidden sm:block">College:</span>
            <select
              name="college"
              defaultValue={collegeFilter}
              className="text-xs border border-slate-200 rounded-xl px-3 py-2 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400 transition cursor-pointer"
            >
              <option value="">All Colleges</option>
              {colleges.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.college_name ?? c.slug}
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none" style={ICO}>
              search
            </span>
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by name, email, ref, course…"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400 transition"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors flex-shrink-0">
            Search
          </button>
          {(q || collegeFilter) && (
            <Link href={buildUrl({ q: "", college: "", page: 1 })} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold rounded-xl transition-colors flex-shrink-0">
              Clear
            </Link>
          )}
        </form>

        {/* Status filter tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUS_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={buildUrl({ status: tab.value, page: 1 })}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap ${
                statusFilter === tab.value
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-[10px] font-bold inline-block align-middle ${statusFilter === tab.value ? "text-white/80" : "text-slate-400"}`}>
                {tab.value === "all" ? grandTotal : (statusCountMap[tab.value] ?? 0)}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Applications table ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {appRows.length === 0 ? (
          <div className="py-24 text-center">
            <span className="material-symbols-rounded text-6xl text-slate-200 block mb-4" style={ICO_FILL}>
              description
            </span>
            <p className="text-slate-500 font-semibold text-sm">
              {q ? `No applications found for "${q}"` : statusFilter !== "all" ? `No ${statusFilter} applications yet.` : "No applications yet."}
            </p>
            {(q || statusFilter !== "all" || collegeFilter) && (
              <Link href="/admin/applications" className="mt-3 inline-block text-xs text-red-600 hover:underline">
                Clear filters
              </Link>
            )}
          </div>
        ) : (
          <div key="results-container">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">App Ref</th>
                    <th className="px-4 py-3 text-left">Student</th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">College</th>
                    <th className="px-4 py-3 text-left hidden lg:table-cell">Course</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-left hidden sm:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {appRows.map((app, idx) => {
                    const statusStyle = getStatusStyle(app.status);
                    return (
                      <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-4 text-xs text-slate-400 font-mono">
                          {offset + idx + 1}
                        </td>

                        {/* App Ref */}
                        <td className="px-4 py-4">
                          <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg whitespace-nowrap">
                            {app.applicationRef ?? `ADX-${String(app.id).padStart(6, "0")}`}
                          </span>
                        </td>

                        {/* Student */}
                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-800 leading-tight truncate max-w-[180px]">
                            {app.student_name ?? "—"}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate max-w-[180px] mt-0.5">
                            {app.student_email ?? "—"}
                          </p>
                          {app.student_phone && (
                            <p className="text-[11px] text-slate-400">{app.student_phone}</p>
                          )}
                        </td>

                        {/* College */}
                        <td className="px-4 py-4 hidden md:table-cell">
                          {app.college_name ? (
                            <div>
                              <p className="text-xs font-semibold text-slate-700 truncate max-w-[160px]">
                                {app.college_name}
                              </p>
                              {app.college_slug && (
                                <Link
                                  href={`/college/${app.college_slug}`}
                                  target="_blank"
                                  className="text-[10px] text-blue-500 hover:underline font-mono"
                                >
                                  view profile →
                                </Link>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-300 italic">Unknown</span>
                          )}
                        </td>

                        {/* Course */}
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <p className="text-xs font-semibold text-slate-700 truncate max-w-[140px]">
                            {app.course_name ?? "—"}
                          </p>
                          {app.degree_name && (
                            <p className="text-[10px] text-slate-400 mt-0.5">{app.degree_name}</p>
                          )}
                        </td>

                        {/* Status (read-only badge) */}
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${statusStyle.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                            {app.status ?? "unknown"}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-4 hidden sm:table-cell">
                          <span className="text-xs text-slate-400 whitespace-nowrap">
                            {formatDate(app.createdAt)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ─────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50/50">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <strong className="text-slate-700">
                  {offset + 1}–{Math.min(offset + PAGE_SIZE, total)}
                </strong>{" "}
                of <strong className="text-slate-700">{total.toLocaleString()}</strong>{" "}
                application{total !== 1 ? "s" : ""}
                {statusFilter !== "all" && <span className="text-slate-400"> (filtered)</span>}
              </p>

              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  {page > 1 && (
                    <Link href={buildUrl({ page: page - 1 })} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      ← Prev
                    </Link>
                  )}
                  {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                    const start = Math.max(1, Math.min(page - 3, totalPages - 6));
                    const p = start + i;
                    if (p > totalPages) return null;
                    return (
                      <Link
                        key={p}
                        href={buildUrl({ page: p })}
                        className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                          p === page ? "bg-red-600 text-white shadow-sm" : "text-slate-500 bg-white border border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {p}
                      </Link>
                    );
                  })}
                  {page < totalPages && (
                    <Link href={buildUrl({ page: page + 1 })} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      Next →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Read-only notice ────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 text-sm text-blue-800">
        <span className="material-symbols-rounded text-[18px] mt-0.5 flex-shrink-0" style={ICO_FILL}>
          info
        </span>
        <p>
          <strong>Read-only view.</strong> Application statuses are managed by colleges directly.
          Admin oversight only — no status changes from this panel.
        </p>
      </div>
    </div>
  );
}
