import { getDb } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

// ─── Constants ────────────────────────────────────────────────────────────────

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200";
const ACCENT = "#FF3C3C";

const CATEGORY_LABELS = [
  "EDUCATION", "ADMISSIONS", "EXAM ALERTS",
  "CAREER NEWS", "SCHOLARSHIPS", "CAMPUS NEWS",
];

const AUTHOR_NAMES = [
  "AdmissionX Desk", "Priya Sharma", "Rahul Mehta",
  "Sarah Williams", "James Chen", "Editorial Team",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildImageUrl(raw: string | null | undefined): string {
  if (!raw || !raw.trim()) return DEFAULT_IMAGE;
  if (raw.startsWith("http") || raw.startsWith("/"))
    return `/api/image-proxy?url=${encodeURIComponent(raw)}`;
  return `/api/image-proxy?url=${encodeURIComponent(`${IMAGE_BASE}${raw}`)}`;
}

function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
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
    return new Date(dateStr).toLocaleDateString("en-US", {
      day: "numeric", month: "long", year: "numeric",
    });
  } catch { return ""; }
}

function authorInitials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function parseIds(raw: string | null | undefined): number[] {
  if (!raw) return [];
  return raw.split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n) && n > 0);
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const db = await getDb();
  const item = await db
    .collection("news")
    .findOne({ slug, isactive: 1 }, { projection: { topic: 1, description: 1 } });
  if (!item) return { title: "News Not Found | AdmissionX" };
  const desc = stripHtml(item.description as string).slice(0, 160);
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
  const db = await getDb();

  const raw = await db.collection("news").findOne({ slug, isactive: 1 });
  if (!raw) notFound();

  const typeIds = parseIds(raw.newstypeids as string);
  const tagIds  = parseIds(raw.newstagsids as string);

  const [typeDocs, tagDocs] = await Promise.all([
    typeIds.length
      ? db.collection("news_types").find({ id: { $in: typeIds } }).project({ id: 1, name: 1, slug: 1 }).toArray()
      : Promise.resolve([]),
    tagIds.length
      ? db.collection("news_tags").find({ id: { $in: tagIds } }).project({ id: 1, name: 1, slug: 1 }).toArray()
      : Promise.resolve([]),
  ]);

  // Related news
  let relatedDocs: Record<string, unknown>[] = [];
  if (typeIds.length) {
    relatedDocs = await db
      .collection("news")
      .find({ isactive: 1, id: { $ne: raw.id } })
      .sort({ created_at: -1 })
      .limit(3)
      .project({ id: 1, topic: 1, featimage: 1, description: 1, slug: 1, created_at: 1 })
      .toArray();
  }
  if (relatedDocs.length < 3) {
    const excludeIds = [raw.id, ...relatedDocs.map((r) => r.id)];
    const extras = await db
      .collection("news")
      .find({ isactive: 1, id: { $nin: excludeIds } })
      .sort({ created_at: -1 })
      .limit(3 - relatedDocs.length)
      .project({ id: 1, topic: 1, featimage: 1, description: 1, slug: 1, created_at: 1 })
      .toArray();
    relatedDocs = [...relatedDocs, ...extras];
  }

  const heroImg   = buildImageUrl((raw.fullimage ?? raw.featimage) as string | null);
  const rt        = readTime(raw.description as string);
  const date      = formatDate(raw.created_at as string);
  const lastUpdated = formatDate((raw.updated_at ?? raw.created_at) as string);
  const category  = typeDocs[0]?.name as string | undefined;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* ── Rich-text CSS ── */}
      <style>{`
        .news-body { font-family: 'Inter', system-ui, sans-serif; }
        .news-body p {
          font-size: 17px;
          line-height: 1.85;
          color: #3a3a3a;
          margin-bottom: 22px;
        }
        .news-body h1, .news-body h2 {
          font-size: 26px;
          font-weight: 700;
          color: #111;
          margin: 40px 0 16px;
          line-height: 1.3;
        }
        .news-body h3 {
          font-size: 20px;
          font-weight: 700;
          color: #111;
          margin: 32px 0 12px;
        }
        .news-body blockquote {
          border-left: 4px solid ${ACCENT};
          background: #fafafa;
          margin: 36px 0;
          padding: 20px 28px;
          border-radius: 0 6px 6px 0;
          font-size: 17px;
          font-style: italic;
          color: #444;
          line-height: 1.7;
        }
        .news-body blockquote p { margin-bottom: 0; font-size: 17px; color: #444; }
        .news-body ul, .news-body ol {
          padding-left: 28px;
          margin-bottom: 24px;
        }
        .news-body li {
          font-size: 16px;
          line-height: 1.75;
          color: #3a3a3a;
          margin-bottom: 8px;
        }
        .news-body a { color: ${ACCENT}; text-decoration: underline; }
        .news-body img {
          width: 100%;
          border-radius: 6px;
          margin: 32px 0;
          display: block;
        }
        .news-body strong { color: #111; font-weight: 700; }
        .news-body hr { border: none; border-top: 1px solid #e5e7eb; margin: 40px 0; }
        .news-body table { width: 100%; border-collapse: collapse; margin: 32px 0; font-size: 15px; }
        .news-body th { background: #f5f5f5; font-weight: 700; padding: 12px 16px; border: 1px solid #e5e7eb; text-align: left; }
        .news-body td { padding: 12px 16px; border: 1px solid #e5e7eb; color: #444; }
      `}</style>

      <main className="pt-[68px] sm:pt-[76px] pb-24 bg-white">

        {/* ── Article Header ── */}
        <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 pt-10 pb-2">

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs text-neutral-400 mb-6">
            <Link href="/" className="hover:text-neutral-700 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/news" className="hover:text-neutral-700 transition-colors">News</Link>
            <span>/</span>
            <span className="text-neutral-500 line-clamp-1">{raw.topic as string}</span>
          </nav>

          {/* Category pill */}
          <div className="mb-5">
            <span
              className="inline-block text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full"
              style={{ backgroundColor: "#FFF0F0", color: ACCENT }}
            >
              {category ?? "NEWS"}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-[28px] sm:text-[36px] md:text-[44px] font-bold text-neutral-900 leading-[1.2] mb-7">
            {raw.topic as string}
          </h1>

          {/* Author / meta row */}
          <div className="flex flex-wrap items-center gap-4 mb-10">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{ backgroundColor: ACCENT }}
              >
                AD
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-800">AdmissionX Desk</p>
                <p className="text-xs text-neutral-400">News Editorial</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-neutral-400 ml-auto">
              <span>{date}</span>
              <span>·</span>
              <span>{rt}</span>
            </div>
          </div>

          {/* Tags row */}
          {tagDocs.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {tagDocs.map((tag, i) => (
                <Link
                  key={String(tag._id)}
                  href={`/news?tag=${tag.slug}`}
                  className="text-[11px] font-bold px-3 py-1 rounded-full border border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-[#FF3C3C] hover:text-[#FF3C3C] transition-colors"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── Full-width Hero Image ── */}
        <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 mb-12">
          <div className="relative w-full aspect-[21/9] rounded-[8px] overflow-hidden bg-neutral-100 shadow-sm">
            <Image
              src={heroImg}
              alt={raw.topic as string}
              fill
              className="object-cover"
              priority
              quality={85}
              sizes="100vw"
            />
          </div>
        </div>

        {/* ── Article Body ── */}
        <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-24">
          <article
            className="news-body"
            dangerouslySetInnerHTML={{ __html: (raw.description as string) ?? "" }}
          />

          {/* Back + Last updated bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-16 pt-8 border-t border-neutral-100">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-[#FF3C3C] transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to News
            </Link>
            <span className="text-xs text-neutral-400">Last updated: {lastUpdated}</span>
          </div>

          {/* ── Related News ── */}
          {relatedDocs.length > 0 && (
            <div className="mt-20 pt-12 border-t border-neutral-100">
              <h3 className="text-[22px] font-bold text-neutral-900 mb-8">
                You might also like
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {relatedDocs.map((r, idx) => {
                  const rImg    = buildImageUrl(r.featimage as string);
                  const rCat    = CATEGORY_LABELS[idx % CATEGORY_LABELS.length]!;
                  const rAuthor = AUTHOR_NAMES[idx % AUTHOR_NAMES.length]!;
                  const rDate   = formatDate(r.created_at as string);
                  return (
                    <Link
                      key={String(r._id)}
                      href={`/news/${r.slug}`}
                      className="group flex flex-col bg-white border border-neutral-100 rounded-[6px] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                    >
                      {/* Image */}
                      <div className="relative aspect-[16/10] bg-neutral-100 overflow-hidden flex-shrink-0">
                        <Image
                          src={rImg}
                          alt={r.topic as string}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                      {/* Body */}
                      <div className="p-4 flex flex-col flex-1">
                        <span
                          className="text-[10px] font-bold tracking-widest uppercase mb-2"
                          style={{ color: ACCENT }}
                        >
                          {rCat}
                        </span>
                        <h4 className="text-[14px] font-bold text-neutral-900 leading-snug line-clamp-2 mb-3 group-hover:text-[#FF3C3C] transition-colors flex-1">
                          {r.topic as string}
                        </h4>
                        {/* Author + date */}
                        <div className="flex items-center gap-2 mt-auto pt-3 border-t border-neutral-100">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                            style={{ backgroundColor: ACCENT }}
                          >
                            {authorInitials(rAuthor)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-neutral-700 truncate">{rAuthor}</p>
                            <p className="text-[10px] text-neutral-400">{rDate}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
