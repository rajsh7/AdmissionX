"use client";

import { useState, useEffect, useCallback } from "react";

interface Props {
  user: { id: string | number; name: string; email: string } | null;
  filter?: string;
}

interface Query {
  id: number;
  college_id: number;
  college_name: string;
  subject: string;
  message: string;
  status: "pending" | "answered" | "closed";
  response: string | null;
  created_at: string;
}

function QueryCard({ q }: { q: Query }) {
  const isAnswered = q.status === "answered";
  
  return (
    <div className="bg-white rounded-[12px] border-2 border-gray-100 p-6 hover:border-[#e31e24]/20 transition-all group">
       <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
             <h3 className="text-[16px] font-bold text-[#333] tracking-tight">{q.subject}</h3>
             <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">{q.college_name}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest ${
            q.status === "pending" ? "bg-amber-50 text-amber-500" :
            q.status === "answered" ? "bg-emerald-50 text-emerald-500" :
            "bg-gray-50 text-gray-400"
          }`}>
             {q.status}
          </span>
       </div>

       <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl mb-6">
          <p className="text-[13px] font-medium text-gray-600 italic leading-relaxed">"{q.message}"</p>
       </div>

       {q.response ? (
         <div className="pt-6 border-t border-gray-100 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2 mb-3">
               <div className="w-6 h-6 bg-[#e31e24] text-white rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-[14px]">account_balance</span>
               </div>
               <span className="text-[11px] font-semibold text-[#333] uppercase tracking-widest">College Response</span>
            </div>
            <p className="text-[14px] font-medium text-[#444] leading-relaxed">{q.response}</p>
         </div>
       ) : (
         <div className="pt-4 flex items-center gap-2 text-gray-400">
            <span className="material-symbols-outlined text-[18px] animate-pulse">schedule</span>
            <span className="text-[11px] font-semibold uppercase tracking-widest">Awaiting response</span>
         </div>
       )}
    </div>
  );
}

export default function QueriesTab({ user }: Props) {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/student/${user.id}/queries`);
      const data = await res.json();
      setQueries(data.queries ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 animate-pulse">
    {[1,2].map(i => <div key={i} className="h-64 bg-gray-50 rounded-xl" />)}
  </div>;

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-[26px] font-bold text-[#222]">My Queries</h2>
        <p className="text-gray-400 font-semibold uppercase text-[12px] tracking-widest mt-1">Direct communication with colleges</p>
      </div>

      {queries.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {queries.map(q => <QueryCard key={q.id} q={q} />)}
        </div>
      ) : (
        <div className="bg-white rounded-[10px] border border-gray-100 flex flex-col items-center justify-center py-32 text-center">
           <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-200">
              <span className="material-symbols-outlined text-[48px]">chat_bubble_outline</span>
           </div>
           <h3 className="text-[20px] font-bold text-[#333]">No Queries Found</h3>
           <p className="text-[14px] font-medium text-gray-400 max-w-[320px] mt-2">You haven't sent any queries yet. Use the 'Apply' tab to ask colleges questions.</p>
        </div>
      )}
    </div>
  );
}
