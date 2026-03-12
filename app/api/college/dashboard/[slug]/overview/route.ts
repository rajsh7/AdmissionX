import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyCollegeToken } from "@/lib/auth";
import pool from "@/lib/db";

// ── Auth + ownership helper ───────────────────────────────────────────────────
async function checkAuth(slug: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("adx_college")?.value;
  if (!token) return null;
  const payload = await verifyCollegeToken(token);
  if (!payload) return null;

  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      `SELECT cp.id AS collegeprofile_id, cp.users_id
       FROM collegeprofile cp
       JOIN users u ON u.id = cp.users_id
       WHERE cp.slug = ? AND TRIM(LOWER(u.email)) = LOWER(?)
       LIMIT 1`,
      [slug, payload.email],
    );
    const list = rows as { collegeprofile_id: number; users_id: number }[];
    if (!list.length) return null;
    return { payload, collegeprofile_id: list[0].collegeprofile_id, users_id: list[0].users_id };
  } finally {
    conn.release();
  }
}

// ── GET /api/college/dashboard/[slug]/overview ────────────────────────────────
// Returns aggregated stats for the dashboard overview tab.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conn = await pool.getConnection();
  try {
    // Run all stat queries in parallel
    const [
      profileRows,
      appRows,
      courseRows,
      galleryRows,
      facultyRows,
      recentAppRows,
      placementRows,
    ] = await Promise.all([
      // 1. Basic profile info + rating
      conn.query(
        `SELECT
           COALESCE(NULLIF(TRIM(u.firstname), ''), cp.slug) AS college_name,
           cp.rating,
           cp.totalRatingUser,
           cp.verified,
           cp.admissionStart,
           cp.admissionEnd,
           cp.description,
           cp.bannerimage,
           cp.estyear,
           cp.registeredSortAddress AS address
         FROM collegeprofile cp
         JOIN users u ON u.id = cp.users_id
         WHERE cp.id = ?
         LIMIT 1`,
        [auth.collegeprofile_id],
      ),

      // 2. Application stats (from next_student_applications)
      conn.query(
        `SELECT
           COUNT(*)                                                          AS total,
           SUM(status = 'submitted')                                         AS submitted,
           SUM(status = 'under_review')                                      AS under_review,
           SUM(status = 'verified')                                          AS verified,
           SUM(status = 'enrolled')                                          AS enrolled,
           SUM(status = 'rejected')                                          AS rejected,
           SUM(payment_status = 'paid')                                      AS paid,
           SUM(status = 'submitted' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AS new_this_week
         FROM next_student_applications
         WHERE collegeprofile_id = ?`,
        [auth.collegeprofile_id],
      ),

      // 3. Course count
      conn.query(
        `SELECT
           COUNT(*)                          AS total_courses,
           COUNT(DISTINCT functionalarea_id) AS total_streams,
           COUNT(DISTINCT degree_id)         AS total_degrees,
           COALESCE(MIN(fees), 0)            AS min_fees,
           COALESCE(MAX(fees), 0)            AS max_fees,
           COALESCE(SUM(seats), 0)           AS total_seats
         FROM collegemaster
         WHERE collegeprofile_id = ?`,
        [auth.collegeprofile_id],
      ),

      // 4. Gallery count
      conn.query(
        `SELECT COUNT(*) AS total_gallery
         FROM gallery
         WHERE users_id = ? AND fullimage IS NOT NULL AND fullimage != ''`,
        [auth.users_id],
      ),

      // 5. Faculty count
      conn.query(
        `SELECT COUNT(*) AS total_faculty
         FROM faculty
         WHERE collegeprofile_id = ?`,
        [auth.collegeprofile_id],
      ),

      // 6. Recent applications (last 5)
      conn.query(
        `SELECT
           a.id,
           a.application_ref,
           a.course_name,
           a.degree_name,
           a.stream_name,
           a.status,
           a.payment_status,
           a.fees,
           a.amount_paid,
           a.created_at,
           s.name  AS student_name,
           s.email AS student_email
         FROM next_student_applications a
         LEFT JOIN next_student_signups s ON s.id = a.student_id
         WHERE a.collegeprofile_id = ?
         ORDER BY a.created_at DESC
         LIMIT 5`,
        [auth.collegeprofile_id],
      ),

      // 7. Placement snapshot
      conn.query(
        `SELECT
           numberofrecruitingcompany,
           numberofplacementlastyear,
           ctchighest,
           ctcaverage
         FROM placement
         WHERE collegeprofile_id = ?
         LIMIT 1`,
        [auth.collegeprofile_id],
      ),
    ]);

    // ── Normalise results ─────────────────────────────────────────────────────
    const profile = (profileRows[0] as Record<string, unknown>[])[0] ?? {};

    const appStats = (appRows[0] as Record<string, unknown>[])[0] ?? {};
    const courseStats = (courseRows[0] as Record<string, unknown>[])[0] ?? {};
    const galleryStats = (galleryRows[0] as Record<string, unknown>[])[0] ?? {};
    const facultyStats = (facultyRows[0] as Record<string, unknown>[])[0] ?? {};
    const placement = (placementRows[0] as Record<string, unknown>[])[0] ?? null;

    // ── Admission window status ───────────────────────────────────────────────
    let admissionStatus: "open" | "closed" | "unknown" = "unknown";
    if (profile.admissionStart && profile.admissionEnd) {
      const now   = new Date();
      const start = new Date(profile.admissionStart as string);
      const end   = new Date(profile.admissionEnd   as string);
      admissionStatus = now >= start && now <= end ? "open" : "closed";
    }

    // ── Profile completeness ──────────────────────────────────────────────────
    const completenessFields = [
      profile.college_name,
      profile.description,
      profile.estyear,
      profile.address,
      profile.bannerimage,
      Number(courseStats.total_courses ?? 0) > 0 ? "yes" : null,
      Number(facultyStats.total_faculty ?? 0) > 0 ? "yes" : null,
      profile.admissionStart,
    ];
    const filled       = completenessFields.filter((f) => f !== null && f !== "" && f !== undefined).length;
    const profileComplete = Math.round((filled / completenessFields.length) * 100);

    // ── Recent apps enrichment ────────────────────────────────────────────────
    const STATUS_META: Record<string, { label: string; cls: string; icon: string }> = {
      draft:        { label: "Draft",        cls: "bg-slate-100 text-slate-600",    icon: "edit"         },
      submitted:    { label: "Submitted",    cls: "bg-blue-100 text-blue-700",      icon: "send"         },
      under_review: { label: "Under Review", cls: "bg-amber-100 text-amber-700",    icon: "schedule"     },
      verified:     { label: "Verified",     cls: "bg-emerald-100 text-emerald-700",icon: "check_circle" },
      rejected:     { label: "Rejected",     cls: "bg-red-100 text-red-700",        icon: "cancel"       },
      enrolled:     { label: "Enrolled",     cls: "bg-purple-100 text-purple-700",  icon: "school"       },
    };

    const recentApplications = (recentAppRows[0] as Record<string, unknown>[]).map((row) => {
      const st = String(row.status ?? "submitted");
      const sm = STATUS_META[st] ?? STATUS_META["submitted"];
      return {
        ...row,
        status:      st,
        statusLabel: sm.label,
        statusClass: sm.cls,
        statusIcon:  sm.icon,
        fees:        Number(row.fees       ?? 0),
        amount_paid: Number(row.amount_paid ?? 0),
        submittedOn: row.created_at
          ? new Date(row.created_at as string).toLocaleDateString("en-IN", {
              day: "2-digit", month: "short", year: "numeric",
            })
          : null,
      };
    });

    // ── Quick action items ────────────────────────────────────────────────────
    // Surfaces things the college should do next
    const quickActions: { icon: string; label: string; tab: string; urgent: boolean }[] = [];

    if (Number(appStats.submitted ?? 0) > 0) {
      quickActions.push({
        icon: "description",
        label: `${appStats.submitted} new application${Number(appStats.submitted) !== 1 ? "s" : ""} to review`,
        tab: "applications",
        urgent: true,
      });
    }
    if (profileComplete < 80) {
      quickActions.push({
        icon: "edit",
        label: "Complete your college profile",
        tab: "profile",
        urgent: false,
      });
    }
    if (Number(courseStats.total_courses ?? 0) === 0) {
      quickActions.push({
        icon: "menu_book",
        label: "Add your first course",
        tab: "courses",
        urgent: false,
      });
    }
    if (Number(galleryStats.total_gallery ?? 0) === 0) {
      quickActions.push({
        icon: "photo_library",
        label: "Upload campus photos",
        tab: "gallery",
        urgent: false,
      });
    }

    return NextResponse.json({
      profile: {
        college_name:     profile.college_name    ?? "",
        rating:           profile.rating          ?? null,
        totalRatingUser:  profile.totalRatingUser ?? 0,
        verified:         profile.verified        ?? 0,
        address:          profile.address         ?? "",
        bannerimage:      profile.bannerimage      ?? null,
        estyear:          profile.estyear          ?? null,
        admissionStatus,
        profileComplete,
      },
      stats: {
        applications: {
          total:         Number(appStats.total         ?? 0),
          submitted:     Number(appStats.submitted      ?? 0),
          under_review:  Number(appStats.under_review   ?? 0),
          verified:      Number(appStats.verified       ?? 0),
          enrolled:      Number(appStats.enrolled       ?? 0),
          rejected:      Number(appStats.rejected       ?? 0),
          paid:          Number(appStats.paid           ?? 0),
          new_this_week: Number(appStats.new_this_week  ?? 0),
        },
        courses: {
          total:         Number(courseStats.total_courses  ?? 0),
          streams:       Number(courseStats.total_streams  ?? 0),
          degrees:       Number(courseStats.total_degrees  ?? 0),
          min_fees:      Number(courseStats.min_fees       ?? 0),
          max_fees:      Number(courseStats.max_fees       ?? 0),
          total_seats:   Number(courseStats.total_seats    ?? 0),
        },
        gallery: {
          total: Number(galleryStats.total_gallery ?? 0),
        },
        faculty: {
          total: Number(facultyStats.total_faculty ?? 0),
        },
      },
      placement: placement
        ? {
            companies:        placement.numberofrecruitingcompany  ?? "—",
            placed_last_year: placement.numberofplacementlastyear  ?? "—",
            ctc_highest:      placement.ctchighest                 ?? "—",
            ctc_average:      placement.ctcaverage                 ?? "—",
          }
        : null,
      recentApplications,
      quickActions,
    });
  } finally {
    conn.release();
  }
}
