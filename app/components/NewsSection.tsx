"use client";

import Link from "next/link";
import { motion } from "framer-motion";

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

const articles: Article[] = [
  {
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2670&auto=format&fit=crop",
    category: "Admissions",
    categoryColor: "text-red-600",
    categoryBg: "bg-red-50",
    time: "2 hours ago",
    readTime: "5 min read",
    title: "Fall 2026 Admission Deadlines Announced for Ivy League Universities",
    excerpt:
      "Most Ivy League universities have released their application deadlines for the upcoming fall semester. Early decision applications are due by November 1st.",
    author: "Priya Sharma",
    authorRole: "Admissions Expert",
    href: "/news/ivy-league-deadlines",
  },
  {
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2670&auto=format&fit=crop",
    category: "Exam Alert",
    categoryColor: "text-orange-600",
    categoryBg: "bg-orange-50",
    time: "1 day ago",
    readTime: "4 min read",
    title: "GMAT Focus Edition: Everything You Need to Know About the New Format",
    excerpt:
      "The Graduate Management Admission Council has introduced the new GMAT Focus Edition. Learn about the changes in format and scoring.",
    author: "Rahul Mehta",
    authorRole: "Test Prep Coach",
    href: "/news/gmat-focus",
  },
  {
    image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=2649&auto=format&fit=crop",
    category: "Scholarships",
    categoryColor: "text-teal-600",
    categoryBg: "bg-teal-50",
    time: "3 days ago",
    readTime: "7 min read",
    title: "Top 10 Scholarships for International Students in 2026",
    excerpt:
      "Funding your education abroad can be challenging. We've compiled a list of the most generous scholarship programs available globally.",
    author: "Ananya Gupta",
    authorRole: "Financial Aid Advisor",
    href: "/blogs/scholarships-2026",
  },
  {
    image: "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2686&auto=format&fit=crop",
    category: "Campus Life",
    categoryColor: "text-violet-600",
    categoryBg: "bg-violet-50",
    time: "5 days ago",
    readTime: "6 min read",
    title: "How to Choose the Right University: A Student's Complete Guide",
    excerpt:
      "Choosing a university is one of the biggest decisions you'll make. Here's a data-driven framework to help you decide.",
    author: "Arjun Patel",
    authorRole: "Career Counselor",
    href: "/blogs/choosing-university",
  },
];

const featured = articles[0];
const rest = articles.slice(1);

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

export default function NewsSection() {
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
            href="/news"
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
                <img
                  src={featured.image}
                  alt={featured.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                {/* Category + Time overlay */}
                <div className="absolute top-5 left-5 flex items-center gap-2">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${featured.categoryBg} ${featured.categoryColor}`}>
                    {featured.category}
                  </span>
                </div>
                <div className="absolute bottom-5 left-5 flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs font-medium text-white/80 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    {featured.time}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-medium text-white/80 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">
                    <span className="material-symbols-outlined text-[14px]">menu_book</span>
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
                      <span className="material-symbols-outlined text-red-500 text-lg">person</span>
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
              <motion.article key={article.title} variants={itemVariants} className="flex-1">
                <Link
                  href={article.href}
                  className="group flex gap-4 bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:shadow-lg hover:shadow-neutral-900/5 transition-all duration-500 p-4 h-full"
                >
                  {/* Thumbnail */}
                  <div className="relative w-28 sm:w-32 flex-shrink-0 rounded-xl overflow-hidden self-stretch min-h-[100px]">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col justify-center flex-1 min-w-0 py-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${article.categoryBg} ${article.categoryColor}`}>
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
          </div>
        </motion.div>
      </div>
    </section>
  );
}
