"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import ProfileModal from "./ProfileModal";

interface ProfileRow {
  id: string;
  users_id: number;
  slug: string;
  name: string;
  bannerimage: string | null;
  rating: number;
  ranking: number | null;
  verified: number;
  isTopUniversity: number;
  topUniversityRank: number | null;
  universityType: string | null;
  registeredAddressCityId: number | null;
  city_name: string | null;
  count_courses: number;
  count_facilities: number;
  count_faculty: number;
  count_placements: number;
  count_admissions: number;
  count_events: number;
  count_faqs: number;
  count_management: number;
  count_reviews: number;
  count_scholarships: number;
  count_sports: number;
  created_at: Date | string | null;
}

interface ProfileClientProps {
  profiles: ProfileRow[];
  total: number;
  page: number;
  totalPages: number;
  offset: number;
  pageSize: number;
  q: string;
  onAdd: (formData: FormData) => Promise<void>;
  onUpdate: (formData: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const REMOTE_IMAGE_BASE = "https://admin.admissionx.in/uploads/";

function buildImageUrl(raw: string | null): string {
  if (!raw) return "";
  if (raw.startsWith("http")) return raw;
  if (raw.startsWith("/")) return raw;
  return `${REMOTE_IMAGE_BASE}${raw}`;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };
const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f43f5e", "#f59e0b", "#06b6d4"];

export default function ProfileClient({
  profiles,
  total,
  page,
  totalPages,
  offset,
  pageSize,
  q,
  onAdd,
  onUpdate,
  onDelete,
}: ProfileClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ProfileRow | null>(null);
  const [searchQuery, setSearchQuery] = useState(q);

  // Form states for the new filter UI
  const [filters, setFilters] = useState({
    collegeName: "",
    email: "",
    university: "",
    review: "",
    agreement: "",
    verified: "",
    addressType: "",
    showOnHome: "",
    showOnTop: "",
    lastUpdatedBy: ""
  });

  const handleClear = () => {
    setFilters({
      collegeName: "",
      email: "",
      university: "",
      review: "",
      agreement: "",
      verified: "",
      addressType: "",
      showOnHome: "",
      showOnTop: "",
      lastUpdatedBy: ""
    });
    setSearchQuery("");
    router.push(pathname);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    // Add logic for other filters if needed in the future
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const FormItem = ({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) => (
    <div className={`relative ${className}`}>
      <label className="absolute -top-2.5 left-4 bg-white px-2 text-[12px] font-bold text-slate-400 z-10 uppercase tracking-tight">
        {label}
      </label>
      {children}
    </div>
  );

  return (
    <div className="p-8 space-y-8 max-w-[1600px] font-lexend">
      
      {/* Main Filter Card */}
      <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <h1 className="text-2xl font-extrabold text-slate-700 tracking-tight">Search College Profile details</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-10" style={{ gap: '48px', display: 'flex', flexDirection: 'column' }}>
          {/* Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
            <FormItem label="College Name">
               <div className="relative group">
                  <select 
                    className="w-full h-14 pl-5 border border-slate-200 rounded-xl bg-white text-slate-500 font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                    value={filters.collegeName}
                    onChange={(e) => setFilters({...filters, collegeName: e.target.value})}
                  >
                    <option value="">Select College</option>
                  </select>
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 pointer-events-none group-hover:text-slate-600 transition-colors">chevron_right</span>
               </div>
            </FormItem>
            <FormItem label="Email Address">
              <input
                type="text"
                placeholder="Enter email address"
                className="w-full h-14 px-5 border border-slate-200 rounded-xl bg-white text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
                value={filters.email}
                onChange={(e) => setFilters({...filters, email: e.target.value})}
              />
            </FormItem>
          </div>

          <div style={{ borderTop: '1px dashed #e2e8f0', padding: '10px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-10">
              <FormItem label="University">
                <select 
                  className="w-full h-14 px-5 border border-slate-200 rounded-xl bg-white text-slate-500 font-medium focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                  value={filters.university}
                  onChange={(e) => setFilters({...filters, university: e.target.value})}
                >
                  <option value="">Select university</option>
                </select>
              </FormItem>
              <FormItem label="Review">
                <select className="w-full h-14 px-5 border border-slate-200 rounded-xl bg-white text-slate-500 font-medium focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer">
                  <option value="">Select Review</option>
                </select>
              </FormItem>
              <FormItem label="Agreement">
                <select className="w-full h-14 px-5 border border-slate-200 rounded-xl bg-white text-slate-500 font-medium focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer">
                  <option value="">Select agreement</option>
                </select>
              </FormItem>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-10">
              <FormItem label="Verified">
                <select className="w-full h-14 px-5 border border-slate-200 rounded-xl bg-white text-slate-500 font-medium focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer">
                  <option value="">Select verified</option>
                </select>
              </FormItem>
              <FormItem label="Address Type">
                <select className="w-full h-14 px-5 border border-slate-200 rounded-xl bg-white text-slate-500 font-medium focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer">
                  <option value="">Select address type</option>
                </select>
              </FormItem>
              <div />
            </div>
          </div>

          <div style={{ borderTop: '1px dashed #e2e8f0', padding: '10px 0' }} />

          {/* Row 4 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-4">
            <FormItem label="Is Show On Home">
              <select className="w-full h-14 px-5 border border-slate-200 rounded-xl bg-white text-slate-500 font-medium focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer">
                <option value="">Select Option</option>
                <option value="1">Yes</option>
                <option value="0">No</option>
              </select>
            </FormItem>
            <FormItem label="Is Show On Top">
              <select className="w-full h-14 px-5 border border-slate-200 rounded-xl bg-white text-slate-500 font-medium focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer">
                <option value="">Select Option</option>
                <option value="1">Yes</option>
                <option value="0">No</option>
              </select>
            </FormItem>
            <FormItem label="Last Updated by admin">
              <select className="w-full h-14 px-5 border border-slate-200 rounded-xl bg-white text-slate-500 font-medium focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer">
                <option value="">Select employee</option>
              </select>
            </FormItem>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-center gap-8 pt-6">
             <button 
               type="button" 
               onClick={handleClear}
               className="w-52 h-14 text-white font-black text-xl rounded-xl shadow-lg transition-all uppercase tracking-wider"
               style={{ backgroundColor: '#8E97A4' }}
             >
               Clear
             </button>
             <button 
               type="submit"
               className="w-52 h-14 text-white font-black text-xl rounded-xl shadow-lg transition-all uppercase tracking-wider"
               style={{ backgroundColor: '#FF4242' }}
             >
               Submit
             </button>
          </div>
        </form>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-[5px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#3498db] text-white uppercase text-[12px] font-black tracking-widest text-center">
                <th className="px-4 py-5 border-r border-white/10">ID</th>
                <th className="px-4 py-5 border-r border-white/10">Created Date</th>
                <th className="px-4 py-5 border-r border-white/10">College Name</th>
                <th className="px-4 py-5 border-r border-white/10">University</th>
                <th className="px-4 py-5 border-r border-white/10">College Type</th>
                <th className="px-4 py-5 border-r border-white/10">Verified</th>
                <th className="px-4 py-5 border-r border-white/10">Review</th>
                <th className="px-4 py-5 border-r border-white/10">Agreement</th>
                <th className="px-4 py-5 border-r border-white/10">Document</th>
                <th className="px-4 py-5 border-r border-white/10">Email</th>
                <th className="px-4 py-5 border-r border-white/10">Last Updated By</th>
                <th className="px-4 py-5">Actions</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 font-medium text-sm text-center">
              {profiles.map((p, index) => (
                <tr key={p.id} className={`border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors ${index % 2 === 0 ? "bg-[#e8f4fd]" : "bg-white"}`}>
                  <td className="px-4 py-4 font-bold text-slate-400">{p.id}</td>
                  <td className="px-4 py-4 whitespace-nowrap" suppressHydrationWarning>
                    {p.created_at ? (
                      (() => {
                        const d = new Date(p.created_at);
                        const dateStr = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                        const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                        return `${dateStr} at ${timeStr}`;
                      })()
                    ) : 'Feb 25, 2026 at 06:40'}
                  </td>
                  <td className="px-4 py-4 font-bold text-slate-800">{p.name || p.slug}</td>
                  <td className="px-4 py-4 text-slate-500">ankarya@gmail...</td>
                  <td className="px-4 py-4">{p.universityType || "Private"}</td>
                  <td className="px-4 py-4">11 Jan 2002</td>
                  <td className="px-4 py-4 font-bold text-slate-700">Amit Tyagi</td>
                  <td className="px-4 py-4">
                    <span className="text-slate-400 font-bold uppercase">{p.verified ? 'YES' : 'NO'}</span>
                  </td>
                  <td className="px-4 py-4 font-bold text-slate-400">NO</td>
                  <td className="px-4 py-4">
                    <button className="px-4 py-1.5 rounded-[5px] border border-blue-400 text-blue-500 text-[11px] font-bold hover:bg-blue-50 transition-colors">
                      Send welcome email
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <button className="px-4 py-1.5 rounded-[5px] bg-[#444444] text-white text-[11px] font-bold">
                      Not Update Yet
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <button className="px-6 py-1.5 rounded-[5px] bg-[#3498db] text-white text-[11px] font-bold shadow-md shadow-blue-500/20">
                      Updated
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination placeholder */}
        {totalPages > 1 && (
           <div className="p-6 flex justify-end gap-2 bg-slate-50/30">
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i} 
                  className={`w-10 h-10 rounded-xl font-bold transition-all ${page === i+1 ? 'bg-[#FF4242] text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-200'}`}
                  onClick={() => router.push(`${pathname}?page=${i+1}${q ? `&q=${q}` : ''}`)}
                >
                  {i + 1}
                </button>
              ))}
           </div>
        )}
      </div>

      <ProfileModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={editingProfile ? onUpdate : onAdd}
        initialData={editingProfile}
        title={editingProfile ? "Edit College Profile" : "Add New College Profile"}
      />
    </div>
  );
}
