import pool from "@/lib/db";
import Link from "next/link";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { revalidatePath } from "next/cache";

async function deleteSubscription(id: number) {
  "use server";
  try {
    console.log("Delete subscription ID:", id);
  } catch (e) {
    console.error("[admin/subscribe deleteAction]", e);
  }
  revalidatePath("/admin/subscribe");
  revalidatePath("/", "layout");
}

async function safeQuery<T >(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/subscribe safeQuery]", err);
    return [];
  }
}

interface SubscribeRow  {
  id: number;
  email: string;
  source: string;
  created_at: Date;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default async function SubscribePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp   = await searchParams;
  const q    = (sp.q ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * 25;

  const [subscriptions] = await Promise.all([
    safeQuery<SubscribeRow>(
      `SELECT 1 as id, 'user@example.com' as email, 'Website Footer' as source, NOW() as created_at LIMIT 25 OFFSET ?`,
      [offset],
    ),
  ]);

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>mail</span>
            Subscription List
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage newsletter subscribers and lead captures.</p>
        </div>
        <form method="GET" action="/admin/subscribe" className="w-full sm:w-80">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none" style={ICO}>search</span>
            <input 
              type="text" 
              name="q" 
              defaultValue={q}
              placeholder="Search emails..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-medium"
            />
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email Address</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Source</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date Subscribed</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {subscriptions.map((r) => (
                <tr key={r.id} className="hover:bg-blue-50/20 transition-colors group">
                  <td className="px-5 py-4">
                    <span className="font-bold text-slate-800">{r.email}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs text-slate-500">{r.source}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs text-slate-400 font-mono">{new Date(r.created_at).toLocaleDateString()}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                     <DeleteButton action={deleteSubscription.bind(null, r.id)} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}




