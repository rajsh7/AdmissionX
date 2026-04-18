import { getDb } from "@/lib/db";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import TransactionListClient from "./TransactionListClient";

async function deleteTransaction(id: number) {
  "use server";
  try {
    const db = await getDb();
    await db.collection("transaction").deleteOne({ id });
  } catch (e) {
    console.error("[admin/payment/transactions deleteAction]", e);
  }
  revalidatePath("/admin/payment/transactions");
}

const PAGE_SIZE = 75;
const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return "—"; }
}

function formatAmount(val: any): string {
  const n = parseFloat(String(val ?? 0));
  if (isNaN(n) || n === 0) return "—";
  return `₹${n.toLocaleString("en-IN")}`;
}

export default async function ApplicationTransactionPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp     = await searchParams;
  const q      = (sp.q ?? "").trim();
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const status = sp.status ?? "all";
  const type   = sp.type ?? "student"; // "student" | "college"
  const offset = (page - 1) * PAGE_SIZE;

  const db = await getDb();

  // ── College Transactions: collegemaster fee structure ──────────────────────
  if (type === "college") {
    const searchMatch = q ? {
      $or: [
        { college_name: { $regex: q, $options: "i" } },
        { slug:         { $regex: q, $options: "i" } },
        { course_name:  { $regex: q, $options: "i" } },
        { degree_name:  { $regex: q, $options: "i" } },
        { stream_name:  { $regex: q, $options: "i" } },
      ]
    } : {};

    const collegePipeline: any[] = [
      { $lookup: { from: "collegeprofile", localField: "collegeprofile_id", foreignField: "id", as: "cp" } },
      { $unwind: { path: "$cp", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "users", localField: "cp.users_id", foreignField: "id", as: "u" } },
      { $unwind: { path: "$u", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "course", localField: "course_id", foreignField: "id", as: "c" } },
      { $unwind: { path: "$c", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "degree", localField: "degree_id", foreignField: "id", as: "d" } },
      { $unwind: { path: "$d", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "functionalarea", localField: "functionalarea_id", foreignField: "id", as: "fa" } },
      { $unwind: { path: "$fa", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          id: 1, fees: 1, seats: 1,
          college_name: {
            $cond: [
              { $and: [{ $ne: ["$u.firstname", null] }, { $ne: [{ $trim: { input: { $ifNull: ["$u.firstname", ""] } } }, ""] }] },
              { $trim: { input: "$u.firstname" } },
              { $ifNull: ["$cp.slug", "Unnamed College"] },
            ],
          },
          slug:        { $ifNull: ["$cp.slug", ""] },
          course_name: { $ifNull: ["$c.name", ""] },
          degree_name: { $ifNull: ["$d.name", ""] },
          stream_name: { $ifNull: ["$fa.name", ""] },
        },
      },
      ...(q ? [{ $match: searchMatch }] : []),
      {
        $facet: {
          data:  [{ $skip: offset }, { $limit: PAGE_SIZE }],
          total: [{ $count: "count" }],
        },
      },
    ];

    const cr      = await db.collection("collegemaster").aggregate(collegePipeline).toArray();
    const cData   = (cr[0]?.data ?? []).map((p: any) => ({
      id: Number(p.id ?? 0),
      name: null,
      application_id: null,
      created_at: null,
      transactionHashKey: null,
      payment_status: "",
      amount: 0,
      student_name: null,
      student_email: null,
      student_phone: null,
      college_name: String(p.college_name ?? ""),
      college_slug: String(p.slug ?? ""),
      course_name: String(p.course_name ?? ""),
      degree_name: String(p.degree_name ?? ""),
      stream_name: String(p.stream_name ?? ""),
      fees: p.fees ? String(p.fees) : null,
      seats: p.seats ? Number(p.seats) : null,
    }));
    const cTotal  = Number(cr[0]?.total?.[0]?.count ?? 0);
    const cPages  = Math.ceil(cTotal / PAGE_SIZE);

    function buildCollegeUrl(overrides: Record<string, string | number>) {
      const merged = { q, page: "1", type: "college", ...Object.fromEntries(Object.entries(overrides).map(([k, v]) => [k, String(v)])) };
      const qs = Object.entries(merged).filter(([, v]) => v).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
      return `/admin/payment/transactions${qs ? `?${qs}` : ""}`;
    }

    return (
      <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>account_balance</span>
            Payment Transactions
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">All payment transactions with full details.</p>
        </div>

        {/* Type Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {[
            { key: "student", label: "Student Transactions", icon: "person" },
            { key: "college", label: "College Transactions", icon: "account_balance" },
          ].map((t) => (
            <Link key={t.key} href={buildCollegeUrl({ type: t.key, page: 1 })}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${type === t.key ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              <span className="material-symbols-rounded text-[16px]" style={type === t.key ? ICO_FILL : ICO}>{t.icon}</span>
              {t.label}
            </Link>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
            <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl flex-shrink-0">
              <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>account_balance</span>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{cTotal.toLocaleString("en-IN")}</p>
              <p className="text-xs font-semibold text-slate-500">Total College Fee Records</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <form method="GET" action="/admin/payment/transactions" className="w-full sm:w-96">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400" style={ICO}>search</span>
            <input name="q" defaultValue={q} placeholder="Search college, course, degree, stream..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
            />
            <input type="hidden" name="type" value="college" />
          </div>
        </form>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <TransactionListClient
            rows={cData}
            offset={offset}
            total={cTotal}
            page={page}
            totalPages={cPages}
            pageSize={PAGE_SIZE}
            type="college"
            onDelete={deleteTransaction}
          />
        </div>
      </div>
    );
  }

  // ── Student Transactions: transaction collection ────────────────────────────
  const basePipeline: any[] = [
    // Join application
    { $lookup: { from: "application", localField: "application_id", foreignField: "id", as: "app" } },
    { $unwind: { path: "$app", preserveNullAndEmptyArrays: true } },

    // Join paymentstatus
    { $lookup: { from: "paymentstatus", localField: "paymentstatus_id", foreignField: "id", as: "ps" } },
    { $unwind: { path: "$ps", preserveNullAndEmptyArrays: true } },

    // Join collegeprofile
    { $lookup: { from: "collegeprofile", localField: "app.collegeprofile_id", foreignField: "id", as: "cp" } },
    { $unwind: { path: "$cp", preserveNullAndEmptyArrays: true } },

    // Join users for college name
    { $lookup: { from: "users", localField: "cp.users_id", foreignField: "id", as: "cu" } },
    { $unwind: { path: "$cu", preserveNullAndEmptyArrays: true } },

    // Join collegemaster → course
    { $lookup: { from: "collegemaster", localField: "app.collegemaster_id", foreignField: "id", as: "cm" } },
    { $unwind: { path: "$cm", preserveNullAndEmptyArrays: true } },
    { $lookup: { from: "course", localField: "cm.course_id", foreignField: "id", as: "course" } },
    { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } },

    {
      $project: {
        id: 1, name: 1, application_id: 1, created_at: 1, transactionHashKey: 1,
        payment_status: { $ifNull: ["$ps.name", "Unknown"] },
        amount: {
          $convert: {
            input: { $trim: { input: { $ifNull: ["$app.byafees", { $ifNull: ["$app.totalfees", "0"] }] } } },
            to: "double", onError: 0, onNull: 0,
          },
        },
        // Student fields from application
        student_name: { $trim: { input: { $concat: [{ $ifNull: ["$app.firstname", ""] }, " ", { $ifNull: ["$app.lastname", ""] }] } } },
        student_email: { $trim: { input: { $ifNull: ["$app.email", ""] } } },
        student_phone: { $trim: { input: { $ifNull: ["$app.phone", ""] } } },
        // College fields
        college_name: {
          $cond: [
            { $and: [{ $ne: ["$cu.firstname", null] }, { $ne: [{ $trim: { input: { $ifNull: ["$cu.firstname", ""] } } }, ""] }] },
            { $trim: { input: "$cu.firstname" } },
            { $ifNull: ["$cp.slug", "—"] },
          ],
        },
        college_slug: { $ifNull: ["$cp.slug", ""] },
        course_name: { $ifNull: ["$course.name", ""] },
        // Has student / has college flags
        has_student: { $cond: [{ $ne: ["$app.users_id", null] }, true, false] },
        has_college: { $cond: [{ $ne: ["$app.collegeprofile_id", null] }, true, false] },
      },
    },

    // Type filter
    ...(type === "student" ? [{ $match: { has_student: true } }] : [{ $match: { has_college: true } }]),

    // Search
    ...(q ? [{
      $match: {
        $or: type === "student"
          ? [{ student_name: { $regex: q, $options: "i" } }, { student_email: { $regex: q, $options: "i" } }, { college_name: { $regex: q, $options: "i" } }]
          : [{ college_name: { $regex: q, $options: "i" } }, { course_name: { $regex: q, $options: "i" } }, { student_name: { $regex: q, $options: "i" } }],
      },
    }] : []),

    // Status filter
    ...(status !== "all" ? [{ $match: { payment_status: status } }] : []),

    { $sort: { id: -1 } },

    {
      $facet: {
        data:  [{ $skip: offset }, { $limit: PAGE_SIZE }],
        total: [{ $count: "count" }],
        stats: [{
          $group: {
            _id: null,
            total_amount:   { $sum: "$amount" },
            success_amount: { $sum: { $cond: [{ $eq: ["$payment_status", "Success"] }, "$amount", 0] } },
          },
        }],
      },
    },
  ];

  const result   = await db.collection("transaction").aggregate(basePipeline).toArray();
  const payments = (result[0]?.data ?? []).map((t: any) => ({
    id: Number(t.id ?? 0),
    name: t.name ? String(t.name) : null,
    application_id: t.application_id ? Number(t.application_id) : null,
    created_at: t.created_at ? String(t.created_at) : null,
    transactionHashKey: t.transactionHashKey ? String(t.transactionHashKey) : null,
    payment_status: String(t.payment_status ?? ""),
    amount: Number(t.amount ?? 0),
    student_name: t.student_name ? String(t.student_name) : null,
    student_email: t.student_email ? String(t.student_email) : null,
    student_phone: t.student_phone ? String(t.student_phone) : null,
    college_name: t.college_name ? String(t.college_name) : null,
    college_slug: t.college_slug ? String(t.college_slug) : null,
    course_name: t.course_name ? String(t.course_name) : null,
  }));
  const total    = Number(result[0]?.total?.[0]?.count ?? 0);
  const stats    = result[0]?.stats?.[0] ?? {};
  const totalPages = Math.ceil(total / PAGE_SIZE);

  function buildUrl(overrides: Record<string, string | number>) {
    const merged = { q, page: "1", status, type, ...Object.fromEntries(Object.entries(overrides).map(([k, v]) => [k, String(v)])) };
    const qs = Object.entries(merged).filter(([, v]) => v && v !== "all").map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
    return `/admin/payment/transactions${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="material-symbols-rounded text-emerald-600 text-[22px]" style={ICO_FILL}>receipt_long</span>
          Payment Transactions
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">All payment transactions with full details.</p>
      </div>

      {/* Type Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {[
          { key: "student", label: "Student Transactions", icon: "person" },
          { key: "college", label: "College Transactions", icon: "account_balance" },
        ].map((t) => (
          <Link key={t.key} href={buildUrl({ type: t.key, page: 1 })}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${type === t.key ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            <span className="material-symbols-rounded text-[16px]" style={type === t.key ? ICO_FILL : ICO}>{t.icon}</span>
            {t.label}
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Transactions", value: total.toLocaleString("en-IN"), icon: "receipt_long", color: "bg-indigo-50 text-indigo-600" },
          { label: "Total Amount", value: formatAmount(stats.total_amount), icon: "payments", color: "bg-emerald-50 text-emerald-600" },
          { label: "Success Amount", value: formatAmount(stats.success_amount), icon: "check_circle", color: "bg-blue-50 text-blue-600" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
            <div className={`${s.color} p-2.5 rounded-xl flex-shrink-0`}>
              <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>{s.icon}</span>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{s.value}</p>
              <p className="text-xs font-semibold text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-center">
        <form method="GET" action="/admin/payment/transactions" className="flex-1 w-full">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400" style={ICO}>search</span>
            <input name="q" defaultValue={q}
              placeholder={type === "student" ? "Search student name, email, college..." : "Search college, course, student..."}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
            />
            <input type="hidden" name="type" value={type} />
            {status !== "all" && <input type="hidden" name="status" value={status} />}
          </div>
        </form>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl flex-shrink-0">
          {["all", "Success", "Pending", "Failed"].map((s) => (
            <Link key={s} href={buildUrl({ status: s })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${status === s ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              {s === "all" ? "All" : s}
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <TransactionListClient
          rows={payments}
          offset={offset}
          total={total}
          page={page}
          totalPages={totalPages}
          pageSize={PAGE_SIZE}
          type={type}
          onDelete={deleteTransaction}
        />
      </div>
    </div>
  );
}
