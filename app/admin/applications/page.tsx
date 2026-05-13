import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import ApplicationsListClient from "./ApplicationsListClient";
import {
  sendCollegeApplicationStatusEmail,
  sendStudentApplicationStatusEmail,
} from "@/lib/application-email";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function updateApplicationStatus(formData: FormData): Promise<void> {
  "use server";
  const appId = formData.get("appId") as string;
  const status = formData.get("status") as string;
  if (!appId || !status || !ObjectId.isValid(appId)) return;
  try {
    const db = await getDb();
    const application = await db.collection("applications").findOne({ _id: new ObjectId(appId) });
    if (!application) return;

    await db.collection("applications").updateOne(
      { _id: new ObjectId(appId) },
      { $set: { status, updated_at: new Date() } }
    );

    const collegeSlug = String(application.college_slug ?? "").trim();
    const collegeProfile = collegeSlug
      ? await db.collection("collegeprofile").findOne(
          { slug: collegeSlug },
          { projection: { email: 1, contactpersonemail: 1, college_name: 1, contactpersonname: 1, slug: 1 } },
        )
      : null;

    const appRef = String(application.application_ref ?? application._id.toString());
    const studentName = String(application.student_name ?? "Student");
    const collegeName = String(
      application.college_name ??
      collegeProfile?.college_name ??
      collegeProfile?.contactpersonname ??
      "Institution",
    );
    const courseName = application.course_name ? String(application.course_name) : null;
    const reason = status === "rejected" ? "The institution has not approved this application at this stage." : null;

    const studentEmail = String(application.student_email ?? "").trim();
    if (studentEmail) {
      try {
        await sendStudentApplicationStatusEmail({
          to: studentEmail,
          studentName,
          collegeName,
          appId: appRef,
          courseName,
          status,
          reason,
        });
      } catch (emailErr) {
        console.error("[admin/applications studentEmail]", emailErr);
      }
    }

    const collegeEmail = String(collegeProfile?.contactpersonemail ?? collegeProfile?.email ?? "").trim();
    if (collegeEmail) {
      try {
        await sendCollegeApplicationStatusEmail({
          to: collegeEmail,
          collegeEmail,
          studentName,
          collegeName,
          collegeSlug,
          appId: appRef,
          courseName,
          status,
          reason,
        });
      } catch (emailErr) {
        console.error("[admin/applications collegeEmail]", emailErr);
      }
    }
  } catch (e) {
    console.error("[admin/applications updateStatus]", e);
  }
  revalidatePath("/admin/applications");
  revalidatePath("/", "layout");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 75;

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

function formatDate(d: string | Date | null | undefined): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch { return "—"; }
}

// ─── Status badge config ──────────────────────────────────────────────────────

const STATUS_TABS = [
  { value: "all",       label: "All"          },
  { value: "approved",  label: "Approved"     },
  { value: "pending",   label: "Pending"      },
  { value: "rejected",  label: "Rejected"     },
  { value: "cancelled", label: "Cancelled"    },
];

const STATUS_STYLE: Record<string, { cls: string; dot: string }> = {
  approved:  { cls: "bg-emerald-50 text-emerald-700 border-emerald-100", dot: "bg-emerald-500" },
  pending:   { cls: "bg-amber-50 text-amber-700 border-amber-100",       dot: "bg-amber-500"   },
  submitted: { cls: "bg-blue-50 text-blue-700 border-blue-100",          dot: "bg-blue-500"    },
  rejected:  { cls: "bg-red-50 text-red-700 border-red-100",             dot: "bg-red-500"     },
  cancelled: { cls: "bg-slate-50 text-slate-600 border-slate-100",       dot: "bg-slate-400"   },
  default:   { cls: "bg-slate-50 text-slate-600 border-slate-100",       dot: "bg-slate-400"   },
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
  const sp            = await searchParams;
  const q             = (sp.q ?? "").trim();
  const page          = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const statusFilter  = sp.status ?? "all";
  const collegeFilter = sp.college ?? "";
  const offset        = (page - 1) * PAGE_SIZE;

  const db = await getDb();

  // ── Load lookup maps ───────────────────────────────────────────────────────
  const collegeProfiles = await db.collection("collegeprofile").find({}, { projection: { id: 1, slug: 1, contactpersonname: 1 } }).toArray();

  // Fetch all applications from new collection
  const allApps = await db.collection("applications").find({}).sort({ created_at: -1 }).toArray();

  // Normalize
  interface AppRow {
    _id: string;
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

  const normalized: AppRow[] = allApps.map((a, idx) => ({
    _id: a._id.toString(),
    id: idx + 1,
    applicationRef: a.application_ref || null,
    student_name: a.student_name || null,
    student_email: a.student_email || null,
    student_phone: a.student_phone || null,
    college_name: a.college_name || null,
    college_slug: a.college_slug || null,
    course_name: a.course_name || null,
    degree_name: a.degree_name || null,
    status: a.status || "pending",
    createdAt: a.created_at ? new Date(a.created_at).toISOString() : "",
  }));

  // Apply filters
  let filtered = normalized;
  if (statusFilter !== "all") {
    filtered = filtered.filter(a => a.status.toLowerCase() === statusFilter.toLowerCase());
  }
  if (collegeFilter) {
    filtered = filtered.filter(a => a.college_slug === collegeFilter);
  }
  if (q) {
    const lq = q.toLowerCase();
    filtered = filtered.filter(a =>
      (a.applicationRef ?? "").toLowerCase().includes(lq) ||
      (a.student_name   ?? "").toLowerCase().includes(lq) ||
      (a.student_email  ?? "").toLowerCase().includes(lq) ||
      (a.college_name   ?? "").toLowerCase().includes(lq) ||
      (a.course_name    ?? "").toLowerCase().includes(lq)
    );
  }

  const total      = filtered.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const grandTotal = normalized.length;
  const appRows    = filtered.slice(offset, offset + PAGE_SIZE);

  // Status counts
  const statusCountMap: Record<string, number> = {};
  for (const a of normalized) {
    const key = a.status.toLowerCase();
    statusCountMap[key] = (statusCountMap[key] ?? 0) + 1;
  }

  // Unique colleges for filter dropdown
  const collegeOptions = collegeProfiles
    .map(cp => ({ slug: String(cp.slug ?? "").trim(), name: String(cp.contactpersonname ?? cp.slug ?? "").trim() }))
    .filter(c => c.slug)
    .sort((a, b) => a.name.localeCompare(b.name));

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
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-teal-600 text-[22px]" style={ICO_FILL}>
              description
            </span>
            Applications Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Managing {grandTotal.toLocaleString()} total entries across all institutions.
          </p>
        </div>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {STATUS_TABS.map((tab) => {
          const val      = tab.value === "all" ? grandTotal : (statusCountMap[tab.value] ?? 0);
          const isActive = statusFilter === tab.value;
          return (
            <Link
              key={tab.value}
              href={buildUrl({ status: tab.value, page: 1 })}
              className={`bg-white rounded-2xl border p-5 flex flex-col gap-3 transition-all hover:shadow-md group ${
                isActive ? "border-teal-500 ring-2 ring-teal-50" : "border-slate-100 shadow-sm"
              }`}
            >
              <div className={`p-2.5 rounded-xl w-fit ${isActive ? "bg-teal-50 text-teal-600" : "bg-slate-50 text-slate-400 group-hover:text-slate-600"} transition-colors`}>
                <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>
                  {tab.value === "all" ? "dashboard_customize" : tab.value === "rejected" ? "block" : tab.value === "approved" ? "verified" : "pending_actions"}
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 leading-tight">{val.toLocaleString()}</p>
                <p className="text-xs font-semibold text-slate-500 truncate">{tab.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Filter & Search Bar ────────────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center">

        {/* Status tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto no-scrollbar">
          {STATUS_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={buildUrl({ status: tab.value, page: 1 })}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                statusFilter === tab.value
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-[10px] font-bold opacity-60">
                ({tab.value === "all" ? grandTotal : (statusCountMap[tab.value] ?? 0)})
              </span>
            </Link>
          ))}
        </div>

        {/* Search & Institution form */}
        <form method="GET" action="/admin/applications" className="flex-1 flex flex-wrap sm:flex-nowrap gap-2 w-full">
          {statusFilter !== "all" && <input type="hidden" name="status" value={statusFilter} />}

          <div className="relative w-full sm:w-60">
            <select
              name="college"
              defaultValue={collegeFilter}
              className="w-full appearance-none pl-4 pr-10 py-2.5 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all cursor-pointer"
            >
              <option value="">All Institutions</option>
              {collegeOptions.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name || c.slug}</option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none" style={ICO}>
              expand_more
            </span>
          </div>

          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400" style={ICO}>
              search
            </span>
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by student, ID or course..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all bg-slate-50"
            />
          </div>

          <button type="submit" className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition-all shadow-sm active:scale-95">
            Search
          </button>

          {(q || collegeFilter) && (
            <Link href={buildUrl({ q: "", college: "", page: 1 })} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold rounded-xl transition-all text-center">
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* ── Applications Table ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        {appRows.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <span className="material-symbols-rounded text-3xl text-slate-300" style={ICO_FILL}>folder_open</span>
            </div>
            <h3 className="text-slate-800 font-bold text-lg">No matching applications</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-[280px] mx-auto font-medium">
              No records match your current filter criteria.
            </p>
            {(q || statusFilter !== "all" || collegeFilter) && (
              <Link href="/admin/applications" className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-teal-50 text-teal-700 text-xs font-bold rounded-xl hover:bg-teal-100 transition-all">
                Reset Filters
              </Link>
            )}
          </div>
        ) : (
          <>
            <ApplicationsListClient
              initialRows={appRows}
              offset={offset}
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={PAGE_SIZE}
              updateAction={updateApplicationStatus}
            />
          </>
        )}
      </div>

      {/* ── Footer Notice ────────────────────────────────────────────────── */}
    </div>
  );
}

