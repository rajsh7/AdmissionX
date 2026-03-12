import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// ── GET /api/student/colleges ─────────────────────────────────────────────────
// Returns a paginated list of colleges (with their courses) that students can
// apply to.  Supports search, stream, and degree filtering.
//
// Query params:
//   q        — full-text search on college name / course name
//   stream   — functionalarea name  (e.g. "Engineering")
//   degree   — degree name          (e.g. "B.Tech")
//   page     — 1-based page number  (default: 1)
//   limit    — results per page     (default: 12, max: 50)
export async function GET(req: NextRequest) {
  const sp     = req.nextUrl.searchParams;
  const q      = sp.get("q")?.trim()      ?? "";
  const stream = sp.get("stream")?.trim() ?? "";
  const degree = sp.get("degree")?.trim() ?? "";
  const page   = Math.max(1, parseInt(sp.get("page")  ?? "1",  10));
  const limit  = Math.min(50, Math.max(1, parseInt(sp.get("limit") ?? "12", 10)));
  const offset = (page - 1) * limit;

  const conn = await pool.getConnection();
  try {
    // ── Build dynamic WHERE clauses ─────────────────────────────────────────
    const whereParts: string[] = ["cp.verified = 1"];
    const whereValues: unknown[] = [];

    if (q) {
      whereParts.push(
        `(COALESCE(NULLIF(TRIM(u.firstname), ''), cp.slug) LIKE ?
          OR co.name  LIKE ?
          OR d.name   LIKE ?
          OR fa.name  LIKE ?)`,
      );
      const like = `%${q}%`;
      whereValues.push(like, like, like, like);
    }
    if (stream) {
      whereParts.push("fa.name = ?");
      whereValues.push(stream);
    }
    if (degree) {
      whereParts.push("d.name = ?");
      whereValues.push(degree);
    }

    const whereSQL = whereParts.length
      ? `WHERE ${whereParts.join(" AND ")}`
      : "";

    // ── Count total matching rows (college level, not course level) ──────────
    const [countRows] = await conn.query(
      `SELECT COUNT(DISTINCT cp.id) AS total
       FROM collegeprofile cp
       LEFT JOIN users         u   ON u.id   = cp.users_id
       LEFT JOIN collegemaster cm  ON cm.collegeprofile_id = cp.id
       LEFT JOIN course        co  ON co.id  = cm.course_id
       LEFT JOIN degree        d   ON d.id   = cm.degree_id
       LEFT JOIN functionalarea fa ON fa.id  = cm.functionalarea_id
       ${whereSQL}`,
      whereValues,
    );
    const total: number =
      (countRows as { total: number }[])[0]?.total ?? 0;

    // ── Fetch colleges ────────────────────────────────────────────────────────
    const [collegeRows] = await conn.query(
      `SELECT DISTINCT
         cp.id                                                         AS collegeprofile_id,
         COALESCE(NULLIF(TRIM(u.firstname), ''), cp.slug)             AS college_name,
         cp.slug,
         cp.bannerimage,
         cp.registeredSortAddress                                      AS address,
         cp.rating,
         cp.totalRatingUser,
         cp.universityType,
         cp.admissionStart,
         cp.admissionEnd,
         ct.name                                                       AS college_type
       FROM collegeprofile cp
       LEFT JOIN users         u   ON u.id   = cp.users_id
       LEFT JOIN collegetype   ct  ON ct.id  = cp.collegetype_id
       LEFT JOIN collegemaster cm  ON cm.collegeprofile_id = cp.id
       LEFT JOIN course        co  ON co.id  = cm.course_id
       LEFT JOIN degree        d   ON d.id   = cm.degree_id
       LEFT JOIN functionalarea fa ON fa.id  = cm.functionalarea_id
       ${whereSQL}
       ORDER BY cp.rating DESC, cp.id ASC
       LIMIT ? OFFSET ?`,
      [...whereValues, limit, offset],
    );

    const colleges = collegeRows as {
      collegeprofile_id: number;
      college_name: string;
      slug: string;
      bannerimage: string | null;
      address: string | null;
      rating: number | null;
      totalRatingUser: number | null;
      universityType: string | null;
      admissionStart: string | null;
      admissionEnd: string | null;
      college_type: string | null;
    }[];

    if (colleges.length === 0) {
      return NextResponse.json({
        colleges:   [],
        pagination: { page, limit, total, totalPages: 0 },
        filters:    { streams: [], degrees: [] },
      });
    }

    // ── Fetch courses for each college (batch) ────────────────────────────────
    const collegeIds = colleges.map((c) => c.collegeprofile_id);
    const placeholders = collegeIds.map(() => "?").join(", ");

    const [courseRows] = await conn.query(
      `SELECT
         cm.id                AS collegemaster_id,
         cm.collegeprofile_id,
         cm.fees,
         cm.seats,
         cm.courseduration,
         cm.twelvemarks       AS min_percent,
         co.name              AS course_name,
         d.name               AS degree_name,
         fa.name              AS stream_name
       FROM collegemaster cm
       LEFT JOIN course        co ON co.id  = cm.course_id
       LEFT JOIN degree        d  ON d.id   = cm.degree_id
       LEFT JOIN functionalarea fa ON fa.id = cm.functionalarea_id
       WHERE cm.collegeprofile_id IN (${placeholders})
       ORDER BY fa.name ASC, d.name ASC, co.name ASC`,
      collegeIds,
    );

    // Group courses by college
    const coursesByCollege: Record<
      number,
      {
        collegemaster_id: number;
        course_name: string | null;
        degree_name: string | null;
        stream_name: string | null;
        fees: number | null;
        seats: number | null;
        courseduration: string | null;
        min_percent: string | null;
      }[]
    > = {};

    for (const row of courseRows as Record<string, unknown>[]) {
      const cid = Number(row.collegeprofile_id);
      if (!coursesByCollege[cid]) coursesByCollege[cid] = [];
      coursesByCollege[cid].push({
        collegemaster_id: Number(row.collegemaster_id),
        course_name:      row.course_name  as string | null,
        degree_name:      row.degree_name  as string | null,
        stream_name:      row.stream_name  as string | null,
        fees:             row.fees !== null ? Number(row.fees) : null,
        seats:            row.seats !== null ? Number(row.seats) : null,
        courseduration:   row.courseduration as string | null,
        min_percent:      row.min_percent as string | null,
      });
    }

    // ── Build filter lists (streams + degrees available in result set) ────────
    const [filterRows] = await conn.query(
      `SELECT DISTINCT fa.name AS stream_name, d.name AS degree_name
       FROM collegemaster cm
       LEFT JOIN functionalarea fa ON fa.id = cm.functionalarea_id
       LEFT JOIN degree         d  ON d.id  = cm.degree_id
       WHERE cm.collegeprofile_id IN (${placeholders})
         AND fa.name IS NOT NULL
       ORDER BY fa.name ASC, d.name ASC`,
      collegeIds,
    );

    const filterSet = filterRows as {
      stream_name: string | null;
      degree_name: string | null;
    }[];

    const streams = [...new Set(filterSet.map((r) => r.stream_name).filter(Boolean))] as string[];
    const degrees = [...new Set(filterSet.map((r) => r.degree_name).filter(Boolean))] as string[];

    // ── Assemble final response ───────────────────────────────────────────────
    const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE ?? "";

    const result = colleges.map((c) => {
      const courses = coursesByCollege[c.collegeprofile_id] ?? [];

      // Pick the min fees across courses for display
      const feesValues = courses.map((x) => x.fees).filter((f): f is number => f !== null);
      const minFees = feesValues.length ? Math.min(...feesValues) : null;

      return {
        collegeprofile_id: c.collegeprofile_id,
        college_name:  c.college_name,
        slug:          c.slug,
        image:         c.bannerimage
          ? `${IMAGE_BASE}${c.bannerimage}`
          : null,
        address:       c.address ?? "",
        rating:        c.rating ? Number(c.rating).toFixed(1) : null,
        totalRatingUser: c.totalRatingUser ?? 0,
        college_type:  c.college_type ?? "College",
        university_type: c.universityType ?? "",
        admission_open:
          c.admissionStart && c.admissionEnd
            ? (() => {
                const now   = new Date();
                const start = new Date(c.admissionStart);
                const end   = new Date(c.admissionEnd);
                return now >= start && now <= end;
              })()
            : null,
        admission_start: c.admissionStart ?? null,
        admission_end:   c.admissionEnd   ?? null,
        total_courses:  courses.length,
        min_fees:       minFees,
        courses,
      };
    });

    return NextResponse.json(
      {
        colleges:   result,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        filters: {
          streams,
          degrees,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      },
    );
  } finally {
    conn.release();
  }
}
