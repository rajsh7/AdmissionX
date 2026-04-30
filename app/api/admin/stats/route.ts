import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

async function safeCount(collection: string, filter: object = {}): Promise<number> {
  try {
    const db = await getDb();
    return await db.collection(collection).countDocuments(filter);
  } catch {
    return 0;
  }
}

export async function GET() {
  const [
    colleges, pendingColleges, students, applications,
    blogsTotal, blogsActive, newsTotal, newsActive,
    exams, degrees, courses, streams, cities, ads, adminUsers,
    subTotalCourses, subTotalFacilities, subTotalFaculty,
    subTotalPlacements, subTotalAdmissions, subTotalCutOffs,
    subTotalEvents, subTotalFAQs, subTotalManagement,
    subTotalReviews, subTotalScholarships, subTotalSports,
  ] = await Promise.all([
    safeCount("next_college_signups"),
    safeCount("next_college_signups", { status: "pending" }),
    safeCount("next_student_signups"),
    safeCount("applications"),
    safeCount("blogs"),
    safeCount("blogs", { isactive: 1 }),
    safeCount("news"),
    safeCount("news", { isactive: 1 }),
    safeCount("examination_details"),
    safeCount("degree"),
    safeCount("course"),
    safeCount("functionalarea"),
    safeCount("city"),
    safeCount("ads_managements"),
    safeCount("next_admin_users", { $or: [{ is_active: true }, { is_active: 1 }, { is_active: "1" }] }),
    safeCount("collegemaster"),
    safeCount("collegefacilities"),
    safeCount("faculty"),
    safeCount("placement"),
    safeCount("college_admission_procedures"),
    safeCount("college_cut_offs"),
    safeCount("event"),
    safeCount("college_faqs"),
    safeCount("college_management_details"),
    safeCount("college_reviews"),
    safeCount("college_scholarships"),
    safeCount("college_sports_activities"),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      colleges, pendingColleges, students, applications,
      blogsTotal, blogsActive, newsTotal, newsActive,
      exams, degrees, courses, streams, cities, ads, adminUsers,
      subitems: {
        courses: subTotalCourses, facilities: subTotalFacilities,
        faculty: subTotalFaculty, placements: subTotalPlacements,
        admissions: subTotalAdmissions, cutoffs: subTotalCutOffs,
        events: subTotalEvents, faqs: subTotalFAQs,
        management: subTotalManagement, reviews: subTotalReviews,
        scholarships: subTotalScholarships, sports: subTotalSports,
      },
    },
  });
}
