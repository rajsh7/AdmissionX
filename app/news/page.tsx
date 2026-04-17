import { getDb } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ExploreCards from "@/app/components/ExploreCards";

const DEFAULT_NEWS_IMAGE =
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800";
const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
const PAGE_SIZE = 12;
const ACCENT = "#FF3B30";

export const metadata: Metadata = {
  title: "Education News — Latest Updates | AdmissionX",
  description:
    "Stay updated with the latest education news — admission alerts, exam notifications, scholarship announcements, and campus updates.",
};

function buildImageUrl(raw: string | null | undefined): string {
  if (!raw || !raw.trim()) return DEFAULT_NEWS_IMAGE;
  if (raw.startsWith("http")) return raw;
  if (raw.startsWith("/")) return raw;
  return `${IMAGE_BASE}${raw}`;
}

function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
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
    const m = Math.floor(diff / 60_000);
    const h = Math.floor(diff / 3_600_000);
    const d = Math.floor(diff / 86_400_000);
    const w = Math.floor(d / 7);
    const mo = Math.floor(d / 30);
    if (mo >= 1) return `${mo} month${mo > 1 ? "s" : ""} ago`;
    if (w >= 1) return `${w} week${w > 1 ? "s" : ""} ago`;
    if (d >= 1) return `${d} day${d > 1 ? "s" : ""} ago`;
    if (h >= 1) return `${h} hour${h > 1 ? "s" : ""} ago`;
    if (m >= 1) return `${m} min ago`;
    return "Just now";
  } catch {
    return "";
  }
}

function formatFullDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(
      new Date(dateStr),
    );
  } catch {
    return "";
  }
}

function estimateReadTime(html: string | null | undefined): string {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

function parseIds(csv: string | null | undefined): number[] {
  if (!csv?.trim()) return [];
  return csv.split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => !Number.isNaN(n));
}

function firstTypeName(
  newstypeids: string | null | undefined,
  allTypes: { id: number; name: string }[],
): string {
  const ids = parseIds(newstypeids);
  const t = allTypes.find((x) => ids.includes(x.id));
  return t?.name ?? "AdmissionX News";
}

function padToSix<T>(items: T[], filler: (i: number) => T): T[] {
  const out = [...items];
  let i = 0;
  while (out.length < 6) {
    out.push(filler(i));
    i += 1;
  }
  return out.slice(0, 6);
}

type NewsRow = {
  _id: unknown;
  id?: number;
  topic: string;
  slug: string;
  featimage?: string | null;
  description?: string | null;
  newstypeids?: string | null;
  created_at?: string | null;
};

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

  const db = await getDb();

  const [allTypes, allTags] = await Promise.all([
    db.collection("news_types").find({}).sort({ name: 1 }).project({ id: 1, name: 1, slug: 1 }).toArray(),
    db.collection("news_tags").find({}).sort({ name: 1 }).project({ id: 1, name: 1, slug: 1 }).toArray(),
  ]);

  let typeId: number | null = null;
  if (activeType) {
    const found = allTypes.find((t) => t.slug?.toLowerCase() === activeType);
    typeId = found?.id ?? null;
  }
  let tagId: number | null = null;
  if (activeTag) {
    const found = allTags.find((t) => t.slug?.toLowerCase() === activeTag);
    tagId = found?.id ?? null;
  }

  const filter: Record<string, unknown> = {
    isactive: 1,
    slug: { $exists: true, $ne: "" },
  };
  if (q) filter.$or = [{ topic: { $regex: q, $options: "i" } }, { description: { $regex: q, $options: "i" } }];
  if (typeId !== null) filter.newstypeids = { $regex: `(^|,)\\s*${typeId}\\s*(,|$)` };
  if (tagId !== null) filter.newstagsids = { $regex: `(^|,)\\s*${tagId}\\s*(,|$)` };

  const baseSidebarFilter: Record<string, unknown> = {
    isactive: 1,
    slug: { $exists: true, $ne: "" },
  };

  const [news, total, spotlightRaw] = await Promise.all([
    db
      .collection("news")
      .find(filter)
      .sort({ created_at: -1 })
      .skip(offset)
      .limit(PAGE_SIZE)
      .project({ id: 1, topic: 1, featimage: 1, description: 1, slug: 1, newstypeids: 1, newstagsids: 1, created_at: 1 })
      .toArray(),
    db.collection("news").countDocuments(filter),
    db
      .collection("news")
      .find(baseSidebarFilter)
      .sort({ created_at: -1 })
      .limit(12)
      .project({ id: 1, topic: 1, featimage: 1, description: 1, slug: 1, newstypeids: 1, created_at: 1 })
      .toArray(),
  ]);

  const newsList = news as unknown as NewsRow[];
  const spotlight = spotlightRaw as unknown as NewsRow[];

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const activeTypeName = allTypes.find((t) => t.slug?.toLowerCase() === activeType)?.name;
  const activeTagName = allTags.find((t) => t.slug?.toLowerCase() === activeTag)?.name;

  const showFeatured = page === 1 && !q && !activeType && !activeTag && newsList.length > 0;
  const featured = showFeatured ? newsList[0] : null;
  const listNews = showFeatured ? newsList.slice(1) : newsList;

  const mostRead =
    spotlight.length > 0
      ? padToSix(spotlight.slice(0, 6), (i) => spotlight[i % spotlight.length]!)
      : [];
  const trendingSource = spotlight.slice(6, 12);
  const trendingItems =
    spotlight.length > 0
      ? padToSix(trendingSource.length ? trendingSource : spotlight, (i) => spotlight[i % spotlight.length]!)
      : [];

  const allTypesTyped = allTypes as { id: number; name: string; slug?: string }[];

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
    <div className="min-h-screen bg-white font-poppins">
      <Header />

      <main className="pt-[72px] sm:pt-20 pb-16 w-full">
        <div className="w-full max-w-none mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 2xl:px-10">
          <div className="pt-6 sm:pt-8 lg:pt-10" />
          {/* Featured */}
          {featured && (
            <article className="mb-10 rounded-[5px] border border-neutral-200/80 bg-neutral-100 shadow-[0_1px_4px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col md:flex-row"
              style={{ backgroundImage: `url("${encodeURI("/Background-images/f0b10acfd1d98e25c40741fa92c81454f3557e55 (1).png")}")`, backgroundSize: "cover", backgroundPosition: "right", backgroundRepeat: "no-repeat" }}
            >
              <Link
                href={`/news/${featured.slug}`}
                className="relative w-full md:w-[32%] min-h-[220px] md:min-h-[340px] shrink-0 group md:m-0 md:rounded-none overflow-hidden"
              >
                <Image
                  src={buildImageUrl(featured.featimage)}
                  alt={featured.topic}
                  fill
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 42vw"
                  priority
                />
                <div className="absolute inset-0 bg-black/10 transition-opacity flex items-center justify-center pointer-events-none" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-r from-transparent to-white/75" />
              </Link>
              <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center">
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-800 leading-snug mb-3">{featured.topic}</h2>
                <p className="text-sm text-neutral-500 leading-relaxed line-clamp-3 mb-4">
                  {excerpt(featured.description, 220) ||
                    "Stay updated with the latest announcements, schedules, and guidance for students and parents."}
                </p>
                <div
                  className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold mb-5"
                  style={{ color: ACCENT }}
                >
                  {timeAgo(featured.created_at) && <span>{timeAgo(featured.created_at)}</span>}
                  {formatFullDate(featured.created_at) && <span>{formatFullDate(featured.created_at)}</span>}
                  <span>{estimateReadTime(featured.description)}</span>
                </div>
                <Link
                  href={`/news/${featured.slug}`}
                  className="inline-flex items-center gap-1 text-sm font-bold w-fit hover:opacity-80 transition-opacity"
                  style={{ color: ACCENT }}
                >
                  Read Full Story
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </article>
          )}

          {/* Category tabs */}
          <div className="w-full mb-6">
            <div className="flex items-center gap-0 min-w-0 overflow-x-auto hide-scrollbar border border-neutral-200 rounded-[5px] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
              <Link
                href={buildUrl({ type: undefined, tag: undefined, page: "1" })}
                className={`flex-1 text-center py-3 text-sm font-semibold whitespace-nowrap transition-colors ${!activeType && !activeTag
                    ? "text-[#FF3B30] border-b-2 border-b-[#FF3B30]"
                    : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 border-r border-neutral-200"
                  }`}
                style={{ fontWeight: 600, fontSize: "20px", color: "rgba(62, 62, 62, 0.71)" }}
              >
                All News
              </Link>
              {allTypesTyped.map((t, i) => {
                const slug = (t.slug ?? "").toLowerCase();
                const on = activeType === slug;
                return (
                  <Link
                    key={t.id}
                    href={buildUrl({ type: t.slug, tag: undefined, page: "1" })}
                    className={`flex-1 text-center py-3 text-sm font-semibold whitespace-nowrap transition-colors ${on ? "text-[#FF3B30] border-b-2 border-b-[#FF3B30]" : `text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50${i < allTypesTyped.length - 1 ? " border-r border-neutral-200" : ""}`
                      }`}
                    style={{ fontWeight: 600, fontSize: "20px", color: "rgba(62, 62, 62, 0.71)" }}
                  >
                    {t.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Search + filters */}
          <form method="GET" action="/news" className="flex flex-row items-center gap-3 mb-10">
            <div className="flex flex-row gap-3 min-w-0 w-full lg:w-1/2">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-neutral-400">
                  search
                </span>
                <input
                  type="text"
                  name="q"
                  defaultValue={q}
                  placeholder="Location, universities, courses..."
                  className="w-full pl-11 pr-4 py-3 text-sm border border-neutral-200 rounded-[5px] bg-white text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 transition-shadow shadow-sm"
                />
                {activeType && <input type="hidden" name="type" value={activeType} />}
                {activeTag && <input type="hidden" name="tag" value={activeTag} />}
              </div>
              <button
                type="submit"
                className="shrink-0 px-6 py-3 rounded-[5px] text-sm font-bold text-white shadow-sm hover:opacity-95 transition-opacity whitespace-nowrap"
                style={{ backgroundColor: ACCENT }}
              >
                Search Now
              </button>
            </div>
          </form>

          {(q || activeType || activeTag) && (
            <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-neutral-600">
                {total} result{total !== 1 ? "s" : ""}
                {q && (
                  <>
                    {" "}
                    for &ldquo;<strong>{q}</strong>&rdquo;
                  </>
                )}
              </span>
              {activeTypeName && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 border border-red-100 px-2.5 py-1 rounded-[5px]">
                  {activeTypeName}
                  <Link href={buildUrl({ type: undefined, page: "1" })} className="hover:opacity-70 ml-0.5">
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </Link>
                </span>
              )}
              {activeTagName && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-neutral-700 bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded-[5px]">
                  #{activeTagName}
                  <Link href={buildUrl({ tag: undefined, page: "1" })} className="hover:opacity-70 ml-0.5">
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </Link>
                </span>
              )}
              <Link href="/news" className="text-xs font-semibold text-[#FF3B30] hover:underline underline-offset-2">
                Clear all
              </Link>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-10 lg:gap-12 items-start">
            {/* Latest news */}
            <div className="flex-1 min-w-0 w-full">
              <h2 className="text-lg sm:text-xl font-bold text-neutral-800 mb-5">Latest news</h2>

              {newsList.length === 0 ? (
                <div className="rounded-[5px] border border-dashed border-neutral-200 py-16 text-center px-4">
                  <span className="material-symbols-outlined text-[40px] text-neutral-300 mb-3 block">newspaper</span>
                  <p className="font-bold text-neutral-800 mb-1">
                    {(q || activeType || activeTag) ? "No matching news" : "No news yet"}
                  </p>
                  <p className="text-sm text-neutral-500 mb-6 max-w-sm mx-auto">
                    {(q || activeType || activeTag)
                      ? "Try adjusting your filters or search."
                      : "Check back soon for updates."}
                  </p>
                  {(q || activeType || activeTag) && (
                    <Link
                      href="/news"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[5px] text-sm font-bold text-white"
                      style={{ backgroundColor: ACCENT }}
                    >
                      Clear filters
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-4">
                    {listNews.map((item) => {
                      const imgUrl = buildImageUrl(item.featimage);
                      const desc = excerpt(item.description, 140);
                      const ago = timeAgo(item.created_at);
                      const source = firstTypeName(item.newstypeids, allTypesTyped);
                      return (
                        <article
                          key={String(item._id)}
                          className="flex gap-4 p-4 rounded-[5px] border border-neutral-200/90 bg-white shadow-sm hover:shadow-md hover:border-neutral-300/80 transition-all"
                        >
                          <Link
                            href={`/news/${item.slug}`}
                            className="relative w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] shrink-0 rounded-[5px] overflow-hidden bg-neutral-100"
                          >
                            <Image src={imgUrl} alt="" fill className="object-cover" sizes="120px" />
                          </Link>
                          <div className="min-w-0 flex-1 flex flex-col">
                            <Link href={`/news/${item.slug}`}>
                              <h3
                                className="leading-snug line-clamp-2 hover:text-[#FF3B30] transition-colors"
                                style={{ fontWeight: 600, fontSize: "24px", color: "rgba(62, 62, 62, 1)" }}
                              >
                                {item.topic}
                              </h3>
                            </Link>
                            {desc && <p className="text-xs sm:text-sm text-neutral-500 mt-2 line-clamp-2 leading-relaxed">{desc}</p>}
                            <Link
                              href={`/news/${item.slug}`}
                              className="text-xs font-bold mt-2 w-fit"
                              style={{ color: ACCENT }}
                            >
                              Read all
                            </Link>
                            <div className="mt-auto pt-3 flex items-center justify-between gap-2 border-t border-neutral-100">
                              <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-neutral-600">
                                <span className="material-symbols-outlined text-[16px] text-blue-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                                  verified
                                </span>
                                <span className="font-medium">{source}</span>
                              </span>
                              {ago && <span className="text-[11px] sm:text-xs text-neutral-400 shrink-0">{ago}</span>}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-10 flex items-center justify-center gap-1 flex-wrap">
                      {page > 1 ? (
                        <Link
                          href={buildUrl({ page: String(page - 1) })}
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
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                        .reduce<(number | "…")[]>((acc, p, i, arr) => {
                          if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("…");
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((p, i) =>
                          p === "…" ? (
                            <span key={`e${i}`} className="w-9 h-9 flex items-center justify-center text-neutral-400 text-sm">
                              …
                            </span>
                          ) : (
                            <Link
                              key={p}
                              href={buildUrl({ page: String(p) })}
                              className={`w-9 h-9 rounded-[5px] text-sm font-bold flex items-center justify-center transition-colors ${p === page
                                  ? "text-white"
                                  : "border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                                }`}
                              style={p === page ? { backgroundColor: ACCENT } : undefined}
                            >
                              {p}
                            </Link>
                          ),
                        )}
                      {page < totalPages ? (
                        <Link
                          href={buildUrl({ page: String(page + 1) })}
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

            {/* Sidebar */}
            <aside className="w-full lg:w-[300px] shrink-0 space-y-8">
              <div>
                <h3 className="mb-4" style={{ fontWeight: 600, fontSize: "20px", color: "rgba(62, 62, 62, 0.71)" }}>
                  Most Read This Week
                </h3>
                {mostRead.length === 0 ? (
                  <p className="text-sm text-neutral-500">No articles yet.</p>
                ) : (
                  <ol className="space-y-5">
                    {mostRead.map((item, idx) => (
                      <li key={`${String(item._id)}-${idx}`} className="flex gap-3">
                        <span className="text-2xl font-bold text-neutral-200 leading-none w-8 shrink-0 tabular-nums">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0 pt-0.5">
                          <Link
                            href={`/news/${item.slug}`}
                            className="leading-snug line-clamp-2 hover:text-[#FF3B30] transition-colors"
                            style={{ fontWeight: 600, fontSize: "16px", color: "rgba(62, 62, 62, 0.71)" }}
                          >
                            {item.topic}
                          </Link>
                          <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{excerpt(item.description, 90)}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              {allTags.length > 0 && (
                <div id="news-tags">
                  <h3 className="text-sm font-bold text-neutral-800 mb-3">Browse by tag</h3>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <Link
                        key={String(tag._id)}
                        href={buildUrl({ tag: tag.slug, page: "1", type: undefined })}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-[5px] border transition-colors ${activeTag === tag.slug?.toLowerCase()
                            ? "border-[#FF3B30] bg-red-50 text-[#FF3B30]"
                            : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                          }`}
                      >
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>

        {/* Ad placeholder */}
        <div className="w-full max-w-none mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 2xl:px-10 mt-14 mb-14">
          <div
            className="w-full h-24 sm:h-28 rounded-[5px] flex items-center justify-center text-sm text-neutral-400 font-medium"
            style={{ backgroundColor: "#E0E0E0" }}
          >
            Advertisement
          </div>
        </div>

        {/* Trending */}
        {trendingItems.length > 0 && (
          <div className="w-full max-w-none mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 2xl:px-10">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-neutral-800">Trending Topics</h2>
              <span className="material-symbols-outlined text-[#22c55e] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                trending_up
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {trendingItems.map((item, idx) => {
                const imgUrl = buildImageUrl(item.featimage);
                const label = firstTypeName(item.newstypeids, allTypesTyped).toUpperCase().slice(0, 16);
                const sub = excerpt(item.description, 70) || "Latest education update and analysis.";
                return (
                  <Link
                    key={`trend-${String(item._id)}-${idx}`}
                    href={`/news/${item.slug}`}
                    className="group relative min-h-[280px] rounded-[5px] overflow-hidden border border-neutral-200/80 shadow-sm"
                  >
                    <Image src={imgUrl} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:640px) 100vw, 33vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="inline-block text-[10px] font-bold tracking-wide text-neutral-900 bg-[#facc15] px-2 py-1 rounded-[5px] shadow-sm">
                        {label}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <p className="text-base sm:text-lg font-bold leading-snug line-clamp-2 mb-1">{item.topic}</p>
                      <p className="text-xs text-white/80 line-clamp-2 mb-2">{sub}</p>
                      <p className="text-[10px] text-white/70">
                        {firstTypeName(item.newstypeids, allTypesTyped)} · {formatFullDate(item.created_at) || "Recently"}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Explore Cards */}
      <ExploreCards />

      <Footer />
    </div>
  );
}
