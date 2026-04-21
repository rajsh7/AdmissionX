import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyCollegeToken } from "@/lib/auth";
import { getDb } from "@/lib/db";

async function checkAuth(slug: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("adx_college")?.value;
  if (!token) return null;
  const payload = await verifyCollegeToken(token);
  if (!payload) return null;

  const db = await getDb();
  const [cp] = await db.collection("collegeprofile").aggregate([
    { $match: { slug } },
    // Try to match by users_id if it exists
    { $lookup: { from: "users", localField: "users_id", foreignField: "_id", as: "u" } },
    { $unwind: { path: "$u", preserveNullAndEmptyArrays: true } },
    // Allow match if (joined user email matches) OR (document email field matches)
    { 
      $match: {
        $or: [
          { "u.email": { $regex: `^${payload.email}$`, $options: "i" } },
          { "email": { $regex: `^${payload.email}$`, $options: "i" } }
        ]
      }
    },
    { $project: { _id: 1, users_id: 1, email: 1 } },
    { $limit: 1 },
  ]).toArray();

  if (!cp) return null;
  return { payload, collegeprofile_id: cp._id, users_id: cp.users_id };
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
  const usersId = auth.users_id;

  const [profileRows, courseStats, galleryCount, facultyCount, recentApps, placement] = await Promise.all([
    db.collection("collegeprofile").aggregate([
      { $match: { _id: cpId } },
      { $lookup: { from: "users", localField: "users_id", foreignField: "_id", as: "u" } },
      { $unwind: { path: "$u", preserveNullAndEmptyArrays: true } },
      { $project: { college_name: { $ifNull: [{ $trim: { input: "$u.firstname" } }, "$slug"] }, rating: 1, totalRatingUser: 1, verified: 1, admissionStart: 1, admissionEnd: 1, description: 1, bannerimage: 1, logoimage: 1, estyear: 1, registeredSortAddress: 1, website: 1, universityType: 1, collegecode: 1, college_type_name: 1, contactpersonname: 1, contactpersonemail: 1, contactpersonnumber: 1, mediumOfInstruction: 1, studyForm: 1, CCTVSurveillance: 1, ACCampus: 1, totalStudent: 1 } },
      { $limit: 1 },
    ]).toArray(),

    db.collection("collegemaster").aggregate([
      { $match: { collegeprofile_id: cpId } },
      { $group: { _id: null, total_courses: { $sum: 1 }, total_streams: { $addToSet: "$functionalarea_id" }, total_degrees: { $addToSet: "$degree_id" }, min_fees: { $min: "$fees" }, max_fees: { $max: "$fees" }, total_seats: { $sum: "$seats" } } },
    ]).toArray(),

    db.collection("gallery").countDocuments({ users_id: usersId, fullimage: { $exists: true, $ne: "" } }),
    db.collection("faculty").countDocuments({ collegeprofile_id: cpId }),

    db.collection("next_student_applications").aggregate([
      { $match: { collegeprofile_id: cpId } },
      { $lookup: { from: "next_student_signups", localField: "student_id", foreignField: "_id", as: "s" } },
      { $unwind: { path: "$s", preserveNullAndEmptyArrays: true } },
      { $project: { application_ref: 1, course_name: 1, degree_name: 1, stream_name: 1, status: 1, payment_status: 1, fees: 1, amount_paid: 1, created_at: 1, student_name: "$s.name", student_email: "$s.email" } },
      { $sort: { created_at: -1 } },
      { $limit: 5 },
    ]).toArray(),

    db.collection("placement").findOne({ collegeprofile_id: cpId }),
  ]);

  const profile = profileRows[0] ?? {};
  const cs = courseStats[0] ?? {};

  let admissionStatus: "open" | "closed" | "unknown" = "unknown";
  if (profile.admissionStart && profile.admissionEnd) {
    const now = new Date();
    admissionStatus = now >= new Date(profile.admissionStart) && now <= new Date(profile.admissionEnd) ? "open" : "closed";
  }

  const completenessFields = [profile.college_name, profile.description, profile.estyear, profile.registeredSortAddress, profile.bannerimage, cs.total_courses > 0 ? "yes" : null, facultyCount > 0 ? "yes" : null, profile.admissionStart];
  const profileComplete = Math.round((completenessFields.filter(Boolean).length / completenessFields.length) * 100);

  const appStats = await db.collection("next_student_applications").aggregate([
    { $match: { collegeprofile_id: cpId } },
    { $group: { _id: null, total: { $sum: 1 }, submitted: { $sum: { $cond: [{ $eq: ["$status", "submitted"] }, 1, 0] } }, under_review: { $sum: { $cond: [{ $eq: ["$status", "under_review"] }, 1, 0] } }, verified: { $sum: { $cond: [{ $eq: ["$status", "verified"] }, 1, 0] } }, enrolled: { $sum: { $cond: [{ $eq: ["$status", "enrolled"] }, 1, 0] } }, rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } }, paid: { $sum: { $cond: [{ $eq: ["$payment_status", "paid"] }, 1, 0] } } } },
  ]).toArray();
  const as = appStats[0] ?? {};

  const STATUS_META: Record<string, { label: string; cls: string; icon: string }> = {
    draft: { label: "Draft", cls: "bg-slate-100 text-slate-600", icon: "edit" },
    submitted: { label: "Submitted", cls: "bg-blue-100 text-blue-700", icon: "send" },
    under_review: { label: "Under Review", cls: "bg-amber-100 text-amber-700", icon: "schedule" },
    verified: { label: "Verified", cls: "bg-emerald-100 text-emerald-700", icon: "check_circle" },
    rejected: { label: "Rejected", cls: "bg-red-100 text-red-700", icon: "cancel" },
    enrolled: { label: "Enrolled", cls: "bg-purple-100 text-purple-700", icon: "school" },
  };

  const recentApplications = recentApps.map((row) => {
    const st = String(row.status ?? "submitted");
    const sm = STATUS_META[st] ?? STATUS_META["submitted"];
    return { ...row, statusLabel: sm.label, statusClass: sm.cls, statusIcon: sm.icon, fees: Number(row.fees ?? 0), amount_paid: Number(row.amount_paid ?? 0), submittedOn: row.created_at ? new Date(row.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : null };
  });

  const quickActions: { icon: string; label: string; tab: string; urgent: boolean }[] = [];
  if (Number(as.submitted ?? 0) > 0) quickActions.push({ icon: "description", label: `${as.submitted} new application${Number(as.submitted) !== 1 ? "s" : ""} to review`, tab: "applications", urgent: true });
  if (profileComplete < 80) quickActions.push({ icon: "edit", label: "Complete your college profile", tab: "profile", urgent: false });
  if (Number(cs.total_courses ?? 0) === 0) quickActions.push({ icon: "menu_book", label: "Add your first course", tab: "courses", urgent: false });
  if (galleryCount === 0) quickActions.push({ icon: "photo_library", label: "Upload campus photos", tab: "gallery", urgent: false });

  return NextResponse.json({
    profile: { 
      college_name: profile.college_name ?? "", 
      rating: profile.rating ?? null, 
      totalRatingUser: profile.totalRatingUser ?? 0, 
      verified: profile.verified ?? 0, 
      address: profile.registeredSortAddress ?? "", 
      bannerimage: profile.bannerimage ?? null,
      logoimage: profile.logoimage ?? null, 
      estyear: profile.estyear ?? null, 
      website: profile.website ?? "",
      universityType: profile.universityType ?? "",
      collegecode: profile.collegecode ?? "",
      contactpersonname: profile.contactpersonname ?? "",
      contactpersonemail: profile.contactpersonemail ?? "",
      contactpersonnumber: profile.contactpersonnumber ?? "",
      mediumOfInstruction: profile.mediumOfInstruction ?? "",
      studyForm: profile.studyForm ?? "",
      CCTVSurveillance: profile.CCTVSurveillance ? "Yes" : "No",
      ACCampus: profile.ACCampus ? "Yes" : "No",
      totalStudent: profile.totalStudent ?? "",
      admissionStart: profile.admissionStart ?? "",
      admissionEnd: profile.admissionEnd ?? "",
      college_type_name: profile.college_type_name ?? "",
      admissionStatus, 
      profileComplete 
    },
    stats: {
      applications: { total: Number(as.total ?? 0), submitted: Number(as.submitted ?? 0), under_review: Number(as.under_review ?? 0), verified: Number(as.verified ?? 0), enrolled: Number(as.enrolled ?? 0), rejected: Number(as.rejected ?? 0), paid: Number(as.paid ?? 0), new_this_week: 0 },
      courses: { total: Number(cs.total_courses ?? 0), streams: (cs.total_streams ?? []).length, degrees: (cs.total_degrees ?? []).length, min_fees: Number(cs.min_fees ?? 0), max_fees: Number(cs.max_fees ?? 0), total_seats: Number(cs.total_seats ?? 0) },
      gallery: { total: galleryCount },
      faculty: { total: facultyCount },
    },
    placement: placement ? { companies: placement.numberofrecruitingcompany ?? "—", placed_last_year: placement.numberofplacementlastyear ?? "—", ctc_highest: placement.ctchighest ?? "—", ctc_average: placement.ctcaverage ?? "—" } : null,
    recentApplications,
    quickActions,
  });
}
