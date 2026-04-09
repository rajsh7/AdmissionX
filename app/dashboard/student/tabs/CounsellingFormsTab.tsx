"use client";

import { useState } from "react";

interface Props {
  user: { id: string | number; name: string; email: string } | null;
}

interface CounsellingForm {
  id: number;
  form_name: string;
  college: string;
  course: string;
  round: string;
  status: "submitted" | "pending" | "shortlisted" | "rejected";
  submitted_on: string;
}

const COUNSELLING_TYPES = [
  { id: "jee-mains", label: "JEE Mains Counselling", body: "JOSAA / JAC / State JEE Counselling" },
  { id: "neet", label: "NEET UG Counselling", body: "MCC / State NEET Counselling" },
  { id: "cat-mba", label: "CAT / MBA Counselling", body: "IIM / Top MBA Institutes" },
];

export default function CounsellingFormsTab({ user }: Props) {
  const [activeType, setActiveType] = useState("jee-mains");

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-[26px] font-bold text-[#222]">Counselling Forms</h2>
        <p className="text-gray-400 font-semibold uppercase text-[12px] tracking-widest mt-1">Track your central admission progress</p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
         {COUNSELLING_TYPES.map(t => (
           <button 
             key={t.id}
             onClick={() => setActiveType(t.id)}
             className={`px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all ${
               activeType === t.id ? "bg-[#e31e24] text-white shadow-lg shadow-red-100" : "bg-gray-50 text-gray-400 hover:bg-gray-100"
             }`}
           >
             {t.label}
           </button>
         ))}
      </div>

      <div className="bg-white rounded-[10px] border border-gray-100 overflow-hidden">
         <div className="p-8 border-b border-gray-50 bg-gray-50/30">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-white rounded-xl border-2 border-gray-100 flex items-center justify-center text-[#e31e24]">
                  <span className="material-symbols-outlined text-[24px]">assignment</span>
               </div>
               <div>
                  <h3 className="text-[16px] font-bold text-[#333] tracking-tight">{COUNSELLING_TYPES.find(x => x.id === activeType)?.label}</h3>
                  <p className="text-[12px] font-medium text-gray-400 uppercase tracking-widest mt-0.5">{COUNSELLING_TYPES.find(x => x.id === activeType)?.body}</p>
               </div>
            </div>
         </div>

         <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-200">
               <span className="material-symbols-outlined text-[48px]">pending_actions</span>
            </div>
            <h3 className="text-[20px] font-bold text-[#333]">Coming Soon</h3>
            <p className="text-[14px] font-medium text-gray-400 max-w-[320px] mt-2">Centralised {activeType} tracking is being integrated. You'll soon be able to manage all rounds here.</p>
            <button className="mt-8 px-10 py-3 bg-[#e31e24] text-white text-[12px] font-bold uppercase tracking-widest rounded-lg shadow-lg shadow-red-100 hover:bg-[#c0191e]">Notify Me</button>
         </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="p-6 bg-[#333] rounded-[12px] text-white">
            <div className="flex items-center gap-3 mb-4">
               <span className="material-symbols-outlined text-red-500">info</span>
               <h4 className="text-[14px] font-bold uppercase tracking-widest">How it works</h4>
            </div>
            <ul className="space-y-3">
               {["Register on official portal", "Fill choice preferences", "Pay counselling fee", "Check allotment results"].map((s, i) => (
                 <li key={i} className="flex items-center gap-3 text-[13px] font-medium text-gray-300">
                    <span className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-[10px] text-white">{i+1}</span>
                    {s}
                 </li>
               ))}
            </ul>
         </div>
         <div className="p-6 bg-white border-2 border-gray-100 rounded-[12px]">
            <div className="flex items-center gap-3 mb-4">
               <span className="material-symbols-outlined text-red-500">calendar_month</span>
               <h4 className="text-[14px] font-bold text-[#333] uppercase tracking-widest">Important Dates</h4>
            </div>
            <div className="space-y-4">
               {[
                 { label: "JEE Main", date: "June 2025" },
                 { label: "NEET UG", date: "July 2025" }
               ].map((d, i) => (
                 <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-[13px] font-bold text-[#333]">{d.label}</span>
                    <span className="text-[12px] font-medium text-gray-400 uppercase tracking-widest">{d.date}</span>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
