import pool from "@/lib/db";
import Link from "next/link";
// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;
const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

async function safeQuery<T >(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/analytics/transactions safeQuery]", err);
    return [];
  }
}

function formatCurrency(amount: number | string): string {
  const val = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(val || 0);
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

interface TransactionRow  {
  id: number;
  amount: number;
  status_name: string;
  transactionHashKey: string;
  application_id: number;
  created_at: string;
}

interface CountRow  { total: number; }

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function TransactionsAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp     = await searchParams;
  const q      = (sp.q ?? "").trim();
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const status = sp.status ?? "all";
  const offset = (page - 1) * PAGE_SIZE;

  // ── WHERE ──────────────────────────────────────────────────────────────────
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (q) {
    conditions.push("(t.transactionHashKey LIKE ? OR t.id LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }
  if (status !== "all") {
    conditions.push("ps.name = ?");
    params.push(status);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  // ── Queries ────────────────────────────────────────────────────────────────
  const [transactions, countRows, statsRows] = await Promise.all([
    safeQuery<TransactionRow>(
      `SELECT t.*, ps.name as status_name, CAST(COALESCE(a.byafees, '0') AS DECIMAL(10,2)) as amount
       FROM transaction t
       LEFT JOIN paymentstatus ps ON t.paymentstatus_id = ps.id
       LEFT JOIN application a ON a.id = t.application_id
       ${where} 
       ORDER BY t.created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total 
       FROM transaction t
       LEFT JOIN paymentstatus ps ON t.paymentstatus_id = ps.id
       LEFT JOIN application a ON a.id = t.application_id
       ${where}`,
      params,
    ),
    safeQuery<any>(`
      SELECT 
        COUNT(*) AS total_count,
        SUM(CAST(COALESCE(a.byafees, '0') AS DECIMAL(10,2))) AS total_volume,
        SUM(CASE WHEN ps.name = 'Success' THEN CAST(COALESCE(a.byafees, '0') AS DECIMAL(10,2)) ELSE 0 END) AS success_volume
      FROM transaction t
      LEFT JOIN paymentstatus ps ON t.paymentstatus_id = ps.id
      LEFT JOIN application a ON a.id = t.application_id
    `),
  ]);

  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const stats      = statsRows[0];

  function buildUrl(overrides: Record<string, string | number>) {
    const merged = { q, page: "1", status, ...overrides };
    const qs = Object.entries(merged)
      .filter(([, v]) => v !== "" && v !== "1" && v !== "all")
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    return `/admin/analytics/transactions${qs ? `?${qs}` : ""}`;
  }

  const STAT_CARDS = [
    { label: "Total Transactions", value: stats?.total_count ?? 0, icon: "receipt_long", accent: "bg-indigo-50 text-indigo-600" },
    { label: "Total Volume", value: formatCurrency(stats?.total_volume ?? 0), icon: "payments", accent: "bg-emerald-50 text-emerald-600" },
    { label: "Success Volume", value: formatCurrency(stats?.success_volume ?? 0), icon: "check_circle", accent: "bg-blue-50 text-blue-600" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-indigo-600 text-[22px]" style={ICO_FILL}>account_balance_wallet</span>
            Transaction Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Overview of platform financial transactions and payment statuses.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STAT_CARDS.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`${card.accent} p-2.5 rounded-xl flex-shrink-0`}>
              <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>{card.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 leading-tight">{card.value}</p>
              <p className="text-xs font-semibold text-slate-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-center">
        <form method="GET" action="/admin/analytics/transactions" className="flex-1 w-full">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400" style={ICO}>search</span>
            <input 
              name="q" defaultValue={q} placeholder="Search by ID or Transaction Key..." 
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition"
            />
          </div>
        </form>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {["all", "Success", "Pending", "Failed"].map((s) => (
            <Link 
              key={s} href={buildUrl({ status: s })} 
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${status === s ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              {s}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {transactions.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <span className="material-symbols-rounded text-6xl block mb-4" style={ICO}>receipt_long</span>
            <p className="text-sm font-semibold">No transactions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3 w-10">#</th>
                  <th className="px-4 py-3">Transaction ID / Key</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3 text-right">App ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-600">
                {transactions.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 text-xs font-mono text-slate-400">{offset + idx + 1}</td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-800">#{t.id}</p>
                      <p className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]" title={t.transactionHashKey}>
                        {t.transactionHashKey || "N/A"}
                      </p>
                    </td>
                    <td className="px-4 py-4 font-bold text-slate-700">{formatCurrency(t.amount)}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        t.status_name === 'Success' ? 'bg-emerald-100 text-emerald-700' :
                        t.status_name === 'Pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {t.status_name || "Unknown"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs">{formatDate(t.created_at)}</td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-[10px] font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-400">
                        APP#{t.application_id}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <p className="text-xs text-slate-500">Showing <strong>{offset + 1}-{Math.min(offset + PAGE_SIZE, total)}</strong> of <strong>{total}</strong></p>
            <div className="flex gap-1">
              {page > 1 && <Link href={buildUrl({ page: page - 1 })} className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Prev</Link>}
              {page < totalPages && <Link href={buildUrl({ page: page + 1 })} className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Next</Link>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}




