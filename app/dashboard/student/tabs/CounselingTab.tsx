"use client";

import { useState } from "react";

interface Props {
  user: { id: string | number; name: string; email: string } | null;
}

interface Counselor {
  id: number;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  reviews: number;
  available: boolean;
  avatar: string;
  languages: string[];
  expertise: string[];
}

const COUNSELORS: Counselor[] = [
  { id: 1, name: "Dr. Priya Sharma", specialty: "Engineering & Technology", experience: "8 years", rating: 4.9, reviews: 312, available: true, avatar: "PS", languages: ["English", "Hindi"], expertise: ["JEE", "B.Tech Admissions"] },
  { id: 2, name: "Prof. Rajesh Kumar", specialty: "Medical & Pharmacy", experience: "12 years", rating: 4.8, reviews: 425, available: true, avatar: "RK", languages: ["English", "Hindi"], expertise: ["NEET", "MBBS Admissions"] },
  { id: 3, name: "Ms. Ananya Patel", specialty: "Management & MBA", experience: "6 years", rating: 4.7, reviews: 198, available: false, avatar: "AP", languages: ["English"], expertise: ["CAT", "MBA Admissions"] },
];

function CounselorCard({ c, onChat, onBook }: { c: Counselor, onChat: (c: Counselor) => void, onBook: (c: Counselor) => void }) {
  return (
    <div className="bg-white rounded-[12px] border-2 border-gray-100 p-6 hover:border-[#e31e24]/20 transition-all group">
       <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center text-[#e31e24] font-bold text-[18px] group-hover:bg-red-50 transition-colors">
             {c.avatar}
          </div>
          <div className="flex-1 min-w-0">
             <div className="flex items-center gap-2 mb-1">
                <h3 className="text-[15px] font-bold text-[#333] truncate">{c.name}</h3>
                <span className={`w-2 h-2 rounded-full ${c.available ? "bg-green-500 animate-pulse" : "bg-gray-300"}`} />
             </div>
             <p className="text-[12px] font-medium text-gray-400 uppercase tracking-widest">{c.specialty}</p>
             <div className="flex items-center gap-1 mt-2">
                <span className="material-symbols-outlined text-amber-400 text-[14px]">star</span>
                <span className="text-[12px] font-bold text-[#333]">{c.rating}</span>
                <span className="text-[11px] font-medium text-gray-300 ml-1">({c.reviews} reviews)</span>
             </div>
          </div>
       </div>

       <div className="flex flex-wrap gap-2 mb-8">
          {c.expertise.map(e => (
            <span key={e} className="px-2 py-0.5 bg-gray-50 text-gray-400 text-[10px] font-semibold uppercase tracking-widest rounded-md border border-gray-100">{e}</span>
          ))}
       </div>

       <div className="flex gap-3 pt-6 border-t border-gray-50">
          <button 
            onClick={() => onChat(c)}
            disabled={!c.available}
            className="flex-1 py-2.5 bg-[#1a1a1a] text-white text-[11px] font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
             {c.available ? "Chat Now" : "Offline"}
          </button>
          <button 
            onClick={() => onBook(c)}
            className="flex-1 py-2.5 bg-white border-2 border-gray-100 text-[#333] text-[11px] font-bold uppercase tracking-widest rounded-lg hover:border-gray-200 transition-all"
          >
             Book Session
          </button>
       </div>
    </div>
  );
}

export default function CounselingTab({ user }: Props) {
  const [view, setView] = useState<"list" | "chat" | "book">("list");
  const [selected, setSelected] = useState<Counselor | null>(null);

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-[26px] font-bold text-[#222]">Expert Counseling</h2>
        <p className="text-gray-400 font-semibold uppercase text-[12px] tracking-widest mt-1">Personalised guidance for your career</p>
      </div>

      {view === "list" ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {COUNSELORS.map(c => (
              <CounselorCard 
                key={c.id} 
                c={c} 
                onChat={(c) => { setSelected(c); setView("chat"); }} 
                onBook={(c) => { setSelected(c); setView("book"); }} 
              />
            ))}
         </div>
      ) : (
         <div className="bg-white rounded-[10px] border-2 border-gray-100 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 text-[#e31e24]">
               <span className="material-symbols-outlined text-[40px]">{view === "chat" ? "chat" : "calendar_month"}</span>
            </div>
            <h3 className="text-[20px] font-bold text-[#333]">Coming Soon</h3>
            <p className="text-[14px] font-medium text-gray-400 mt-2 max-w-[320px]">We're finalising the {view} interface with {selected?.name}. You'll be able to connect shortly!</p>
            <button onClick={() => setView("list")} className="mt-8 px-8 py-3 bg-[#e31e24] text-white text-[12px] font-bold uppercase tracking-widest rounded-lg shadow-lg shadow-red-100">Back to Counselors</button>
         </div>
      )}
    </div>
  );
}
