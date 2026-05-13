import { getCollegeDb } from "@/lib/db";
import Link from "next/link";
import CollegePaymentListClient from "./CollegePaymentListClient";

const PAGE_SIZE = 50;
const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default async function CollegePaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const status = sp.status ?? "all";
  const offset = (page - 1) * PAGE_SIZE;

  const db = await getCollegeDb();

  const filter: any = {};
  if (status !== "all") {
    filter.payment_status = status;
  }

  if (q) {
    filter.$or = [
      { college_name: { $regex: q, $options: "i" } },
      { transaction_id: { $regex: q, $options: "i" } },
      { service_type: { $regex: q, $options: "i" } },
    ];
  }

  const [payments, total, stats] = await Promise.all([
    db.collection("college_payments")
      .find(filter)
      .sort({ created_at: -1 })
      .skip(offset)
      .limit(PAGE_SIZE)
      .toArray(),
    db.collection("college_payments").countDocuments(filter),
    db.collection("college_payments").aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total_amount: { $sum: { $ifNull: ["$amount", 0] } },
          paid_count: { $sum: { $cond: [{ $eq: ["$payment_status", "paid"] }, 1, 0] } },
          pending_count: { $sum: { $cond: [{ $eq: ["$payment_status", "pending"] }, 1, 0] } },
        },
      },
    ]).toArray(),
  ]);

  const paymentList = payments.map((p: any) => ({
    _id: p._id.toString(),
    college_name: p.college_name || "—",
    transaction_id: p.transaction_id || "—",
    service_type: p.service_type || "—",
    amount: p.amount || 0,
    payment_status: p.payment_status || "pending",
    created_at: p.created_at,
  }));

  const statsData = stats[0] || { total_amount: 0, paid_count: 0, pending_count: 0 };
  const totalPages = Math.ceil(total / PAGE_SIZE);

  function buildUrl(overrides: Record<string, string | number>) {
    const merged = { q, page: "1", status, ...Object.fromEntries(Object.entries(overrides).map(([k, v]) => [k, String(v)])) };
    const qs = Object.entries(merged).filter(([, v]) => v && v !== "all").map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
    return `/admin/payment/college${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>account_balance</span>
          College Payments
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Colleges paying AdmissionX for services and courses</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Payments", value: total.toLocaleString("en-IN"), icon: "receipt_long", color: "bg-indigo-50 text-indigo-600" },
          { label: "Total Amount", value: `₹${statsData.total_amount.toLocaleString("en-IN")}`, icon: "payments", color: "bg-blue-50 text-blue-600" },
          { label: "Paid", value: statsData.paid_count.toLocaleString("en-IN"), icon: "check_circle", color: "bg-green-50 text-green-600" },
          { label: "Pending", value: statsData.pending_count.toLocaleString("en-IN"), icon: "pending", color: "bg-amber-50 text-amber-600" },
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

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-center">
        <form method="GET" action="/admin/payment/college" className="flex-1 w-full">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400" style={ICO}>search</span>
            <input name="q" defaultValue={q} placeholder="Search by college name, transaction ID, service type..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
            />
            {status !== "all" && <input type="hidden" name="status" value={status} />}
          </div>
        </form>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl flex-shrink-0">
          {["all", "paid", "pending"].map((s) => (
            <Link key={s} href={buildUrl({ status: s })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${status === s ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <CollegePaymentListClient
          payments={paymentList}
          offset={offset}
          total={total}
          page={page}
          totalPages={totalPages}
          pageSize={PAGE_SIZE}
        />
      </div>
    </div>
  );
}
