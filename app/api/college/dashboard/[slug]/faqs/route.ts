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
          { "email": { $regex: `^${payload.email}$`, $options: "i" } }
        ]
      }
    },
    { $project: { _id: 1, id: 1 } },
    { $limit: 1 },
  ]).toArray();

  if (!cp) return null;
  // Use numeric id if available, otherwise fall back to ObjectId
  const collegeprofile_id = cp.id ? Number(cp.id) : cp._id;
  return { payload, collegeprofile_id };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDb();
  const faqs = await db.collection("college_faqs")
    .find({ collegeprofile_id: auth.collegeprofile_id })
    .sort({ created_at: -1 })
    .toArray();

  return NextResponse.json({ faqs });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { question?: string; answer?: string; refLinks?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.question?.trim() || !body.answer?.trim()) {
    return NextResponse.json({ error: "Question and Answer are required" }, { status: 400 });
  }

  const db = await getDb();
  const result = await db.collection("college_faqs").insertOne({
    collegeprofile_id: auth.collegeprofile_id,
    question: body.question.trim(),
    answer: body.answer.trim(),
    refLinks: body.refLinks?.trim() || "",
    created_at: new Date(),
    updated_at: new Date(),
  });

  return NextResponse.json({ success: true, id: result.insertedId });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { id?: string; question?: string; answer?: string; refLinks?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.id) return NextResponse.json({ error: "FAQ ID is required" }, { status: 400 });

  const db = await getDb();
  const result = await db.collection("college_faqs").updateOne(
    { _id: new ObjectId(body.id), collegeprofile_id: auth.collegeprofile_id },
    { 
      $set: { 
        question: body.question?.trim(), 
        answer: body.answer?.trim(),
        refLinks: body.refLinks?.trim(),
        updated_at: new Date()
      } 
    }
  );

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const faqId = req.nextUrl.searchParams.get("id");
  if (!faqId) return NextResponse.json({ error: "FAQ ID is required" }, { status: 400 });

  const db = await getDb();
  const result = await db.collection("college_faqs").deleteOne({
    _id: new ObjectId(faqId),
    collegeprofile_id: auth.collegeprofile_id,
  });

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
