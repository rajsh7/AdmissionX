import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyCollegeToken } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";

async function checkAuth(slug: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("adx_college")?.value;
  if (!token) return null;
  const payload = await verifyCollegeToken(token);
  if (!payload) return null;

  const db = await getDb();
  const [cp] = await db.collection("collegeprofile").aggregate([
    { $match: { slug } },
    { $lookup: { from: "users", localField: "users_id", foreignField: "_id", as: "u" } },
    { $unwind: { path: "$u", preserveNullAndEmptyArrays: true } },
    {
      $match: {
        $or: [
          { "u.email": { $regex: `^${payload.email}$`, $options: "i" } },
          { "email": { $regex: `^${payload.email}$`, $options: "i" } },
        ],
      },
    },
    { $project: { _id: 1, id: 1, slug: 1 } },
    { $limit: 1 },
  ]).toArray();

  if (!cp) return null;
  return { payload, slug: cp.slug as string };
}

// GET — fetch questions whose slug matches this college, with answers + comments
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = req.nextUrl;
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const limit = 15;
  const skip = (page - 1) * limit;
  const search = url.searchParams.get("q")?.trim() ?? "";

  const db = await getDb();

  const qFilter: Record<string, unknown> = { slug };
  if (search) qFilter.question = { $regex: search, $options: "i" };

  const [questions, total] = await Promise.all([
    db.collection("ask_questions")
      .find(qFilter)
      .sort({ id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    db.collection("ask_questions").countDocuments(qFilter),
  ]);

  if (!questions.length) {
    return NextResponse.json({ questions: [], total: 0, page, totalPages: 0 });
  }

  const qIds = questions.map((q: any) => Number(q.id)).filter(Boolean);

  // Fetch answers + comments for these questions
  const [answers, comments] = await Promise.all([
    db.collection("ask_question_answers")
      .find({ questionId: { $in: qIds } })
      .sort({ id: 1 })
      .toArray(),
    db.collection("ask_question_comments")
      .find({ questionId: { $in: qIds } })
      .sort({ id: 1 })
      .toArray(),
  ]);

  // Fetch user names for answers/comments
  const userIds = [
    ...new Set([
      ...answers.map((a: any) => Number(a.userId)).filter(Boolean),
      ...comments.map((c: any) => Number(c.userId)).filter(Boolean),
    ]),
  ];
  const users = userIds.length
    ? await db.collection("users")
        .find({ id: { $in: userIds } }, { projection: { id: 1, firstname: 1, lastname: 1 } })
        .toArray()
    : [];
  const userMap = new Map(
    users.map((u: any) => [
      Number(u.id),
      `${String(u.firstname ?? "").trim()} ${String(u.lastname ?? "").trim()}`.trim() || "User",
    ])
  );

  const answersByQ = new Map<number, any[]>();
  for (const a of answers) {
    const qid = Number(a.questionId);
    if (!answersByQ.has(qid)) answersByQ.set(qid, []);
    answersByQ.get(qid)!.push({
      id: String(a._id),
      answer: String(a.answer ?? "").replace(/<[^>]*>/g, "").trim(),
      userName: userMap.get(Number(a.userId)) ?? "User",
      date: a.answerDate ? String(a.answerDate) : null,
      status: Number(a.status ?? 0),
    });
  }

  const commentsByQ = new Map<number, any[]>();
  for (const c of comments) {
    const qid = Number(c.questionId);
    if (!commentsByQ.has(qid)) commentsByQ.set(qid, []);
    commentsByQ.get(qid)!.push({
      id: String(c._id),
      comment: String(c.comment ?? "").replace(/<[^>]*>/g, "").trim(),
      userName: userMap.get(Number(c.userId)) ?? "User",
      date: c.commentDate ? String(c.commentDate) : null,
    });
  }

  const result = questions.map((q: any) => {
    const qid = Number(q.id);
    return {
      id: String(q._id),
      numericId: qid,
      question: String(q.question ?? "").replace(/<[^>]*>/g, "").trim(),
      date: q.questionDate ? String(q.questionDate) : null,
      status: Number(q.status ?? 0),
      answers: answersByQ.get(qid) ?? [],
      comments: commentsByQ.get(qid) ?? [],
    };
  });

  return NextResponse.json({
    questions: result,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

// POST — college adds an answer to a question
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { questionId, answer } = body as { questionId?: number; answer?: string };

  if (!questionId || !answer?.trim()) {
    return NextResponse.json({ error: "questionId and answer are required" }, { status: 400 });
  }

  const db = await getDb();

  // Get next id
  const last = await db.collection("ask_question_answers")
    .find({}, { projection: { id: 1 } }).sort({ id: -1 }).limit(1).toArray();
  const nextId = ((last[0]?.id as number) ?? 0) + 1;

  await db.collection("ask_question_answers").insertOne({
    id: nextId,
    questionId,
    answer: answer.trim(),
    userId: null,
    answerDate: new Date(),
    status: 1,
    created_at: new Date(),
    updated_at: new Date(),
  });

  return NextResponse.json({ success: true });
}

// DELETE — remove an answer
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const answerId = req.nextUrl.searchParams.get("answerId");
  if (!answerId) return NextResponse.json({ error: "answerId required" }, { status: 400 });

  const db = await getDb();
  await db.collection("ask_question_answers").deleteOne({ _id: new ObjectId(answerId) });

  return NextResponse.json({ success: true });
}
