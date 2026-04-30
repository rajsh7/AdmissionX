import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyStudentToken } from "@/lib/auth";
import { getDb } from "@/lib/db";

async function checkAuth(studentId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("adx_student")?.value;
  if (!token) return null;
  const payload = await verifyStudentToken(token);
  if (!payload || String(payload.id) !== studentId) return null;
  return payload;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const payload = await checkAuth(id);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDb();

  const rows = await db.collection("applications").aggregate([
    { $match: { $or: [{ studentId: id }, { studentId: payload.id }] } },
    { $lookup: { from: "collegeprofile", localField: "collegeId", foreignField: "_id", as: "cp" } },
    { $unwind: { path: "$cp", preserveNullAndEmptyArrays: true } },
    { $lookup: { from: "users", localField: "cp.users_id", foreignField: "id", as: "u" } },
    { $unwind: { path: "$u", preserveNullAndEmptyArrays: true } },
    { $lookup: { from: "documents", localField: "_id", foreignField: "applicationId", as: "docs" } },
    {
      $project: {
        application_ref: "$applicationRef",
        college_name: {
          $cond: [
            { $and: [{ $ne: ["$collegeName", null] }, { $ne: ["$collegeName", ""] }] },
            "$collegeName",
            { $ifNull: [{ $trim: { input: "$u.firstname" } }, "$cp.slug"] },
          ],
        },
        course_name: "$courseName",
        degree_name: "$degreeName",
        stream_name: "$streamName",
        fees: { $ifNull: ["$fees", 0] },
        status: 1,
        personal_info: 1,
        academic_info: 1,
        payment_info: 1,
        documents: {
          $map: {
            input: "$docs",
            as: "d",
            in: { type: "$$d.type", url: "$$d.fileUrl" },
          },
        },
        payment_status: { $ifNull: ["$payment_status", "pending"] },
        transaction_id: 1,
        amount_paid: { $ifNull: ["$amount_paid", 0] },
        notes: 1,
        created_at: "$createdAt",
        updated_at: "$createdAt",
      },
    },
    { $sort: { created_at: -1 } },
  ]).toArray();

  const statusMeta: Record<string, { label: string; cls: string; icon: string; progress: number; progressColor: string }> = {
    draft: { label: "Draft", cls: "bg-slate-100 text-slate-600", icon: "edit", progress: 20, progressColor: "slate" },
    submitted: { label: "Submitted", cls: "bg-blue-100 text-blue-700", icon: "send", progress: 50, progressColor: "blue" },
    under_review: { label: "Under Review", cls: "bg-amber-100 text-amber-700", icon: "schedule", progress: 65, progressColor: "amber" },
    verified: { label: "Verified", cls: "bg-emerald-100 text-emerald-700", icon: "check_circle", progress: 85, progressColor: "emerald" },
    rejected: { label: "Rejected", cls: "bg-red-100 text-red-700", icon: "cancel", progress: 100, progressColor: "red" },
    enrolled: { label: "Enrolled", cls: "bg-purple-100 text-purple-700", icon: "school", progress: 100, progressColor: "purple" },
  };

  const payMeta: Record<string, { label: string; cls: string; icon: string }> = {
    pending: { label: "Payment Pending", cls: "bg-amber-100 text-amber-700", icon: "pending" },
    paid: { label: "Paid", cls: "bg-emerald-100 text-emerald-700", icon: "payments" },
    failed: { label: "Payment Failed", cls: "bg-red-100 text-red-700", icon: "money_off" },
    refunded: { label: "Refunded", cls: "bg-slate-100 text-slate-600", icon: "undo" },
  };

  const applications = rows.map((row) => {
    const status = String(row.status ?? "submitted");
    const payStatus = String(row.payment_status ?? "pending");
    const sm = statusMeta[status] ?? statusMeta["submitted"];
    const pm = payMeta[payStatus] ?? payMeta["pending"];
    const actionLabel = status === "draft" ? "Complete Application" : payStatus === "pending" && status === "verified" ? "Pay Fees" : "View Details";

    return {
      ...row,
      status,
      payment_status: payStatus,
      statusLabel: sm.label, statusClass: sm.cls, statusIcon: sm.icon,
      progress: sm.progress, progressColor: sm.progressColor,
      paymentLabel: pm.label, paymentClass: pm.cls, paymentIcon: pm.icon,
      actionLabel,
      fees: Number(row.fees ?? 0),
      amount_paid: Number(row.amount_paid ?? 0),
      submittedOn: row.created_at ? new Date(row.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : null,
    };
  });

  const stats = {
    total: applications.length,
    submitted: applications.filter((a) => a.status === "submitted").length,
    under_review: applications.filter((a) => a.status === "under_review").length,
    verified: applications.filter((a) => a.status === "verified").length,
    enrolled: applications.filter((a) => a.status === "enrolled").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
    pending_pay: applications.filter((a) => a.payment_status === "pending" && a.status === "verified").length,
  };

  return NextResponse.json({ applications, stats });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const payload = await checkAuth(id);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const appId = req.nextUrl.searchParams.get("appId");
  if (!appId) return NextResponse.json({ error: "appId is required" }, { status: 400 });

  const db = await getDb();
  const result = await db.collection("applications").deleteOne({
    _id: appId as unknown,
    studentId: id,
    status: "draft",
  } as object);

  if (!result.deletedCount) {
    return NextResponse.json({ error: "Application not found or cannot be deleted (only drafts can be removed)." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
