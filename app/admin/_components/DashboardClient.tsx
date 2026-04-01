"use client";

import { useState } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { 
  Users, Building2, UserCog, MessageSquare, 
  MoreHorizontal, ChevronDown 
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
  const [timeRange, setTimeRange] = useState("This year");

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents.toLocaleString(),
      change: "+12.5%",
      subtext: "new this month",
      icon: Users,
      trend: "up"
    },
    {
      title: "Total Colleges",
      value: stats.totalColleges.toLocaleString(),
      change: "+12.5%",
      subtext: "new this month",
      icon: Building2,
      trend: "up"
    },
    {
      title: "Total Admins",
      value: stats.totalAdmins.toLocaleString(),
      change: "+12.5%",
      subtext: "new this month",
      icon: UserCog,
      trend: "up"
    },
    {
      title: "Active Queries",
      value: stats.activeQueries.toLocaleString(),
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
          <div key={i} className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-red-50 p-3 rounded-xl text-red-600">
                <stat.icon className="w-6 h-6" strokeWidth={2} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm font-semibold text-slate-500">{stat.title}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2">
              <span className={`text-xs font-bold ${stat.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                {stat.change}
              </span>
              <span className="text-xs text-slate-400 font-medium">{stat.subtext}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart Section */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-800">Student Registration</h2>
          <div className="flex items-center gap-2">
            <button className="text-sm font-semibold text-slate-600 flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              {timeRange}
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={graphData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 12 }}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Line 
                type="monotone" 
                dataKey="uv" 
                stroke="#f43f5e" 
                strokeWidth={3} 
                dot={false}
                activeDot={{ r: 6, fill: '#f43f5e', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Student Registration Table */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm lg:col-span-2 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">Student Registration</h2>
            <button className="text-slate-400 hover:text-slate-600">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Course Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">College Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-sm text-slate-700">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{student.course}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-[200px]">{student.college}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                        student.status === 'Active' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentStudents.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-sm">
                      No recent students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity List */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
            <button className="text-slate-400 hover:text-slate-600">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 flex-1">
            <div className="space-y-6">
              {recentActivity.map((activity, index) => (
                <div key={activity.id} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 ring-4 ring-red-50 group-hover:ring-red-100 transition-all flex-shrink-0" />
                    {index !== recentActivity.length - 1 && (
                      <div className="w-[2px] h-full bg-slate-100 mt-2" />
                    )}
                  </div>
                  <div className="pb-6">
                    <p className="text-sm font-medium text-slate-800">{activity.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <div className="text-center text-slate-400 text-sm py-4">
                  No recent activity.
                </div>
              )}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}




