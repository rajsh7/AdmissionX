"use client";

import { useState, useEffect, useCallback } from "react";

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const COLORS = ["#3b82f6","#10b981","#f59e0b","#8b5cf6","#ef4444","#06b6d4","#ec4899"];

interface AnalyticsData {
  timestamp: string;
  students:  { total: number; active: number; today: number; week: number; month: number };
  colleges:  { total: number; today: number };
  applications: { total: number };
  pageViews: { today: number; week: number; month: number; total: number; uniqueToday: number; uniqueWeek: number };
  topPages:  { path: string; views: number }[];
  devices:   { device: string; count: number; pct: number }[];
  browsers:  { browser: string; count: number; pct: number }[];
  chartData: { date: string; label: string; students: number; colleges: number; views: number }[];
}

function StatCard({ label, value, sub, icon, color, pulse }: {
  label: string; value: number | string; sub?: string; icon: string; color: string; pulse?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${color}18` }}>
          <span className="material-symbols-rounded text-[20px]" style={{ ...ICO_FILL, color }}>{icon}</span>
        </div>
        {pulse && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />LIVE
          </span>
        )}
      </div>
      <div>
        <p className="text-[26px] font-black text-slate-800 leading-none">{typeof value === "number" ? value.toLocaleString() : value}</p>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">{label}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function BarChart({ data }: { data: AnalyticsData["chartData"] }) {
  const maxVal = Math.max(...data.map(d => Math.max(d.students, d.colleges, d.views)), 1);
  return (
    <div className="flex items-end gap-1 h-44 w-full">
      {data.map((d) => (
        <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5 group relative">
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-semibold px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
            {d.label} — {d.views}v / {d.students}s / {d.colleges}c
          </div>
          <div className="w-full flex gap-px items-end" style={{ height: "100%" }}>
            <div className="flex-1 rounded-t-sm bg-slate-200 transition-all duration-500" style={{ height: `${(d.views / maxVal) * 100}%`, minHeight: d.views > 0 ? "3px" : "0" }} />
            <div className="flex-1 rounded-t-sm bg-blue-400 transition-all duration-500" style={{ height: `${(d.students / maxVal) * 100}%`, minHeight: d.students > 0 ? "3px" : "0" }} />
            <div className="flex-1 rounded-t-sm bg-emerald-400 transition-all duration-500" style={{ height: `${(d.colleges / maxVal) * 100}%`, minHeight: d.colleges > 0 ? "3px" : "0" }} />
          </div>
          <span className="text-[8px] text-slate-400 font-medium">{d.label.split(" ")[0]}</span>
        </div>
      ))}
    </div>
  );
}

function PctBar({ label, pct, color, count }: { label: string; pct: number; color: string; count: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[12px] font-semibold">
        <span className="text-slate-600 capitalize">{label}</span>
        <span className="text-slate-400">{count.toLocaleString()} ({pct}%)</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function WebsiteMetricsPage() {
  const [data, setData]           = useState<AnalyticsData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(30);

  const fetchData = useCallback(async () => {
    try {
      const res  = await fetch("/api/admin/analytics/realtime");
      const json = await res.json();
      setData(json);
      setLastRefresh(new Date());
      setCountdown(30);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 30000);
    return () => clearInterval(iv);
  }, [fetchData]);

  useEffect(() => {
    const t = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 30), 1000);
    return () => clearInterval(t);
  }, []);

  if (loading) return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-slate-200 rounded" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-100 rounded-2xl" />)}
      </div>
      <div className="h-64 bg-slate-100 rounded-2xl" />
    </div>
  );

  const s  = data?.students;
  const c  = data?.colleges;
  const pv = data?.pageViews;

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-emerald-600 text-[22px]" style={ICO_FILL}>monitoring</span>
            Real-Time Platform Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Tracks all visitors — registered and anonymous</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl">
            Refresh in <span className="text-slate-700 font-black">{countdown}s</span>
          </span>
          <button onClick={fetchData} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-[12px] font-bold rounded-xl hover:bg-emerald-700 transition-colors">
            <span className="material-symbols-rounded text-[16px]">refresh</span>Refresh Now
          </button>
        </div>
      </div>

      {lastRefresh && (
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
          Last updated: {lastRefresh.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </div>
      )}

      {/* Visitor KPIs */}
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Visitor Traffic</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard label="Page Views Today"     value={pv?.today ?? 0}       icon="visibility"     color="#6366f1" pulse />
          <StatCard label="Page Views This Week" value={pv?.week ?? 0}        icon="bar_chart"      color="#8b5cf6" />
          <StatCard label="Unique Visitors Today" value={pv?.uniqueToday ?? 0} icon="person_outline" color="#ec4899" pulse />
          <StatCard label="Unique Visitors Week"  value={pv?.uniqueWeek ?? 0}  icon="groups"         color="#f59e0b" />
        </div>
      </div>

      {/* Platform KPIs */}
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Platform Registrations</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard label="Total Students"     value={s?.total ?? 0} sub={`${s?.active ?? 0} verified`} icon="school"          color="#3b82f6" />
          <StatCard label="Students Today"     value={s?.today ?? 0} sub={`+${s?.week ?? 0} this week`} icon="person_add"      color="#10b981" pulse />
          <StatCard label="Total Colleges"     value={c?.total ?? 0} sub={`+${c?.today ?? 0} today`}    icon="account_balance" color="#8b5cf6" />
          <StatCard label="Total Applications" value={data?.applications.total ?? 0}                    icon="description"     color="#f59e0b" />
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-bold text-slate-700">Traffic &amp; Signups — Last 14 Days</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Hover over bars for details</p>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-slate-200 inline-block" />Page Views</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-blue-400 inline-block" />Students</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-emerald-400 inline-block" />Colleges</span>
          </div>
        </div>
        {data?.chartData?.length ? (
          <BarChart data={data.chartData} />
        ) : (
          <div className="h-44 flex items-center justify-center text-slate-400 text-sm">No data yet — visit some pages first</div>
        )}
      </div>

      {/* Top Pages + Devices + Browsers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Top Pages (This Week)</h3>
          {data?.topPages?.length ? (
            <div className="space-y-2">
              {data.topPages.map((p, i) => (
                <div key={p.path} className="flex items-center gap-3">
                  <span className="text-[11px] font-black text-slate-300 w-4">{i + 1}</span>
                  <span className="flex-1 text-[12px] text-slate-600 truncate font-medium">{p.path}</span>
                  <span className="text-[11px] font-bold text-slate-400 shrink-0">{p.views.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-[12px] text-slate-400">No page view data yet</p>}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Devices (This Month)</h3>
          {data?.devices?.length ? (
            <div className="space-y-3">
              {data.devices.map((d, i) => (
                <PctBar key={d.device} label={d.device} pct={d.pct} count={d.count} color={COLORS[i % COLORS.length]} />
              ))}
            </div>
          ) : <p className="text-[12px] text-slate-400">No device data yet</p>}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Browsers (This Month)</h3>
          {data?.browsers?.length ? (
            <div className="space-y-3">
              {data.browsers.map((b, i) => (
                <PctBar key={b.browser} label={b.browser} pct={b.pct} count={b.count} color={COLORS[i % COLORS.length]} />
              ))}
            </div>
          ) : <p className="text-[12px] text-slate-400">No browser data yet</p>}
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-700">Registration Summary</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="px-5 py-3 text-left">Metric</th>
              <th className="px-5 py-3 text-right">Total</th>
              <th className="px-5 py-3 text-right">Today</th>
              <th className="px-5 py-3 text-right">This Week</th>
              <th className="px-5 py-3 text-right">This Month</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {[
              { label: "Page Views",      icon: "visibility",     color: "#6366f1", total: pv?.month,      today: pv?.today,      week: pv?.week,      month: pv?.month },
              { label: "Unique Visitors", icon: "person_outline", color: "#ec4899", total: pv?.uniqueWeek, today: pv?.uniqueToday, week: pv?.uniqueWeek, month: null },
              { label: "Students",        icon: "school",         color: "#3b82f6", total: s?.total,       today: s?.today,       week: s?.week,       month: s?.month },
              { label: "Colleges",        icon: "account_balance",color: "#8b5cf6", total: c?.total,       today: c?.today,       week: null,          month: null },
            ].map(row => (
              <tr key={row.label} className="hover:bg-slate-50/50">
                <td className="px-5 py-3.5 font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-rounded text-[16px]" style={{ ...ICO_FILL, color: row.color }}>{row.icon}</span>
                    {row.label}
                  </div>
                </td>
                <td className="px-5 py-3.5 text-right font-black text-slate-800">{row.total?.toLocaleString() ?? "—"}</td>
                <td className="px-5 py-3.5 text-right font-semibold text-emerald-600">{row.today != null ? `+${row.today}` : "—"}</td>
                <td className="px-5 py-3.5 text-right font-semibold text-blue-600">{row.week != null ? `+${row.week}` : "—"}</td>
                <td className="px-5 py-3.5 text-right font-semibold text-slate-500">{row.month != null ? `+${row.month}` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
