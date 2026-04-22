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
    { $project: { _id: 1 } },
    { $limit: 1 },
  ]).toArray();

  if (!cp) return null;
  return { payload, collegeprofile_id: cp._id };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDb();
  const cpId = auth.collegeprofile_id;

  const sp = req.nextUrl.searchParams;
  const search = sp.get("search")?.trim() ?? "";
  const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(sp.get("limit") ?? "20", 10)));
  const skip = (page - 1) * limit;

  // Query only successful transactions
  const matchQuery: any = {
    collegeprofile_id: cpId,
    payment_status: "paid",
  };

  if (search) {
    matchQuery.$or = [
      { transaction_id: { $regex: search, $options: "i" } },
      { application_ref: { $regex: search, $options: "i" } },
      { student_name: { $regex: search, $options: "i" } },
    ];
  }

  const [transactions, totals] = await Promise.all([
    db.collection("next_student_applications").aggregate([
      { $match: matchQuery },
      { $lookup: { from: "next_student_signups", localField: "student_id", foreignField: "_id", as: "s" } },
      { $unwind: { path: "$s", preserveNullAndEmptyArrays: true } },
      { 
        $project: { 
          id: "$_id",
          application_ref: 1,
          student_name: { $ifNull: ["$s.name", "Unknown student"] },
          student_email: { $ifNull: ["$s.email", "—"] },
          course_name: 1,
          amount_paid: 1,
          transaction_id: 1,
          created_at: 1,
          updated_at: 1
        } 
      },
      { $sort: { updated_at: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]).toArray(),

    db.collection("next_student_applications").aggregate([
      { $match: { collegeprofile_id: cpId, payment_status: "paid" } },
      { 
        $group: { 
          _id: null, 
          total_revenue: { $sum: "$amount_paid" },
          count: { $sum: 1 } 
        } 
      }
    ]).toArray()
  ]);

  const totalRevenue = totals[0]?.total_revenue ?? 0;
  const totalCount = totals[0]?.count ?? 0;

  return NextResponse.json({
    transactions,
    stats: {
      totalRevenue,
      totalCount,
    },
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    }
  });
}
