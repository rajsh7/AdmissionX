import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  if (!id) {
    return NextResponse.json({ success: false, message: "College ID is required" }, { status: 400 });
  }

  let conn;
  try {
    conn = await pool.getConnection();

    // Determine if ID is numeric
    const isNumeric = /^\d+$/.test(id);

    // Fetch from collegeprofile primarily as it has the rich data used in listing
    const [profileRows] = await conn.query(
      `SELECT cp.*, u.bannerimage AS univ_banner, u.logoimage AS univ_logo 
       FROM collegeprofile cp
       LEFT JOIN university u ON cp.university_id = u.id
       WHERE ${isNumeric ? "cp.id = ?" : "cp.slug = ?"} LIMIT 1`,
      [id]
    ) as [any[], unknown];

    if (!profileRows.length) {
      // Fallback to university table if not in profile
      const [uniRows] = await conn.query(
        `SELECT * FROM university WHERE ${isNumeric ? "id = ?" : "slug = ?"} LIMIT 1`,
        [id]
      ) as [any[], unknown];
      
      if (!uniRows.length) {
        return NextResponse.json({ success: false, message: "College not found" }, { status: 404 });
      }
      
      const uni = uniRows[0];
      return NextResponse.json({
        success: true,
        data: {
          id: uni.id,
          name: uni.name,
          image: uni.image,
          location: uni.location || uni.address,
          rating: uni.rating,
          slug: uni.slug,
          profile: { description: uni.description }
        }
      });
    }

    const row = profileRows[0];
    
    // Helper to resolve image like listing API
    const resolveImageUrl = (val: any) => {
      const raw = typeof val === "number" ? String(val) : val?.toString().trim();
      if (!raw) return "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600";
      if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("/")) return raw;
      return `https://admin.admissionx.in/uploads/${raw}`;
    };

    // Helper to parse location like listing API
    const parseLocation = (val: string) => {
      const parts = (val || "").split(",").map((p: string) => p.trim()).filter(Boolean);
      return {
        city: parts[0] ?? "",
        country: parts.length > 1 ? parts[parts.length - 1] ?? "" : ""
      };
    };

    const locationStr = row.registeredSortAddress || row.campusSortAddress || "";
    const { city, country } = parseLocation(locationStr);

    // Fetch courses with richer details
    let courses: any[] = [];
    try {
      const [courseRows] = await conn.query(
        `SELECT 
          c.id, 
          c.name, 
          c.pageslug,
          c.logoimage,
          c.bannerimage,
          c.duration,
          d.name AS degree_name,
          fa.name AS functional_area_name
        FROM course c
        LEFT JOIN degree d ON c.degree_id = d.id
        LEFT JOIN functional_area fa ON c.functional_area_id = fa.id
        WHERE c.college_id = ? OR c.users_id = ?
        ORDER BY c.name ASC
        LIMIT 100`,
        [row.id, row.users_id || 0]
      ) as [any[], unknown];
      courses = courseRows;
    } catch (e) {
      console.warn("Could not fetch courses for college", e);
    }

    // Fetch facilities
    let facilities = [];
    try {
      const [facilityRows] = await conn.query(
        `SELECT f.name FROM collegefacilities cf 
         JOIN facilities f ON cf.facilities_id = f.id 
         WHERE cf.collegeprofile_id = ?`,
        [row.id]
      ) as [any[], unknown];
      facilities = facilityRows.map(f => f.name);
    } catch (e) {
      console.warn("Could not fetch facilities for college", e);
    }

    // Image prioritization: Campus Banner > Univ Banner > Univ Logo > Fallback
    let resolvedImage = resolveImageUrl(row.bannerimage);
    if (resolvedImage.includes("unsplash.com") && row.univ_banner) {
      resolvedImage = resolveImageUrl(row.univ_banner);
    }
    if (resolvedImage.includes("unsplash.com") && row.univ_logo) {
      resolvedImage = resolveImageUrl(row.univ_logo);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: row.id,
        name: row.name || (row.slug ? row.slug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : "College"),
        image: resolvedImage,
        city,
        country,
        location: locationStr,
        rating: row.rating ? Number(row.rating) : null,
        estyear: row.estyear,
        slug: row.slug,
        address: row.campusFullAddress || row.registeredFullAddress || locationStr,
        totalStudent: row.totalStudent,
        ranking: row.ranking,
        universityType: row.universityType,
        profile: {
          description: row.description,
          established_year: row.estyear,
          website: row.website,
          phone: row.phone || row.contactpersonnumber,
          email: row.email || row.contactpersonemail,
          facebook: row.facebookurl,
          twitter: row.twitterurl,
          admissionStart: row.admissionStart,
          admissionEnd: row.admissionEnd,
          contactPerson: row.contactpersonname
        },
        courses,
        facilities: facilities.length > 0 ? facilities : ["Library", "Hostel", "WiFi", "Sports", "Labs", "Cafeteria"] // Fallback if none in DB
      }
    });
  } catch (error) {
    console.error("Error fetching college details:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load college details" },
      { status: 500 }
    );
  } finally {
    if (conn) conn.release();
  }
}
