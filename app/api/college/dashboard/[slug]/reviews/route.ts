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
  const cp = await db.collection("collegeprofile").findOne(
    { slug },
    { projection: { _id: 1, users_id: 1, email: 1 } }
  );
  if (!cp) return null;

  return { payload, collegeprofile_id: cp._id };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDb();
  const cpId = auth.collegeprofile_id;

  const reviews = await db.collection("college_reviews")
    .aggregate([
      { $match: { collegeprofile_id: cpId } },
      {
        $lookup: {
          from: "users",
          localField: "users_id",
          foreignField: "id",
          as: "student",
        },
      },
      { $unwind: { path: "$student", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          academic: 1,
          infrastructure: 1,
          faculty: 1,
          accommodation: 1,
          placement: 1,
          social: 1,
          votes: 1,
          created_at: 1,
          updated_at: 1,
          student_name: { $ifNull: ["$student.firstname", "Anonymous Student"] },
          student_email: "$student.email",
        },
      },
      { $sort: { created_at: -1 } },
    ])
    .toArray();

  const formattedReviews = reviews.map((r) => ({
    id: r._id.toString(),
    title: String(r.title || ""),
    description: String(r.description || ""),
    academic: Number(r.academic || 0),
    infrastructure: Number(r.infrastructure || 0),
    faculty: Number(r.faculty || 0),
    accommodation: Number(r.accommodation || 0),
    placement: Number(r.placement || 0),
    social: Number(r.social || 0),
    votes: Number(r.votes || 0),
    student_name: String(r.student_name),
    student_email: String(r.student_email || ""),
    created_at: r.created_at,
    rating: Math.min(5, Math.max(1, Math.round(
      ([r.academic, r.accommodation, r.faculty, r.infrastructure, r.placement, r.social]
        .filter((v): v is number => typeof v === "number" && v > 0)
        .reduce((a, b) => a + b, 0) /
      Math.max(1, [r.academic, r.accommodation, r.faculty, r.infrastructure, r.placement, r.social]
        .filter((v): v is number => typeof v === "number" && v > 0).length)
      ) / 2
    ))),
  }));

  return NextResponse.json({ reviews: formattedReviews });
}
