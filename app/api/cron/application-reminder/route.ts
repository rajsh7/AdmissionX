import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendApplicationStartedEmail } from "@/lib/email";

/**
 * GET /api/cron/application-reminder
 *
 * Sends an email reminder to students whose applications are still in "draft"
 * or "submitted" state and haven't been reminded in the last 4 days.
 *
 * Triggered by Vercel Cron: "0 10 * / 4 * *" (every 4 days at 10:00 UTC)
 * Protected by Authorization: Bearer <CRON_SECRET>
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "your-secret-key";

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await getDb();
    const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);

    // Find draft/submitted applications that haven't been reminded in 4+ days
    const pendingApplications = await db
      .collection("applications")
      .find({
        status: { $in: ["draft", "submitted"] },
        createdAt: { $lt: fourDaysAgo },
        $or: [
          { application_reminder_sent: { $ne: true } },
          { reminder_sent_at: { $lt: fourDaysAgo } },
        ],
      })
      .toArray();

    let sentCount = 0;

    for (const application of pendingApplications) {
      const studentEmail = application.student_email as string | undefined;
      const studentName  = (application.student_name as string | undefined) ?? "Student";
      const appId        = String(application.applicationRef ?? application._id);

      if (!studentEmail) continue;

      try {
        await sendApplicationStartedEmail(studentEmail, studentName, appId);

        await db.collection("applications").updateOne(
          { _id: application._id },
          {
            $set: {
              application_reminder_sent: true,
              reminder_sent_at: new Date(),
              updated_at: new Date(),
            },
          }
        );

        sentCount++;
      } catch (emailErr) {
        console.error(
          `[Application Reminder Cron] Failed to send to ${studentEmail}:`,
          emailErr
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Application reminders sent to ${sentCount} student(s).`,
      processed: pendingApplications.length,
      sent: sentCount,
    });
  } catch (err) {
    console.error("[Application Reminder Cron Error]:", err);
    return NextResponse.json(
      { error: "Failed to send application reminders." },
      { status: 500 }
    );
  }
}
