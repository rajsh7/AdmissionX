import { getDb } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import BlogImage from "@/app/components/BlogImage";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export const dynamic = 'force-dynamic';
const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
const PAGE_SIZE = 12;

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

const CARD_ACCENTS = [
  { dot: "bg-red-500",     badge: "bg-red-50 text-red-700 border-red-100"         },
  { dot: "bg-orange-500",  badge: "bg-orange-50 text-orange-700 border-orange-100" },
  { dot: "bg-indigo-500",  badge: "bg-indigo-50 text-indigo-700 border-indigo-100" },
  { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  { dot: "bg-purple-500",  badge: "bg-purple-50 text-purple-700 border-purple-100" },
  { dot: "bg-amber-500",   badge: "bg-amber-50 text-amber-700 border-amber-100"   },
];

export default async function EducationBlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { page: pageParam, q: qParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const q = (qParam ?? "").trim();
  const offset = (currentPage - 1) * PAGE_SIZE;

  const db = await getDb();

  const filter: Record<string, unknown> = {
    isactive: 1,
    slug: { $exists: true, $ne: "" },
  };
  if (q) {
    filter.$or = [
      { topic: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ];
  }

  const [blogs, total] = await Promise.all([
    db.collection("blogs")
      .find(filter)
      .sort({ created_at: -1 })
      .skip(offset)
      .limit(PAGE_SIZE)
      .project({ id: 1, topic: 1, featimage: 1, description: 1, slug: 1, created_at: 1 })
      .toArray(),
    db.collection("blogs").countDocuments(filter),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (currentPage > totalPages && total > 0) notFound();

  const featured = blogs[0] ?? null;
  const rest = blogs.slice(1);

  function href(p: number) {
    const params = new URLSearchParams();
    if (p > 1) params.set("page", String(p));
    if (q) params.set("q", q);
    const qs = params.toString();
    return `/education-blogs${qs ? `?${qs}` : ""}`;
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

  return (
    <div className="min-h-screen bg-neutral-50 relative">
      <div className="fixed inset-0 z-0 text-[0px] font-[0] leading-[0]">
        <Image
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=2000"
          alt="Campus Background" fill priority sizes="100vw" quality={80} className="object-cover"
        />
        <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10">
        <Header />

        <div className="pt-24 pb-14">
          <div className="w-full px-4 lg:px-8 xl:px-12 flex flex-col items-center text-center">
            <nav className="flex items-center justify-center gap-2 text-xs text-neutral-500 mb-6 font-medium">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-neutral-300">Education Blogs</span>
            </nav>

            <div className="flex flex-col items-center gap-6">
              <div className="w-full max-w-2xl flex flex-col items-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                    <span className="material-symbols-outlined text-[13px]">article</span>
                    Education Blogs
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-3">
                  Insights, Tips &{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-400">Guides</span>
                </h1>
                <p className="text-neutral-400 text-sm leading-relaxed max-w-lg text-center">
                  Expert articles on admissions, entrance exams, career guidance, scholarships, and campus life.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-center min-w-[90px]">
                <p className="text-2xl font-black text-white">{total}</p>
                <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide mt-0.5">Articles</p>
              </div>
            </div>

            <form method="GET" className="mt-8 w-full flex justify-center max-w-xl mx-auto">
              <div className="relative w-full">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-neutral-500">search</span>
                <input
                  type="search" name="q" defaultValue={q}
                  placeholder="Search blogs by topic or keyword…"
                  className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/15 rounded-xl text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-red-400 focus:bg-white/15 transition-all"
                />
                {q && (
                  <Link href="/education-blogs" className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors" aria-label="Clear search">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </Link>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="w-full px-4 lg:px-8 xl:px-12 py-3 mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {[
              { icon: "school", label: "Admissions" }, { icon: "quiz", label: "Exam Tips" },
              { icon: "work", label: "Career Guidance" }, { icon: "payments", label: "Scholarships" },
              { icon: "apartment", label: "Campus Life" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs font-bold rounded-full bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 text-white">
                <span className="material-symbols-outlined text-[15px] text-red-400">{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="w-full px-4 lg:px-8 xl:px-12 py-10">
          {q && (
            <div className="mb-6 flex items-center gap-3">
              <p className="text-sm text-neutral-300">
                Showing <span className="font-black text-white">{total}</span> result{total !== 1 ? "s" : ""} for{" "}
                <span className="font-black text-red-400">&quot;{q}&quot;</span>
              </p>
              <Link href="/education-blogs" className="text-xs font-bold text-neutral-400 hover:text-red-600 transition-colors">Clear</Link>
            </div>
          )}

          {blogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-[36px] text-red-400" style={{ fontVariationSettings: "'FILL' 1" }}>article</span>
              </div>
              <h3 className="text-lg font-black text-white mb-2">{q ? `No results for "${q}"` : "No blogs yet"}</h3>
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
          ) : (
            <>
              {/* Featured post */}
              {featured && !q && currentPage === 1 && (() => {
                const img = buildImageUrl(featured.featimage);
                const desc = excerpt(featured.description ?? "", 200);
                const rt = readTime(featured.description ?? "");
                const time = timeAgo(featured.created_at);
                return (
                  <Link href={`/blogs/${featured.slug}`}
                    className="group block bg-white rounded-3xl border border-neutral-100 overflow-hidden hover:shadow-xl hover:shadow-neutral-200/60 hover:border-red-100 transition-all duration-300 mb-8">
                    <div className="flex flex-col lg:flex-row">
                      <div className="relative lg:w-1/2 h-64 lg:h-auto bg-neutral-100 overflow-hidden flex-shrink-0">
                        <BlogImage src={img} alt={featured.topic} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
                        <h2 className="text-xl lg:text-2xl font-black text-neutral-900 leading-snug mb-3 group-hover:text-red-600 transition-colors">{featured.topic}</h2>
                        {desc && <p className="text-sm text-neutral-500 leading-relaxed mb-5 line-clamp-3">{desc}</p>}
                        <div className="flex items-center gap-2 text-sm font-black text-red-600 group-hover:gap-3 transition-all">
                          Read Article <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })()}

              {rest.length > 0 && (
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6">
                  {(q || currentPage > 1 ? blogs : rest).map((blog, idx) => {
                    const img = buildImageUrl(blog.featimage);
                    const desc = excerpt(blog.description ?? "", 110);
                    const rt = readTime(blog.description ?? "");
                    const time = timeAgo(blog.created_at);
                    const accent = CARD_ACCENTS[idx % CARD_ACCENTS.length];
                    return (
                      <Link key={String(blog._id)} href={`/blogs/${blog.slug}`}
                        className="group flex flex-col bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:shadow-lg hover:shadow-neutral-200/60 hover:border-red-100 transition-all duration-300">
                        <div className="relative h-44 bg-neutral-100 overflow-hidden flex-shrink-0">
                          <BlogImage src={img} alt={blog.topic} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${accent.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${accent.dot}`} />
                              Education
                            </span>
                            <span className="text-[10px] font-bold text-white/80 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full">{rt}</span>
                          </div>
                        </div>
                        <div className="flex flex-col flex-1 p-5">
                          <p className="text-[10px] font-bold text-neutral-400 mb-2">{time}</p>
                          <h3 className="text-sm font-black text-neutral-900 leading-snug mb-2 group-hover:text-red-600 transition-colors line-clamp-2">{blog.topic}</h3>
                          {desc && <p className="text-xs text-neutral-500 leading-relaxed line-clamp-3 flex-1 mb-4">{desc}</p>}
                          <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
                              <span className="material-symbols-outlined text-[13px]">person</span>
                              AdmissionX Team
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs font-black text-red-600 group-hover:gap-2 transition-all">
                              Read <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  {currentPage > 1 && (
                    <Link href={href(currentPage - 1)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-neutral-600 bg-white border border-neutral-200 hover:border-red-300 hover:text-red-600 transition-all">
                      <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                      <span className="hidden sm:inline">Prev</span>
                    </Link>
                  )}
                  {pages.map((p, i) =>
                    p === "…" ? (
                      <span key={`e${i}`} className="w-9 h-9 flex items-center justify-center text-sm text-neutral-400">…</span>
                    ) : (
                      <Link key={p} href={href(p as number)}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${p === currentPage ? "bg-red-600 text-white shadow-md shadow-red-500/25 scale-105" : "bg-white border border-neutral-200 text-neutral-600 hover:border-red-300 hover:text-red-600"}`}>
                        {p}
                      </Link>
                    )
                  )}
                  {currentPage < totalPages && (
                    <Link href={href(currentPage + 1)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-neutral-600 bg-white border border-neutral-200 hover:border-red-300 hover:text-red-600 transition-all">
                      <span className="hidden sm:inline">Next</span>
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </Link>
                  )}
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





