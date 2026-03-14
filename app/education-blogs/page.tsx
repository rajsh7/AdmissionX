import pool from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { RowDataPacket } from "mysql2";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

// ─── Constants ────────────────────────────────────────────────────────────────

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800";
const PAGE_SIZE = 12;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildImageUrl(raw: string | null | undefined): string {
  if (!raw || !raw.trim()) return DEFAULT_IMAGE;
  if (raw.startsWith("http")) return raw;
  return `${IMAGE_BASE}${raw}`;
}

function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function excerpt(text: string, max = 130): string {
  const clean = stripHtml(text);
  if (clean.length <= max) return clean;
  return clean.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

function timeAgo(dateStr: string): string {
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffDay = Math.floor(diffMs / 86_400_000);
    const diffWk = Math.floor(diffDay / 7);
    const diffMo = Math.floor(diffDay / 30);
    if (diffMo >= 1) return `${diffMo}mo ago`;
    if (diffWk >= 1) return `${diffWk}w ago`;
    if (diffDay >= 1) return `${diffDay}d ago`;
    return "Today";
  } catch { return ""; }
}

function readTime(html: string): string {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[education-blogs/page.tsx safeQuery]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface BlogRow extends RowDataPacket {
  id: number;
  topic: string;
  featimage: string | null;
  description: string | null;
  slug: string;
  created_at: string;
}

interface CountRow extends RowDataPacket {
  total: number;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Education Blogs — Insights, Tips & Guides | AdmissionX",
  description:
    "Explore expert articles on admissions, entrance exams, career guidance, scholarships, and campus life. Stay updated with AdmissionX education blogs.",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function EducationBlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { page: pageParam, q: qParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const q = (qParam ?? "").trim();
  const offset = (currentPage - 1) * PAGE_SIZE;

  const searchClause = q ? `AND (topic LIKE ? OR description LIKE ?)` : "";
  const searchBinds: string[] = q ? [`%${q}%`, `%${q}%`] : [];

  const baseWhere = `WHERE isactive = 1 AND slug IS NOT NULL AND slug != '' ${searchClause}`;

  const [blogs, countRows] = await Promise.all([
    safeQuery<BlogRow>(
      `SELECT id, topic, featimage, description, slug, created_at
       FROM blogs
       ${baseWhere}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...searchBinds, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total FROM blogs ${baseWhere}`,
      searchBinds,
    ),
  ]);

  const total = countRows[0]?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (currentPage > totalPages && total > 0) notFound();

  const featured = blogs[0] ?? null;
  const rest = blogs.slice(1);

  return (
    <div className="min-h-screen bg-neutral-50 relative">
      {/* ── Full Page Background ── */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=2000"
          alt="Campus Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10">
        <Header />

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <div className="pt-24 pb-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-neutral-300">Education Blogs</span>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                    <span className="material-symbols-outlined text-[13px]">article</span>
                    Education Blogs
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-3">
                  Insights, Tips &{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-400">
                    Guides
                  </span>
                </h1>
                <p className="text-neutral-400 text-sm leading-relaxed max-w-lg">
                  Expert articles on admissions, entrance exams, career guidance, scholarships, and campus life — everything you need to make the right academic decisions.
                </p>
              </div>

              {/* Stats */}
              <div className="flex gap-4 flex-shrink-0">
                <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-center min-w-[90px]">
                  <p className="text-2xl font-black text-white">{total}</p>
                  <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide mt-0.5">Articles</p>
                </div>
              </div>
            </div>

            {/* ── Search bar ── */}
            <form method="GET" className="mt-8 max-w-xl">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-neutral-500">
                  search
                </span>
                <input
                  type="search"
                  name="q"
                  defaultValue={q}
                  placeholder="Search blogs by topic or keyword…"
                  className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/15 rounded-xl text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-red-400 focus:bg-white/15 transition-all"
                />
                {q && (
                  <Link
                    href="/education-blogs"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                    aria-label="Clear search"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </Link>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* ── Quick-info strip ── */}
        <div className="border-neutral-100">
          <div className="mx-auto max-w-7xl px-7 sm:px-6 py-3">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {[
                { icon: "school", label: "Admissions" },
                { icon: "quiz", label: "Exam Tips" },
                { icon: "work", label: "Career Guidance" },
                { icon: "payments", label: "Scholarships" },
                { icon: "apartment", label: "Campus Life" },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs font-bold rounded-full bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 text-white">
                  <span className="material-symbols-outlined text-[15px] text-red-400">{icon}</span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">

          {/* Search context */}
          {q && (
            <div className="mb-6 flex items-center gap-3">
              <p className="text-sm text-neutral-300">
                Showing <span className="font-black text-white">{total}</span> result{total !== 1 ? "s" : ""} for{" "}
                <span className="font-black text-red-400">"{q}"</span>
              </p>
              <Link href="/education-blogs" className="text-xs font-bold text-neutral-400 hover:text-red-600 transition-colors">
                Clear
              </Link>
            </div>
          )}

          {blogs.length === 0 ? (
            <EmptyState q={q} />
          ) : (
            <>
              {/* Featured post */}
              {featured && !q && currentPage === 1 && (
                <FeaturedCard blog={featured} />
              )}

              {/* Grid */}
              {rest.length > 0 && (
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(q || currentPage > 1 ? blogs : rest).map((blog) => (
                    <BlogCard key={blog.id} blog={blog} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <PaginationBar
                    current={currentPage}
                    total={totalPages}
                    q={q}
                  />
                </div>
              )}
            </>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}

// ─── Featured Card ────────────────────────────────────────────────────────────

function FeaturedCard({ blog }: { blog: BlogRow }) {
  const img = buildImageUrl(blog.featimage);
  const desc = excerpt(blog.description ?? "", 200);
  const rt = readTime(blog.description ?? "");
  const time = timeAgo(blog.created_at);

  return (
    <Link
      href={`/blogs/${blog.slug}`}
      className="group block bg-white rounded-3xl border border-neutral-100 overflow-hidden hover:shadow-xl hover:shadow-neutral-200/60 hover:border-red-100 transition-all duration-300 mb-8"
    >
      <div className="flex flex-col lg:flex-row">
        <div className="relative lg:w-1/2 h-64 lg:h-auto bg-neutral-100 overflow-hidden flex-shrink-0">
          <Image
            src={img}
            alt={blog.topic}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized={img.startsWith("http") && !img.includes("unsplash")}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
              <span className="material-symbols-outlined text-[12px]">star</span>
              Featured
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-center p-7 lg:p-8 flex-1">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[11px] font-bold text-neutral-400">{time}</span>
            <span className="w-1 h-1 rounded-full bg-neutral-300" />
            <span className="text-[11px] font-bold text-neutral-400">{rt}</span>
          </div>
          <h2 className="text-xl lg:text-2xl font-black text-neutral-900 leading-snug mb-3 group-hover:text-red-600 transition-colors">
            {blog.topic}
          </h2>
          {desc && (
            <p className="text-sm text-neutral-500 leading-relaxed mb-5 line-clamp-3">{desc}</p>
          )}
          <div className="flex items-center gap-2 text-sm font-black text-red-600 group-hover:gap-3 transition-all">
            Read Article
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Blog Card ────────────────────────────────────────────────────────────────

const CARD_ACCENTS = [
  { dot: "bg-red-500", badge: "bg-red-50 text-red-700 border-red-100" },
  { dot: "bg-orange-500", badge: "bg-orange-50 text-orange-700 border-orange-100" },
  { dot: "bg-indigo-500", badge: "bg-indigo-50 text-indigo-700 border-indigo-100" },
  { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  { dot: "bg-purple-500", badge: "bg-purple-50 text-purple-700 border-purple-100" },
  { dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-100" },
];

function BlogCard({ blog, idx = 0 }: { blog: BlogRow; idx?: number }) {
  const img = buildImageUrl(blog.featimage);
  const desc = excerpt(blog.description ?? "", 110);
  const rt = readTime(blog.description ?? "");
  const time = timeAgo(blog.created_at);
  const accent = CARD_ACCENTS[idx % CARD_ACCENTS.length];

  return (
    <Link
      href={`/blogs/${blog.slug}`}
      className="group flex flex-col bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:shadow-lg hover:shadow-neutral-200/60 hover:border-red-100 transition-all duration-300"
    >
      <div className="relative h-44 bg-neutral-100 overflow-hidden flex-shrink-0">
        <Image
          src={img}
          alt={blog.topic}
          fill
          sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          unoptimized={img.startsWith("http") && !img.includes("unsplash")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${accent.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${accent.dot}`} />
            Education
          </span>
          <span className="text-[10px] font-bold text-white/80 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full">
            {rt}
          </span>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5">
        <p className="text-[10px] font-bold text-neutral-400 mb-2">{time}</p>
        <h3 className="text-sm font-black text-neutral-900 leading-snug mb-2 group-hover:text-red-600 transition-colors line-clamp-2">
          {blog.topic}
        </h3>
        {desc && (
          <p className="text-xs text-neutral-500 leading-relaxed line-clamp-3 flex-1 mb-4">
            {desc}
          </p>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
            <span className="material-symbols-outlined text-[13px]">person</span>
            AdmissionX Team
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-black text-red-600 group-hover:gap-2 transition-all">
            Read
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Pagination Bar ───────────────────────────────────────────────────────────

function PaginationBar({
  current,
  total,
  q,
}: {
  current: number;
  total: number;
  q: string;
}) {
  function href(p: number) {
    const params = new URLSearchParams();
    if (p > 1) params.set("page", String(p));
    if (q) params.set("q", q);
    const qs = params.toString();
    return `/education-blogs${qs ? `?${qs}` : ""}`;
  }

  const pages: (number | "…")[] = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 4) pages.push("…");
    const s = Math.max(2, current - 2);
    const e = Math.min(total - 1, current + 2);
    for (let i = s; i <= e; i++) pages.push(i);
    if (current < total - 3) pages.push("…");
    pages.push(total);
  }

  return (
    <>
      {current > 1 && (
        <Link href={href(current - 1)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-neutral-600 bg-white border border-neutral-200 hover:border-red-300 hover:text-red-600 transition-all">
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          <span className="hidden sm:inline">Prev</span>
        </Link>
      )}
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="w-9 h-9 flex items-center justify-center text-sm text-neutral-400">…</span>
        ) : (
          <Link
            key={p}
            href={href(p as number)}
            className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${p === current
              ? "bg-red-600 text-white shadow-md shadow-red-500/25 scale-105"
              : "bg-white border border-neutral-200 text-neutral-600 hover:border-red-300 hover:text-red-600"
              }`}
          >
            {p}
          </Link>
        )
      )}
      {current < total && (
        <Link href={href(current + 1)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-neutral-600 bg-white border border-neutral-200 hover:border-red-300 hover:text-red-600 transition-all">
          <span className="hidden sm:inline">Next</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </Link>
      )}
    </>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ q }: { q: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mb-5">
        <span className="material-symbols-outlined text-[36px] text-red-400" style={{ fontVariationSettings: "'FILL' 1" }}>
          article
        </span>
      </div>
      <h3 className="text-lg font-black text-white mb-2">
        {q ? `No results for "${q}"` : "No blogs yet"}
      </h3>
      <p className="text-sm text-neutral-300 max-w-xs leading-relaxed mb-6">
        {q ? "Try different keywords or browse all articles." : "Check back soon for expert education content."}
      </p>
      {q && (
        <Link href="/education-blogs" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors">
          <span className="material-symbols-outlined text-[17px]">article</span>
          Browse All Blogs
        </Link>
      )}
    </div>
  );
}
