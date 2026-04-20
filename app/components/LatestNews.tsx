"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
const NEWS_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop";

function buildImageUrl(raw: string | null | undefined): string {
  if (!raw || !raw.trim()) return NEWS_FALLBACK_IMAGE;
  // Fix double /uploads//uploads/ from bad DB data
  const cleaned = raw.replace(/\/uploads\/\/uploads\//g, "/uploads/");
  if (cleaned.startsWith("http")) return `/api/image-proxy?url=${encodeURIComponent(cleaned)}`;
  return `/api/image-proxy?url=${encodeURIComponent(IMAGE_BASE + cleaned)}`;
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

function NewsImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={(event) => {
        const target = event.currentTarget;
        target.onerror = null;
        target.src = NEWS_FALLBACK_IMAGE;
      }}
    />
  );
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
        <div className="home-page-shell">
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white rounded-[5px] overflow-hidden animate-pulse">
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
      <div className="home-page-shell">

        {/* Header */}
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-start">
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
            className="group inline-flex h-[51.8px] shrink-0 items-center gap-2 rounded-[5px] border border-slate-200 bg-white px-8 font-medium transition-all hover:bg-slate-50 shadow-sm hover:shadow-md"
            style={{ color: "#475569" }}
          >
            View All News
            <span className="material-symbols-rounded transition-transform group-hover:translate-x-1">arrow_right_alt</span>
          </Link>
        </div>

        {/* Grid: 1 featured + 5 smaller */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

          {/* Featured large card */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link href={`/news/${featured.slug}`} className="group block h-full">
              <div className="overflow-hidden rounded-[5px] border border-slate-100 bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <NewsImage
                    src={buildImageUrl(featured.featimage)}
                    alt={featured.topic}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1.5 rounded-[5px] bg-primary text-white text-[11px] font-bold uppercase tracking-widest">
                      Featured
                    </span>
                  </div>
                </div>
                <div className="space-y-3 p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                    {formatDate(featured.created_at)}
                  </p>
                  <h3 className="line-clamp-2 text-[24px] font-bold leading-tight text-slate-900 transition-colors group-hover:text-primary">
                    {featured.topic}
                  </h3>
                  <p className="line-clamp-3 text-[15px] leading-relaxed text-slate-500">
                    {stripHtml(featured.description)}
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-[14px] font-semibold text-primary">
                    <span>Read More</span>
                    <span className="material-symbols-rounded text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* 5 smaller cards */}
          <div className="grid grid-cols-1 gap-6 lg:col-span-7 sm:grid-cols-2">
            {rest.slice(0, 4).map((item, i) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Link
                  href={`/news/${item.slug}`}
                  className="group flex h-full min-h-[164px] gap-4 rounded-[5px] border border-slate-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-[5px] bg-slate-100">
                    <NewsImage
                      src={buildImageUrl(item.featimage)}
                      alt={item.topic}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                        {formatDate(item.created_at)}
                      </p>
                      <h4 className="line-clamp-3 text-[15px] font-bold leading-snug text-slate-800 transition-colors group-hover:text-primary">
                        {item.topic}
                      </h4>
                      <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
                        {stripHtml(item.description)}
                      </p>
                    </div>
                    <span className="mt-3 flex items-center gap-1 text-[12px] font-semibold text-primary">
                      Read
                      <span className="material-symbols-rounded text-[14px] transition-transform group-hover:translate-x-0.5">arrow_forward</span>
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
