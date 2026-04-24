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
          { "email":   { $regex: `^${payload.email}$`, $options: "i" } },
        ],
      },
    },
    { $project: { _id: 1, id: 1, slug: 1 } },
    { $limit: 1 },
  ]).toArray();

  if (!cp) return null;
  const collegeprofile_id = cp.id ? Number(cp.id) : cp._id;
  return { payload, collegeprofile_id, slug: cp.slug as string };
}

// GET — list tickets for this college with stats
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = req.nextUrl;
  const page   = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const status = url.searchParams.get("status") ?? "";
  const limit  = 20;
  const skip   = (page - 1) * limit;

  const db = await getDb();

  const filter: Record<string, unknown> = { collegeprofile_id: auth.collegeprofile_id };
  if (status) filter.status = status;

  const [tickets, total] = await Promise.all([
    db.collection("college_helpdesk")
      .find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    db.collection("college_helpdesk").countDocuments(filter),
  ]);

  const [open, in_progress, resolved] = await Promise.all([
    db.collection("college_helpdesk").countDocuments({ collegeprofile_id: auth.collegeprofile_id, status: "open" }),
    db.collection("college_helpdesk").countDocuments({ collegeprofile_id: auth.collegeprofile_id, status: "in_progress" }),
    db.collection("college_helpdesk").countDocuments({ collegeprofile_id: auth.collegeprofile_id, status: "resolved" }),
  ]);

  const result = tickets.map((t: any) => ({
    id:           String(t._id),
    subject:      String(t.subject ?? ""),
    message:      String(t.message ?? ""),
    priority:     String(t.priority ?? "medium"),
    status:       String(t.status ?? "open"),
    category:     String(t.category ?? "General"),
    student_name: String(t.student_name ?? "Student"),
    student_email:String(t.student_email ?? ""),
    reply:        t.reply ? String(t.reply) : null,
    replied_at:   t.replied_at ? String(t.replied_at) : null,
    created_at:   t.created_at
      ? new Date(t.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : null,
  }));

  return NextResponse.json({
    tickets: result,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    stats: { open, in_progress, resolved, total: open + in_progress + resolved },
  });
}

// PUT — college replies to a ticket
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { ticketId, reply } = body as { ticketId?: string; reply?: string };

  if (!ticketId || !reply?.trim()) {
    return NextResponse.json({ error: "ticketId and reply are required" }, { status: 400 });
  }

  const db = await getDb();
  const result = await db.collection("college_helpdesk").updateOne(
    { _id: new ObjectId(ticketId), collegeprofile_id: auth.collegeprofile_id },
    { $set: { reply: reply.trim(), replied_at: new Date(), status: "resolved", updated_at: new Date() } }
  );

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

// PATCH — update ticket status only
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { ticketId, status } = body as { ticketId?: string; status?: string };

  const validStatuses = ["open", "in_progress", "resolved"];
  if (!ticketId || !status || !validStatuses.includes(status)) {
    return NextResponse.json({ error: "ticketId and valid status required" }, { status: 400 });
  }

  const db = await getDb();
  await db.collection("college_helpdesk").updateOne(
    { _id: new ObjectId(ticketId), collegeprofile_id: auth.collegeprofile_id },
    { $set: { status, updated_at: new Date() } }
  );

  return NextResponse.json({ success: true });
}
