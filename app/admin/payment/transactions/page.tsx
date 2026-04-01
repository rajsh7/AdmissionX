import pool from "@/lib/db";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { revalidatePath } from "next/cache";

async function deleteTransaction(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM transaction WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/payment/transactions deleteAction]", e);
  }
  revalidatePath("/admin/payment/transactions");
  revalidatePath("/", "layout");
}

async function safeQuery<T >(
  sql: string,
  params: (string | number | boolean)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/payment/transactions safeQuery]", err);
    return [];
  }
}

interface TransactionRow  {
  id: number;
  name: string | null;
  paymentStatus: string | null;
  cardType: string | null;
  application_id: number | null;
  transactionHashKey: string | null;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default async function ApplicationTransactionPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();

  const where = q ? "WHERE t.name LIKE ? OR t.transactionHashKey LIKE ?" : "";
  const params = q ? [`%${q}%`, `%${q}%`] : [];

  const data = await safeQuery<TransactionRow>(
    `SELECT t.id, t.name, ps.name as paymentStatus, ct.name as cardType, t.application_id, t.transactionHashKey
     FROM transaction t
     LEFT JOIN paymentstatus ps ON ps.id = t.paymentstatus_id
     LEFT JOIN cardtype ct ON ct.id = t.cardtype_id
     ${where}
     ORDER BY t.id DESC
     LIMIT 100`,
    params
  );

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-emerald-600 text-[22px]" style={ICO_FILL}>receipt_long</span>
            Application Transactions
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Monitor and manage all application-related payment transactions.</p>
        </div>
        <form method="GET" className="relative max-w-sm w-full">
           <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[20px]" style={ICO}>search</span>
           <input 
             name="q" 
             defaultValue={q}
             placeholder="Search transactions or keys..." 
             className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
           />
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Transaction Name</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hash Key</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Payment Info</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-slate-400">
                     No transactions found.
                  </td>
                </tr>
              ) : (
                data.map((r) => (
                  <tr key={r.id} className="hover:bg-emerald-50/20 transition-colors group">
                    <td className="px-5 py-4">
                       <p className="font-bold text-slate-800">{r.name || "N/A"}</p>
                       <p className="text-[10px] text-slate-400">App ID: {r.application_id || "—"}</p>
                    </td>
                    <td className="px-4 py-4">
                       <code className="text-[10px] bg-slate-50 px-1.5 py-0.5 rounded text-slate-600 font-mono break-all">
                         {r.transactionHashKey || "—"}
                       </code>
                    </td>
                    <td className="px-4 py-4">
                       <div className="flex flex-col gap-1">
                         <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
                           {r.paymentStatus || "Unknown"}
                         </span>
                         <span className="text-[10px] text-slate-500 font-medium">
                           {r.cardType || "Standard"}
                         </span>
                       </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                       <DeleteButton action={deleteTransaction.bind(null, r.id)} size="sm" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}




