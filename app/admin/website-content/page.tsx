import pool from "@/lib/db";
import Link from "next/link";
import { revalidatePath } from "next/cache";

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default async function WebsiteContentPage() {
  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>language</span>
          Website Content Management
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage global text, hero sections, and static page content.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[40px] text-white shadow-xl shadow-blue-900/20 relative overflow-hidden group">
            <div className="relative z-10">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Campaign Center</span>
               <h2 className="text-2xl font-black mt-2 leading-tight">Manage Home Page Banner & CTA</h2>
               <p className="text-sm opacity-80 mt-4 leading-relaxed max-w-[300px]">Update the primary marketing message and call-to-action buttons for the main landing page.</p>
               <button className="mt-8 bg-white text-blue-600 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all">Edit Homepage Content</button>
            </div>
            <span className="material-symbols-rounded absolute -right-8 -bottom-8 text-[200px] opacity-10 group-hover:scale-110 transition-transform duration-700" style={ICO_FILL}>star</span>
         </div>

         <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col justify-between group">
            <div>
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Content Modules</span>
               <h2 className="text-2xl font-black mt-2 leading-tight text-slate-800">Static Pages & FAQ Sections</h2>
               <p className="text-sm text-slate-500 mt-4 leading-relaxed">Modify About Us, Contact Us, and common FAQ blocks used throughout the platform.</p>
            </div>
            <button className="mt-8 bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all self-start">Manage Modules</button>
         </div>
      </div>
    </div>
  );
}




