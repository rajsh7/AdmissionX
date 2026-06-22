import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendProfileCompletionReminder } from "@/lib/email";
import { sendSMSProfileIncomplete } from "@/lib/sms";

/**
 * GET /api/cron/student-notification
 *
 * Sends a bi-daily activity notification to all active students who haven't
 * received any notification in the last 2 days.
 *
 * This nudges students to log in, check their application status, and stay
 * engaged with the AdmissionX platform.
 *
 * Triggered by Vercel Cron: "0 8 * / 2 * *" (every 2 days at 08:00 UTC)
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
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    // Find active students who haven't been notified in 2+ days
    const activeStudents = await db
      .collection("next_student_signups")
      .find({
        is_active: { $in: [1, true] },
        $or: [
          { last_notification_sent: { $exists: false } },
          { last_notification_sent: { $lt: twoDaysAgo } },
        ],
      })
      .toArray();

    let sentCount = 0;

    for (const student of activeStudents) {
      const email = student.email as string | undefined;
      const name  = (student.name ?? "Student") as string;

      if (!email) continue;

      try {
        // Re-use the profile completion reminder as a general engagement nudge.
        // Replace with a dedicated sendStudentActivityNotification() if a new
        // template is created in the future.
        await sendProfileCompletionReminder(email, name);

        try {
          if (student.phone) {
            await sendSMSProfileIncomplete(student.phone);
          }
        } catch (smsErr) {
          console.error(`[Student Notification Cron] SMS failed for ${student.email}:`, smsErr);
        }

        await db.collection("next_student_signups").updateOne(
          { _id: student._id },
          {
            $set: {
              last_notification_sent: new Date(),
              updated_at: new Date(),
            },
          }
        );

        sentCount++;
      } catch (emailErr) {
        console.error(
          `[Student Notification Cron] Failed to send to ${email}:`,
          emailErr
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Activity notifications sent to ${sentCount} student(s).`,
      processed: activeStudents.length,
      sent: sentCount,
    });
  } catch (err) {
    console.error("[Student Notification Cron Error]:", err);
    return NextResponse.json(
      { error: "Failed to send student notifications." },
      { status: 500 }
    );
  }
}
