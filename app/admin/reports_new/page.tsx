import pool from "@/lib/db";
import Link from "next/link";
import { revalidatePath } from "next/cache";

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default async function ReportsManagementPage() {
  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto w-full">
      <div>
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>analytics</span>
          System Reports & Analytics
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Centralized hub for monitoring performance, traffic, and user activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[
          { title: "Admission Trends", icon: "trending_up", desc: "View enrollment growth and conversion rates over time.", color: "text-emerald-600 bg-emerald-50" },
          { title: "User Activity", icon: "person_celebrate", desc: "Monitor student and college engagement metrics.", color: "text-blue-600 bg-blue-50" },
          { title: "Revenue Reports", icon: "payments", desc: "Track application fees and payment distributions.", color: "text-purple-600 bg-purple-50" },
          { title: "Search Metrics", icon: "search_insights", desc: "Analyze what colleges and courses students are searching for.", color: "text-orange-600 bg-orange-50" },
          { title: "Error Logs", icon: "running_with_errors", desc: "Review system errors and service interruptions.", color: "text-red-600 bg-red-50" },
          { title: "Platform Health", icon: "health_and_safety", desc: "Overall performance and uptime statistics.", color: "text-slate-600 bg-slate-50" },
        ].map((item) => (
          <div key={item.title} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
             <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.color}`}>
                   <span className="material-symbols-rounded text-[24px]" style={ICO_FILL}>{item.icon}</span>
                </div>
                <h2 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{item.title}</h2>
             </div>
             <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
             <div className="mt-4 pt-4 border-t border-slate-50 flex justify-end">
                <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1 uppercase tracking-widest">
                   Generate Report
                   <span className="material-symbols-rounded text-[14px]">arrow_forward</span>
                </span>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}




