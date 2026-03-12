import pool from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RowDataPacket } from "mysql2";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

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

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[ask/page.tsx safeQuery]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuestionRow extends RowDataPacket {
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

interface TagRow extends RowDataPacket {
  id: number;
  name: string;
  slug: string;
  question_count: number;
}

interface CountRow extends RowDataPacket {
  total: number;
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

  // ── Resolve tag filter ────────────────────────────────────────────────────
  let tagId: number | null = null;
  if (tag) {
    const tagRows = await safeQuery<TagRow>(
      `SELECT id FROM ask_question_tags WHERE slug = ? LIMIT 1`,
      [tag],
    );
    tagId = tagRows[0]?.id ?? null;
  }

  // ── Build WHERE ───────────────────────────────────────────────────────────
  const conditions: string[] = ["aq.status = 1"];
  const qParams: (string | number)[] = [];

  if (q) {
    conditions.push("aq.question LIKE ?");
    qParams.push(`%${q}%`);
  }
  if (tagId !== null) {
    conditions.push("FIND_IN_SET(?, aq.askQuestionTagIds)");
    qParams.push(tagId);
  }

  const where = `WHERE ${conditions.join(" AND ")}`;

  let orderBy = "aq.created_at DESC";
  if (sort === "popular") orderBy = "aq.likes DESC, aq.views DESC";
  if (sort === "answered") orderBy = "aq.totalAnswerCount DESC, aq.created_at DESC";
  if (sort === "views") orderBy = "aq.views DESC";

  // ── Fetch questions + count + tags in parallel ────────────────────────────
  const [questions, countRows, allTags] = await Promise.all([
    safeQuery<QuestionRow>(
      `SELECT aq.id, aq.question, aq.questionDate, aq.slug,
              aq.likes, aq.views, aq.totalAnswerCount,
              aq.totalCommentsCount, aq.askQuestionTagIds, aq.created_at
       FROM ask_questions aq
       ${where}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [...qParams, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total FROM ask_questions aq ${where}`,
      qParams,
    ),
    safeQuery<TagRow>(
      `SELECT id, name, slug,
              (SELECT COUNT(*) FROM ask_questions
               WHERE status = 1 AND FIND_IN_SET(ask_question_tags.id, askQuestionTagIds)) AS question_count
       FROM ask_question_tags
       ORDER BY question_count DESC, name ASC
       LIMIT 30`,
    ),
  ]);

  const total = countRows[0]?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // ── Build a tag lookup map for rendering tag chips ────────────────────────
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
    { value: "latest",   label: "Latest",       icon: "schedule" },
    { value: "popular",  label: "Popular",       icon: "trending_up" },
    { value: "answered", label: "Most Answered", icon: "forum" },
    { value: "views",    label: "Most Viewed",   icon: "visibility" },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-neutral-900 pt-24 pb-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-neutral-300">Community Q&amp;A</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-2xl">
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
              <p className="text-neutral-400 text-sm leading-relaxed max-w-lg">
                Browse questions from students about admissions, exams, scholarships,
                and campus life — answered by experts and peers.
              </p>
            </div>

            <div className="flex gap-4 flex-shrink-0">
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
          <form method="GET" action="/ask" className="mt-8">
            {tag && <input type="hidden" name="tag" value={tag} />}
            {sort && sort !== "latest" && <input type="hidden" name="sort" value={sort} />}
            <div className="relative max-w-xl">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-neutral-400">search</span>
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Search questions…"
                className="w-full bg-white/10 border border-white/10 text-white placeholder-neutral-500 rounded-2xl pl-11 pr-4 py-3 text-sm font-medium focus:outline-none focus:border-violet-400/50 focus:bg-white/15 transition-all"
              />
            </div>
          </form>
        </div>
      </div>

      {/* ── Sort tabs ────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-neutral-100 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <nav className="flex items-center overflow-x-auto scrollbar-hide">
            {sortTabs.map((tab) => {
              const active = sort === tab.value;
              return (
                <Link
                  key={tab.value}
                  href={buildUrl({ sort: tab.value, page: 1 })}
                  className={`flex items-center gap-1.5 px-4 py-4 text-xs font-bold whitespace-nowrap transition-colors shrink-0 border-b-2 -mb-px ${
                    active
                      ? "border-violet-600 text-violet-600"
                      : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ── Questions list ───────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Active filters */}
            {(tag || q) && (
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className="text-xs font-bold text-neutral-400">Filters:</span>
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
                <Link href="/ask" className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors">
                  Clear all
                </Link>
              </div>
            )}

            {questions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-neutral-100 p-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-[32px] text-violet-400" style={{ fontVariationSettings: "'FILL' 1" }}>forum</span>
                </div>
                <h3 className="text-base font-black text-neutral-700 mb-2">No questions found</h3>
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
                      className="block bg-white rounded-2xl border border-neutral-100 hover:border-violet-200 hover:shadow-md hover:shadow-violet-500/5 transition-all duration-300 p-5 group"
                    >
                      <div className="flex items-start gap-4">
                        {/* Answer count badge */}
                        <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl flex-shrink-0 ${answered ? "bg-violet-50 border border-violet-200" : "bg-neutral-50 border border-neutral-200"}`}>
                          <span className={`text-lg font-black leading-none ${answered ? "text-violet-700" : "text-neutral-400"}`}>
                            {q_item.totalAnswerCount}
                          </span>
                          <span className={`text-[9px] font-bold uppercase tracking-wide mt-0.5 ${answered ? "text-violet-500" : "text-neutral-400"}`}>
                            {q_item.totalAnswerCount === 1 ? "answer" : "answers"}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-neutral-800 group-hover:text-violet-700 transition-colors leading-snug line-clamp-2 mb-2">
                            {q_item.question}
                          </h3>

                          {/* Tags */}
                          {qTags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {qTags.map((t) => (
                                <span
                                  key={t.id}
                                  className="inline-flex items-center text-[10px] font-bold text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full"
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
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                Answered
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="material-symbols-outlined text-[18px] text-neutral-300 group-hover:text-violet-400 transition-colors flex-shrink-0 mt-1">
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
                    className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-bold text-neutral-600 bg-white border border-neutral-200 hover:border-violet-300 hover:text-violet-600 transition-all"
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
                      className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                        p === page
                          ? "bg-violet-600 text-white shadow-md"
                          : "bg-white border border-neutral-200 text-neutral-600 hover:border-violet-300 hover:text-violet-600"
                      }`}
                    >
                      {p}
                    </Link>
                  );
                })}
                {page < totalPages && (
                  <Link
                    href={buildUrl({ page: page + 1 })}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-bold text-neutral-600 bg-white border border-neutral-200 hover:border-violet-300 hover:text-violet-600 transition-all"
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
              <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-neutral-100 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-violet-500" style={{ fontVariationSettings: "'FILL' 1" }}>label</span>
                  <h3 className="text-sm font-black text-neutral-800">Browse Topics</h3>
                </div>
                <div className="p-4 flex flex-wrap gap-2">
                  {allTags.map((t) => {
                    const active = tag === t.slug;
                    return (
                      <Link
                        key={t.id}
                        href={buildUrl({ tag: active ? undefined : t.slug, page: 1 })}
                        className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                          active
                            ? "bg-violet-600 text-white border-violet-600"
                            : "text-violet-700 bg-violet-50 border-violet-100 hover:bg-violet-100"
                        }`}
                      >
                        #{t.name}
                        {t.question_count > 0 && (
                          <span className={`text-[9px] font-black ${active ? "text-violet-200" : "text-violet-400"}`}>
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
            <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-neutral-100">
                <h3 className="text-sm font-black text-neutral-800">Community Stats</h3>
              </div>
              <div className="divide-y divide-neutral-50">
                {[
                  { icon: "help", label: "Total Questions", value: total.toLocaleString() },
                  { icon: "label", label: "Topics", value: String(allTags.length) },
                  { icon: "forum", label: "Answered", value: `${Math.round((questions.filter(q => q.totalAnswerCount > 0).length / Math.max(1, questions.length)) * 100)}%` },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="px-5 py-3.5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[15px] text-violet-500">{icon}</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{label}</p>
                      <p className="text-sm font-black text-neutral-700">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Explore more */}
            <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-5">
              <h3 className="text-sm font-black text-white mb-2">Looking for more?</h3>
              <p className="text-xs text-violet-100 leading-relaxed mb-4">
                Explore education blogs, news, and career guides on AdmissionX.
              </p>
              <div className="flex flex-col gap-2">
                <Link href="/education-blogs" className="flex items-center gap-2 text-xs font-bold text-white hover:text-violet-200 transition-colors">
                  <span className="material-symbols-outlined text-[15px]">article</span>
                  Education Blogs
                </Link>
                <Link href="/news" className="flex items-center gap-2 text-xs font-bold text-white hover:text-violet-200 transition-colors">
                  <span className="material-symbols-outlined text-[15px]">newspaper</span>
                  Latest News
                </Link>
                <Link href="/popular-careers" className="flex items-center gap-2 text-xs font-bold text-white hover:text-violet-200 transition-colors">
                  <span className="material-symbols-outlined text-[15px]">work</span>
                  Popular Careers
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}
