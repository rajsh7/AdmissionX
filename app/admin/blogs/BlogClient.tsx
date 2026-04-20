"use client";
// Forced HMR trigger for hydration fix

import { useState, useEffect } from "react";
import AdminModal from "@/app/admin/_components/AdminModal";
import BlogForm from "./BlogForm";
import DeleteButton from "../_components/DeleteButton";
import Link from "next/link";
import PaginationFixed from "@/app/components/PaginationFixed";

interface BlogClientProps {
  blogs: any[];
  onDelete: (id: number) => Promise<void>;
  onToggle: (formData: FormData) => Promise<void>;
  offset: number;
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
  q: string;
}

const STEP = 25;

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

export default function BlogClient({
  blogs,
  onDelete,
  onToggle,
  offset,
  total,
  page,
  totalPages,
  pageSize,
  q
}: BlogClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any>(null);
  
  const [visibleCount, setVisibleCount] = useState(STEP);

  // Reset when page changes (blogs change)
  // Reset when blogs change
  useEffect(() => {
    setVisibleCount(STEP);
  }, [blogs[0]?.id]);

  const showMore = visibleCount < blogs.length;
  const showPagination = !showMore && totalPages > 1;

  const start = total > 0 ? offset + 1 : 0;
  const end   = total > 0 ? Math.min(offset + pageSize, total) : 0;

  const handleEdit = (blog: any) => {
    setEditingBlog(blog);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingBlog(null);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingBlog(null);
  };

  function stripHtml(html: string | null | undefined): string {
    if (!html) return "";
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 100);
  }

  function formatDate(d: string | null | undefined): string {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  }

  return (
    <>
      <div className="flex justify-end mb-1">
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl shadow-lg shadow-violet-500/25 transition-all group"
        >
          <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>add_circle</span>
          Create New Post
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden text-left">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider px-5 py-3 w-8">#</th>
                <th className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 py-3 w-16">Image</th>
                <th className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 py-3">Title</th>
                <th className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 py-3 w-24">Status</th>
                <th className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 py-3 w-32">Slug</th>
                <th className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 py-3 w-28">Date</th>
                <th className="text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider px-5 py-3 w-40">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {blogs.slice(0, visibleCount).map((blog, idx) => (
                <tr key={blog.id} className="hover:bg-violet-50/30 transition-colors group">
                  <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">{offset + idx + 1}</td>
                  <td className="px-3 py-3.5">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 shadow-inner shrink-0 relative">
                      {blog.featimage && blog.featimage.trim() ? (
                        <img 
                          src={
                            blog.featimage.startsWith('/') 
                              ? `/api/image-proxy?url=${encodeURIComponent(blog.featimage)}`
                              : blog.featimage.startsWith('http')
                                ? `/api/image-proxy?url=${encodeURIComponent(blog.featimage)}`
                                : `/api/image-proxy?url=${encodeURIComponent(`https://admin.admissionx.in/uploads/${blog.featimage}`)}`
                          } 
                          alt="" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              e.currentTarget.remove();
                              parent.className = "w-full h-full flex items-center justify-center bg-violet-100 text-violet-600 font-black text-sm";
                              parent.textContent = (blog.topic || "?").charAt(0).toUpperCase();
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-violet-100 text-violet-600 font-black text-sm">
                          {(blog.topic || "?").charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3.5 max-w-xs">
                    <p className="font-semibold text-slate-800 truncate leading-tight tracking-tight uppercase">{blog.topic}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-1 leading-tight italic">{stripHtml(blog.description) || "No description provided."}</p>
                  </td>
                  <td className="px-3 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter ring-1 ${blog.isactive ? 'bg-green-50 text-green-700 ring-green-100' : 'bg-slate-50 text-slate-500 ring-slate-100'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${blog.isactive ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                      {blog.isactive ? 'Live' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-3 py-3.5">
                    {blog.slug ? (
                      <Link href={`/blogs/${blog.slug}`} target="_blank" className="text-[11px] text-violet-600 hover:underline font-mono truncate block max-w-[120px] font-bold">
                        {blog.slug}
                      </Link>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">no slug</span>
                    )}
                  </td>
                  <td className="px-3 py-3.5 text-[11px] text-slate-500 font-medium whitespace-nowrap">{formatDate(blog.created_at)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <form action={onToggle}>
                        <input type="hidden" name="id" value={blog.id} />
                        <input type="hidden" name="current" value={blog.isactive} />
                        <button type="submit" className={`p-2 rounded-lg transition-all ${blog.isactive ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`} title={blog.isactive ? "Set to Draft" : "Set to Live"}>
                          <span className="material-symbols-rounded text-[18px]">{blog.isactive ? 'visibility_off' : 'visibility'}</span>
                        </button>
                      </form>
                      <button onClick={() => handleEdit(blog)} className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all" title="Update">
                        <span className="material-symbols-rounded text-[18px]">edit</span>
                      </button>
                      <DeleteButton action={onDelete.bind(null, blog.id)} size="sm" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Show More */}
      {showMore && (
        <div className="mt-6 mb-8 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => setVisibleCount((c) => Math.min(c + STEP, blogs.length))}
            className="group flex flex-col items-center gap-1 text-slate-400 hover:text-violet-600 transition-colors"
          >
            <span className="text-xs font-bold uppercase tracking-widest">Show More</span>
            <span className="material-symbols-outlined text-[36px] group-hover:text-violet-600 animate-bounce">
              keyboard_arrow_down
            </span>
          </button>
        </div>
      )}

      {/* Pagination — shown only after all blogs are visible */}
      {showPagination && (
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between bg-slate-50/50 mt-6 rounded-b-2xl">
          <p className="text-sm text-slate-500 font-medium">
            Showing <strong>{start}</strong>–<strong>{end}</strong> of <strong>{total.toLocaleString()}</strong> blogs
          </p>
          <PaginationFixed currentPage={page} totalPages={totalPages} useUrl />
        </div>
      )}

      {/* CRUD Modal */}
      <AdminModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBlog ? "Update Blog Post" : "Create New Post"}>
        <BlogForm initialData={editingBlog} onSuccess={handleFormSuccess} />
      </AdminModal>
    </>
  );
}




