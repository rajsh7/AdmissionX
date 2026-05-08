import { getDb } from "@/lib/db";
import Link from "next/link";
import BlogImage from "@/app/components/BlogImage";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

// ─── Constants ────────────────────────────────────────────────────────────────

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
const DEFAULT_IMAGE = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
const ACCENT = "#FF3C3C";

const CATEGORY_LABELS = [
  "STUDENT LIFE", "ADMISSIONS", "EXAM TIPS",
  "CAREER", "SCHOLARSHIPS", "CAMPUS LIFE",
];
const AUTHOR_NAMES = [
  "Emily Watson", "Sarah Williams", "James Chen",
  "Priya Sharma", "AdmissionX Editorial", "Alex Rivera",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildImageUrl(raw: string | null | undefined): string {
  if (!raw || !raw.trim()) return DEFAULT_IMAGE;
  if (raw.startsWith("/") || raw.startsWith("http"))
    return `/api/image-proxy?url=${encodeURIComponent(raw)}`;
  return `/api/image-proxy?url=${encodeURIComponent(`${IMAGE_BASE}${raw}`)}`;
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
    return new Date(dateStr).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function authorInitials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

interface BlogRow {
  id: number;
  topic: string;
  featimage: string | null;
  fullimage: string | null;
  description: string | null;
  isactive: number;
  slug: string;
  created_at: string;
  updated_at: string;
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
    .collection("blogs")
    .findOne({ slug, isactive: 1 }, { projection: { topic: 1, description: 1 } });
  if (!item) return { title: "Blog Not Found | AdmissionX" };
  const desc = stripHtml(item.description as string).slice(0, 160);
  return {
    title: `${item.topic} | AdmissionX`,
    description: desc || "Read this article on AdmissionX.",
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const db = await getDb();

  const raw = await db.collection("blogs").findOne({ slug, isactive: 1 });
  if (!raw) notFound();

  const blog: BlogRow = {
    id: raw.id,
    topic: raw.topic,
    featimage: raw.featimage ?? null,
    fullimage: raw.fullimage ?? null,
    description: raw.description ?? null,
    isactive: raw.isactive,
    slug: raw.slug,
    created_at: raw.created_at,
    updated_at: raw.updated_at ?? raw.created_at,
  };

  const relatedDocs = await db
    .collection("blogs")
    .find({ isactive: 1, id: { $ne: blog.id } })
    .sort({ created_at: -1 })
    .limit(3)
    .project({ id: 1, topic: 1, featimage: 1, description: 1, slug: 1, created_at: 1 })
    .toArray();

  const related: BlogRow[] = relatedDocs.map((r) => ({
    id: r.id,
    topic: r.topic,
    featimage: r.featimage ?? null,
    fullimage: null,
    description: r.description ?? null,
    isactive: 1,
    slug: r.slug,
    created_at: r.created_at,
    updated_at: r.created_at,
  }));

  const heroImg = buildImageUrl(blog.fullimage ?? blog.featimage);
  const rt = readTime(blog.description);
  const date = formatDate(blog.created_at);
  const lastUpdated = formatDate(blog.updated_at || blog.created_at);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* ── Rich-text CSS injected once ── */}
      <style>{`
        .blog-body { font-family: 'Inter', system-ui, sans-serif; }
        .blog-body p {
          font-size: 17px;
          line-height: 1.85;
          color: #3a3a3a;
          margin-bottom: 22px;
        }
        .blog-body h1, .blog-body h2 {
          font-size: 26px;
          font-weight: 700;
          color: #111;
          margin: 40px 0 16px;
          line-height: 1.3;
        }
        .blog-body h3 {
          font-size: 20px;
          font-weight: 700;
          color: #111;
          margin: 32px 0 12px;
        }
        .blog-body blockquote {
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
        .blog-body blockquote p { margin-bottom: 0; font-size: 17px; color: #444; }
        .blog-body ul, .blog-body ol {
          padding-left: 28px;
          margin-bottom: 24px;
        }
        .blog-body li {
          font-size: 16px;
          line-height: 1.75;
          color: #3a3a3a;
          margin-bottom: 8px;
        }
        .blog-body a { color: ${ACCENT}; text-decoration: underline; }
        .blog-body img {
          width: 100%;
          border-radius: 6px;
          margin: 32px 0;
          display: block;
        }
        .blog-body strong { color: #111; font-weight: 700; }
        .blog-body hr { border: none; border-top: 1px solid #e5e7eb; margin: 40px 0; }
        .blog-body table { width: 100%; border-collapse: collapse; margin: 32px 0; font-size: 15px; }
        .blog-body th { background: #f5f5f5; font-weight: 700; padding: 12px 16px; border: 1px solid #e5e7eb; text-align: left; }
        .blog-body td { padding: 12px 16px; border: 1px solid #e5e7eb; color: #444; }
      `}</style>

      <main className="pt-[68px] sm:pt-[76px] pb-24 bg-white">

        {/* ── Article Header ── */}
        <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 pt-10 pb-2">

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs text-neutral-400 mb-6">
            <Link href="/" className="hover:text-neutral-700 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blogs" className="hover:text-neutral-700 transition-colors">Blogs</Link>
            <span>/</span>
            <span className="text-neutral-500 line-clamp-1">{blog.topic}</span>
          </nav>

          {/* Category pill */}
          <div className="mb-5">
            <span
              className="inline-block text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full"
              style={{ backgroundColor: "#FFF0F0", color: ACCENT }}
            >
              STUDENT LIFE
            </span>
          </div>

          {/* Title */}
          <h1 className="text-[28px] sm:text-[36px] md:text-[44px] font-bold text-neutral-900 leading-[1.2] mb-7">
            {blog.topic}
          </h1>

          {/* Author / meta row */}
          <div className="flex flex-wrap items-center gap-4 mb-10">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{ backgroundColor: ACCENT }}
              >
                SW
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-800">Sarah Williams</p>
                <p className="text-xs text-neutral-400">AdmissionX Editorial</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-neutral-400 ml-auto">
              <span>{date}</span>
              <span>·</span>
              <span>{rt}</span>
            </div>
          </div>
        </div>

        {/* ── Full-width Hero Image ── */}
        <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 mb-12">
          <div className="relative w-full aspect-[21/9] rounded-[8px] overflow-hidden bg-neutral-100 shadow-sm">
            <BlogImage
              src={heroImg}
              alt={blog.topic}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* ── Article Body ── */}
        <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-24">
          <article
            className="blog-body"
            dangerouslySetInnerHTML={{ __html: blog.description ?? "" }}
          />

          {/* Back + Last updated bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-16 pt-8 border-t border-neutral-100">
            <Link
              href="/blogs"
              className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-[#FF3C3C] transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Blogs
            </Link>
            <span className="text-xs text-neutral-400">Last updated: {lastUpdated}</span>
          </div>

          {/* ── Related Posts ── */}
          {related.length > 0 && (
            <div className="mt-20 pt-12 border-t border-neutral-100">
              <h3 className="text-[22px] font-bold text-neutral-900 mb-8">
                You might also like
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {related.map((r, idx) => {
                  const rImg = buildImageUrl(r.featimage);
                  const rCat = CATEGORY_LABELS[(idx + 1) % CATEGORY_LABELS.length]!;
                  const rAuthor = AUTHOR_NAMES[(idx + 1) % AUTHOR_NAMES.length]!;
                  const rDate = formatDate(r.created_at);
                  return (
                    <Link
                      key={r.id}
                      href={`/blogs/${r.slug}`}
                      className="group flex flex-col bg-white border border-neutral-100 rounded-[6px] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                    >
                      {/* Image */}
                      <div className="relative aspect-[16/10] bg-neutral-100 overflow-hidden flex-shrink-0">
                        <BlogImage
                          src={rImg}
                          alt={r.topic}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
                          {r.topic}
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
