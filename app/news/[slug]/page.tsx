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
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200";

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

function readTime(html: string | null | undefined): string {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
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

function parseIds(raw: string | null | undefined): number[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && n > 0);
}

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[news/[slug]/page.tsx safeQuery]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface NewsRow extends RowDataPacket {
  id: number;
  topic: string;
  featimage: string | null;
  fullimage: string | null;
  description: string | null;
  isactive: number;
  slug: string;
  newstypeids: string | null;
  newstagsids: string | null;
  created_at: string;
}

interface NewsTypeRow extends RowDataPacket {
  id: number;
  name: string;
  slug: string;
}

interface NewsTagRow extends RowDataPacket {
  id: number;
  name: string;
  slug: string;
}

// ─── generateMetadata ─────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const rows = await safeQuery<NewsRow>(
    "SELECT topic, description FROM news WHERE slug = ? AND isactive = 1 LIMIT 1",
    [slug],
  );
  if (!rows.length) return { title: "News Not Found | AdmissionX" };
  const item = rows[0];
  const desc = stripHtml(item.description).slice(0, 160);
  return {
    title: `${item.topic} | AdmissionX News`,
    description: desc || "Read this news article on AdmissionX.",
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // ── Fetch news item ────────────────────────────────────────────────────────
  const newsRows = await safeQuery<NewsRow>(
    "SELECT * FROM news WHERE slug = ? AND isactive = 1 LIMIT 1",
    [slug],
  );
  if (!newsRows.length) notFound();
  const item = newsRows[0];

  // ── Resolve type IDs ───────────────────────────────────────────────────────
  const typeIds = parseIds(item.newstypeids);
  const types: NewsTypeRow[] =
    typeIds.length > 0
      ? await safeQuery<NewsTypeRow>(
          `SELECT id, name, slug FROM news_types WHERE id IN (${typeIds.map(() => "?").join(",")})`,
          typeIds,
        )
      : [];

  // ── Resolve tag IDs ────────────────────────────────────────────────────────
  const tagIds = parseIds(item.newstagsids);
  const tags: NewsTagRow[] =
    tagIds.length > 0
      ? await safeQuery<NewsTagRow>(
          `SELECT id, name, slug FROM news_tags WHERE id IN (${tagIds.map(() => "?").join(",")})`,
          tagIds,
        )
      : [];

  // ── Related news (same type preferred, fallback to recent) ─────────────────
  let related: NewsRow[] = [];
  if (typeIds.length > 0) {
    const conditions = typeIds.map(() => `FIND_IN_SET(?, newstypeids) > 0`).join(" OR ");
    related = await safeQuery<NewsRow>(
      `SELECT id, topic, featimage, description, slug, newstypeids, created_at
       FROM news
       WHERE isactive = 1 AND id != ? AND (${conditions})
       ORDER BY created_at DESC
       LIMIT 3`,
      [item.id, ...typeIds],
    );
  }
  if (related.length < 3) {
    const excludeIds = [item.id, ...related.map((r) => r.id)];
    const placeholders = excludeIds.map(() => "?").join(",");
    const extras = await safeQuery<NewsRow>(
      `SELECT id, topic, featimage, description, slug, newstypeids, created_at
       FROM news
       WHERE isactive = 1 AND id NOT IN (${placeholders})
       ORDER BY created_at DESC
       LIMIT ${3 - related.length}`,
      excludeIds,
    );
    related = [...related, ...extras];
  }

  // ── Sidebar tag cloud (all active tags) ────────────────────────────────────
  const allTags = await safeQuery<NewsTagRow>(
    "SELECT id, name, slug FROM news_tags ORDER BY name ASC LIMIT 30",
  );

  const heroImg = buildImageUrl(item.fullimage ?? item.featimage);
  const rt = readTime(item.description);
  const date = formatDate(item.created_at);
  const ago = timeAgo(item.created_at);
  const ico = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };
  const icoFill = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

  const TAG_COLORS = [
    "text-blue-700 bg-blue-50 border-blue-200",
    "text-violet-700 bg-violet-50 border-violet-200",
    "text-emerald-700 bg-emerald-50 border-emerald-200",
    "text-amber-700 bg-amber-50 border-amber-200",
    "text-cyan-700 bg-cyan-50 border-cyan-200",
    "text-rose-700 bg-rose-50 border-rose-200",
    "text-indigo-700 bg-indigo-50 border-indigo-200",
    "text-teal-700 bg-teal-50 border-teal-200",
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="relative h-[460px] md:h-[540px] overflow-hidden">
          <Image
            src={heroImg}
            alt={item.topic}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/20" />
          <div className="relative z-10 h-full flex flex-col justify-end px-4 pb-10 max-w-6xl mx-auto w-full">

            {/* Breadcrumb */}
            <nav className="flex items-center flex-wrap gap-1 text-white/70 text-sm mb-4">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span className="material-symbols-rounded text-base" style={ico}>chevron_right</span>
              <Link href="/news" className="hover:text-white transition-colors">News</Link>
              <span className="material-symbols-rounded text-base" style={ico}>chevron_right</span>
              <span className="text-white/90 line-clamp-1">{item.topic}</span>
            </nav>

            {/* Type badges */}
            {types.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {types.map((t) => (
                  <Link
                    key={t.id}
                    href={`/news?type=${t.slug}`}
                    className="text-xs font-semibold bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-500 transition-colors"
                  >
                    {t.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight max-w-3xl mb-4">
              {item.topic}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-5 text-white/80 text-sm">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-rounded text-base" style={ico}>calendar_today</span>
                {date}
              </span>
              {ago && (
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-rounded text-base" style={ico}>schedule</span>
                  {ago}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-rounded text-base" style={ico}>timer</span>
                {rt}
              </span>
            </div>
          </div>
        </section>

        {/* ── Body ──────────────────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex flex-col lg:flex-row gap-10">

            {/* ── Article (2/3) ──────────────────────────────────────────── */}
            <article className="lg:w-2/3 min-w-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 md:p-10">

                {/* Tag chips above article */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-7 pb-6 border-b border-gray-100">
                    {tags.map((tag, i) => (
                      <Link
                        key={tag.id}
                        href={`/news?tag=${tag.slug}`}
                        className={`text-xs font-medium px-3 py-1 rounded-full border transition-colors hover:opacity-80 ${TAG_COLORS[i % TAG_COLORS.length]}`}
                      >
                        #{tag.name}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Rich text body */}
                <div
                  className="rich-text"
                  dangerouslySetInnerHTML={{ __html: item.description ?? "" }}
                />

                {/* Bottom tag strip */}
                {tags.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Tagged</p>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, i) => (
                        <Link
                          key={tag.id}
                          href={`/news?tag=${tag.slug}`}
                          className={`text-xs font-medium px-3 py-1 rounded-full border transition-colors hover:opacity-80 ${TAG_COLORS[i % TAG_COLORS.length]}`}
                        >
                          #{tag.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Back link */}
              <div className="mt-6">
                <Link
                  href="/news"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <span className="material-symbols-rounded text-base" style={ico}>arrow_back</span>
                  Back to News
                </Link>
              </div>
            </article>

            {/* ── Sidebar (1/3) ──────────────────────────────────────────── */}
            <aside className="lg:w-1/3 flex flex-col gap-6">

              {/* Related News */}
              {related.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="material-symbols-rounded text-blue-600 text-xl" style={icoFill}>newspaper</span>
                    Related News
                  </h3>
                  <ul className="flex flex-col gap-4">
                    {related.map((r) => (
                      <li key={r.id}>
                        <Link href={`/news/${r.slug}`} className="flex gap-3 group">
                          <div className="relative w-[72px] h-[56px] rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                            <Image
                              src={buildImageUrl(r.featimage)}
                              alt={r.topic}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="72px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
                              {r.topic}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">{formatDate(r.created_at)}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/news"
                    className="mt-5 flex items-center justify-center gap-1.5 text-sm font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-xl py-2.5 transition-colors"
                  >
                    View all news
                    <span className="material-symbols-rounded text-base" style={ico}>arrow_forward</span>
                  </Link>
                </div>
              )}

              {/* Tags cloud */}
              {allTags.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="material-symbols-rounded text-blue-600 text-xl" style={icoFill}>sell</span>
                    Browse by Tag
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag, i) => (
                      <Link
                        key={tag.id}
                        href={`/news?tag=${tag.slug}`}
                        className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors hover:opacity-80 ${
                          tagIds.includes(tag.id)
                            ? "bg-blue-600 text-white border-blue-600"
                            : TAG_COLORS[i % TAG_COLORS.length]
                        }`}
                      >
                        #{tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Sidebar CTA */}
              <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white">
                <span className="material-symbols-rounded text-3xl mb-3 block" style={icoFill}>feed</span>
                <h3 className="font-bold text-lg mb-2">Stay Informed</h3>
                <p className="text-sm text-blue-100 mb-5 leading-relaxed">
                  Get the latest education news, admission alerts, and scholarship updates — all in one place.
                </p>
                <Link
                  href="/news"
                  className="inline-flex items-center gap-1.5 bg-white text-blue-600 font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-blue-50 transition-colors"
                >
                  Browse all news
                  <span className="material-symbols-rounded text-base" style={ico}>arrow_forward</span>
                </Link>
              </div>

            </aside>
          </div>
        </div>

        {/* ── Bottom CTA ────────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 py-16 px-4 mt-4">
          <div className="max-w-4xl mx-auto text-center">
            <span
              className="material-symbols-rounded text-4xl text-white/60 mb-4 block"
              style={icoFill}
            >
              newspaper
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Stay Ahead with AdmissionX News
            </h2>
            <p className="text-blue-100 mb-8 text-base max-w-xl mx-auto">
              Exam notifications, admission alerts, scholarship deadlines — never miss what matters.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/news"
                className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-7 py-3 rounded-full hover:bg-blue-50 transition-colors shadow-md"
              >
                <span className="material-symbols-rounded text-lg" style={icoFill}>newspaper</span>
                All News
              </Link>
              <Link
                href="/education-blogs"
                className="inline-flex items-center gap-2 bg-blue-800/60 text-white font-semibold px-7 py-3 rounded-full hover:bg-blue-800/80 transition-colors shadow-md border border-blue-400/50"
              >
                <span className="material-symbols-rounded text-lg" style={icoFill}>library_books</span>
                Education Blogs
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
