"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Users, Building2, UserCog, FileText } from "lucide-react";

interface Stats {
  totalStudents: number;
  totalColleges: number;
  totalAdmins: number;
  activeQueries: number;
  pendingColleges?: number;
  activeBlogs?: number;
}

interface GraphPoint { name: string; uv: number; }
interface Student { id: string; name: string; course: string; college: string; status: string; }
interface Activity { id: string; type: string; message: string; time: string; }

export default function DashboardClient({
  stats,
  graphData,
  recentStudents,
  recentActivity,
}: {
  stats: Stats;
  graphData: GraphPoint[];
  recentStudents: Student[];
  recentActivity: Activity[];
}) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents?.toLocaleString() || "0",
      subtext: "registered students",
      icon: Users,
    },
    {
      title: "Total Colleges",
      value: stats.totalColleges?.toLocaleString() || "0",
      subtext: `${stats.pendingColleges ?? 0} pending approval`,
      icon: Building2,
    },
    {
      title: "Admin Users",
      value: stats.totalAdmins?.toLocaleString() || "0",
      subtext: "active admins",
      icon: UserCog,
    },
    {
      title: "Applications",
      value: stats.activeQueries?.toLocaleString() || "0",
      subtext: `${stats.activeBlogs ?? 0} active blogs`,
      icon: FileText,
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className="bg-[#FF3C3C] p-2 rounded-lg text-white shadow-lg shadow-red-200">
                <stat.icon className="w-5 h-5" strokeWidth={2.5} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-[13px] text-slate-400 font-medium">{stat.subtext}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-[20px] font-bold text-slate-800 mb-8">
          Student Registrations — Last 12 Months
        </h2>
        <div className="h-[320px] w-full">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={graphData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF3C3C" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#FF3C3C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 500 }}
                  dy={12}
                  interval="preserveStartEnd"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 500 }}
                  dx={-10}
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#332222] text-white px-3 py-1.5 rounded shadow-xl text-[12px] font-bold">
                          {label}: {Number(payload[0].value).toLocaleString()} students
                        </div>
                      );
                    }
                    return null;
                  }}
                  cursor={{ stroke: "#FF3C3C", strokeWidth: 1, strokeDasharray: "3 3" }}
                />
                <Area
                  type="monotone"
                  dataKey="uv"
                  stroke="#FF3C3C"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#FF3C3C", strokeWidth: 0 }}
                  fillOpacity={1}
                  fill="url(#colorUv)"
                  activeDot={{ r: 5, fill: "#FF3C3C", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full bg-slate-50 animate-pulse rounded-xl" />
          )}
        </div>
      </div>

      {/* Bottom Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Students */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm lg:col-span-2 overflow-hidden flex flex-col p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-[18px] font-bold text-slate-800">Recent Students</h2>
            <a href="/admin/students/profile" className="text-[13px] font-bold text-[#FF3C3C] hover:underline">
              View All
            </a>
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500">
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">Email / Course</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-slate-700">{s.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">{s.course}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        s.status === "Active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentStudents.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-400 text-sm">
                      No recent students registered.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col p-6">
          <h2 className="text-[18px] font-bold text-slate-800 mb-6">Recent Activity</h2>
          <div className="space-y-5">
            {recentActivity.map((a) => (
              <div key={a.id} className="flex gap-3 items-start">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  a.type === "college" ? "bg-blue-100 text-blue-600" : "bg-red-100 text-[#FF3C3C]"
                }`}>
                  <span className="material-symbols-rounded text-[18px]">
                    {a.type === "college" ? "account_balance" : "person"}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-slate-700 leading-snug">{a.message}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <p className="text-center text-slate-400 text-sm py-4">No recent activity.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
