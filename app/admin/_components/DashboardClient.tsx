"use client";
// v3 - dasher design

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface Stats {
  totalStudents: number;
  totalColleges: number;
  totalAdmins: number;
  totalApplications: number;
  pendingColleges: number;
  activeBlogs: number;
}

interface GraphPoint { label: string; uv: number; }
interface Student { id: string; name: string; email: string; phone: string; status: string; created_at: string; }
interface College { id: string; name: string; email: string; status: string; created_at: string; }

export default function DashboardClient({
  stats, graphData, collegeGraphData, recentStudents, recentColleges,
}: {
  stats: Stats;
  graphData: GraphPoint[];
  collegeGraphData: GraphPoint[];
  recentStudents: Student[];
  recentColleges: College[];
}) {
  const [mounted, setMounted] = useState(false);
  const [activeChart, setActiveChart] = useState<"students" | "colleges">("students");
  useEffect(() => setMounted(true), []);

  const kpis = [
    { label: "Total Students", value: stats.totalStudents.toLocaleString(), sub: `${stats.pendingColleges} pending colleges`, icon: "school", color: "bg-amber-100 text-amber-600" },
    { label: "Total Colleges", value: stats.totalColleges.toLocaleString(), sub: `${stats.pendingColleges} awaiting approval`, icon: "account_balance", color: "bg-emerald-100 text-emerald-600" },
    { label: "Applications", value: stats.totalApplications.toLocaleString(), sub: "total submitted", icon: "description", color: "bg-blue-100 text-blue-600" },
    { label: "Active Blogs", value: stats.activeBlogs.toLocaleString(), sub: `${stats.totalAdmins} admin users`, icon: "article", color: "bg-purple-100 text-purple-600" },
  ];

  const statusMeta: Record<string, { cls: string; label: string }> = {
    pending:  { cls: "bg-amber-100 text-amber-700",   label: "Pending"  },
    approved: { cls: "bg-emerald-100 text-emerald-700", label: "Approved" },
    rejected: { cls: "bg-red-100 text-red-700",        label: "Rejected" },
    active:   { cls: "bg-emerald-100 text-emerald-700", label: "Active"   },
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-full">

      {/* ── Welcome Banner ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl p-8 flex flex-col justify-between min-h-[140px]"
          style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 60%, #1e1b4b 100%)" }}>
          <div>
            <h1 className="text-2xl font-black text-white">👋 Welcome back, Admin!</h1>
            <p className="text-slate-400 mt-1 text-sm">Here's what's happening with AdmissionX today.</p>
          </div>
          <div className="flex items-center gap-3 mt-6">
            <Link href="/admin/colleges/profile"
              className="px-5 py-2 bg-white text-slate-900 text-sm font-bold rounded-xl hover:bg-slate-100 transition-colors">
              Manage Colleges
            </Link>
            <Link href="/admin/students/profile"
              className="px-5 py-2 bg-white/10 text-white text-sm font-bold rounded-xl hover:bg-white/20 transition-colors border border-white/20">
              View Students
            </Link>
          </div>
        </div>

        {/* Quick stats */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
          <h2 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-4">Quick Overview</h2>
          <div className="space-y-3">
            {[
              { label: "Pending Approvals", value: stats.pendingColleges, href: "/admin/members/registrations", color: "text-amber-600" },
              { label: "Active Blogs", value: stats.activeBlogs, href: "/admin/blogs", color: "text-blue-600" },
              { label: "Admin Users", value: stats.totalAdmins, href: "/admin/members/users", color: "text-purple-600" },
            ].map((item) => (
              <Link key={item.label} href={item.href}
                className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors">
                <span className="text-sm text-slate-600 font-medium">{item.label}</span>
                <span className={`text-sm font-black ${item.color}`}>{item.value}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpis.map((k, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${k.color}`}>
                <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>{k.icon}</span>
              </div>
              <span className="text-sm font-semibold text-slate-600">{k.label}</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-slate-900">{k.value}</span>
              <span className="text-xs text-slate-400 text-right leading-tight">{k.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Area / Bar chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          {/* Tab switcher */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-slate-800">Registrations</h2>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {(["students", "colleges"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveChart(tab)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                    activeChart === tab ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Chart total */}
          <div className="mb-6">
            <p className="text-3xl font-black text-slate-900">
              {activeChart === "students"
                ? stats.totalStudents.toLocaleString()
                : stats.totalColleges.toLocaleString()}
            </p>
            <p className="text-sm text-slate-400 mt-0.5">
              Total {activeChart} registered
            </p>
          </div>

          <div className="h-[260px]">
            {mounted ? (
              activeChart === "students" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={graphData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="gradStudent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF3C3C" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#FF3C3C" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10 }} allowDecimals={false} />
                    <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
                      <div className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xl">
                        {label}: {payload[0].value} students
                      </div>
                    ) : null} />
                    <Area type="monotone" dataKey="uv" stroke="#FF3C3C" strokeWidth={2} fill="url(#gradStudent)"
                      dot={false} activeDot={{ r: 4, fill: "#FF3C3C", stroke: "#fff", strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={collegeGraphData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10 }} allowDecimals={false} />
                    <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
                      <div className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xl">
                        {label}: {payload[0].value} colleges
                      </div>
                    ) : null} />
                    <Bar dataKey="uv" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              )
            ) : <div className="h-full bg-slate-50 animate-pulse rounded-xl" />}
          </div>
        </div>

        {/* Recent Colleges */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-black text-slate-800">New Colleges</h2>
            <Link href="/admin/members/registrations" className="text-xs font-bold text-[#FF3C3C] hover:underline">View all</Link>
          </div>
          <div className="space-y-4">
            {recentColleges.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No colleges yet</p>
            ) : recentColleges.map((c) => {
              const sm = statusMeta[c.status] ?? statusMeta["pending"];
              return (
                <div key={c.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-sm flex-shrink-0">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{c.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{c.email}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${sm.cls}`}>{sm.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Recent Students Table ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-black text-slate-800">Recent Students</h2>
          <Link href="/admin/students/profile" className="text-xs font-bold text-[#FF3C3C] hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Student", "Email", "Phone", "Status", "Registered", "Action"].map((h) => (
                  <th key={h} className="px-6 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentStudents.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-sm">No students yet</td></tr>
              ) : recentStudents.map((s) => {
                const sm = statusMeta[s.status.toLowerCase()] ?? statusMeta["pending"];
                return (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#FF3C3C]/10 flex items-center justify-center text-[#FF3C3C] font-black text-xs flex-shrink-0">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-slate-800">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-500">{s.email}</td>
                    <td className="px-6 py-3 text-sm text-slate-500">{s.phone || "—"}</td>
                    <td className="px-6 py-3">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${sm.cls}`}>{sm.label}</span>
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-400">{s.created_at}</td>
                    <td className="px-6 py-3">
                      <Link href={`/admin/students/${s.id}`}
                        className="text-xs font-bold px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:border-[#FF3C3C] hover:text-[#FF3C3C] transition-colors">
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
