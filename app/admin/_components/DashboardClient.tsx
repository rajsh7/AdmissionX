"use client";

import Link from "next/link";
import { useMemo, useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Users, Building2, UserCog, MessageSquare, ChevronDown } from "lucide-react";

const StudentRegistrationChart = dynamic(() => import("./StudentRegistrationChart"), {
  ssr: false, loading: () => <div className="h-full w-full bg-slate-50 animate-pulse rounded-[5px]" />,
});
const CollegeRegistrationChart = dynamic(() => import("./CollegeRegistrationChart"), {
  ssr: false, loading: () => <div className="h-full w-full bg-slate-50 animate-pulse rounded-[5px]" />,
});
const TransactionsPieChart = dynamic(() => import("./TransactionsPieChart"), {
  ssr: false, loading: () => <div className="h-full w-full bg-slate-50 animate-pulse rounded-[5px]" />,
});

interface GraphPoint { key: string; label: string; year: number; month: number; uv: number; }
interface PiePoint   { name: string; value: number; count: number; amount?: number; }

const MONTH_OPTIONS = [
  "All","January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

interface DashboardClientProps {
  stats: {
    totalStudents: number;
    totalColleges: number;
    totalAdmins: number;
    activeQueries: number;
    pendingStudents?: number;
    pendingColleges?: number;
    successfulStudents?: number;
    activeBlogs?: number;
  };
  graphData: GraphPoint[];
  collegeGraphData: GraphPoint[];
  studentTransactionPie: PiePoint[];
  collegeTransactionPie: PiePoint[];
  recentStudents: Array<{ id: string; name: string; course: string; college: string; status: string }>;
  recentActivity: Array<{ id: string; type: string; message: string; time: string }>;
}

export default function DashboardClient({
  stats: propStats, graphData: propGraphData, collegeGraphData: propCollegeGraphData,
  studentTransactionPie: propStudentTransactionPie, collegeTransactionPie: propCollegeTransactionPie,
  recentStudents: propRecentStudents, recentActivity: propRecentActivity,
}: DashboardClientProps) {
  const [stats, setStats] = useState(propStats);
  const [graphData, setGraphData] = useState(propGraphData);
  const [collegeGraphData, setCollegeGraphData] = useState(propCollegeGraphData);
  const [studentTransactionPie, setStudentTransactionPie] = useState(propStudentTransactionPie);
  const [collegeTransactionPie, setCollegeTransactionPie] = useState(propCollegeTransactionPie);
  const [recentStudents, setRecentStudents] = useState(propRecentStudents);
  const [recentActivity, setRecentActivity] = useState(propRecentActivity);
  const [monthFilter, setMonthFilter] = useState("All");
  const [openMenu, setOpenMenu]     = useState<"student" | "college" | null>(null);
  const studentMonthRef = useRef<HTMLDivElement>(null);
  const collegeMonthRef = useRef<HTMLDivElement>(null);

  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString());
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('/api/admin/dashboard-refresh', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        setStats(data.stats);
        setGraphData(data.graphData);
        setCollegeGraphData(data.collegeGraphData);
        setStudentTransactionPie(data.studentTransactionPie);
        setCollegeTransactionPie(data.collegeTransactionPie);
        setRecentStudents(data.recentStudents);
        setRecentActivity(data.recentActivity);
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (e) {
        console.error('[Dashboard] Auto-refresh failed:', e);
      }
    };

    const intervalId = window.setInterval(fetchDashboardData, 30000);
    return () => window.clearInterval(intervalId);
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/admin/dashboard-refresh', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setGraphData(data.graphData);
        setCollegeGraphData(data.collegeGraphData);
        setStudentTransactionPie(data.studentTransactionPie);
        setCollegeTransactionPie(data.collegeTransactionPie);
        setRecentStudents(data.recentStudents);
        setRecentActivity(data.recentActivity);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.error('[Dashboard] Manual refresh failed:', e);
    }
    setTimeout(() => setIsRefreshing(false), 800);
  };

  useEffect(() => {
    if (!openMenu) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if ((openMenu === "student" && studentMonthRef.current?.contains(t)) ||
          (openMenu === "college" && collegeMonthRef.current?.contains(t))) return;
      setOpenMenu(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openMenu]);

  const monthIndex = useMemo(() => monthFilter === "All" ? null : MONTH_OPTIONS.indexOf(monthFilter), [monthFilter]);

  const filteredGraphData = useMemo(() => {
    if (!graphData?.length) return [];
    return monthIndex == null || monthIndex < 1 ? graphData : graphData.filter(d => d.month === monthIndex);
  }, [graphData, monthIndex]);

  const filteredCollegeGraphData = useMemo(() => {
    if (!collegeGraphData?.length) return [];
    return monthIndex == null || monthIndex < 1 ? collegeGraphData : collegeGraphData.filter(d => d.month === monthIndex);
  }, [collegeGraphData, monthIndex]);

  const keyMap = useMemo(() => { const m = new Map<string, GraphPoint>(); filteredGraphData.forEach(d => m.set(d.key, d)); return m; }, [filteredGraphData]);
  const collegeKeyMap = useMemo(() => { const m = new Map<string, GraphPoint>(); filteredCollegeGraphData.forEach(d => m.set(d.key, d)); return m; }, [filteredCollegeGraphData]);

  const firstKeyByYear = useMemo(() => {
    const m = new Map<number, string>();
    filteredGraphData.forEach(d => { if (!m.has(d.year)) m.set(d.year, d.key); });
    return m;
  }, [filteredGraphData]);

  const collegeFirstKeyByYear = useMemo(() => {
    const m = new Map<number, string>();
    filteredCollegeGraphData.forEach(d => { if (!m.has(d.year)) m.set(d.year, d.key); });
    return m;
  }, [filteredCollegeGraphData]);

  const yearTicks        = useMemo(() => Array.from(firstKeyByYear.entries()).sort(([a],[b]) => a-b).map(([,k]) => k), [firstKeyByYear]);
  const collegeYearTicks = useMemo(() => Array.from(collegeFirstKeyByYear.entries()).sort(([a],[b]) => a-b).map(([,k]) => k), [collegeFirstKeyByYear]);

  const statCards = [
    { 
      title: "Total Students", 
      value: stats.totalStudents?.toLocaleString() || "0", 
      subtext: `${stats.successfulStudents ?? 0} successful signups`, 
      icon: <Users className="w-5 h-5" />, 
      href: "/admin/members/registrations" 
    },
    { 
      title: "Total Colleges", 
      value: stats.totalColleges?.toLocaleString() || "0", 
      subtext: `${stats.pendingColleges ?? 0} pending approval`, 
      icon: <Building2 className="w-5 h-5" />, 
      href: "/admin/colleges/profile" 
    },
    { title: "Admin Users",    value: stats.totalAdmins?.toLocaleString()   || "0", subtext: "active admins",                                  icon: <UserCog className="w-5 h-5" />,      href: "/admin/members/roles" },
    { title: "Applications",   value: stats.activeQueries?.toLocaleString() || "0", subtext: `${stats.activeQueries ?? 0} open sessions`,          icon: <MessageSquare className="w-5 h-5" />, href: "/admin/applications" },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Title & Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[25px] font-semibold text-[#3E3E3E]">Dashboard</h1>
          <p className="text-[18px] font-normal text-slate-500">Overview of platform growth and activity.</p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold text-emerald-700 tracking-wide uppercase">
              Live updates
            </span>
            <span className="text-[11px] text-emerald-600/80 font-semibold font-mono">
              (Synced {lastUpdated})
            </span>
          </div>
          <button 
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-2 text-slate-400 hover:text-slate-600 bg-white border border-slate-100 rounded-full shadow-sm hover:shadow transition-all disabled:opacity-50 flex items-center justify-center"
            title="Sync now"
          >
            <svg 
              className={`w-4 h-4 ${isRefreshing ? "animate-spin text-emerald-500" : ""}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Link key={i} href={stat.href} className="bg-white rounded-[5px] p-6 border border-slate-100 shadow-md relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 block">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className="bg-[#FF3C3C] p-3 rounded-lg text-white shadow-sm">{stat.icon}</div>
            </div>
            <div className="mt-4">
              <span className="text-[13px] text-slate-400 font-medium">{stat.subtext}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Registration Chart */}
        <div className="bg-white rounded-[5px] border border-slate-100 shadow-md p-6 relative min-h-[520px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 overflow-visible">
            <h2 className="text-[22px] font-semibold text-slate-800">Student Registration</h2>
            <div className="relative w-full sm:w-auto" ref={studentMonthRef}>
              <button type="button" onClick={() => setOpenMenu(v => v === "student" ? null : "student")}
                className="w-full sm:w-auto text-[13px] font-semibold text-slate-500 flex items-center justify-between sm:justify-start gap-2 border border-slate-100 px-4 py-1.5 rounded-[5px] hover:bg-slate-50 transition-all">
                {monthFilter}
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openMenu === "student" ? "rotate-180" : ""}`} />
              </button>
              {openMenu === "student" && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-100 rounded-[5px] shadow-xl z-50">
                  <ul className="py-1 max-h-80 overflow-auto">
                    {MONTH_OPTIONS.map(m => (
                      <li key={m}>
                        <button type="button" onClick={() => { setMonthFilter(m); setOpenMenu(null); }}
                          className={`w-full text-left px-3 py-2 text-xs font-semibold transition-colors ${monthFilter === m ? "bg-slate-100 text-slate-700" : "text-slate-500 hover:bg-slate-50"}`}>
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
            <StudentRegistrationChart key={JSON.stringify(filteredGraphData)} data={filteredGraphData} ticks={yearTicks} keyMap={keyMap} firstKeyByYear={firstKeyByYear} monthFilter={monthFilter} />
          </div>
        </div>

        {/* College Registration Chart */}
        <div className="bg-white rounded-[5px] border border-slate-100 shadow-md p-6 relative min-h-[520px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 overflow-visible">
            <h2 className="text-[22px] font-semibold text-slate-800">College Registration</h2>
            <div className="relative w-full sm:w-auto" ref={collegeMonthRef}>
              <button type="button" onClick={() => setOpenMenu(v => v === "college" ? null : "college")}
                className="w-full sm:w-auto text-[13px] font-semibold text-slate-500 flex items-center justify-between sm:justify-start gap-2 border border-slate-100 px-4 py-1.5 rounded-[5px] hover:bg-slate-50 transition-all">
                {monthFilter}
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openMenu === "college" ? "rotate-180" : ""}`} />
              </button>
              {openMenu === "college" && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-100 rounded-[5px] shadow-xl z-50">
                  <ul className="py-1 max-h-80 overflow-auto">
                    {MONTH_OPTIONS.map(m => (
                      <li key={m}>
                        <button type="button" onClick={() => { setMonthFilter(m); setOpenMenu(null); }}
                          className={`w-full text-left px-3 py-2 text-xs font-semibold transition-colors ${monthFilter === m ? "bg-slate-100 text-slate-700" : "text-slate-500 hover:bg-slate-50"}`}>
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
            <CollegeRegistrationChart key={JSON.stringify(filteredCollegeGraphData)} data={filteredCollegeGraphData} ticks={collegeYearTicks} keyMap={collegeKeyMap} firstKeyByYear={collegeFirstKeyByYear} monthFilter={monthFilter} />
          </div>
        </div>
      </div>

      {/* Transaction Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-[5px] border border-slate-100 shadow-md p-6">
          <h2 className="text-[20px] font-bold text-slate-800 mb-6">Student Transactions</h2>
          <div className="h-[450px] sm:h-[300px] w-full"><TransactionsPieChart key={JSON.stringify(studentTransactionPie)} data={studentTransactionPie} /></div>
        </div>
        <div className="bg-white rounded-[5px] border border-slate-100 shadow-md p-6">
          <h2 className="text-[20px] font-bold text-slate-800 mb-6">College Transactions</h2>
          <div className="h-[450px] sm:h-[300px] w-full"><TransactionsPieChart key={JSON.stringify(collegeTransactionPie)} data={collegeTransactionPie} /></div>
        </div>
      </div>

      {/* Recent Activity & Students */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-[5px] border border-slate-100 shadow-md p-6 xl:col-span-1">
          <h2 className="text-[22px] font-semibold text-slate-800 mb-8">Recent Activity</h2>
          <div className="space-y-6">
            {recentActivity.map(activity => (
              <div key={activity.id} className="flex gap-4 items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${activity.type === "student" ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"}`}>
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[14px] font-medium text-slate-700 leading-tight">{activity.message}</p>
                  <p className="text-[12px] text-slate-400 mt-1 font-medium">{activity.time}</p>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && <p className="text-center text-slate-400 py-10 italic">No recent activities.</p>}
          </div>
        </div>

        <div className="bg-white rounded-[5px] border border-slate-100 shadow-md overflow-hidden flex flex-col p-6 xl:col-span-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-[22px] font-semibold text-slate-800">Recent Student Registrations</h2>
            <Link href="/admin/members/registrations" className="text-[13px] font-bold text-blue-600 hover:text-blue-700 underline">View All</Link>
          </div>
          <div className="overflow-x-auto rounded-[5px] border border-slate-100">
            <table className="w-full text-center border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 text-slate-600">
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-r border-slate-100">Name</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-r border-slate-100">Course</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-r border-slate-100">College</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentStudents.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 text-sm font-medium text-slate-700">{student.name}</td>
                    <td className="px-4 py-4 text-sm text-slate-500 uppercase">{student.course}</td>
                    <td className="px-4 py-4 text-sm text-slate-500 truncate max-w-[200px]">{student.college}</td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${student.status === "Active" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentStudents.length === 0 && (
                  <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400 text-sm italic">No recent registrations found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
