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
const DEFAULT_NEWS_IMAGE =
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800";
const PAGE_SIZE = 12;

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Education News — Latest Updates | AdmissionX",
  description:
    "Stay updated with the latest education news — admission alerts, exam notifications, scholarship announcements, and campus updates.",
  keywords:
    "education news, admission news, exam news, scholarship news, college updates",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildImageUrl(raw: string | null | undefined): string {
  if (!raw || !raw.trim()) return DEFAULT_NEWS_IMAGE;
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

function excerpt(html: string | null | undefined, max = 130): string {
  const t = stripHtml(html);
  if (!t) return "";
  return t.length <= max ? t : t.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const d = Math.floor(diff / 86_400_000);
    const w = Math.floor(d / 7);
    const mo = Math.floor(d / 30);
    if (mo >= 1) return `${mo} month${mo > 1 ? "s" : ""} ago`;
    if (w >= 1) return `${w} week${w > 1 ? "s" : ""} ago`;
    if (d >= 1) return `${d} day${d > 1 ? "s" : ""} ago`;
    return "Today";
  } catch {
    return "";
  }
}

function estimateReadTime(html: string | null | undefined): string {
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
    console.error("[news/page.tsx safeQuery]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface NewsRow extends RowDataPacket {
  id: number;
  topic: string;
  featimage: string | null;
  description: string | null;
  slug: string;
  newstypeids: string | null;
  newstagsids: string | null;
  created_at: string;
}

interface NewsTypeRow extends RowDataPacket {
  id: number;
  name: string;
  slug: string;
  news_count: number;
}

interface NewsTagRow extends RowDataPacket {
  id: number;
  name: string;
  slug: string;
}

interface CountRow extends RowDataPacket {
  total: number;
}

// ─── Tag colour palette ───────────────────────────────────────────────────────

const TAG_COLORS = [
  "text-red-700 bg-red-50 border-red-200",
  "text-blue-700 bg-blue-50 border-blue-200",
  "text-emerald-700 bg-emerald-50 border-emerald-200",
  "text-violet-700 bg-violet-50 border-violet-200",
  "text-amber-700 bg-amber-50 border-amber-200",
  "text-cyan-700 bg-cyan-50 border-cyan-200",
  "text-rose-700 bg-rose-50 border-rose-200",
  "text-indigo-700 bg-indigo-50 border-indigo-200",
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; type?: string; tag?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const activeType = (sp.type ?? "").trim().toLowerCase();
  const activeTag = (sp.tag ?? "").trim().toLowerCase();
  const q = (sp.q ?? "").trim();
  const offset = (page - 1) * PAGE_SIZE;

  // ── Resolve type/tag slugs to IDs ─────────────────────────────────────────
  let typeId: number | null = null;
  let tagId: number | null = null;

  const [allTypes, allTags] = await Promise.all([
    safeQuery<NewsTypeRow>(
      `SELECT nt.id, nt.name, nt.slug,
              COUNT(n.id) AS news_count
       FROM news_types nt
       LEFT JOIN news n ON FIND_IN_SET(nt.id, n.newstypeids) AND n.isactive = 1
       GROUP BY nt.id, nt.name, nt.slug
       HAVING news_count > 0
       ORDER BY news_count DESC, nt.name ASC`,
    ),
    safeQuery<NewsTagRow>(
      `SELECT id, name, slug FROM news_tags ORDER BY name ASC`,
    ),
  ]);

  if (activeType) {
    const found = allTypes.find((t) => t.slug.toLowerCase() === activeType);
    typeId = found?.id ?? null;
  }
  if (activeTag) {
    const found = allTags.find((t) => t.slug.toLowerCase() === activeTag);
    tagId = found?.id ?? null;
  }

  // ── Build WHERE ────────────────────────────────────────────────────────────
  const conditions: string[] = ["isactive = 1", "slug IS NOT NULL", "slug != ''"];
  const params: (string | number)[] = [];

  if (q) {
    conditions.push("(topic LIKE ? OR description LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }
  if (typeId !== null) {
    conditions.push("FIND_IN_SET(?, newstypeids)");
    params.push(typeId);
  }
  if (tagId !== null) {
    conditions.push("FIND_IN_SET(?, newstagsids)");
    params.push(tagId);
  }

  const where = `WHERE ${conditions.join(" AND ")}`;

  // ── Fetch news + count ─────────────────────────────────────────────────────
  const [news, countRows] = await Promise.all([
    safeQuery<NewsRow>(
      `SELECT id, topic, featimage, description, slug,
              newstypeids, newstagsids, created_at
       FROM news
       ${where}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total FROM news ${where}`,
      params,
    ),
  ]);

  const total = countRows[0]?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // ── Active filter labels ───────────────────────────────────────────────────
  const activeTypeName = allTypes.find(
    (t) => t.slug.toLowerCase() === activeType,
  )?.name;
  const activeTagName = allTags.find(
    (t) => t.slug.toLowerCase() === activeTag,
  )?.name;

  // ── Build URL helper ───────────────────────────────────────────────────────
  function buildUrl(overrides: Record<string, string | undefined>) {
    const merged: Record<string, string> = {};
    if (q) merged.q = q;
    if (activeType) merged.type = activeType;
    if (activeTag) merged.tag = activeTag;
    merged.page = String(page);
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === undefined) delete merged[k];
      else merged[k] = v;
    });
    if (merged.page === "1") delete merged.page;
    const qs = new URLSearchParams(merged).toString();
    return `/news${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="min-h-screen bg-neutral-50 relative">
      <div className="fixed inset-0 z-0 text-[0px] font-[0] leading-[0]">
        <Image
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=2000"
          alt="Campus Background"
          fill
          priority
          sizes="100vw"
          quality={80}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10">
        <Header />

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <div className="pt-24 pb-12">
          <div className="w-full px-4 lg:px-8 xl:px-12 flex flex-col items-center text-center">
            <nav className="flex items-center justify-center gap-2 text-xs text-neutral-500 mb-6 font-medium">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-neutral-300">News</span>
            </nav>

            <div className="flex flex-col items-center gap-6">
              <div className="w-full max-w-2xl flex flex-col items-center">
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                    <span className="material-symbols-outlined text-[13px]">newspaper</span>
                    Education News
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-3">
                  Latest{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                    Education News
                  </span>
                </h1>
                <p className="text-neutral-400 text-sm leading-relaxed max-w-lg text-center">
                  Stay informed with the latest admission alerts, exam notifications,
                  scholarship announcements, and campus updates.
                </p>
              </div>

              {/* Stats */}
              <div className="flex justify-center gap-3 flex-shrink-0">
                <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-center min-w-[80px]">
                  <p className="text-2xl font-black text-white">{total}</p>
                  <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide mt-0.5">
                    Articles
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-center min-w-[80px]">
                  <p className="text-2xl font-black text-white">{allTypes.length}</p>
                  <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide mt-0.5">
                    Topics
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Search bar ───────────────────────────────────────────────────── */}
        <div className="border-neutral-100">
          <div className="w-full px-4 lg:px-8 xl:px-12 py-4 mx-auto flex justify-center">
            <form method="GET" action="/news" className="flex gap-3 max-w-xl">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-neutral-400">
                  search
                </span>
                <input
                  type="text"
                  name="q"
                  defaultValue={q}
                  placeholder="Search news…"
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
                {activeType && <input type="hidden" name="type" value={activeType} />}
                {activeTag && <input type="hidden" name="tag" value={activeTag} />}
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors whitespace-nowrap"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* ── Type filter chips ─────────────────────────────────────────────── */}
        {allTypes.length > 0 && (
          <div className=" border-neutral-100">
            <div className="w-full px-4 lg:px-8 xl:px-12 py-3 mx-auto">
              <div className="flex items-center justify-center gap-2 overflow-x-auto scrollbar-hide">
                <Link
                  href={buildUrl({ type: undefined, page: "1" })}
                  className={`inline-flex items-center gap-1.5 px-3  py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-colors ${!activeType
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-neutral-600 border-neutral-200 hover:border-blue-300 hover:text-blue-600"
                    }`}
                >
                  <span className="material-symbols-outlined text-[13px]">newspaper</span>
                  All News
                </Link>
                {allTypes.map((t) => (
                  <Link
                    key={t.id}
                    href={buildUrl({ type: t.slug, page: "1" })}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-colors ${activeType === t.slug.toLowerCase()
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-neutral-600 border-neutral-200 hover:border-blue-300 hover:text-blue-600"
                      }`}
                  >
                    {t.name}
                    <span className="opacity-70 text-[10px]">({t.news_count})</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Main content ──────────────────────────────────────────────────── */}
        <div className="w-full px-4 lg:px-8 xl:px-12 py-10">
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* ── NEWS GRID ────────────────────────────────────────────────── */}
            <div className="flex-1 min-w-0">
              {/* Active filters / result count */}
              {(q || activeType || activeTag) && (
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-white">
                    {total} result{total !== 1 ? "s" : ""}
                    {q && <> for &ldquo;<strong>{q}</strong>&rdquo;</>}
                  </span>
                  {activeTypeName && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                      {activeTypeName}
                      <Link href={buildUrl({ type: undefined, page: "1" })} className="hover:text-red-500 transition-colors ml-0.5">
                        <span className="material-symbols-outlined text-[13px]">close</span>
                      </Link>
                    </span>
                  )}
                  {activeTagName && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-700 bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded-full">
                      #{activeTagName}
                      <Link href={buildUrl({ tag: undefined, page: "1" })} className="hover:text-red-500 transition-colors ml-0.5">
                        <span className="material-symbols-outlined text-[13px]">close</span>
                      </Link>
                    </span>
                  )}
                  {(q || activeType || activeTag) && (
                    <Link href="/news" className="text-xs text-neutral-400 hover:text-red-600 transition-colors underline underline-offset-2">
                      Clear all
                    </Link>
                  )}
                </div>
              )}

              {news.length === 0 ? (
                <EmptyState hasFilters={!!(q || activeType || activeTag)} />
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                    {news.map((item, idx) => (
                      <NewsCard key={item.id} item={item} colorIdx={idx} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-10 flex items-center justify-center gap-1.5 flex-wrap">
                      {page > 1 && (
                        <Link
                          href={buildUrl({ page: String(page - 1) })}
                          className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold text-neutral-600 bg-white border border-neutral-200 hover:border-blue-300 hover:text-blue-600 transition-all"
                        >
                          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                          Prev
                        </Link>
                      )}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                        .reduce<(number | "…")[]>((acc, p, i, arr) => {
                          if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("…");
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((p, i) =>
                          p === "…" ? (
                            <span key={`e${i}`} className="w-9 h-9 flex items-center justify-center text-neutral-400 text-sm select-none">…</span>
                          ) : (
                            <Link
                              key={p}
                              href={buildUrl({ page: String(p) })}
                              className={`w-9 h-9 rounded-xl text-sm font-bold flex items-center justify-center transition-all ${p === page
                                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                : "bg-white border border-neutral-200 text-neutral-600 hover:border-blue-300 hover:text-blue-600"
                                }`}
                            >
                              {p}
                            </Link>
                          ),
                        )}
                      {page < totalPages && (
                        <Link
                          href={buildUrl({ page: String(page + 1) })}
                          className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold text-neutral-600 bg-white border border-neutral-200 hover:border-blue-300 hover:text-blue-600 transition-all"
                        >
                          Next
                          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        </Link>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ── SIDEBAR ──────────────────────────────────────────────────── */}
            <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0 space-y-5">

              {/* Tags cloud */}
              {allTags.length > 0 && (
                <div className="bg-white rounded-2xl border border-neutral-100 p-5">
                  <h3 className="text-sm font-black text-neutral-800 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[17px] text-blue-500" style={{ fontVariationSettings: "'FILL' 1" }}>sell</span>
                    Browse by Tag
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {allTags.map((tag, i) => (
                      <Link
                        key={tag.id}
                        href={buildUrl({ tag: tag.slug, page: "1" })}
                        className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${activeTag === tag.slug.toLowerCase()
                          ? TAG_COLORS[i % TAG_COLORS.length].split(" ").slice(0, 2).join(" ") + " border-current ring-1 ring-current"
                          : TAG_COLORS[i % TAG_COLORS.length] + " hover:ring-1 hover:ring-current"
                          }`}
                      >
                        #{tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick links */}
              <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-neutral-100">
                  <h3 className="text-sm font-black text-neutral-800">Explore More</h3>
                </div>
                <div className="divide-y divide-neutral-50">
                  {[
                    { href: "/education-blogs", icon: "article", label: "Education Blogs", sub: "In-depth articles & guides" },
                    { href: "/examination", icon: "quiz", label: "Entrance Exams", sub: "Find exams by stream" },
                    { href: "/popular-careers", icon: "work", label: "Career Profiles", sub: "Explore career paths" },
                    { href: "/ask", icon: "forum", label: "Community Q&A", sub: "Ask & answer questions" },
                  ].map(({ href, icon, label, sub }) => (
                    <Link key={href} href={href} className="flex items-center gap-3 px-5 py-4 hover:bg-neutral-50 transition-colors group">
                      <div className="w-9 h-9 rounded-xl bg-neutral-100 group-hover:bg-blue-50 flex items-center justify-center flex-shrink-0 transition-colors">
                        <span className="material-symbols-outlined text-[17px] text-neutral-400 group-hover:text-blue-500 transition-colors">{icon}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-neutral-700 group-hover:text-blue-600 transition-colors">{label}</p>
                        <p className="text-[10px] text-neutral-400">{sub}</p>
                      </div>
                      <span className="material-symbols-outlined text-[15px] text-neutral-300 group-hover:text-blue-400 transition-colors">arrow_forward_ios</span>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}

// ─── NewsCard ─────────────────────────────────────────────────────────────────

function NewsCard({ item, colorIdx }: { item: NewsRow; colorIdx: number }) {
  const imgUrl = buildImageUrl(item.featimage);
  const desc = excerpt(item.description);
  const ago = timeAgo(item.created_at);
  const readMin = estimateReadTime(item.description);
  const color = TAG_COLORS[colorIdx % TAG_COLORS.length];

  return (
    <Link
      href={`/news/${item.slug}`}
      className="group flex flex-col bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:shadow-lg hover:shadow-neutral-200/60 hover:border-neutral-200 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-44 bg-neutral-100 overflow-hidden flex-shrink-0">
        <Image
          src={imgUrl}
          alt={item.topic}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 350px"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {ago && (
          <span className="absolute bottom-3 left-3 text-[10px] font-bold text-white/90 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
            {ago}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${color}`}>
            News
          </span>
          <span className="text-[10px] text-neutral-400">{readMin}</span>
        </div>

        <h2 className="text-sm font-black text-neutral-900 leading-snug mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
          {item.topic}
        </h2>

        {desc && (
          <p className="text-xs text-neutral-500 leading-relaxed line-clamp-3 flex-1 mb-3">
            {desc}
          </p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-neutral-100 mt-auto">
          <span className="text-[11px] text-neutral-400 font-medium">AdmissionX News</span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:gap-2 transition-all">
            Read
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center mb-5">
        <span className="material-symbols-outlined text-[36px] text-blue-400" style={{ fontVariationSettings: "'FILL' 1" }}>
          newspaper
        </span>
      </div>
      <h3 className="text-lg font-black text-white mb-2">
        {hasFilters ? "No matching news" : "No news yet"}
      </h3>
      <p className="text-sm text-neutral-300 max-w-xs leading-relaxed mb-6">
        {hasFilters
          ? "Try adjusting your filters or search term."
          : "Check back soon for the latest education updates."}
      </p>
      {hasFilters && (
        <Link
          href="/news"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          Clear filters
        </Link>
      )}
    </div>
  );
}
