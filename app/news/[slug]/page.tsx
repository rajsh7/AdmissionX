import { getDb } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200";

function buildImageUrl(raw: string | null | undefined): string {
  if (!raw || !raw.trim()) return DEFAULT_IMAGE;
  if (raw.startsWith("http") || raw.startsWith("/")) return raw;
  return `${IMAGE_BASE}${raw}`;
}

function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function readTime(html: string | null | undefined): string {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  } catch { return ""; }
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
  } catch { return ""; }
}

function parseIds(raw: string | null | undefined): number[] {
  if (!raw) return [];
  return raw.split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n) && n > 0);
}

const ICO_STYLE = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };
const ICO_FILL_STYLE = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const db = await getDb();
  const item = await db.collection("news").findOne({ slug, isactive: 1 }, { projection: { topic: 1, description: 1 } });
  if (!item) return { title: "News Not Found | AdmissionX" };
  const desc = stripHtml(item.description).slice(0, 160);
  return { title: `${item.topic} | AdmissionX News`, description: desc || "Read this news article on AdmissionX." };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();

  const raw = await db.collection("news").findOne({ slug, isactive: 1 });
  if (!raw) notFound();

  const typeIds = parseIds(raw.newstypeids);
  const tagIds = parseIds(raw.newstagsids);

  const [typeDocs, tagDocs, allTagDocs] = await Promise.all([
    typeIds.length ? db.collection("news_types").find({ id: { $in: typeIds } }).project({ id: 1, name: 1, slug: 1 }).toArray() : Promise.resolve([]),
    tagIds.length ? db.collection("news_tags").find({ id: { $in: tagIds } }).project({ id: 1, name: 1, slug: 1 }).toArray() : Promise.resolve([]),
    db.collection("news_tags").find({}).sort({ name: 1 }).limit(30).project({ id: 1, name: 1, slug: 1 }).toArray(),
  ]);

  // Related news
  let relatedDocs: Record<string, unknown>[] = [];
  if (typeIds.length) {
    relatedDocs = await db.collection("news")
      .find({ isactive: 1, id: { $ne: raw.id }, newstypeids: { $regex: typeIds.map((id) => `(^|,)\\s*${id}\\s*(,|$)`).join("|") } })
      .sort({ created_at: -1 }).limit(3)
      .project({ id: 1, topic: 1, featimage: 1, description: 1, slug: 1, created_at: 1 }).toArray();
  }
  if (relatedDocs.length < 3) {
    const excludeIds = [raw.id, ...relatedDocs.map((r) => r.id)];
    const extras = await db.collection("news")
      .find({ isactive: 1, id: { $nin: excludeIds } })
      .sort({ created_at: -1 }).limit(3 - relatedDocs.length)
      .project({ id: 1, topic: 1, featimage: 1, description: 1, slug: 1, created_at: 1 }).toArray();
    relatedDocs = [...relatedDocs, ...extras];
  }

  const heroImg = buildImageUrl((raw.fullimage ?? raw.featimage) as string | null);
  const rt = readTime(raw.description as string);
  const date = formatDate(raw.created_at as string);
  const ago = timeAgo(raw.created_at as string);

  return (
    <>
      <Header />
      <main className="min-h-screen relative overflow-hidden bg-neutral-900">
        <div className="fixed inset-0 z-0">
          <Image src={heroImg} alt={raw.topic as string} fill className="object-cover" priority quality={80} />
          <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10">
          <section className="relative h-[460px] md:h-[540px] flex flex-col items-center justify-center text-center">
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
            <div className="relative z-20 w-full px-4 lg:px-8 xl:px-12 flex flex-col items-center">
              <nav className="flex items-center justify-center flex-wrap gap-1 text-white/70 text-sm mb-6">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <span className="material-symbols-rounded text-base" style={ICO_STYLE}>chevron_right</span>
                <Link href="/news" className="hover:text-white transition-colors">News</Link>
                <span className="material-symbols-rounded text-base" style={ICO_STYLE}>chevron_right</span>
                <span className="text-white/90 line-clamp-1">{raw.topic as string}</span>
              </nav>

              {typeDocs.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {typeDocs.map((t) => (
                    <Link key={String(t._id)} href={`/news?type=${t.slug}`}
                      className="text-xs font-bold bg-blue-600/30 backdrop-blur-md text-blue-200 border border-blue-400/40 px-4 py-1.5 rounded-full hover:bg-blue-600 hover:text-white transition-all shadow-lg">
                      {t.name}
                    </Link>
                  ))}
                </div>
              )}

              <h1 className="text-3xl md:text-5xl font-black text-white leading-tight max-w-4xl mb-6 drop-shadow-xl">{raw.topic as string}</h1>

              <div className="flex flex-wrap justify-center items-center gap-6 text-white text-sm font-medium">
                <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                  <span className="material-symbols-rounded text-base text-blue-400" style={ICO_FILL_STYLE}>calendar_today</span>
                  {date}
                </span>
                {ago && (
                  <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                    <span className="material-symbols-rounded text-base text-blue-400" style={ICO_FILL_STYLE}>schedule</span>
                    {ago}
                  </span>
                )}
                <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                  <span className="material-symbols-rounded text-base text-blue-400" style={ICO_FILL_STYLE}>timer</span>
                  {rt}
                </span>
              </div>
            </div>
          </section>

          <div className="w-full px-4 lg:px-8 xl:px-12 py-10">
            <div className="flex flex-col lg:flex-row gap-10">
              <article className="lg:w-2/3 min-w-0">
                <section className="bg-white rounded-2xl shadow-xl border border-white/10 p-7 md:p-10">
                  {tagDocs.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-neutral-100">
                      {tagDocs.map((tag, i) => (
                        <Link key={String(tag._id)} href={`/news?tag=${tag.slug}`}
                          className={`text-xs font-bold px-4 py-1.5 rounded-full border transition-all hover:scale-105 ${TAG_COLORS[i % TAG_COLORS.length]}`}>
                          #{tag.name}
                        </Link>
                      ))}
                    </div>
                  )}
                  <div className="rich-text text-black prose prose-neutral max-w-none prose-headings:font-black prose-headings:text-neutral-900 prose-p:text-neutral-700 hover:prose-a:text-blue-600 transition-colors"
                    dangerouslySetInnerHTML={{ __html: (raw.description as string) ?? "" }} />
                  {tagDocs.length > 0 && (
                    <div className="mt-10 pt-8 border-t border-neutral-100">
                      <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">Tagged In</p>
                      <div className="flex flex-wrap gap-2">
                        {tagDocs.map((tag, i) => (
                          <Link key={String(tag._id)} href={`/news?tag=${tag.slug}`}
                            className={`text-xs font-bold px-4 py-1.5 rounded-full border transition-all hover:scale-105 ${TAG_COLORS[i % TAG_COLORS.length]}`}>
                            #{tag.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
                <div className="mt-6 flex items-center justify-between flex-wrap gap-4 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10">
                  <Link href="/news" className="inline-flex items-center gap-2 text-sm font-bold text-white hover:text-blue-400 transition-colors">
                    <span className="material-symbols-rounded text-base" style={ICO_STYLE}>arrow_back</span>
                    Back to News
                  </Link>
                  <span className="text-xs text-neutral-300 font-semibold italic">Curated by AdmissionX Editorial Team</span>
                </div>
              </article>

              <aside className="lg:w-1/3 flex flex-col gap-8">
                {relatedDocs.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-xl border border-white/10 p-6">
                    <h3 className="text-lg font-black text-black mb-5 flex items-center gap-2">
                      <span className="material-symbols-rounded text-blue-600 text-xl" style={ICO_FILL_STYLE}>newspaper</span>
                      Related News
                    </h3>
                    <ul className="flex flex-col gap-5">
                      {relatedDocs.map((r) => (
                        <li key={String(r._id)}>
                          <Link href={`/news/${r.slug}`} className="flex gap-4 group">
                            <div className="relative w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100 shadow-sm">
                              <Image src={buildImageUrl(r.featimage as string)} alt={r.topic as string} fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500" sizes="80px" />
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                              <p className="text-sm font-bold text-neutral-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">{r.topic as string}</p>
                              <p className="text-[11px] text-neutral-500 font-bold mt-2">{formatDate(r.created_at as string)}</p>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link href="/news" className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-blue-600 border border-blue-100 hover:bg-blue-50 rounded-xl py-3 transition-all">
                      View all news
                      <span className="material-symbols-rounded text-base" style={ICO_STYLE}>arrow_forward</span>
                    </Link>
                  </div>
                )}

                {allTagDocs.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-xl border border-white/10 p-6">
                    <h3 className="text-lg font-black text-black mb-5 flex items-center gap-2">
                      <span className="material-symbols-rounded text-blue-600 text-xl" style={ICO_FILL_STYLE}>sell</span>
                      Browse by Tag
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {allTagDocs.map((tag, i) => (
                        <Link key={String(tag._id)} href={`/news?tag=${tag.slug}`}
                          className={`text-xs font-bold px-3.5 py-1.5 rounded-full border transition-all hover:scale-110 ${tagIds.includes(tag.id)
                            ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20"
                            : TAG_COLORS[i % TAG_COLORS.length]}`}>
                          #{tag.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-2xl bg-gradient-to-br from-neutral-900 to-black p-8 text-white shadow-2xl border border-white/10 overflow-hidden relative group">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl group-hover:bg-blue-600/30 transition-colors duration-500" />
                  <span className="material-symbols-rounded text-4xl mb-4 text-blue-500 block" style={ICO_FILL_STYLE}>feed</span>
                  <h3 className="font-black text-xl mb-3">Stay Informed</h3>
                  <p className="text-sm text-neutral-400 mb-6 leading-relaxed font-medium">Get the latest education news, admission alerts, and scholarship updates.</p>
                  <Link href="/news" className="inline-flex items-center gap-2 bg-blue-600 text-white font-black text-sm px-6 py-3 rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30">
                    Browse news
                    <span className="material-symbols-rounded text-base" style={ICO_STYLE}>arrow_forward</span>
                  </Link>
                </div>
              </aside>
            </div>
          </div>

          <section className="bg-black/60 backdrop-blur-xl border-y border-white/10 py-24 px-4 mt-12 overflow-hidden relative">
            <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none select-none">
              <span className="text-[200px] font-black tracking-tighter text-white">ADMISSIONX</span>
            </div>
            <div className="max-w-4xl mx-auto text-center flex flex-col items-center relative z-10">
              <div className="w-20 h-20 rounded-2xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center mb-8">
                <span className="material-symbols-rounded text-4xl text-blue-500" style={ICO_FILL_STYLE}>rss_feed</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">Stay Ahead of the Curve</h2>
              <p className="text-neutral-400 mb-12 text-lg max-w-xl font-medium leading-relaxed">Exam notifications, admission alerts, scholarship deadlines — never miss what matters.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/news" className="inline-flex items-center gap-3 bg-blue-600 text-white font-black px-10 py-5 rounded-2xl hover:bg-blue-500 transition-all hover:scale-[1.02] shadow-xl shadow-blue-600/20">
                  <span className="material-symbols-rounded text-xl" style={ICO_FILL_STYLE}>newspaper</span>
                  All Latest News
                </Link>
                <Link href="/blogs" className="inline-flex items-center gap-3 bg-white/10 text-white font-black px-10 py-5 rounded-2xl hover:bg-white/20 transition-all hover:scale-[1.02] shadow-xl border border-white/20">
                  <span className="material-symbols-rounded text-xl" style={ICO_FILL_STYLE}>library_books</span>
                  Education Blogs
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
