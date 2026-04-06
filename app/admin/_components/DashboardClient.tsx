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
  defs,
  linearGradient,
  stop
} from "recharts";
import { 
  Users, 
  Building2, 
  UserCog, 
  MessageSquare, 
  MoreHorizontal, 
  ChevronDown 
} from "lucide-react";

export default function DashboardClient({ 
  stats, 
  graphData, 
  recentStudents, 
  recentActivity 
}: { 
  stats: any, 
  graphData: any[], 
  recentStudents: any[], 
  recentActivity: any[] 
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [timeRange, setTimeRange] = useState("This year");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents?.toLocaleString() || "0",
      change: "+12.5%",
      subtext: "new this month",
      icon: Users,
      trend: "up"
    },
    {
      title: "Total Colleges",
      value: stats.totalColleges?.toLocaleString() || "0",
      change: "+12.5%",
      subtext: "new this month",
      icon: Building2,
      trend: "up"
    },
    {
      title: "Total Admins",
      value: stats.totalAdmins?.toLocaleString() || "0",
      change: "+12.5%",
      subtext: "new this month",
      icon: UserCog,
      trend: "up"
    },
    {
      title: "Active Queries",
      value: stats.activeQueries?.toLocaleString() || "0",
      change: "+12.5%",
      subtext: "new this month",
      icon: MessageSquare,
      trend: "up"
    }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className="bg-[#FF3C3C] p-2 rounded-lg text-white shadow-lg shadow-red-200">
                <stat.icon className="w-5 h-5" strokeWidth={2.5} />
              </div>
            </div>
            
            <div className="mt-6 flex items-center gap-2">
              <div className="flex items-center text-emerald-500">
                <span className="material-symbols-rounded text-[18px]">trending_up</span>
                <span className="text-[13px] font-bold ml-1">{stat.change}</span>
              </div>
              <span className="text-[13px] text-slate-400 font-medium">{stat.subtext}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart Section */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 relative">
        <div className="flex justify-between items-center mb-10 overflow-visible">
          <h2 className="text-[20px] font-bold text-slate-800">Student Registration</h2>
          <div className="relative group">
            <button className="text-[13px] font-semibold text-slate-500 flex items-center gap-2 border border-slate-100 px-4 py-1.5 rounded-md hover:bg-slate-50 transition-all">
              October
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        <div className="h-[350px] w-full px-4 overflow-hidden">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={graphData} margin={{ top: 20, right: 30, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF3C3C" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#FF3C3C" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }} 
                  dy={15}
                  interval="preserveStartEnd"
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
                      return (
                        <div className="relative">
                          <div className="bg-[#332222] text-white px-3 py-1 rounded shadow-xl text-[11px] font-bold">
                            {payload[0].value?.toLocaleString()}
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
          ) : (
            <div className="h-full w-full bg-slate-50 animate-pulse rounded-xl" />
          )}
        </div>
      </div>

      {/* Bottom Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Student Registration Table */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm lg:col-span-2 overflow-hidden flex flex-col pt-6 px-6 pb-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[20px] font-bold text-slate-800">Student Registration</h2>
            <button className="text-[13px] font-bold text-slate-400 hover:text-slate-600">
              View All
            </button>
          </div>
          <div className="overflow-x-auto flex-1 rounded-lg overflow-hidden border border-slate-100 mb-4">
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
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-[20px] font-bold text-slate-800">Recent Activity</h2>
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
