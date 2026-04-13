"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";

function buildImageUrl(raw: string | null | undefined): string {
  if (!raw || !raw.trim()) return "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop";
  if (raw.startsWith("http")) return `/api/image-proxy?url=${encodeURIComponent(raw)}`;
  return `/api/image-proxy?url=${encodeURIComponent(IMAGE_BASE + raw)}`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch { return ""; }
}

function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

interface NewsItem {
  _id: string;
  topic: string;
  featimage: string | null;
  description: string | null;
  slug: string;
  created_at: string;
}

export default function LatestNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news?limit=6")
      .then(r => r.json())
      .then(d => setNews(d.data ?? []))
      .catch(() => setNews([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="w-full py-16 lg:py-24 bg-[#f8fafc]">
        <div className="mx-auto max-w-[1920px] px-6 sm:px-12 lg:px-24">
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white rounded-[10px] overflow-hidden animate-pulse">
                <div className="aspect-[16/10] bg-slate-200" />
                <div className="p-6 space-y-3">
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-100 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (news.length === 0) return null;

  const [featured, ...rest] = news;

  return (
    <section className="w-full py-16 lg:py-24 bg-[#f8fafc]">
      <div className="mx-auto max-w-[1920px] px-6 sm:px-12 lg:px-24">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-primary text-[12px] font-bold uppercase tracking-[3px] mb-2">Latest Updates</p>
            <h2 className="text-[36px] lg:text-[48px] font-bold text-slate-900 leading-tight tracking-tight">
              Education News
            </h2>
            <p className="mt-3 text-slate-500 font-medium max-w-lg">
              Stay updated with the latest news, announcements, and insights from the world of education.
            </p>
          </div>
          <Link
            href="/news"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-[5px] bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all shadow-sm hover:shadow-md group shrink-0"
          >
            View All News
            <span className="material-symbols-rounded transition-transform group-hover:translate-x-1">arrow_right_alt</span>
          </Link>
        </div>

        {/* Grid: 1 featured + 5 smaller */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Featured large card */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link href={`/news/${featured.slug}`} className="group block h-full">
              <div className="relative aspect-[4/3] rounded-[10px] overflow-hidden mb-5 shadow-lg shadow-black/5">
                <img
                  src={buildImageUrl(featured.featimage)}
                  alt={featured.topic}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 rounded-[5px] bg-primary text-white text-[11px] font-bold uppercase tracking-widest">
                    Featured
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                  {formatDate(featured.created_at)}
                </p>
                <h3 className="text-[22px] font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                  {featured.topic}
                </h3>
                <p className="text-[15px] text-slate-500 line-clamp-3 leading-relaxed">
                  {stripHtml(featured.description)}
                </p>
                <div className="pt-2 flex items-center gap-2 text-primary font-semibold text-[14px]">
                  <span>Read More</span>
                  <span className="material-symbols-rounded text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* 5 smaller cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {rest.slice(0, 4).map((item, i) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Link href={`/news/${item.slug}`} className="group flex gap-4 bg-white rounded-[10px] p-4 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all h-full">
                  <div className="w-24 h-24 rounded-[8px] overflow-hidden flex-shrink-0">
                    <img
                      src={buildImageUrl(item.featimage)}
                      alt={item.topic}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
                        {formatDate(item.created_at)}
                      </p>
                      <h4 className="text-[14px] font-bold text-slate-800 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {item.topic}
                      </h4>
                    </div>
                    <span className="text-[12px] font-semibold text-primary flex items-center gap-1 mt-2">
                      Read
                      <span className="material-symbols-rounded text-[14px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
