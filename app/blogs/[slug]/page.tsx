import { getDb } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import BlogImage from "@/app/components/BlogImage";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

// ─── Constants ────────────────────────────────────────────────────────────────

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
const DEFAULT_IMAGE = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildImageUrl(raw: string | null | undefined): string {
  if (!raw || !raw.trim()) return DEFAULT_IMAGE;
  if (raw.startsWith("/")) return `/api/image-proxy?url=${encodeURIComponent(raw)}`;
  if (raw.startsWith("http")) {
    return `/api/image-proxy?url=${encodeURIComponent(raw)}`;
  }
  const remoteUrl = `${IMAGE_BASE}${raw}`;
  return `/api/image-proxy?url=${encodeURIComponent(remoteUrl)}`;
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

// ─── generateMetadata ─────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const db = await getDb();
  const item = await db.collection("blogs").findOne({ slug, isactive: 1 }, { projection: { topic: 1, description: 1 } });
  if (!item) return { title: "Blog Not Found | AdmissionX" };
  const desc = stripHtml(item.description as string).slice(0, 160);
  return { title: `${item.topic} | AdmissionX`, description: desc || "Read this article on AdmissionX." };
}

// ─── Styles & Icons ──────────────────────────────────────────────────────────

const ICO_STYLE = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };
const ICO_FILL_STYLE = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();

  const raw = await db.collection("blogs").findOne({ slug, isactive: 1 });
  if (!raw) notFound();
  const blog: BlogRow = { id: raw.id, topic: raw.topic, featimage: raw.featimage ?? null, fullimage: raw.fullimage ?? null, description: raw.description ?? null, isactive: raw.isactive, slug: raw.slug, created_at: raw.created_at, updated_at: raw.updated_at ?? raw.created_at };

  const relatedDocs = await db.collection("blogs")
    .find({ isactive: 1, id: { $ne: blog.id } })
    .sort({ created_at: -1 }).limit(3)
    .project({ id: 1, topic: 1, featimage: 1, description: 1, slug: 1, created_at: 1 }).toArray();
  const related: BlogRow[] = relatedDocs.map((r) => ({ id: r.id, topic: r.topic, featimage: r.featimage ?? null, fullimage: null, description: r.description ?? null, isactive: 1, slug: r.slug, created_at: r.created_at, updated_at: r.created_at }));

  const heroImg = buildImageUrl(blog.fullimage ?? blog.featimage);
  const rt = readTime(blog.description);
  const date = formatDate(blog.created_at);

  return (
    <>
      <Header />
      <main className="min-h-screen relative overflow-hidden bg-neutral-900">
        {/* ── Background Layer ── */}
        <div className="fixed inset-0 z-0">
          <BlogImage
            src={heroImg}
            alt={blog.topic}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px]" />
        </div>

        {/* ── Content Layer ── */}
        <div className="relative z-10">
          {/* Hero Section */}
          <section className="relative h-[460px] md:h-[540px] flex flex-col items-center justify-center text-center">
            {/* Darker localized overlay to ensure text is ALWAYS readable */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />

            {/* Centered Hero Content */}
            <div className="relative z-20 w-full px-4 lg:px-8 xl:px-12 flex flex-col items-center">
              {/* Breadcrumbs */}
              <nav className="flex items-center justify-center flex-wrap gap-1 text-white/70 text-sm mb-6">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <span className="material-symbols-rounded text-base" style={ICO_STYLE}>chevron_right</span>
                <Link href="/blogs" className="hover:text-white transition-colors">Education Blogs</Link>
                <span className="material-symbols-rounded text-base" style={ICO_STYLE}>chevron_right</span>
                <span className="text-white/90 line-clamp-1">{blog.topic}</span>
              </nav>

              <h1 className="text-3xl md:text-5xl font-black text-white leading-tight max-w-4xl mb-6 drop-shadow-lg">
                {blog.topic}
              </h1>

              <div className="flex flex-wrap items-center justify-center gap-6 text-white text-sm font-medium">
                <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                  <span className="material-symbols-rounded text-base text-red-500" style={ICO_FILL_STYLE}>schedule</span>
                  {rt}
                </span>
                <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                  <span className="material-symbols-rounded text-base text-red-500" style={ICO_FILL_STYLE}>calendar_today</span>
                  {date}
                </span>
              </div>
            </div>
          </section>

          {/* Main Content Area */}
          <div className="w-full px-4 lg:px-8 xl:px-12 py-10">
            <div className="flex flex-col lg:flex-row gap-10">
              {/* Article */}
              <article className="lg:w-2/3 min-w-0">
                <section className="bg-white rounded-2xl shadow-xl border border-white/10 p-7 md:p-10">
                  <div
                    className="rich-text text-black prose prose-neutral max-w-none prose-headings:font-black prose-headings:text-neutral-900 prose-p:text-neutral-700 hover:prose-a:text-red-600 transition-colors"
                    dangerouslySetInnerHTML={{ __html: blog.description ?? "" }}
                  />
                </section>

                <div className="mt-6 flex items-center justify-between flex-wrap gap-4 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10">
                  <Link
                    href="/blogs"
                    className="inline-flex items-center gap-2 text-sm font-bold text-white hover:text-red-400 transition-colors"
                  >
                    <span className="material-symbols-rounded text-base" style={ICO_STYLE}>arrow_back</span>
                    Back to Education Blogs
                  </Link>
                  <span className="text-xs text-neutral-300 font-semibold">
                    Last updated: {formatDate(blog.updated_at || blog.created_at)}
                  </span>
                </div>
              </article>

              {/* Sidebar */}
              <aside className="lg:w-1/3 flex flex-col gap-8">
                <div className="bg-white rounded-2xl shadow-xl border border-white/10 p-6">
                  <h3 className="text-lg font-black text-black mb-4 flex items-center gap-2">
                    <span className="material-symbols-rounded text-red-600 text-xl" style={ICO_FILL_STYLE}>school</span>
                    About AdmissionX
                  </h3>
                  <p className="text-sm text-neutral-600 font-medium leading-relaxed">
                    AdmissionX is India&apos;s trusted education platform helping students navigate college admissions,
                    entrance exams, career choices, and scholarships.
                  </p>
                  <Link
                    href="/blogs"
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-red-600 hover:text-red-700 transition-colors"
                  >
                    Browse all articles
                    <span className="material-symbols-rounded text-base" style={ICO_STYLE}>arrow_forward</span>
                  </Link>
                </div>

                {related.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-xl border border-white/10 p-6">
                    <h3 className="text-lg font-black text-black mb-5 flex items-center gap-2 uppercase tracking-tight">
                      <span className="material-symbols-rounded text-red-600 text-xl" style={ICO_FILL_STYLE}>article</span>
                      Related Posts
                    </h3>
                    <ul className="flex flex-col gap-5">
                      {related.map((r) => (
                        <li key={r.id}>
                          <Link href={`/blogs/${r.slug}`} className="flex gap-4 group">
                            <div className="relative w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100 shadow-sm">
                              <BlogImage
                                src={buildImageUrl(r.featimage)}
                                alt={r.topic}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                              <p className="text-sm font-bold text-neutral-900 line-clamp-2 group-hover:text-red-600 transition-colors leading-tight">
                                {r.topic}
                              </p>
                              <p className="text-[11px] text-neutral-500 font-bold mt-2">{formatDate(r.created_at)}</p>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="rounded-2xl bg-gradient-to-br from-neutral-900 to-black p-8 text-white shadow-2xl border border-white/10 overflow-hidden relative group">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-600/20 rounded-full blur-3xl group-hover:bg-red-600/30 transition-colors duration-500" />
                  <span className="material-symbols-rounded text-4xl mb-4 text-red-500 block" style={ICO_FILL_STYLE}>library_books</span>
                  <h3 className="font-black text-xl mb-3">Explore Insights</h3>
                  <p className="text-sm text-neutral-400 mb-6 leading-relaxed font-medium">
                    Stay updated with the latest education insights and career guidance.
                  </p>
                  <Link
                    href="/blogs"
                    className="inline-flex items-center gap-2 bg-red-600 text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-red-500 transition-all shadow-lg shadow-red-600/30"
                  >
                    Browse blogs
                    <span className="material-symbols-rounded text-base" style={ICO_STYLE}>arrow_forward</span>
                  </Link>
                </div>
              </aside>
            </div>
          </div>

          {/* Bottom CTA Section */}
          <section className="bg-black/60 backdrop-blur-xl border-y border-white/10 py-24 px-4 mt-12 overflow-hidden relative">
            <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none select-none">
              <span className="text-[200px] font-black tracking-tighter text-white">ADMISSIONX</span>
            </div>

            <div className="max-w-4xl mx-auto text-center flex flex-col items-center relative z-10">
              <div className="w-20 h-20 rounded-2xl bg-red-600/10 border border-red-600/20 flex items-center justify-center mb-8">
                <span className="material-symbols-rounded text-4xl text-red-500" style={ICO_FILL_STYLE}>newspaper</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
                Never Miss an Update
              </h2>
              <p className="text-neutral-400 mb-12 text-lg max-w-xl font-medium leading-relaxed">
                Exam deadlines, admission tips, and expert career guidance — all in one place.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/blogs"
                  className="inline-flex items-center gap-3 bg-red-600 text-white font-black px-10 py-5 rounded-2xl hover:bg-red-500 transition-all hover:scale-[1.02] shadow-xl shadow-red-600/20"
                >
                  <span className="material-symbols-rounded text-xl" style={ICO_FILL_STYLE}>library_books</span>
                  View All Blogs
                </Link>
                <Link
                  href="/news"
                  className="inline-flex items-center gap-3 bg-white/10 text-white font-black px-10 py-5 rounded-2xl hover:bg-white/20 transition-all hover:scale-[1.02] shadow-xl border border-white/20"
                >
                  <span className="material-symbols-rounded text-xl" style={ICO_FILL_STYLE}>feed</span>
                  Latest News
                </Link>
              </div>
            </div>
          </section>

          <Footer />
        </div>
      </main>
    </>
  );
}
