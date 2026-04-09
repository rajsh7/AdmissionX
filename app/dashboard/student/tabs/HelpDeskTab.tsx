"use client";

import { useState } from "react";

interface Props {
  user: { id: string | number; name: string; email: string } | null;
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

interface Ticket {
  id: number;
  subject: string;
  message: string;
  priority: "low" | "medium" | "high";
  status: "open" | "in_progress" | "resolved";
  created_at: string;
  category: string;
}

const FAQ_DATA: FAQ[] = [
  { id: 1, category: "Account", question: "How do I reset my password?", answer: "Go to the Settings tab and use the 'Update Password' section. If you forgot it, use the 'Forgot Password' link on the login page." },
  { id: 2, category: "Account", question: "How do I update my profile?", answer: "Navigate to Student Details -> Profile. You can update your name, photo, and other personal details there." },
  { id: 3, category: "Application", question: "How do I track my application?", answer: "Go to the 'My Applications' tab from the sidebar to see the real-time status of all your submissions." },
  { id: 4, category: "Documents", question: "What file formats are accepted?", answer: "We accept PDF, JPG, PNG, and WEBP. Each file must be under 5MB." },
];

export default function HelpDeskTab({ user }: Props) {
  const [activeTab, setActiveTab] = useState<"faq" | "tickets">("faq");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-[26px] font-bold text-[#222]">Help & Support</h2>
          <p className="text-gray-400 font-semibold uppercase text-[12px] tracking-widest mt-1">Get assistance and find answers</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-[#e31e24] text-white text-[13px] font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-red-100 hover:bg-[#c0191e] transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Ticket
          </button>
        )}
      </div>

      <div className="bg-white rounded-[10px] shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
        <div className="flex border-b border-gray-100">
           <button 
             onClick={() => { setActiveTab("faq"); setShowForm(false); }}
             className={`px-8 py-5 text-[13px] font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === "faq" ? "border-[#e31e24] text-[#e31e24]" : "border-transparent text-gray-400 hover:text-gray-600"}`}
           >
             Frequently Asked Questions
           </button>
           <button 
             onClick={() => { setActiveTab("tickets"); setShowForm(false); }}
             className={`px-8 py-5 text-[13px] font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === "tickets" ? "border-[#e31e24] text-[#e31e24]" : "border-transparent text-gray-400 hover:text-gray-600"}`}
           >
             Support Tickets
           </button>
        </div>

        <div className="p-10">
          {activeTab === "faq" ? (
             <div className="max-w-3xl space-y-4">
                {FAQ_DATA.map(faq => (
                  <div key={faq.id} className="border-2 border-gray-50 rounded-xl overflow-hidden">
                     <button 
                       onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                       className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50/50 transition-colors"
                     >
                        <span className="text-[14px] font-bold text-[#333]">{faq.question}</span>
                        <span className={`material-symbols-outlined text-gray-300 transition-transform ${openFaq === faq.id ? "rotate-180" : ""}`}>expand_more</span>
                     </button>
                     {openFaq === faq.id && (
                       <div className="p-5 pt-0 text-[14px] font-medium text-gray-500 leading-relaxed bg-gray-50/30">
                          {faq.answer}
                       </div>
                     )}
                  </div>
                ))}
             </div>
          ) : (
             <div className="space-y-6">
                {showForm ? (
                  <div className="max-w-2xl animate-in zoom-in-95 duration-300">
                     <h3 className="text-[18px] font-bold text-[#333] mb-8">Create Support Ticket</h3>
                     <div className="space-y-6">
                        <div className="relative pt-2">
                           <label className="absolute left-4 -top-0.5 px-1.5 bg-white text-[11px] font-semibold text-gray-400 uppercase tracking-widest z-10">Subject</label>
                           <input type="text" className="w-full bg-white border-2 border-gray-100 rounded-[8px] px-4 py-3.5 text-[14px] font-medium text-[#333] outline-none transition-all focus:border-[#e31e24]/30" placeholder="Summary of the issue" />
                        </div>
                        <div className="relative pt-2">
                           <label className="absolute left-4 -top-0.5 px-1.5 bg-white text-[11px] font-semibold text-gray-400 uppercase tracking-widest z-10">Priority</label>
                           <select className="w-full bg-white border-2 border-gray-100 rounded-[8px] px-4 py-3.5 text-[14px] font-medium text-[#333] outline-none appearance-none">
                              <option>Low</option>
                              <option>Medium</option>
                              <option>High</option>
                           </select>
                        </div>
                        <div className="relative pt-2">
                           <label className="absolute left-4 -top-0.5 px-1.5 bg-white text-[11px] font-semibold text-gray-400 uppercase tracking-widest z-10">Message</label>
                           <textarea className="w-full bg-white border-2 border-gray-100 rounded-[8px] px-4 py-3.5 text-[14px] font-medium text-[#333] outline-none transition-all focus:border-[#e31e24]/30 min-h-[150px]" placeholder="Detailed description..." />
                        </div>
                        <div className="flex gap-4 pt-4">
                           <button onClick={() => setShowForm(false)} className="flex-1 py-3 bg-gray-50 text-gray-500 text-[13px] font-bold uppercase tracking-wider rounded-lg hover:bg-gray-100">Cancel</button>
                           <button className="flex-1 py-3 bg-[#e31e24] text-white text-[13px] font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-red-100 hover:bg-[#c0191e]">Submit Ticket</button>
                        </div>
                     </div>
                  </div>
                ) : (
                  tickets.length > 0 ? (
                    <div className="space-y-4">
                       {tickets.map(t => (
                         <div key={t.id} className="p-5 border-2 border-gray-50 rounded-xl flex items-center justify-between">
                            <div>
                               <h4 className="text-[14px] font-bold text-[#333]">{t.subject}</h4>
                               <p className="text-[12px] font-medium text-gray-400">{t.created_at}</p>
                            </div>
                            <span className="px-3 py-1 bg-gray-50 text-gray-400 text-[10px] font-semibold uppercase tracking-widest rounded-full">{t.status}</span>
                         </div>
                       ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                       <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-200">
                          <span className="material-symbols-outlined text-[40px]">confirmation_number</span>
                       </div>
                       <h3 className="text-[18px] font-bold text-[#333]">No Tickets Yet</h3>
                       <p className="text-[13px] font-medium text-gray-400 max-w-[280px] mt-1">If you have any issues, raise a ticket and we'll get back to you.</p>
                       <button 
                         onClick={() => setShowForm(true)}
                         className="mt-6 px-8 py-3 bg-[#e31e24] text-white text-[12px] font-bold uppercase tracking-widest rounded-lg shadow-lg shadow-red-100 hover:bg-[#c0191e] transition-all"
                       >
                         Create Ticket
                       </button>
                    </div>
                  )
                )}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
