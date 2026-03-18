"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { DbBlog } from "../api/home/latest-blogs/route";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Article {
  image: string;
  category: string;
  categoryColor: string;
  categoryBg: string;
  time: string;
  readTime: string;
  title: string;
  excerpt: string;
  author: string;
  authorRole: string;
  href: string;
}

interface NewsSectionProps {
  dbBlogs?: DbBlog[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  try {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    if (isNaN(then)) return "Recently";
    const diffMs = now - then;
    const diffMin = Math.floor(diffMs / 60_000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    const diffWk = Math.floor(diffDay / 7);
    const diffMo = Math.floor(diffDay / 30);

    if (diffMo >= 1) return `${diffMo} month${diffMo > 1 ? "s" : ""} ago`;
    if (diffWk >= 1) return `${diffWk} week${diffWk > 1 ? "s" : ""} ago`;
    if (diffDay >= 1) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
    if (diffHr >= 1) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
    if (diffMin >= 1) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
    return "Just now";
  } catch {
    return "Recently";
  }
}

function htmlToExcerpt(html: string, maxLen = 160): string {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > maxLen ? text.slice(0, maxLen).trimEnd() + "…" : text;
}

function estimateReadTime(html: string): string {
  const words = html
    .replace(/<[^>]+>/g, " ")
    .trim()
    .split(/\s+/).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
}

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2670&auto=format&fit=crop";

// Cycle through a small palette of category styles for visual variety
const CATEGORY_STYLES = [
  {
    category: "Admissions",
    categoryColor: "text-red-600",
    categoryBg: "bg-red-50",
  },
  {
    category: "Exam Alert",
    categoryColor: "text-orange-600",
    categoryBg: "bg-orange-50",
  },
  {
    category: "Scholarships",
    categoryColor: "text-teal-600",
    categoryBg: "bg-teal-50",
  },
  {
    category: "Campus Life",
    categoryColor: "text-violet-600",
    categoryBg: "bg-violet-50",
  },
];

function mapDbBlogToArticle(blog: DbBlog, index: number): Article {
  const style = CATEGORY_STYLES[index % CATEGORY_STYLES.length];
  return {
    image: blog.featimage ? `${IMAGE_BASE}${blog.featimage}` : FALLBACK_IMAGE,
    category: style.category,
    categoryColor: style.categoryColor,
    categoryBg: style.categoryBg,
    time: timeAgo(blog.created_at),
    readTime: estimateReadTime(blog.description ?? ""),
    title: blog.topic ?? "Untitled",
    excerpt: htmlToExcerpt(blog.description ?? ""),
    author: "AdmissionX Team",
    authorRole: "Education Expert",
    href: `/blogs/${blog.slug ?? ""}`,
  };
}

// ── Static fallback articles ──────────────────────────────────────────────────

const STATIC_ARTICLES: Article[] = [
  {
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2670&auto=format&fit=crop",
    category: "Admissions",
    categoryColor: "text-red-600",
    categoryBg: "bg-red-50",
    time: "2 hours ago",
    readTime: "5 min read",
    title: "Fall 2026 Admission Deadlines Announced for Top Universities",
    excerpt:
      "Most top universities have released their application deadlines for the upcoming fall semester. Early decision applications are due by November 1st.",
    author: "Priya Sharma",
    authorRole: "Admissions Expert",
    href: "/news/admission-deadlines",
  },
  {
    image:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2670&auto=format&fit=crop",
    category: "Exam Alert",
    categoryColor: "text-orange-600",
    categoryBg: "bg-orange-50",
    time: "1 day ago",
    readTime: "4 min read",
    title: "JEE Main 2026: Everything You Need to Know About the New Format",
    excerpt:
      "The National Testing Agency has introduced changes to the JEE Main 2026 exam. Learn about the revised pattern, scoring, and key dates.",
    author: "Rahul Mehta",
    authorRole: "Test Prep Coach",
    href: "/news/jee-main-2026",
  },
  {
    image:
      "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=2649&auto=format&fit=crop",
    category: "Scholarships",
    categoryColor: "text-teal-600",
    categoryBg: "bg-teal-50",
    time: "3 days ago",
    readTime: "7 min read",
    title: "Top 10 Scholarships for Indian Students in 2026",
    excerpt:
      "Funding your education can be challenging. We've compiled a list of the most generous scholarship programmes available for Indian students.",
    author: "Ananya Gupta",
    authorRole: "Financial Aid Advisor",
    href: "/blogs/scholarships-2026",
  },
  {
    image:
      "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2686&auto=format&fit=crop",
    category: "Campus Life",
    categoryColor: "text-violet-600",
    categoryBg: "bg-violet-50",
    time: "5 days ago",
    readTime: "6 min read",
    title: "How to Choose the Right College: A Student's Complete Guide",
    excerpt:
      "Choosing a college is one of the biggest decisions you'll make. Here's a data-driven framework to help you decide with confidence.",
    author: "Arjun Patel",
    authorRole: "Career Counselor",
    href: "/blogs/choosing-college",
  },
];

// ── Animation variants ────────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function NewsSection({ dbBlogs }: NewsSectionProps) {
  // Map DB blogs to Article shape; if none available, use static fallback
  const articles: Article[] =
    dbBlogs && dbBlogs.length > 0
      ? dbBlogs.map((b, i) => mapDbBlogToArticle(b, i))
      : STATIC_ARTICLES;

  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <section className="relative w-full py-20 lg:py-28 bg-neutral-50 overflow-hidden">
      <div className="absolute -top-32 left-0 w-[400px] h-[400px] bg-red-500/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        {/* ─── Chapter Heading ─── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14 lg:mb-16"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="chapter-number text-xs font-bold tracking-[0.25em] uppercase text-red-500">
                06
              </span>
              <div className="h-px w-8 bg-red-500/30" />
              <span className="text-xs font-semibold tracking-[0.15em] uppercase text-neutral-400">
                Stay Sharp
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-neutral-900 leading-[1.1]">
              Knowledge Is Power
            </h2>
            <p className="mt-4 text-lg text-neutral-500 font-light max-w-xl leading-relaxed">
              Stay ahead with the latest admission updates, exam alerts, and
              education insights.
            </p>
          </div>

          <Link
            href="/education-blogs"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
          >
            View all articles
            <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </Link>
        </motion.div>

        {/* ─── Magazine Layout: Featured + Sidebar ─── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 lg:grid-cols-5 gap-6"
        >
          {/* ── Featured Article (large, spans 3 cols) ── */}
          <motion.article variants={itemVariants} className="lg:col-span-3">
            <Link
              href={featured.href}
              className="group relative flex flex-col bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:shadow-xl hover:shadow-neutral-900/5 transition-all duration-500 h-full"
            >
              {/* Image */}
              <div className="relative h-64 sm:h-72 lg:h-80 overflow-hidden">
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 800px"
                  quality={85}
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                {/* Category + Time overlay */}
                <div className="absolute top-5 left-5 flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-3 py-1.5 rounded-full ${featured.categoryBg} ${featured.categoryColor}`}
                  >
                    {featured.category}
                  </span>
                </div>
                <div className="absolute bottom-5 left-5 flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs font-medium text-white/80 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">
                    <span className="material-symbols-outlined text-[14px]">
                      schedule
                    </span>
                    {featured.time}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-medium text-white/80 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">
                    <span className="material-symbols-outlined text-[14px]">
                      menu_book
                    </span>
                    {featured.readTime}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 lg:p-8 flex flex-col flex-1">
                <h3 className="text-xl lg:text-2xl font-bold text-neutral-900 leading-snug mb-3 group-hover:text-red-600 transition-colors line-clamp-2">
                  {featured.title}
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed mb-6 line-clamp-3 flex-1">
                  {featured.excerpt}
                </p>

                {/* Author + CTA */}
                <div className="flex items-center justify-between pt-5 border-t border-neutral-100">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-red-500 text-lg">
                        person
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-neutral-900">
                        {featured.author}
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        {featured.authorRole}
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-red-500 group-hover:gap-2.5 transition-all">
                    Read article
                    <span className="material-symbols-outlined text-base">
                      arrow_forward
                    </span>
                  </span>
                </div>
              </div>
            </Link>
          </motion.article>

          {/* ── Sidebar Articles (stacked, span 2 cols) ── */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {rest.map((article) => (
              <motion.article
                key={article.href}
                variants={itemVariants}
                className="flex-1"
              >
                <Link
                  href={article.href}
                  className="group flex gap-4 bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:shadow-lg hover:shadow-neutral-900/5 transition-all duration-500 p-4 h-full"
                >
                  {/* Thumbnail */}
                  <div className="relative w-28 sm:w-32 flex-shrink-0 rounded-xl overflow-hidden self-stretch min-h-[100px]">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      sizes="150px"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col justify-center flex-1 min-w-0 py-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded ${article.categoryBg} ${article.categoryColor}`}
                      >
                        {article.category}
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        {article.time}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-neutral-900 leading-snug mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                      {article.title}
                    </h4>

                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-[11px] text-neutral-400 font-medium">
                        {article.readTime}
                      </span>
                      <span className="material-symbols-outlined text-base text-neutral-300 group-hover:text-red-500 group-hover:translate-x-1 transition-all">
                        arrow_forward
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}

            {/* Fallback filler if fewer than 3 sidebar articles */}
            {rest.length === 0 && (
              <div className="flex-1 flex items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 p-8 text-neutral-400 text-sm font-medium">
                More articles coming soon
              </div>
            )}
          </div>
        </motion.div>

        {/* ─── View All CTA ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Link
            href="/education-blogs"
            className="group inline-flex items-center gap-3 bg-neutral-900 text-white font-bold text-sm px-7 py-4 rounded-2xl hover:bg-red-600 transition-all duration-300 shadow-lg hover:shadow-red-600/25"
          >
            Explore All Blogs & News
            <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
