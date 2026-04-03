"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { DbBlog } from "../api/home/latest-blogs/route";

interface NewsSectionProps {
  dbBlogs?: DbBlog[];
}

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";

function buildImageUrl(raw: string | null | undefined): string {
  if (!raw || !raw.trim()) return "https://images.unsplash.com/photo-1523240715627-5d0b541f8d9c?q=80&w=800&auto=format&fit=crop";
  if (raw.startsWith("http")) return `/api/image-proxy?url=${encodeURIComponent(raw)}`;
  if (raw.startsWith("/")) return `/api/image-proxy?url=${encodeURIComponent(raw)}`;
  return `/api/image-proxy?url=${encodeURIComponent(IMAGE_BASE + raw)}`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return "";
  }
}

function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export default function NewsSection({ dbBlogs }: NewsSectionProps) {
  const blogs = dbBlogs && dbBlogs.length > 0 ? dbBlogs.slice(0, 8) : [];

  return (
    <section className="w-full py-16 lg:py-24 bg-white">
      <div className="mx-auto max-w-[1920px] px-6 sm:px-12 lg:px-24">
        <div className="flex flex-row items-center justify-between gap-6 mb-12 flex-wrap sm:flex-nowrap">
           <div className="flex-1">
              <h2 className="text-[40px] font-semibold text-[#6C6C6C] tracking-tight">Student Life & Beyond</h2>
              <p className="mt-3 text-slate-500 font-normal max-w-lg hidden sm:block">
                Expert advice on everything from dorm life to corporate ladders.
              </p>
           </div>
           <Link 
             href="/education-blogs" 
             className="px-8 h-[59px] flex items-center justify-center rounded-[10px] bg-white border border-slate-100 shadow-sm text-[24px] font-medium text-[#6C6C6C] hover:bg-slate-50 transition-all whitespace-nowrap shrink-0"
           >
              Explore all blogs
           </Link>
        </div>

        {blogs.length === 0 ? (
          <p className="text-slate-400 text-sm font-normal">No articles available yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {blogs.map((blog, i) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link href={`/blogs/${blog.slug}`} className="group block">
                  <div className="relative aspect-[16/10] rounded-[32px] overflow-hidden mb-6 shadow-lg shadow-black/5">
                    <img
                      src={buildImageUrl(blog.featimage)}
                      alt={blog.topic}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md text-[10px] font-normal uppercase tracking-widest text-[#FF3C3C]">
                        Related Blogs
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-normal text-slate-400 uppercase tracking-widest">
                      <span>{formatDate(blog.created_at)}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span>5 min read</span>
                    </div>
                    <h3 className="text-[20px] font-bold text-[#3E3E3E] leading-tight group-hover:text-[#FF3C3C] transition-colors line-clamp-2">
                      {blog.topic}
                    </h3>
                    <p className="text-[16px] font-medium text-[#6C6C6C] line-clamp-2 leading-relaxed mt-2">
                      {stripHtml(blog.description)}
                    </p>

                    <div className="pt-4 flex items-center gap-2 text-[#FF3C3C] font-semibold text-[15px] uppercase tracking-widest">
                      <span>Read Related Blog</span>
                      <span className="material-symbols-rounded text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}




