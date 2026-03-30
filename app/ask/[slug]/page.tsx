import { getDb } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function parseIds(raw: string | null | undefined): number[] {
  if (!raw) return [];
  return raw.split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n) && n > 0);
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try { return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }); }
  catch { return ""; }
}

function timeAgo(dateStr: string | null | undefined): string {
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
  } catch { return "Recently"; }
}

function hasHtml(text: string | null | undefined): boolean {
  return !!(text && /<[^>]+>/.test(text));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const numericId = parseInt(slug, 10);
  const db = await getDb();
  const filter = !isNaN(numericId)
    ? { $or: [{ slug }, { id: numericId }], status: 1 }
    : { slug, status: 1 };
  const q = await db.collection("ask_questions").findOne(filter, { projection: { question: 1 } });
  if (!q) return { title: "Question Not Found | AdmissionX" };
  const title = q.question.length > 60 ? q.question.slice(0, 57) + "…" : q.question;
  return { title: `${title} | AdmissionX Q&A`, description: stripHtml(q.question).slice(0, 160) };
}

export default async function AskDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const numericId = parseInt(slug, 10);
  const db = await getDb();

  const filter = !isNaN(numericId)
    ? { $or: [{ slug }, { id: numericId }], status: 1 }
    : { slug, status: 1 };
  const questionDoc = await db.collection("ask_questions").findOne(filter);
  if (!questionDoc) notFound();

  const [answerDocs, tagDocs] = await Promise.all([
    db.collection("ask_question_answers")
      .find({ questionId: questionDoc.id, status: 1 })
      .sort({ likes: -1, created_at: 1 }).toArray(),
    parseIds(questionDoc.askQuestionTagIds).length
      ? db.collection("ask_question_tags").find({ id: { $in: parseIds(questionDoc.askQuestionTagIds) } }).project({ id: 1, name: 1, slug: 1 }).toArray()
      : Promise.resolve([] as import("mongodb").WithId<import("mongodb").Document>[]),
  ]);

  // Fetch comments for all answers
  const commentsByAnswerId = new Map<number, Record<string, unknown>[]>();
  if (answerDocs.length > 0) {
    const answerIds = answerDocs.map((a) => a.id);
    const commentDocs = await db.collection("ask_question_answer_comments")
      .find({ answerId: { $in: answerIds }, status: 1 })
      .sort({ created_at: 1 }).toArray() as Record<string, unknown>[];
    for (const c of commentDocs) {
      const list = commentsByAnswerId.get(c.answerId as number) ?? [];
      list.push(c);
      commentsByAnswerId.set(c.answerId as number, list);
    }
  }

  // Related questions
  const tagIds = parseIds(questionDoc.askQuestionTagIds);
  let relatedDocs: Record<string, unknown>[] = [];
  if (tagIds.length > 0) {
    relatedDocs = await db.collection("ask_questions")
      .find({ status: 1, id: { $ne: questionDoc.id }, askQuestionTagIds: { $regex: tagIds.map((id) => `(^|,)\\s*${id}\\s*(,|$)`).join("|") } })
      .sort({ created_at: -1 }).limit(4)
      .project({ id: 1, question: 1, slug: 1, views: 1, likes: 1, totalAnswerCount: 1, created_at: 1 }).toArray() as Record<string, unknown>[];
  }
  if (relatedDocs.length < 4) {
    const excludeIds = [questionDoc.id, ...relatedDocs.map((r) => r.id)];
    const extras = await db.collection("ask_questions")
      .find({ status: 1, id: { $nin: excludeIds } })
      .sort({ created_at: -1 }).limit(4 - relatedDocs.length)
      .project({ id: 1, question: 1, slug: 1, views: 1, likes: 1, totalAnswerCount: 1, created_at: 1 }).toArray() as Record<string, unknown>[];
    relatedDocs = [...relatedDocs, ...extras];
  }

  const ico     = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };
  const icoFill = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
  const qDate   = formatDate(questionDoc.questionDate ?? questionDoc.created_at);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 py-14 px-4">
          <div className="max-w-6xl mx-auto">
            <nav className="flex items-center flex-wrap gap-1 text-white/60 text-sm mb-6">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span className="material-symbols-rounded text-base" style={ico}>chevron_right</span>
              <Link href="/ask" className="hover:text-white transition-colors">Q&amp;A</Link>
              <span className="material-symbols-rounded text-base" style={ico}>chevron_right</span>
              <span className="text-white/80 line-clamp-1">{questionDoc.question.length > 60 ? questionDoc.question.slice(0, 57) + "…" : questionDoc.question}</span>
            </nav>
            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight max-w-3xl mb-5">{questionDoc.question}</h1>
            {tagDocs.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {tagDocs.map((tag) => (
                  <Link key={tag.id} href={`/ask?tag=${tag.slug}`}
                    className="text-xs font-semibold bg-violet-600/40 text-violet-200 border border-violet-500/40 px-3 py-1 rounded-full hover:bg-violet-600/60 transition-colors">
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 bg-white/10 text-white/80 text-sm px-3 py-1.5 rounded-full">
                <span className="material-symbols-rounded text-base" style={ico}>visibility</span>
                {questionDoc.views ?? 0} views
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 text-white/80 text-sm px-3 py-1.5 rounded-full">
                <span className="material-symbols-rounded text-base" style={ico}>thumb_up</span>
                {questionDoc.likes ?? 0} likes
              </span>
              <span className="inline-flex items-center gap-1.5 bg-violet-600/60 text-white text-sm px-3 py-1.5 rounded-full font-semibold">
                <span className="material-symbols-rounded text-base" style={icoFill}>forum</span>
                {questionDoc.totalAnswerCount ?? 0} answers
              </span>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="lg:w-2/3 min-w-0 flex flex-col gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
                <div className="flex items-start gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-rounded text-violet-600 text-xl" style={icoFill}>person</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Anonymous Student</p>
                    <p className="text-xs text-gray-400">{qDate}</p>
                  </div>
                </div>
                <p className="text-gray-800 text-base leading-relaxed font-medium">{questionDoc.question}</p>
                <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap gap-5 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5"><span className="material-symbols-rounded text-base" style={ico}>visibility</span>{questionDoc.views ?? 0} views</span>
                  <span className="flex items-center gap-1.5"><span className="material-symbols-rounded text-base" style={ico}>thumb_up</span>{questionDoc.likes ?? 0} likes</span>
                  <span className="flex items-center gap-1.5"><span className="material-symbols-rounded text-base" style={ico}>forum</span>{questionDoc.totalAnswerCount ?? 0} answers</span>
                </div>
              </div>

              {answerDocs.length > 0 ? (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="material-symbols-rounded text-violet-600 text-xl" style={icoFill}>forum</span>
                    {answerDocs.length} Answer{answerDocs.length !== 1 ? "s" : ""}
                  </h2>
                  <div className="flex flex-col gap-5">
                    {answerDocs.map((ans, idx) => {
                      const ansComments = commentsByAnswerId.get(ans.id) ?? [];
                      const visibleComments = ansComments.slice(0, 3);
                      const hiddenCount = ansComments.length - visibleComments.length;
                      const ansAgo = timeAgo(ans.answerDate ?? ans.created_at);
                      const isRich = hasHtml(ans.answer);
                      const isBest = idx === 0;
                      return (
                        <div key={String(ans._id)} className={`bg-white rounded-2xl shadow-sm border p-6 ${isBest ? "border-violet-200 ring-1 ring-violet-100" : "border-gray-100"}`}>
                          <div className="flex items-start gap-3 mb-4">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${isBest ? "bg-violet-600" : "bg-gray-100"}`}>
                              <span className={`material-symbols-rounded text-lg ${isBest ? "text-white" : "text-gray-500"}`} style={icoFill}>{isBest ? "workspace_premium" : "person"}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-semibold text-gray-800">{isBest ? "Top Answer" : `Answer #${idx + 1}`}</p>
                                {isBest && <span className="text-xs bg-violet-100 text-violet-700 font-semibold px-2 py-0.5 rounded-full">Best</span>}
                              </div>
                              <p className="text-xs text-gray-400">{ansAgo}</p>
                            </div>
                          </div>
                          {isRich ? (
                            <div className="rich-text" dangerouslySetInnerHTML={{ __html: ans.answer ?? "" }} />
                          ) : (
                            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{ans.answer}</p>
                          )}
                          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5"><span className="material-symbols-rounded text-base" style={ico}>thumb_up</span>{ans.likes ?? 0} likes</span>
                          </div>
                          {visibleComments.length > 0 && (
                            <div className="mt-4 pl-4 border-l-2 border-violet-100 flex flex-col gap-3">
                              {visibleComments.map((c) => {
                                const comment = c as { _id: unknown; replyanswer: string | null; answerDate: string | null; created_at: string };
                                return (
                                <div key={String(comment._id)} className="bg-gray-50 rounded-xl px-4 py-3">
                                  <p className="text-sm text-gray-700 leading-relaxed">{comment.replyanswer}</p>
                                  <p className="text-xs text-gray-400 mt-1">{timeAgo(comment.answerDate ?? comment.created_at)}</p>
                                </div>
                                );
                              })}
                              {hiddenCount > 0 && <p className="text-xs text-gray-400 pl-1 italic">+{hiddenCount} more comment{hiddenCount !== 1 ? "s" : ""}</p>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                  <span className="material-symbols-rounded text-6xl text-gray-200 mb-4 block" style={icoFill}>forum</span>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No answers yet</h3>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto">This question hasn&apos;t been answered yet. Check back soon!</p>
                </div>
              )}

              <div>
                <Link href="/ask" className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 hover:text-violet-700 transition-colors">
                  <span className="material-symbols-rounded text-base" style={ico}>arrow_back</span>
                  Back to Q&amp;A
                </Link>
              </div>
            </div>

            <aside className="lg:w-1/3 flex flex-col gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="material-symbols-rounded text-violet-600 text-xl" style={icoFill}>bar_chart</span>
                  Question Stats
                </h3>
                <dl className="grid grid-cols-2 gap-3">
                  {([
                    { label: "Views", value: questionDoc.views ?? 0, icon: "visibility" },
                    { label: "Likes", value: questionDoc.likes ?? 0, icon: "thumb_up" },
                    { label: "Answers", value: questionDoc.totalAnswerCount ?? 0, icon: "forum" },
                    { label: "Comments", value: questionDoc.totalCommentsCount ?? 0, icon: "comment" },
                  ] as const).map((stat) => (
                    <div key={stat.label} className="bg-violet-50 rounded-xl p-3 text-center">
                      <span className="material-symbols-rounded text-violet-500 text-xl mb-1 block" style={ico}>{stat.icon}</span>
                      <dd className="text-xl font-bold text-gray-900">{stat.value}</dd>
                      <dt className="text-xs text-gray-500">{stat.label}</dt>
                    </div>
                  ))}
                </dl>
              </div>

              {tagDocs.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="material-symbols-rounded text-violet-600 text-xl" style={icoFill}>sell</span>
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tagDocs.map((tag) => (
                      <Link key={tag.id} href={`/ask?tag=${tag.slug}`}
                        className="text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200 px-3 py-1.5 rounded-full hover:bg-violet-100 transition-colors">
                        #{tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {relatedDocs.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="material-symbols-rounded text-violet-600 text-xl" style={icoFill}>help</span>
                    Related Questions
                  </h3>
                  <ul className="flex flex-col gap-4">
                    {relatedDocs.map((r) => {
                      const rel = r as { _id: unknown; id: number; question: string; slug: string | null; totalAnswerCount: number; views: number };
                      return (
                      <li key={String(rel._id)}>
                        <Link href={`/ask/${rel.slug ?? rel.id}`} className="group flex items-start gap-2">
                          <span className="material-symbols-rounded text-violet-300 text-base mt-0.5 flex-shrink-0" style={icoFill}>help_outline</span>
                          <div className="min-w-0">
                            <p className="text-sm text-gray-700 group-hover:text-violet-600 transition-colors line-clamp-2 leading-snug">{rel.question}</p>
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-rounded" style={{ ...ico, fontSize: "0.85rem" }}>forum</span>
                                {rel.totalAnswerCount ?? 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-rounded" style={{ ...ico, fontSize: "0.85rem" }}>visibility</span>
                                {rel.views ?? 0}
                              </span>
                            </div>
                          </div>
                        </Link>
                      </li>
                      );
                    })}
                  </ul>
                  <Link href="/ask" className="mt-5 flex items-center justify-center gap-1.5 text-sm font-semibold text-violet-600 border border-violet-200 hover:bg-violet-50 rounded-xl py-2.5 transition-colors">
                    Browse all questions
                    <span className="material-symbols-rounded text-base" style={ico}>arrow_forward</span>
                  </Link>
                </div>
              )}

              <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-purple-800 p-6 text-white">
                <span className="material-symbols-rounded text-3xl mb-3 block" style={icoFill}>forum</span>
                <h3 className="font-bold text-lg mb-2">Have a Question?</h3>
                <p className="text-sm text-violet-100 mb-5 leading-relaxed">Join thousands of students asking and getting expert answers on admissions, exams, and college life.</p>
                <Link href="/ask" className="inline-flex items-center gap-1.5 bg-white text-violet-700 font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-violet-50 transition-colors">
                  Explore Q&amp;A
                  <span className="material-symbols-rounded text-base" style={ico}>arrow_forward</span>
                </Link>
              </div>
            </aside>
          </div>
        </div>

        <section className="bg-gradient-to-r from-violet-700 via-violet-800 to-purple-900 py-16 px-4 mt-4">
          <div className="max-w-4xl mx-auto text-center">
            <span className="material-symbols-rounded text-4xl text-white/50 mb-4 block" style={icoFill}>forum</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Got More Questions?</h2>
            <p className="text-violet-100 mb-8 text-base max-w-xl mx-auto">Thousands of students are asking and answering questions about admissions, exams, scholarships, and careers.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/ask" className="inline-flex items-center gap-2 bg-white text-violet-700 font-semibold px-7 py-3 rounded-full hover:bg-violet-50 transition-colors shadow-md">
                <span className="material-symbols-rounded text-lg" style={icoFill}>help</span>
                Browse Q&amp;A
              </Link>
              <Link href="/education-blogs" className="inline-flex items-center gap-2 bg-violet-900/60 text-white font-semibold px-7 py-3 rounded-full hover:bg-violet-900/80 transition-colors shadow-md border border-violet-500/50">
                <span className="material-symbols-rounded text-lg" style={icoFill}>library_books</span>
                Education Blogs
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
