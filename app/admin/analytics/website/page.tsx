import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
    console.error("[admin/analytics/website safeQuery]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface MetricRow extends RowDataPacket {
  id: number;
  label: string;
  value: string;
  icon: string;
  color: string;
  is_active: number;
  updated_at: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function WebsiteMetricsPage() {
  const metrics = await safeQuery<MetricRow>("SELECT * FROM homepage_stats WHERE is_active = 1 ORDER BY id ASC");

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-emerald-600 text-[22px]" style={ICO_FILL}>monitoring</span>
            Website Metrics
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Key performance indicators displayed on the homepage.</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m) => (
          <div key={m.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 group-hover:opacity-10 transition-opacity`} style={{ backgroundColor: m.color || '#10b981' }}></div>
            <div className="flex flex-col gap-4 relative">
              <div className="p-3 rounded-2xl w-fit" style={{ backgroundColor: `${m.color}15` || '#10b98115', color: m.color || '#10b981' }}>
                <span className="material-symbols-rounded text-2xl" style={ICO_FILL}>{m.icon || 'star'}</span>
              </div>
              <div>
                <p className="text-3xl font-black text-slate-800 tracking-tight">{m.value}</p>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">{m.label}</p>
              </div>
              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400">Last updated: {new Date(m.updated_at).toLocaleDateString()}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Version for detailed editing (Optional) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-8">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-rounded text-lg">list</span> 
            All Metrics
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3 w-10">ID</th>
                <th className="px-4 py-3">Label</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Icon</th>
                <th className="px-4 py-3">Color</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-600">
              {metrics.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 text-xs font-mono text-slate-400">#{m.id}</td>
                  <td className="px-4 py-4 font-bold text-slate-800">{m.label}</td>
                  <td className="px-4 py-4 font-black text-emerald-600 font-mono">{m.value}</td>
                  <td className="px-4 py-4 italic text-slate-400 flex items-center gap-2">
                    <span className="material-symbols-rounded text-base" style={ICO}>{m.icon}</span>
                    {m.icon}
                  </td>
                  <td className="px-4 py-4 font-mono text-xs uppercase tracking-widest" style={{ color: m.color }}>{m.color}</td>
                  <td className="px-4 py-4 text-right">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">ACTIVE</span>
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
