"use client";

import { useState, useEffect, useCallback } from "react";

interface Props {
  user: { id: string | number; name: string; email: string } | null;
  initialFilter?: string;
}

interface Application {
  id: number;
  application_ref: string;
  college_name: string | null;
  course_name: string | null;
  degree_name: string | null;
  stream_name: string | null;
  fees: number;
  status: string;
  statusLabel: string;
  statusClass: string;
  statusIcon: string;
  progress: number;
  progressColor: string;
  payment_status: string;
  paymentLabel: string;
  paymentClass: string;
  paymentIcon: string;
  transaction_id: string | null;
  amount_paid: number;
  actionLabel: string;
  notes: string | null;
  submittedOn: string | null;
  created_at: string;
}

// -- Application Card --------------------------------------------------------
function AppCard({ app }: { app: Application }) {
  return (
    <div className="bg-white rounded-[12px] border-2 border-gray-100 p-6 hover:border-[#e31e24]/20 transition-all group relative overflow-hidden">
       <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-red-50 group-hover:text-[#e31e24] transition-colors">
             <span className="material-symbols-outlined text-[28px]">account_balance</span>
          </div>
          <div className="text-right">
             <span className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Ref ID</span>
             <span className="px-3 py-1 bg-gray-50 rounded text-[12px] font-semibold text-[#555] font-mono">{app.application_ref}</span>
          </div>
       </div>

       <div className="space-y-1 mb-6">
          <h3 className="text-[18px] font-bold text-[#333] leading-tight truncate px-0">{app.college_name}</h3>
          <p className="text-[13px] font-medium text-gray-400 uppercase tracking-wider">{app.degree_name} · {app.course_name}</p>
       </div>

       <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="space-y-1">
             <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-widest">Status</p>
             <div className="flex items-center gap-2 text-[13px] font-semibold text-[#333]">
                <span className={`w-2 h-2 rounded-full ${app.status === "enrolled" ? "bg-green-500" : app.status === "verified" ? "bg-blue-500" : "bg-[#e31e24]"}`} />
                {app.statusLabel}
             </div>
          </div>
          <div className="space-y-1">
             <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-widest">Applied On</p>
             <p className="text-[13px] font-semibold text-[#333]">{app.submittedOn || "—"}</p>
          </div>
       </div>

       <div className="flex items-center justify-between pt-6 border-t border-gray-50">
          <div className="flex flex-col">
             <span className="text-[10px] font-semibold text-gray-300 uppercase tracking-widest">Application Fee</span>
             <span className="text-[16px] font-bold text-[#333]">₹{app.fees.toLocaleString("en-IN")}</span>
          </div>
          <button className="px-6 py-2.5 bg-[#1a1a1a] text-white text-[12px] font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-all">
             View Details
          </button>
       </div>
    </div>
  );
}

export default function ApplicationsTab({ user }: Props) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/student/${user.id}/applications`);
      const data = await res.json();
      setApplications(data.applications ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="space-y-6 pt-10 animate-pulse">
    {[1,2,3].map(i => <div key={i} className="h-40 bg-gray-50 rounded-xl" />)}
  </div>;

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-[26px] font-bold text-[#222]">My Applications</h2>
          <p className="text-gray-400 font-semibold uppercase text-[12px] tracking-widest mt-1">Track your admission progress</p>
        </div>
        <div className="flex items-center gap-3">
           <span className="text-[13px] font-semibold text-gray-300 uppercase tracking-widest">{applications.length} Total</span>
        </div>
      </div>

      {applications.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
           {applications.map(app => <AppCard key={app.id} app={app} />)}
        </div>
      ) : (
        <div className="bg-white rounded-[10px] border border-gray-100 flex flex-col items-center justify-center py-32 text-center">
           <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-200">
              <span className="material-symbols-outlined text-[48px]">description</span>
           </div>
           <h3 className="text-[20px] font-bold text-[#333]">No Applications Yet</h3>
           <p className="text-[14px] font-medium text-gray-400 max-w-[320px] mt-2">You haven't applied to any colleges. Start your journey by exploring top universities.</p>
           <button className="mt-8 px-10 py-3.5 bg-[#e31e24] text-white text-[13px] font-bold uppercase tracking-widest rounded-full shadow-lg shadow-red-100 hover:scale-105 active:scale-95 transition-all">
              Explore Colleges
           </button>
        </div>
      )}
    </div>
  );
}
