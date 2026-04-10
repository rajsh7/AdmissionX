"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface Props {
  user: { id: string | number; name: string; email: string } | null;
  initialType?: string;
}

interface Bookmark {
  id: number;
  type: "college" | "course" | "blog";
  item_id: number;
  title: string;
  image: string;
  url: string;
  created_at: string;
  college_name: string | null;
  college_slug: string | null;
  college_address: string | null;
  course_name: string | null;
  degree_name: string | null;
  stream_name: string | null;
  blog_topic: string | null;
  blog_slug: string | null;
}

// ── Bookmark Card ────────────────────────────────────────────────────────────
function BookmarkCard({ bm, onRemove }: { bm: Bookmark, onRemove: (id: number) => void }) {
  const isCollege = bm.type === "college";
  const isCourse = bm.type === "course";
  
  return (
    <div className="bg-white rounded-[12px] border-2 border-gray-100 p-5 hover:border-[#e31e24]/20 transition-all group relative flex flex-col h-full">
       <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-red-50 group-hover:text-[#e31e24] transition-colors">
             <span className="material-symbols-outlined text-[24px]">
               {isCollege ? "account_balance" : isCourse ? "school" : "article"}
             </span>
          </div>
          <button 
            onClick={() => onRemove(bm.id)}
            className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
          >
             <span className="material-symbols-outlined text-[20px]">bookmark_remove</span>
          </button>
       </div>

       <div className="flex-1 space-y-1 mb-6">
          <h3 className="text-[16px] font-bold text-[#333] leading-tight line-clamp-2">{bm.title}</h3>
          <p className="text-[12px] font-medium text-gray-400 uppercase tracking-widest">
            {isCollege ? bm.college_address : isCourse ? `${bm.degree_name} · ${bm.course_name}` : bm.blog_topic}
          </p>
       </div>

       <div className="pt-5 border-t border-gray-50 mt-auto">
          <a 
            href={bm.url} 
            className="w-full py-2.5 bg-[#1a1a1a] text-white text-[11px] font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-all flex items-center justify-center gap-2"
          >
             View Result
             <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </a>
       </div>
    </div>
  );
}

export default function BookmarksTab({ user, initialType = "all" }: Props) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState(initialType);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/student/${user.id}/bookmarks`);
      const data = await res.json();
      setBookmarks(data.bookmarks ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  async function handleRemove(id: number) {
    try {
      await fetch(`/api/student/${user?.id}/bookmarks?bookmarkId=${id}`, { method: "DELETE" });
      setBookmarks(prev => prev.filter(b => b.id !== id));
    } catch (e) {
      console.error(e);
    }
  }

  const filtered = bookmarks.filter(b => activeType === "all" || b.type === activeType);

  if (loading) return <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 animate-pulse">
    {[1,2,3].map(i => <div key={i} className="h-48 bg-gray-50 rounded-xl" />)}
  </div>;

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-[26px] font-bold text-[#222]">Saved Items</h2>
          <p className="text-gray-400 font-semibold uppercase text-[12px] tracking-widest mt-1">Colleges & Courses Shortlist</p>
        </div>
        <div className="flex gap-2">
           {["all", "college", "course"].map(t => (
             <button 
               key={t}
               onClick={() => setActiveType(t)}
               className={`px-4 py-2 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                 activeType === t ? "bg-[#e31e24] text-white shadow-lg shadow-red-100" : "bg-gray-50 text-gray-400 hover:bg-gray-100"
               }`}
             >
               {t}
             </button>
           ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {filtered.map(bm => <BookmarkCard key={bm.id} bm={bm} onRemove={handleRemove} />)}
        </div>
      ) : (
        <div className="bg-white rounded-[10px] border border-gray-100 flex flex-col items-center justify-center py-32 text-center">
           <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-200">
              <span className="material-symbols-outlined text-[48px]">bookmark</span>
           </div>
           <h3 className="text-[20px] font-bold text-[#333]">Shortlist is Empty</h3>
           <p className="text-[14px] font-medium text-gray-400 max-w-[320px] mt-2">You haven't saved any items yet. Bookmark colleges and courses to see them here.</p>
        </div>
      )}
    </div>
  );
}
