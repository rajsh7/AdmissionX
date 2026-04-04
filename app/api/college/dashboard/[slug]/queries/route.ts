import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyCollegeToken } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import { sendMail } from "@/lib/email";

async function checkAuth(slug: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("adx_college")?.value;
  if (!token) return null;
  const payload = await verifyCollegeToken(token);
  if (!payload) return null;
  const db = await getDb();
  const profile = await db.collection("collegeprofile").findOne(
    { email: payload.email.toLowerCase(), slug },
    { projection: { _id: 1, college_name: 1 } }
  );
  if (!profile) return null;
  return { payload, slug, college_name: profile.college_name ?? payload.name };
}

// GET /api/college/dashboard/[slug]/queries?status=pending&page=1
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const status = sp.get("status") ?? "";
  const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10));
  const limit = 20;
  const skip = (page - 1) * limit;

  const db = await getDb();
  const filter: Record<string, unknown> = { college_slug: slug };
  if (status) filter.status = status;

  const [rows, total] = await Promise.all([
    db.collection("student_queries").find(filter).sort({ created_at: -1 }).skip(skip).limit(limit).toArray(),
    db.collection("student_queries").countDocuments(filter),
  ]);

  const stats = {
    total: await db.collection("student_queries").countDocuments({ college_slug: slug }),
    pending: await db.collection("student_queries").countDocuments({ college_slug: slug, status: "pending" }),
    answered: await db.collection("student_queries").countDocuments({ college_slug: slug, status: "answered" }),
  };

  const queries = rows.map((r) => ({
    id: r._id.toString(),
    student_id: r.student_id,
    student_name: r.student_name ?? "Student",
    student_email: r.student_email ?? "",
    subject: r.subject ?? "",
    message: r.message ?? "",
    status: r.status ?? "pending",
    response: r.response ?? null,
    responded_at: r.responded_at ?? null,
    created_at: r.created_at
      ? new Date(r.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : null,
  }));

  return NextResponse.json({
    queries,
    stats,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

// PUT /api/college/dashboard/[slug]/queries
// Body: { query_id: string, response: string }
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { query_id?: string; response?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { query_id, response } = body;
  if (!query_id || !response?.trim()) {
    return NextResponse.json({ error: "query_id and response are required." }, { status: 400 });
  }

  let oid: ObjectId;
  try { oid = new ObjectId(query_id); } catch { return NextResponse.json({ error: "Invalid query_id." }, { status: 400 }); }

  const db = await getDb();
  const query = await db.collection("student_queries").findOne({ _id: oid, college_slug: slug });
  if (!query) return NextResponse.json({ error: "Query not found." }, { status: 404 });

  await db.collection("student_queries").updateOne(
    { _id: oid },
    { $set: { response: response.trim(), status: "answered", responded_at: new Date() } }
  );

  // Email the student
  if (query.student_email) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://admissionx.com";
    try {
      await sendMail({
        to: query.student_email,
        subject: `Your query has been answered — ${auth.college_name}`,
        html: `
<!DOCTYPE html><html><head><meta charset="UTF-8"/><style>
body{margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;}
.w{max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);}
.h{background:#c0392b;padding:32px 40px;text-align:center;}
.h h1{margin:0;color:#fff;font-size:24px;font-weight:700;}
.h p{margin:4px 0 0;color:rgba(255,255,255,.75);font-size:13px;}
.b{padding:40px;color:#1e293b;line-height:1.6;}
.q{background:#f8fafc;border-left:4px solid #e2e8f0;padding:12px 16px;border-radius:0 8px 8px 0;margin:12px 0;font-style:italic;color:#64748b;}
.r{background:#f0fdf4;border-left:4px solid #22c55e;padding:12px 16px;border-radius:0 8px 8px 0;margin:12px 0;color:#166534;}
.btn{display:inline-block;margin:16px 0;padding:14px 32px;background:#c0392b;color:#fff!important;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;}
.f{padding:24px 40px;background:#f8fafc;text-align:center;font-size:12px;color:#94a3b8;}
</style></head><body>
<div class="w">
  <div class="h"><h1>AdmissionX</h1><p>India's Trusted College Admissions Platform</p></div>
  <div class="b">
    <h2 style="margin:0 0 8px;font-size:20px;">Your Query Has Been Answered</h2>
    <p>Hi <strong>${query.student_name ?? "Student"}</strong>,</p>
    <p><strong>${auth.college_name}</strong> has replied to your query:</p>
    <p style="font-weight:600;color:#334155;">${query.subject}</p>
    <div class="q">"${query.message}"</div>
    <p style="font-weight:600;color:#166534;margin-top:16px;">College Response:</p>
    <div class="r">${response.trim()}</div>
    <a href="${baseUrl}/dashboard/student" class="btn">View in Dashboard</a>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;"/>
    <p style="font-size:13px;color:#94a3b8;">Questions? Contact us at <a href="mailto:support@admissionx.com" style="color:#c0392b;">support@admissionx.com</a></p>
  </div>
  <div class="f">&copy; ${new Date().getFullYear()} AdmissionX. All rights reserved.</div>
</div>
</body></html>`,
      });
    } catch (e) {
      console.error("[Queries] Reply email failed:", e);
    }
  }

  return NextResponse.json({ success: true, message: "Reply sent successfully." });
}
