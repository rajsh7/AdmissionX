"use client";
// v2 - lucide removed

import Link from "next/link";
import { useMemo, useState, useEffect, useRef } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import dynamic from "next/dynamic";
import {
  Users,
  Building2,
  UserCog,
  MessageSquare,
  ChevronDown
} from "lucide-react";

// Dynamically import charts with SSR disabled to prevent 'module factory not available' errors
const StudentRegistrationChart = dynamic(
  () => import("./StudentRegistrationChart"),
  { ssr: false, loading: () => <div className="h-full w-full bg-slate-50 animate-pulse rounded-[5px]" /> }
);

const CollegeRegistrationChart = dynamic(
  () => import("./CollegeRegistrationChart"),
  { ssr: false, loading: () => <div className="h-full w-full bg-slate-50 animate-pulse rounded-[5px]" /> }
);

const TransactionsPieChart = dynamic(
  () => import("./TransactionsPieChart"),
  { ssr: false, loading: () => <div className="h-full w-full bg-slate-50 animate-pulse rounded-[5px]" /> }
);

type GraphPoint = {
  key: string;
  label: string;
  year: number;
  month: number;
  uv: number;
};

type PiePoint = {
  name: string;
  value: number;
  count: number;
};

export default function DashboardClient({
  stats,
  graphData,
  collegeGraphData,
  transactionPie,
  recentStudents,
  recentActivity
}: {
  stats: any,
  graphData: GraphPoint[],
  collegeGraphData: GraphPoint[],
  transactionPie: (PiePoint & { amount?: number })[],
  recentStudents: any[],
  recentActivity: any[]
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [monthFilter, setMonthFilter] = useState<string>("All");
  const [openMenu, setOpenMenu] = useState<"student" | "college" | null>(null);
  const studentMonthRef = useRef<HTMLDivElement | null>(null);
  const collegeMonthRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {

    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!openMenu) return;
    const handleClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        studentMonthRef.current?.contains(t) ||
        collegeMonthRef.current?.contains(t)
      ) return;
      setOpenMenu(null);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openMenu]);

  const monthOptions = ["All", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthIndex = useMemo(() => {
    if (monthFilter === "All") return null;
    return monthOptions.indexOf(monthFilter);
  }, [monthFilter]);

  const filteredGraphData = useMemo(() => {
    if (!graphData?.length) return [];
    if (monthIndex == null || monthIndex < 1) return graphData;
    return graphData.filter((d) => d.month === monthIndex);
  }, [graphData, monthIndex]);

  const filteredCollegeGraphData = useMemo(() => {
    if (!collegeGraphData?.length) return [];
    if (monthIndex == null || monthIndex < 1) return collegeGraphData;
    return collegeGraphData.filter((d) => d.month === monthIndex);
  }, [collegeGraphData, monthIndex]);

  const keyMap = useMemo(() => {
    const map = new Map<string, GraphPoint>();
    filteredGraphData.forEach((d) => map.set(d.key, d));
    return map;
  }, [filteredGraphData]);

  const collegeKeyMap = useMemo(() => {
    const map = new Map<string, GraphPoint>();
    filteredCollegeGraphData.forEach((d) => map.set(d.key, d));
    return map;
  }, [filteredCollegeGraphData]);

  const firstKeyByYear = useMemo(() => {
    const map = new Map<number, string>();
    filteredGraphData.forEach((d) => {
      if (!map.has(d.year)) map.set(d.year, d.key);
    });
    return map;
  }, [filteredGraphData]);

  const collegeFirstKeyByYear = useMemo(() => {
    const map = new Map<number, string>();
    filteredCollegeGraphData.forEach((d) => {
      if (!map.has(d.year)) map.set(d.year, d.key);
    });
    return map;
  }, [filteredCollegeGraphData]);

  const yearTicks = useMemo(() => {
    return Array.from(firstKeyByYear.entries())
      .sort(([a], [b]) => a - b)
      .map(([, key]) => key);
  }, [firstKeyByYear]);

  const collegeYearTicks = useMemo(() => {
    return Array.from(collegeFirstKeyByYear.entries())
      .sort(([a], [b]) => a - b)
      .map(([, key]) => key);
  }, [collegeFirstKeyByYear]);

  const pieColors = ["#10B981", "#F59E0B", "#EF4444", "#6366F1", "#0EA5E9", "#14B8A6"];
  const fmtCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount || 0);

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents?.toLocaleString() || "0",
      subtext: `${stats.pendingColleges ?? 0} pending approval`,
      icon: "group",
    },
    {
      title: "Total Colleges",
      value: stats.totalColleges?.toLocaleString() || "0",
      subtext: `${stats.pendingColleges ?? 0} pending approval`,
      icon: "account_balance",
    },
    {
      title: "Admin Users",
      value: stats.totalAdmins?.toLocaleString() || "0",
      subtext: "active admins",
      icon: "manage_accounts",
    },
    {
      title: "Applications",
      value: stats.activeQueries?.toLocaleString() || "0",
      subtext: `${stats.activeBlogs ?? 0} active blogs`,
      icon: "description",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Registration */}
        <div className="bg-white rounded-[5px] border border-slate-100 shadow-md p-6 relative min-h-[520px]">
          <div className="flex justify-between items-center mb-10 overflow-visible">
            <h2 className="text-[25px] font-semibold text-slate-800">Student Registration</h2>
            <div className="relative" ref={studentMonthRef}>
              <button
                type="button"
                onClick={() => setOpenMenu((v) => (v === "student" ? null : "student"))}
                className="text-[13px] font-semibold text-slate-500 flex items-center gap-2 border border-slate-100 px-4 py-1.5 rounded-md hover:bg-slate-50 transition-all"
                aria-haspopup="listbox"
                aria-expanded={openMenu === "student"}
              >
                {monthFilter}
                <span className="material-symbols-rounded text-[16px] text-slate-400">expand_more</span>
              </button>
              {openMenu === "student" && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-100 rounded-md shadow-lg z-20">
                  <ul className="py-1 max-h-80 overflow-auto" role="listbox">
                    {monthOptions.map((m) => (
                      <li key={m}>
                        <button
                          type="button"
                          onClick={() => {
                            setMonthFilter(m);
                            setOpenMenu(null);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs font-semibold transition-colors ${monthFilter === m ? "bg-slate-100 text-slate-700" : "text-slate-500 hover:bg-slate-50"}`}
                        >
                          {m}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-[5px] p-6 border border-slate-100 shadow-md relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className="bg-[#FF3C3C] p-2 rounded-lg text-white">
                <span className="material-symbols-rounded text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
              </div>
            </div>
            
            <div className="mt-4">
              <span className="text-[13px] text-slate-400 font-medium">{stat.subtext}</span>
            </div>
          </div>

          <div className="h-[380px] w-full px-4 overflow-hidden">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredGraphData} margin={{ top: 20, right: 30, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF3C3C" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#FF3C3C" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="key"
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }} 
                    dy={15}
                    interval={0}
                    ticks={monthFilter === "All" ? yearTicks : undefined}
                    tickFormatter={(value: string) => {
                      const item = keyMap.get(value);
                      if (!item) return "";
                      if (monthFilter === "All") {
                        return firstKeyByYear.get(item.year) === value ? String(item.year) : "";
                      }
                      return String(item.year);
                    }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }}
                    dx={-10}
                    domain={[0, 10000]}
                    ticks={[2000, 4000, 6000, 8000, 10000]}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0]?.payload as GraphPoint | undefined;
                        return (
                          <div className="relative">
                            <div className="bg-[#332222] text-white px-3 py-1 rounded shadow-xl text-[11px] font-bold">
                              {item?.label ?? ""}: {payload[0].value?.toLocaleString()}
                            </div>
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#332222] rotate-45" />
                          </div>
                        );
                      }
                      return null;
                    }}
                    cursor={{ stroke: '#FF3C3C', strokeWidth: 1, strokeDasharray: '3 3' }}
                    offset={-40}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="uv" 
                    stroke="#FF3C3C" 
                    strokeWidth={2} 
                    dot={{ r: 2.5, fill: '#FF3C3C', strokeWidth: 0 }}
                    fillOpacity={1}
                    fill="url(#colorUv)"
                    activeDot={{ r: 5, fill: '#FF3C3C', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
      {/* Transactions Pie */}
      <div className="bg-white rounded-[5px] border border-slate-100 shadow-sm p-6 w-full lg:w-1/2">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[20px] font-bold text-slate-800">Transactions Overview</h2>
        </div>
        <div className="h-[260px] w-full">
          {isMounted ? (
            <TransactionsPieChart data={transactionPie} />
          ) : (
            <div className="h-full w-full bg-slate-50 animate-pulse rounded-[5px]" />
          )}
        </div>
      </div>
      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Registration */}
        <div className="bg-white rounded-[5px] border border-slate-100 shadow-md p-6 relative min-h-[520px]">
          <div className="flex justify-between items-center mb-10 overflow-visible">
            <h2 className="text-[25px] font-semibold text-slate-800">Student Registration</h2>
            <div className="relative" ref={studentMonthRef}>
              <button
                type="button"
                onClick={() => setOpenMenu((v) => (v === "student" ? null : "student"))}
                className="text-[13px] font-semibold text-slate-500 flex items-center gap-2 border border-slate-100 px-4 py-1.5 rounded-md hover:bg-slate-50 transition-all"
              >
                {monthFilter}
                <span className="material-symbols-rounded text-[16px] text-slate-400">expand_more</span>
              </button>
              {openMenu === "student" && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-100 rounded-md shadow-lg z-20">
                  <ul className="py-1 max-h-80 overflow-auto">
                    {monthOptions.map((m) => (
                      <li key={m}>
                        <button
                          type="button"
                          onClick={() => {
                            setMonthFilter(m);
                            setOpenMenu(null);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs font-semibold transition-colors ${monthFilter === m ? "bg-slate-100 text-slate-700" : "text-slate-500 hover:bg-slate-50"}`}
                        >
                          {m}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="h-[380px] w-full px-4 overflow-hidden">
            {isMounted ? (
              <StudentRegistrationChart 
                data={filteredGraphData} 
                ticks={yearTicks}
                keyMap={keyMap}
                firstKeyByYear={firstKeyByYear}
                monthFilter={monthFilter}
              />
            ) : (
              <div className="h-full w-full bg-slate-50 animate-pulse rounded-[5px]" />
            )}
          </div>
        </div>

        {/* College Registration */}
        <div className="bg-white rounded-[5px] border border-slate-100 shadow-md p-6 relative min-h-[520px]">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-[20px] font-bold text-slate-800">College Registration</h2>
            <div className="relative" ref={collegeMonthRef}>
              <button
                type="button"
                onClick={() => setOpenMenu((v) => (v === "college" ? null : "college"))}
                className="text-[13px] font-semibold text-slate-500 flex items-center gap-2 border border-slate-100 px-4 py-1.5 rounded-md hover:bg-slate-50 transition-all"
                aria-haspopup="listbox"
                aria-expanded={openMenu === "college"}
              >
                {monthFilter}
                <span className="material-symbols-rounded text-[16px] text-slate-400">expand_more</span>
              </button>
              {openMenu === "college" && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-100 rounded-md shadow-lg z-20">
                  <ul className="py-1 max-h-80 overflow-auto" role="listbox">
                    {monthOptions.map((m) => (
                      <li key={m}>
                        <button
                          type="button"
                          onClick={() => {
                            setMonthFilter(m);
                            setOpenMenu(null);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs font-semibold transition-colors ${monthFilter === m ? "bg-slate-100 text-slate-700" : "text-slate-500 hover:bg-slate-50"}`}
                        >
                          {m}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="h-[380px] w-full px-4 overflow-hidden">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredCollegeGraphData} margin={{ top: 20, right: 30, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="key"
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }} 
                    dy={15}
                    interval={0}
                    ticks={monthFilter === "All" ? collegeYearTicks : undefined}
                    tickFormatter={(value: string) => {
                      const item = collegeKeyMap.get(value);
                      if (!item) return "";
                      if (monthFilter === "All") {
                        return collegeFirstKeyByYear.get(item.year) === value ? String(item.year) : "";
                      }
                      return String(item.year);
                    }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }}
                    dx={-10}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0]?.payload as GraphPoint | undefined;
                        return (
                          <div className="relative">
                            <div className="bg-[#332222] text-white px-3 py-1 rounded shadow-xl text-[11px] font-bold">
                              {item?.label ?? ""}: {payload[0].value?.toLocaleString()}
                            </div>
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1F2937] rotate-45" />
                          </div>
                        );
                      }
                      return null;
                    }}
                    cursor={{ stroke: '#3B82F6', strokeWidth: 1, strokeDasharray: '3 3' }}
                    offset={-40}
                  />
                  <Bar
                    dataKey="uv"
                    fill="#3B82F6"
                    radius={[6, 6, 2, 2]}
                    maxBarSize={22}
                  />
                </BarChart>
              </ResponsiveContainer>
              <CollegeRegistrationChart 
                data={filteredCollegeGraphData} 
                ticks={collegeYearTicks}
                keyMap={collegeKeyMap}
                firstKeyByYear={collegeFirstKeyByYear}
                monthFilter={monthFilter}
              />
            ) : (
              <div className="h-full w-full bg-slate-50 animate-pulse rounded-[5px]" />
            )}
          </div>
        </div>
      </div>

      {/* Bottom Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Registration Table */}
        <div className="bg-white rounded-[5px] border border-slate-100 shadow-md lg:col-span-2 overflow-hidden flex flex-col pt-6 px-6 pb-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[25px] font-semibold text-slate-800">Student Registration</h2>
            <Link href="/admin/students/profile" className="text-[13px] font-bold text-slate-400 hover:text-slate-600">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto flex-1 rounded-[5px] overflow-hidden border border-slate-100 mb-4">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-[#D9D9D9] text-[#444444]">
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-r border-white last:border-0">Student Name</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-r border-white last:border-0">Course</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-r border-white last:border-0">College</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentStudents.map((student: any) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 text-sm font-medium text-slate-600">{student.name}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{student.course}</td>
                    <td className="px-4 py-4 text-sm text-slate-500 truncate max-w-[150px]">{student.college}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{student.status}</td>
                  </tr>
                ))}
                {recentStudents.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-sm italic">
                      No recent students registered.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity List */}
        <div className="bg-white rounded-[5px] border border-slate-100 shadow-md flex flex-col p-6 min-h-[520px]">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-[25px] font-semibold text-slate-800">Recent Activity</h2>
          </div>
          <div className="flex-1">
            <div className="space-y-8 px-2">
              {recentActivity.map((activity: any) => (
                <div key={activity.id} className="flex gap-4 items-center">
                  <div className="bg-[#99DEFF] w-10 h-10 rounded-full flex items-center justify-center text-[#007AFF] flex-shrink-0 shadow-sm">
                    <span className="material-symbols-rounded text-[24px]">person</span>
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-slate-700 leading-tight">{activity.message}</p>
                    <p className="text-[12px] text-slate-400 mt-1 font-medium">{activity.time} ago</p>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <div className="text-center text-slate-400 text-sm py-4 italic">
                  No activities in history.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
                );
}
