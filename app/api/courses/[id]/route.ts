import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  if (!id) {
    return NextResponse.json({ success: false, message: "Course ID is required" }, { status: 400 });
  }

  let conn;
  try {
    conn = await pool.getConnection();

    // Determine if ID is numeric
    const isNumeric = /^\d+$/.test(id);

    // Fetch primary course details
    const [courseRows] = await conn.query(
      `SELECT c.*, d.name AS degree_name, fa.name AS functional_area_name
       FROM course c
       LEFT JOIN degree d ON c.degree_id = d.id
       LEFT JOIN functionalarea fa ON c.functionalarea_id = fa.id
       WHERE ${isNumeric ? "c.id = ?" : "c.pageslug = ?"} LIMIT 1`,
      [id]
    ) as [any[], unknown];

    if (!courseRows.length) {
      return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 });
    }

    const course = courseRows[0];

    // Fetch specific offering details from collegemaster
    const [masterRows] = await conn.query(
      `SELECT cm.*, cp.slug AS college_slug, cp.bannerimage AS college_banner,
              cp.registeredSortAddress, cp.campusSortAddress
       FROM collegemaster cm
       JOIN collegeprofile cp ON cm.collegeprofile_id = cp.id
       WHERE cm.course_id = ? LIMIT 1`,
      [course.id]
    ) as [any[], unknown];

    const master = masterRows[0] || {};
    
    // Helper to turn slug into name
    const slugToName = (slug: string) => {
      if (!slug) return "College";
      return slug.replace(/-\d+$/, "").replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    };

    const collegeName = master.college_slug ? slugToName(master.college_slug) : "College";

    // Helper to resolve image
    const resolveImageUrl = (val: any) => {
      const raw = typeof val === "number" ? String(val) : val?.toString().trim();
      if (!raw) return "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1200";
      if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("/")) return raw;
      return `https://admin.admissionx.in/uploads/${raw}`;
    };

    // Fetch other colleges offering courses in the same degree/functional area
    let otherColleges: any[] = [];
    try {
      const [otherRows] = await conn.query(
        `SELECT cp.id, cp.slug, cp.bannerimage, cp.registeredSortAddress, cp.campusSortAddress
         FROM collegeprofile cp
         JOIN collegemaster cm ON cm.collegeprofile_id = cp.id
         WHERE cm.degree_id = ? AND cp.id != ?
         GROUP BY cp.id
         LIMIT 6`,
        [course.degree_id || 0, master.collegeprofile_id || 0]
      ) as [any[], unknown];
      
      otherColleges = otherRows.map((r: any) => ({
        id: r.id,
        name: slugToName(r.slug),
        slug: r.slug,
        image: resolveImageUrl(r.bannerimage),
        location: r.campusSortAddress || r.registeredSortAddress
      }));
    } catch (e) {
      console.warn("Could not fetch other colleges", e);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: course.id,
        name: course.name,
        slug: course.pageslug,
        title: course.pagetitle,
        description: course.pagedescription,
        image: resolveImageUrl(course.bannerimage || course.logoimage),
        degree: course.degree_name,
        functionalArea: course.functional_area_name,
        details: {
          fees: master.fees,
          seats: master.seats,
          duration: master.courseduration,
          eligibility: master.twelvemarks || master.description,
          otherInfo: master.others
        },
        college: master.collegeprofile_id ? {
          id: master.collegeprofile_id,
          name: collegeName,
          slug: master.college_slug,
          image: resolveImageUrl(master.college_banner),
          location: master.campusSortAddress || master.registeredSortAddress
        } : null,
        otherColleges
      }
    });
  } catch (error: any) {
    console.error("Error fetching course details:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load course details", error: error.message },
      { status: 500 }
    );
  } finally {
    if (conn) conn.release();
  }
}
