import { getDb } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlogImage from "@/app/components/BlogImage";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ExploreCards from "@/app/components/ExploreCards";
import BlogFilters from "@/app/components/BlogFilters";

export const dynamic = "force-dynamic";

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
const GRID_SIZE = 9;
const ACCENT = "#FF3B30";

const CATEGORY_LABELS = ["STUDENT LIFE", "ADMISSIONS", "EXAM TIPS", "CAREER", "SCHOLARSHIPS", "CAMPUS LIFE"];
const AUTHOR_NAMES = ["Emily Watson", "Sarah Williams", "James Chen", "Priya Sharma", "AdmissionX Editorial", "Alex Rivera"];

export const metadata: Metadata = {
  title: "Education Blogs — Insights, Tips & Guides | AdmissionX",
  description:
    "Explore expert articles on admissions, entrance exams, career guidance, scholarships, and campus life. Stay updated with AdmissionX education blogs.",
};

function buildImageUrl(raw: string | null | undefined): string {
  if (!raw || !raw.trim()) return "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
  if (raw.startsWith("/")) return `/api/image-proxy?url=${encodeURIComponent(raw)}`;
  if (raw.startsWith("http")) return `/api/image-proxy?url=${encodeURIComponent(raw)}`;
  return `/api/image-proxy?url=${encodeURIComponent(`${IMAGE_BASE}${raw}`)}`;
}

function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function excerpt(text: string, max = 130): string {
  const clean = stripHtml(text);
  if (clean.length <= max) return clean;
  return clean.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

function readTime(html: string | null | undefined): string {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

function formatHeroDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(dateStr));
  } catch {
    return "";
  }
}

type BlogRow = {
  _id: unknown;
  topic: string;
  slug: string;
  featimage?: string | null;
  description?: string | null;
  created_at?: string | null;
};

function totalBlogPages(total: number, q: string): number {
  if (total <= 0) return 0;
  if (q) return Math.ceil(total / GRID_SIZE);
  if (total <= 10) return 1;
  return 1 + Math.ceil((total - 10) / GRID_SIZE);
}

export default async function BlogsListingPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; sort?: string }>;
}) {
  const { page: pageParam, q: qParam, sort: sortParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const q = (qParam ?? "").trim();
  const currentSort: "latest" | "oldest" = sortParam === "oldest" ? "oldest" : "latest";
  const createdAtSort = currentSort === "oldest" ? 1 : -1;

  const db = await getDb();

  const filter: Record<string, any> = {
    isactive: 1,
    slug: { $exists: true, $ne: "" },
  };

  if (q) {
    const keywords = q.split(/\s+/).filter(Boolean);
    if (keywords.length > 0) {
      filter.$and = keywords.map((k) => ({
        $or: [
          { topic: { $regex: k, $options: "i" } },
          { description: { $regex: k, $options: "i" } },
        ],
      }));
    }
  }

  const total = await db.collection("blogs").countDocuments(filter);
  const totalPages = totalBlogPages(total, q);

  if (totalPages > 0 && currentPage > totalPages) notFound();

  let skip: number;
  let limit: number;
  if (q) {
    skip = (currentPage - 1) * GRID_SIZE;
    limit = GRID_SIZE;
  } else if (currentPage === 1) {
    skip = 0;
    limit = 10;
  } else {
    skip = 10 + (currentPage - 2) * GRID_SIZE;
    limit = GRID_SIZE;
  }

  const rawBlogs = await db
    .collection("blogs")
    .find(filter)
    .sort({ created_at: createdAtSort })
    .skip(skip)
    .limit(limit)
    .project({ id: 1, topic: 1, featimage: 1, description: 1, slug: 1, created_at: 1 })
    .toArray();

  const blogs = rawBlogs as unknown as BlogRow[];

  // Dynamic hero: if searching, use the very first result found; otherwise use the latest across all blogs
  let featured: BlogRow | null = null;
  if (q && blogs.length > 0) {
    featured = blogs[0];
  } else {
    const featuredRaw = await db
      .collection("blogs")
      .find({ isactive: 1, slug: { $exists: true, $ne: "" } })
      .sort({ created_at: -1 })
      .limit(1)
      .project({ id: 1, topic: 1, featimage: 1, description: 1, slug: 1, created_at: 1 })
      .toArray();
    featured = (featuredRaw[0] as unknown as BlogRow) ?? null;
  }
  const gridBlogs = blogs;

  function href(p: number) {
    const params = new URLSearchParams();
    if (p > 1) params.set("page", String(p));
    if (q) params.set("q", q);
    if (currentSort !== "latest") params.set("sort", currentSort);
    const qs = params.toString();
    return `/blogs${qs ? `?${qs}` : ""}`;
  }

  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 4) pages.push("…");
    const s = Math.max(2, currentPage - 2);
    const e = Math.min(totalPages - 1, currentPage + 2);
    for (let i = s; i <= e; i++) pages.push(i);
    if (currentPage < totalPages - 3) pages.push("…");
    pages.push(totalPages);
  }

  function authorInitials(name: string) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0]![0] + parts[1]![0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-[72px] sm:pt-20 pb-16 w-full">
        <div className="w-full max-w-none mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 2xl:px-10">
          <div className="pt-2 sm:pt-3" />
          {/* Hero — featured */}
          {featured && (
            <section
              className="mb-10 rounded-[5px] border border-neutral-200/90 overflow-hidden bg-neutral-100 relative"
              style={{ backgroundImage: `url("${encodeURI("/Background-images/f0b10acfd1d98e25c40741fa92c81454f3557e55 (1).png")}")`, backgroundSize: "cover", backgroundPosition: "right", backgroundRepeat: "no-repeat" }}
            >
              <div className="relative flex flex-col lg:flex-row lg:items-stretch">
                <div className="flex-1 p-6 sm:p-8 lg:p-12 flex flex-col justify-center order-2 lg:order-1 min-h-[320px] lg:min-h-[380px]">
                  <Link href={`/blogs/${featured.slug}`} className="group mb-4 block">
                    <h1 
                      style={{ fontWeight: 700, fontSize: "32px", color: "#3E3E3E" }}
                      className="leading-tight group-hover:opacity-80 transition-opacity"
                    >
                      Advanced Global Analysis & Exam Intelligence Report | Admission X
                    </h1>
                  </Link>
                  <p 
                    className="leading-relaxed line-clamp-3 mb-5"
                    style={{ fontWeight: 500, fontSize: "20px", color: "#3E3E3EB5" }}
                  >
                    {excerpt(featured.description ?? "", 480) ||
                      "An Advanced Global Analysis & Exam Intelligence Report is a comprehensive, data-driven document that examines examination systems, question patterns, and student performance across different regions or education boards to generate meaningful insights for smarter preparation and decision-making. It combines historical exam data, statistical analysis, and predictive techniques to identify important trends such as frequently asked topics, changing difficulty levels, and…"}
                  </p>
                  <p className="text-xs text-neutral-400 mb-6">
                    <span>By Sarah Williams</span>
                    {formatHeroDate(featured.created_at) && (
                      <>
                        <span className="mx-2">·</span>
                        <span>{formatHeroDate(featured.created_at)}</span>
                      </>
                    )}
                    <span className="mx-2">·</span>
                    <span>{readTime(featured.description)}</span>
                  </p>
                  <Link
                    href={`/blogs/${featured.slug}`}
                    className="inline-flex items-center justify-center px-6 py-3 rounded-[5px] text-sm font-bold text-white shadow-sm hover:opacity-95 transition-opacity w-fit"
                    style={{ backgroundColor: "#D40C11" }}
                  >
                    Read Article
                  </Link>
                </div>
                <Link
                  href={`/blogs/${featured.slug}`}
                  className="relative w-full lg:w-[35%] min-h-[260px] lg:min-h-[380px] shrink-0 order-1 lg:order-2 lg:m-0 lg:rounded-none overflow-hidden"
                >
                  <BlogImage
                    src={buildImageUrl(featured.featimage)}
                    alt={featured.topic}
                    className="w-full h-full min-h-[260px] lg:min-h-full object-cover rounded-none"
                  />
                  <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-l from-transparent to-white/75 hidden lg:block" />
                </Link>
              </div>
            </section>
          )}

          {/* Search + filters */}
          <BlogFilters currentQuery={q} currentSort={currentSort} />

          {q && (
            <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-neutral-600">
                <span className="font-semibold text-neutral-800">{total}</span> result{total !== 1 ? "s" : ""} for{" "}
                <span className="font-semibold" style={{ color: ACCENT }}>
                  &quot;{q}&quot;
                </span>
              </span>
              <Link href="/blogs" className="text-xs font-semibold text-neutral-500 hover:text-red-600 transition-colors">
                Clear
              </Link>
            </div>
          )}



          {blogs.length === 0 ? (
            <div className="rounded-[5px] border border-dashed border-neutral-200 py-20 text-center px-4">
              <span className="material-symbols-outlined text-[40px] text-neutral-300 mb-3 block">article</span>
              <p className="font-bold text-neutral-800 mb-1">{q ? `No results for "${q}"` : "No blogs yet"}</p>
              <p className="text-sm text-neutral-500 mb-6 max-w-sm mx-auto">
                {q ? "Try different keywords or browse all articles." : "Check back soon for expert education content."}
              </p>
              {q && (
                <Link
                  href="/blogs"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-[5px] text-sm font-bold text-white"
                  style={{ backgroundColor: ACCENT }}
                >
                  Browse all blogs
                </Link>
              )}
            </div>
          ) : (
            <>
              {gridBlogs.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-6 xl:gap-8">
                  {gridBlogs.map((blog, idx) => {
                    const img = buildImageUrl(blog.featimage);
                    const desc = excerpt(blog.description ?? "", 110);
                    const rt = readTime(blog.description);
                    const cat = CATEGORY_LABELS[idx % CATEGORY_LABELS.length];
                    const author = AUTHOR_NAMES[idx % AUTHOR_NAMES.length];
                    return (
                      <article
                        key={String(blog._id)}
                        className="flex flex-col rounded-[5px] border border-neutral-200/90 bg-white overflow-hidden shadow-sm hover:shadow-md hover:border-neutral-300/80 transition-all"
                      >
                        <Link href={`/blogs/${blog.slug}`} className="relative block h-48 bg-neutral-100 shrink-0 overflow-hidden group">
                          <BlogImage
                            src={img}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                          />
                        </Link>
                        <div className="p-5 flex flex-col flex-1">
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-[11px] font-bold tracking-wide" style={{ color: ACCENT }}>
                              {cat}
                            </span>
                            <span className="text-[11px] text-neutral-400 font-medium">{rt}</span>
                          </div>
                          <Link href={`/blogs/${blog.slug}`}>
                            <h2 className="text-base font-bold text-neutral-900 leading-snug line-clamp-2 mb-2 hover:opacity-80 transition-opacity">
                              {blog.topic}
                            </h2>
                          </Link>
                          {desc && <p className="text-sm text-neutral-500 leading-relaxed line-clamp-3 flex-1 mb-4">{desc}</p>}
                          <div className="flex items-center gap-2 pt-3 mt-auto border-t border-neutral-100">
                            <div
                              className="w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center text-[11px] font-bold text-neutral-600 shrink-0"
                              aria-hidden
                            >
                              {authorInitials(author)}
                            </div>
                            <span className="text-xs text-neutral-500 font-medium">{author}</span>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-1 flex-wrap">
                  {currentPage > 1 ? (
                    <Link
                      href={href(currentPage - 1)}
                      className="w-9 h-9 flex items-center justify-center rounded-[5px] border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                      aria-label="Previous page"
                    >
                      <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                    </Link>
                  ) : (
                    <span className="w-9 h-9 flex items-center justify-center rounded-[5px] border border-neutral-100 text-neutral-300">
                      <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                    </span>
                  )}
                  {pages.map((p, i) =>
                    p === "…" ? (
                      <span key={`e${i}`} className="w-9 h-9 flex items-center justify-center text-sm text-neutral-400 select-none">
                        …
                      </span>
                    ) : (
                      <Link
                        key={p}
                        href={href(p as number)}
                        className={`w-9 h-9 rounded-[5px] text-sm font-bold flex items-center justify-center transition-colors ${
                          p === currentPage ? "text-white" : "border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                        }`}
                        style={p === currentPage ? { backgroundColor: ACCENT } : undefined}
                      >
                        {p}
                      </Link>
                    ),
                  )}
                  {currentPage < totalPages ? (
                    <Link
                      href={href(currentPage + 1)}
                      className="w-9 h-9 flex items-center justify-center rounded-[5px] border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                      aria-label="Next page"
                    >
                      <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                    </Link>
                  ) : (
                    <span className="w-9 h-9 flex items-center justify-center rounded-[5px] border border-neutral-100 text-neutral-300">
                      <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Explore Cards */}
        <div className="mt-16">
          <ExploreCards />
        </div>
      </main>

      <Footer />
    </div>
  );
}
