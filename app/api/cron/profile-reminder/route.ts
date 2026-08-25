import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendProfileCompletionReminder } from "@/lib/email";
import { sendSMSProfileIncomplete } from "@/lib/sms";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await getDb();
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    // Find active signups who either have never been sent a reminder (and signed up 2+ days ago)
    // or were sent a reminder 2+ days ago
    const incompleteProfiles = await db
      .collection("next_student_signups")
      .find({
        is_active: { $in: [1, true] },
        $or: [
          {
            profile_reminder_sent: { $ne: true },
            created_at: { $lt: twoDaysAgo },
          },
          {
            profile_reminder_sent: true,
            profile_reminder_sent_at: { $lt: twoDaysAgo },
          },
        ],
      })
      .toArray();

    let sentCount = 0;

    for (const student of incompleteProfiles) {
      const profile = await db.collection("next_student_profiles").findOne({
        student_id: String(student._id),
      });

      const application = await db.collection("applications").findOne({
        studentId: String(student._id),
      });

      // 1. Personal Details check
      const isPersonalComplete = !!(profile && profile.dob && profile.gender && profile.city && profile.state);

      // 2. Course Preferences check (starting application implies course/college preference)
      const isCourseComplete = !!application;

      // 3. Academic Info check
      const isAcademicComplete = !!(application && application.academic_info && Object.keys(application.academic_info).length > 0);

      // 4. Document Upload check
      let isDocComplete = false;
      if (application) {
        const docCount = await db.collection("documents").countDocuments({
          applicationId: application._id,
        });
        isDocComplete = docCount > 0;
      }

      const isAllComplete = isPersonalComplete && isCourseComplete && isAcademicComplete && isDocComplete;

      if (!isAllComplete) {
        let progressPercent = 0;
        let personalDetails: "completed" | "urgent" | "pending" = "pending";
        let academicInfo: "completed" | "urgent" | "pending" = "pending";
        let documentUpload: "completed" | "urgent" | "pending" = "pending";
        let coursePreferences: "completed" | "urgent" | "pending" = "pending";

        if (isPersonalComplete) {
          progressPercent += 25;
          personalDetails = "completed";
        } else {
          personalDetails = "urgent";
        }

        if (isCourseComplete) {
          progressPercent += 25;
          coursePreferences = "completed";
        } else {
          coursePreferences = isPersonalComplete ? "urgent" : "pending";
        }

        if (isAcademicComplete) {
          progressPercent += 25;
          academicInfo = "completed";
        } else {
          academicInfo = (isPersonalComplete && isCourseComplete) ? "urgent" : "pending";
        }

        if (isDocComplete) {
          progressPercent += 25;
          documentUpload = "completed";
        } else {
          documentUpload = (isPersonalComplete && isCourseComplete && isAcademicComplete) ? "urgent" : "pending";
        }

        await sendProfileCompletionReminder(
          student.email,
          student.name || "Student",
          progressPercent,
          {
            personalDetails,
            academicInfo,
            documentUpload,
            coursePreferences,
          }
        );

        try {
          if (student.phone) {
            await sendSMSProfileIncomplete(student.phone);
          }
        } catch (smsErr) {
          console.error(`[Profile Reminder Cron] SMS failed for ${student.email}:`, smsErr);
        }

        await db.collection("next_student_signups").updateOne(
          { _id: student._id },
          {
            $set: {
              profile_reminder_sent: true,
              profile_reminder_sent_at: new Date(),
              updated_at: new Date(),
            },
          }
        );
        sentCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Profile completion reminders sent to ${sentCount} students.`,
    });
  } catch (err) {
    console.error("[Profile Reminder Cron Error]:", err);
    return NextResponse.json({ error: "Failed to send reminders." }, { status: 500 });
  }
}
