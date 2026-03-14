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
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200";

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

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[blogs/[slug]/page.tsx safeQuery]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface BlogRow extends RowDataPacket {
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const rows = await safeQuery<BlogRow>(
    "SELECT topic, description FROM blogs WHERE slug = ? AND isactive = 1 LIMIT 1",
    [slug],
  );
  if (!rows.length) return { title: "Blog Not Found | AdmissionX" };
  const blog = rows[0];
  const desc = stripHtml(blog.description).slice(0, 160);
  return {
    title: `${blog.topic} | AdmissionX`,
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

  // ── Fetch blog ─────────────────────────────────────────────────────────────
  const blogs = await safeQuery<BlogRow>(
    "SELECT * FROM blogs WHERE slug = ? AND isactive = 1 LIMIT 1",
    [slug],
  );
  if (!blogs.length) notFound();
  const blog = blogs[0];

  // ── Related posts (3 most recent, exclude current) ────────────────────────
  const related = await safeQuery<BlogRow>(
    `SELECT id, topic, featimage, description, slug, created_at
     FROM blogs
     WHERE isactive = 1 AND id != ?
     ORDER BY created_at DESC
     LIMIT 3`,
    [blog.id],
  );

  const heroImg = buildImageUrl(blog.fullimage ?? blog.featimage);
  const rt = readTime(blog.description);
  const date = formatDate(blog.created_at);
  const ico = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };
  const icoFill = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="relative h-[460px] md:h-[540px] overflow-hidden">
          <Image
            src={heroImg}
            alt={blog.topic}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/15" />
          <div className="relative z-10 h-full flex flex-col justify-end px-4 pb-10 max-w-6xl mx-auto w-full">
            {/* Breadcrumb */}
            <nav className="flex items-center flex-wrap gap-1 text-white/70 text-sm mb-4">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span className="material-symbols-rounded text-base" style={ico}>chevron_right</span>
              <Link href="/education-blogs" className="hover:text-white transition-colors">Education Blogs</Link>
              <span className="material-symbols-rounded text-base" style={ico}>chevron_right</span>
              <span className="text-white/90 line-clamp-1">{blog.topic}</span>
            </nav>

            {/* Title */}
            <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight max-w-3xl mb-4">
              {blog.topic}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-5 text-white/80 text-sm">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-rounded text-base" style={ico}>schedule</span>
                {rt}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-rounded text-base" style={ico}>calendar_today</span>
                {date}
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
                <div
                  className="rich-text"
                  dangerouslySetInnerHTML={{ __html: blog.description ?? "" }}
                />
              </div>

              {/* Share / nav strip */}
              <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
                <Link
                  href="/education-blogs"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
                >
                  <span className="material-symbols-rounded text-base" style={ico}>arrow_back</span>
                  Back to Education Blogs
                </Link>
                <span className="text-xs text-gray-400">
                  Last updated: {formatDate(blog.updated_at || blog.created_at)}
                </span>
              </div>
            </article>

            {/* ── Sidebar (1/3) ──────────────────────────────────────────── */}
            <aside className="lg:w-1/3 flex flex-col gap-6">

              {/* About AdmissionX */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="material-symbols-rounded text-red-600 text-xl" style={icoFill}>school</span>
                  About AdmissionX
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  AdmissionX is India&apos;s trusted education platform helping students navigate college admissions,
                  entrance exams, career choices, and scholarships. Our expert-curated content empowers you to make
                  informed decisions about your academic journey.
                </p>
                <Link
                  href="/education-blogs"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
                >
                  Browse all articles
                  <span className="material-symbols-rounded text-base" style={ico}>arrow_forward</span>
                </Link>
              </div>

              {/* Related Posts */}
              {related.length > 0 && (
                <div className="rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="material-symbols-rounded text-red-600 text-xl" style={icoFill}>article</span>
                    Related Posts
                  </h3>
                  <ul className="flex flex-col gap-4">
                    {related.map((r) => (
                      <li key={r.id}>
                        <Link href={`/blogs/${r.slug}`} className="flex gap-3 group">
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
                            <p className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-red-600 transition-colors leading-snug">
                              {r.topic}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">{formatDate(r.created_at)}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/education-blogs"
                    className="mt-5 flex items-center justify-center gap-1.5 text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 rounded-xl py-2.5 transition-colors"
                  >
                    View all articles
                    <span className="material-symbols-rounded text-base" style={ico}>arrow_forward</span>
                  </Link>
                </div>
              )}

              {/* Sidebar CTA */}
              <div className="rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 p-6 text-white">
                <span className="material-symbols-rounded text-3xl mb-3 block" style={icoFill}>library_books</span>
                <h3 className="font-bold text-lg mb-2">Explore More Articles</h3>
                <p className="text-sm text-red-100 mb-5 leading-relaxed">
                  Stay updated with the latest education insights, admission tips, and career guidance.
                </p>
                <Link
                  href="/education-blogs"
                  className="inline-flex items-center gap-1.5 bg-white text-red-600 font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-red-50 transition-colors"
                >
                  Browse blogs
                  <span className="material-symbols-rounded text-base" style={ico}>arrow_forward</span>
                </Link>
              </div>

            </aside>
          </div>
        </div>

        {/* ── Bottom CTA ────────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-r from-red-600 via-red-700 to-rose-700 py-16 px-4 mt-4">
          <div className="max-w-4xl mx-auto text-center">
            <span
              className="material-symbols-rounded text-4xl text-white/60 mb-4 block"
              style={icoFill}
            >
              newspaper
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Never Miss an Education Update
            </h2>
            <p className="text-red-100 mb-8 text-base max-w-xl mx-auto">
              From admission deadlines to exam tips — stay ahead with AdmissionX.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/education-blogs"
                className="inline-flex items-center gap-2 bg-white text-red-600 font-semibold px-7 py-3 rounded-full hover:bg-red-50 transition-colors shadow-md"
              >
                <span className="material-symbols-rounded text-lg" style={icoFill}>library_books</span>
                All Education Blogs
              </Link>
              <Link
                href="/news"
                className="inline-flex items-center gap-2 bg-red-800/60 text-white font-semibold px-7 py-3 rounded-full hover:bg-red-800/80 transition-colors shadow-md border border-red-400/50"
              >
                <span className="material-symbols-rounded text-lg" style={icoFill}>feed</span>
                Latest News
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
