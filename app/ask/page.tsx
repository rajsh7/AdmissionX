import { getDb } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export const dynamic = 'force-dynamic';
// ─── Constants ────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Community Q&A — Ask Questions | AdmissionX",
  description:
    "Browse thousands of questions and answers from students about admissions, exams, careers, and college life. Get answers from experts and peers.",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 15;

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Recently";
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMin = Math.floor(diffMs / 60_000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    const diffWk = Math.floor(diffDay / 7);
    const diffMo = Math.floor(diffDay / 30);
    if (diffMo >= 1) return `${diffMo}mo ago`;
    if (diffWk >= 1) return `${diffWk}w ago`;
    if (diffDay >= 1) return `${diffDay}d ago`;
    if (diffHr >= 1) return `${diffHr}h ago`;
    if (diffMin >= 1) return `${diffMin}m ago`;
    return "Just now";
  } catch {
    return "Recently";
  }
}

interface QuestionRow {
  id: number;
  question: string;
  questionDate: string | null;
  slug: string | null;
  likes: number;
  views: number;
  totalAnswerCount: number;
  totalCommentsCount: number;
  askQuestionTagIds: string | null;
  created_at: string;
}

interface TagRow {
  id: number;
  name: string;
  slug: string;
  question_count: number;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AskPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(String(sp.page ?? "1"), 10) || 1);
  const tag = String(sp.tag ?? "").trim().toLowerCase();
  const sort = String(sp.sort ?? "latest").trim().toLowerCase();
  const q = String(sp.q ?? "").trim();
  const offset = (page - 1) * PAGE_SIZE;

  const db = await getDb();

  // Resolve tag
  let tagId: number | null = null;
  if (tag) {
    const tagDoc = await db.collection("ask_question_tags").findOne({ slug: tag }, { projection: { id: 1 } });
    tagId = tagDoc?.id ?? null;
  }

  // Build filter
  const filter: Record<string, unknown> = { status: 1 };
  if (q) filter.question = { $regex: q, $options: "i" };
  if (tagId !== null) filter.askQuestionTagIds = { $regex: `(^|,)\\s*${tagId}\\s*(,|$)` };

  // Sort
  const mongoSort: Record<string, 1 | -1> =
    sort === "popular" ? { likes: -1, views: -1 } :
    sort === "answered" ? { totalAnswerCount: -1, created_at: -1 } :
    sort === "views" ? { views: -1 } :
    { created_at: -1 };

  const [questionDocs, total, allTagDocs] = await Promise.all([
    db.collection("ask_questions").find(filter).sort(mongoSort).skip(offset).limit(PAGE_SIZE)
      .project({ id: 1, question: 1, questionDate: 1, slug: 1, likes: 1, views: 1, totalAnswerCount: 1, totalCommentsCount: 1, askQuestionTagIds: 1, created_at: 1 }).toArray(),
    db.collection("ask_questions").countDocuments(filter),
    db.collection("ask_question_tags").find({}).sort({ name: 1 }).limit(30)
      .project({ id: 1, name: 1, slug: 1 }).toArray(),
  ]);

  const questions: QuestionRow[] = questionDocs.map((d) => ({
    id: d.id, question: d.question, questionDate: d.questionDate ?? null, slug: d.slug ?? null,
    likes: Number(d.likes) || 0, views: Number(d.views) || 0,
    totalAnswerCount: Number(d.totalAnswerCount) || 0, totalCommentsCount: Number(d.totalCommentsCount) || 0,
    askQuestionTagIds: d.askQuestionTagIds ?? null, created_at: d.created_at,
  }));
  const allTags: TagRow[] = allTagDocs.map((t) => ({ id: t.id, name: t.name, slug: t.slug, question_count: 0 }));

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const tagMap = new Map(allTags.map((t) => [t.id, t]));

  function getTagsForQuestion(tagIds: string | null): TagRow[] {
    if (!tagIds) return [];
    return tagIds
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((id) => !isNaN(id) && tagMap.has(id))
      .map((id) => tagMap.get(id)!)
      .slice(0, 4);
  }

  // ── URL builder ───────────────────────────────────────────────────────────
  function buildUrl(overrides: Record<string, string | number | undefined>) {
    const base: Record<string, string> = {};
    if (q) base.q = q;
    if (tag) base.tag = tag;
    if (sort && sort !== "latest") base.sort = sort;
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === undefined || v === "" || v === "latest") {
        delete base[k];
      } else {
        base[k] = String(v);
      }
    });
    const qs = new URLSearchParams(base).toString();
    return `/ask${qs ? `?${qs}` : ""}`;
  }

  const sortTabs = [
    { value: "latest", label: "Latest", icon: "schedule" },
    { value: "popular", label: "Popular", icon: "trending_up" },
    { value: "answered", label: "Most Answered", icon: "forum" },
    { value: "views", label: "Most Viewed", icon: "visibility" },
  ];

  return (
    <div className="min-h-screen relative">
      {/* ── Full Page Background ── */}
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
        <div className="pt-24 pb-14">
          <div className="w-full px-4 lg:px-8 xl:px-12 flex flex-col items-center text-center">
            <nav className="flex items-center justify-center gap-2 text-xs text-neutral-500 mb-6 font-medium">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-neutral-300">Community Q&amp;A</span>
            </nav>

            <div className="flex flex-col items-center gap-6">
              <div className="w-full max-w-2xl flex flex-col items-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center gap-1.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                    <span className="material-symbols-outlined text-[13px]">forum</span>
                    Community Q&amp;A
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-3">
                  Ask{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">
                    Anything
                  </span>
                </h1>
                <p className="text-neutral-400 text-sm leading-relaxed max-w-lg text-center">
                  Browse questions from students about admissions, exams, scholarships,
                  and campus life — answered by experts and peers.
                </p>
              </div>

              <div className="flex justify-center gap-4 flex-shrink-0">
                {[
                  { label: "Questions", value: total > 0 ? total.toLocaleString() : "—" },
                  { label: "Topics", value: allTags.length > 0 ? String(allTags.length) : "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-center min-w-[90px]">
                    <p className="text-2xl font-black text-white">{value}</p>
                    <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Search bar */}
            <form method="GET" action="/ask" className="mt-8 w-full flex justify-center">
              {tag && <input type="hidden" name="tag" value={tag} />}
              {sort && sort !== "latest" && <input type="hidden" name="sort" value={sort} />}
              <div className="relative max-w-xl">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-neutral-400">search</span>
                <input
                  type="search"
                  name="q"
                  defaultValue={q}
                  placeholder="Search questions…"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-neutral-500 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium focus:outline-none focus:border-violet-500/50 focus:bg-white/10 focus:ring-4 focus:ring-violet-500/5 transition-all"
                />
              </div>
            </form>
          </div>
        </div>

        {/* ── Sort tabs ────────────────────────────────────────────────────────── */}
        <div className="border-b border-white/10" style={{ backgroundColor: 'transparent' }}>
          <div className="w-full px-4 lg:px-8 xl:px-12">
            <nav className="flex items-center justify-center overflow-x-auto scrollbar-hide">
              {sortTabs.map((tab) => {
                const active = sort === tab.value;
                return (
                  <Link
                    key={tab.value}
                    href={buildUrl({ sort: tab.value, page: 1 })}
                    className={`flex items-center gap-1.5 px-4 py-4 text-xs font-bold whitespace-nowrap transition-colors shrink-0 border-b-2 -mb-px ${active
                      ? "border-violet-500 text-violet-400"
                      : "border-transparent text-neutral-400 hover:text-white hover:border-white/20"
                      }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* ── Main layout ──────────────────────────────────────────────────────── */}
        <div className="w-full px-4 lg:px-8 xl:px-12 py-10">
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* ── Questions list ───────────────────────────────────────────────── */}
            <div className="flex-1 min-w-0">
              {/* Active filters */}
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className="text-sm text-white mr-2">
                  {total} {total === 1 ? "question" : "questions"} found
                </span>
                {(tag || q) && (
                  <>
                    <span className="text-xs font-bold text-neutral-300 border-l border-neutral-700 pl-3">Filters:</span>
                    {q && (
                      <Link
                        href={buildUrl({ q: undefined, page: 1 })}
                        className="inline-flex items-center gap-1 text-xs font-bold text-violet-700 bg-violet-50 border border-violet-200 px-2.5 py-1 rounded-full hover:bg-violet-100 transition-colors"
                      >
                        &ldquo;{q}&rdquo;
                        <span className="material-symbols-outlined text-[12px]">close</span>
                      </Link>
                    )}
                    {tag && (
                      <Link
                        href={buildUrl({ tag: undefined, page: 1 })}
                        className="inline-flex items-center gap-1 text-xs font-bold text-violet-700 bg-violet-50 border border-violet-200 px-2.5 py-1 rounded-full hover:bg-violet-100 transition-colors"
                      >
                        #{tag}
                        <span className="material-symbols-outlined text-[12px]">close</span>
                      </Link>
                    )}
                    <Link href="/ask" className="text-xs text-neutral-300 hover:text-white transition-colors underline underline-offset-2 ml-1">
                      Clear all
                    </Link>
                  </>
                )}
              </div>

              {questions.length === 0 ? (
                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-[32px] text-violet-400" style={{ fontVariationSettings: "'FILL' 1" }}>forum</span>
                  </div>
                  <h3 className="text-base font-black text-white mb-2">No questions found</h3>
                  <p className="text-sm text-neutral-400 max-w-xs mx-auto leading-relaxed">
                    {q ? `No results for "${q}".` : "No questions match your filters."}
                  </p>
                  <Link href="/ask" className="inline-flex items-center gap-2 mt-5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors">
                    Clear filters
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {questions.map((q_item) => {
                    const qTags = getTagsForQuestion(q_item.askQuestionTagIds);
                    const href = q_item.slug ? `/ask/${q_item.slug}` : `/ask/${q_item.id}`;
                    const answered = q_item.totalAnswerCount > 0;

                    return (
                      <Link
                        key={q_item.id}
                        href={href}
                        className="block bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:border-violet-400/50 hover:bg-white/10 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300 p-5 group"
                      >
                        <div className="flex items-start gap-4">
                          {/* Answer count badge */}
                          <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl flex-shrink-0 transition-colors ${answered ? "bg-violet-500/20 border border-violet-500/30" : "bg-white/5 border border-white/10"}`}>
                            <span className={`text-lg font-black leading-none ${answered ? "text-violet-400" : "text-neutral-500"}`}>
                              {q_item.totalAnswerCount}
                            </span>
                            <span className={`text-[9px] font-bold uppercase tracking-wide mt-0.5 ${answered ? "text-violet-300" : "text-neutral-500"}`}>
                              {q_item.totalAnswerCount === 1 ? "answer" : "answers"}
                            </span>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-white group-hover:text-violet-400 transition-colors leading-snug line-clamp-2 mb-2">
                              {q_item.question}
                            </h3>

                            {/* Tags */}
                            {qTags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-3">
                                {qTags.map((t) => (
                                  <span
                                    key={t.id}
                                    className="inline-flex items-center text-[10px] font-bold text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full"
                                  >
                                    #{t.name}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Meta row */}
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                                <span className="material-symbols-outlined text-[13px]">schedule</span>
                                {timeAgo(q_item.created_at)}
                              </span>
                              <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                                <span className="material-symbols-outlined text-[13px]">visibility</span>
                                {q_item.views.toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                                <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                                {q_item.likes}
                              </span>
                              {answered && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                                  Answered
                                </span>
                              )}
                            </div>
                          </div>

                          <span className="material-symbols-outlined text-[18px] text-neutral-400 group-hover:text-violet-400 transition-colors flex-shrink-0 mt-1">
                            arrow_forward_ios
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-1.5">
                  {page > 1 && (
                    <Link
                      href={buildUrl({ page: page - 1 })}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-bold text-white bg-white/10 border border-white/10 hover:border-violet-400/50 hover:bg-white/15 transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                      Prev
                    </Link>
                  )}
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const p = totalPages <= 7 ? i + 1 : Math.max(1, page - 3) + i;
                    if (p > totalPages) return null;
                    return (
                      <Link
                        key={p}
                        href={buildUrl({ page: p })}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${p === page
                          ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                          : "bg-white/5 border border-white/10 text-neutral-300 hover:border-violet-400/50 hover:text-white"
                          }`}
                      >
                        {p}
                      </Link>
                    );
                  })}
                  {page < totalPages && (
                    <Link
                      href={buildUrl({ page: page + 1 })}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-bold text-white bg-white/10 border border-white/10 hover:border-violet-400/50 hover:bg-white/15 transition-all"
                    >
                      Next
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* ── Sidebar ──────────────────────────────────────────────────────── */}
            <aside className="w-full lg:w-72 flex-shrink-0 space-y-5">

              {/* Topics / Tags */}
              {allTags.length > 0 && (
                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
                  <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-violet-400" style={{ fontVariationSettings: "'FILL' 1" }}>label</span>
                    <h3 className="text-sm font-black text-white">Browse Topics</h3>
                  </div>
                  <div className="p-5 flex flex-wrap gap-2">
                    {allTags.map((t) => {
                      const active = tag === t.slug;
                      return (
                        <Link
                          key={t.id}
                          href={buildUrl({ tag: active ? undefined : t.slug, page: 1 })}
                          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${active
                            ? "bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-600/20"
                            : "text-violet-300 bg-violet-500/10 border-violet-500/20 hover:bg-violet-500/20 hover:border-violet-500/40"
                            }`}
                        >
                          #{t.name}
                          {t.question_count > 0 && (
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${active ? "bg-white/20 text-white" : "bg-violet-500/20 text-violet-300"}`}>
                              {t.question_count}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
                <div className="px-5 py-4 border-b border-white/10">
                  <h3 className="text-sm font-black text-white">Community Stats</h3>
                </div>
                <div className="divide-y divide-white/5">
                  {[
                    { icon: "help", label: "Total Questions", value: total.toLocaleString() },
                    { icon: "label", label: "Topics", value: String(allTags.length) },
                    { icon: "forum", label: "Answered", value: `${Math.round((questions.filter(q => q.totalAnswerCount > 0).length / Math.max(1, questions.length)) * 100)}%` },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="px-5 py-3.5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-[15px] text-violet-400">{icon}</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{label}</p>
                        <p className="text-sm font-black text-white">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explore more */}
              <div className="bg-gradient-to-br from-violet-600/90 to-purple-700/90 backdrop-blur-md rounded-2xl p-6 border border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 -transtale-y-1/2 translate-x-1/2 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors" />
                <h3 className="text-sm font-black text-white mb-2 relative z-10">Looking for more?</h3>
                <p className="text-xs text-violet-100 leading-relaxed mb-5 relative z-10 opacity-90">
                  Explore education blogs, news, and career guides on AdmissionX.
                </p>
                <div className="flex flex-col gap-3 relative z-10">
                  <Link href="/education-blogs" className="flex items-center gap-2.5 text-xs font-bold text-white hover:translate-x-1 transition-all">
                    <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[14px]">article</span>
                    </div>
                    Education Blogs
                  </Link>
                  <Link href="/news" className="flex items-center gap-2.5 text-xs font-bold text-white hover:translate-x-1 transition-all">
                    <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[14px]">newspaper</span>
                    </div>
                    Latest News
                  </Link>
                  <Link href="/popular-careers" className="flex items-center gap-2.5 text-xs font-bold text-white hover:translate-x-1 transition-all">
                    <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[14px]">work</span>
                    </div>
                    Popular Careers
                  </Link>
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





