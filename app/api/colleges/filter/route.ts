import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stream = searchParams.get("stream") || "Engineering";

  // Map UI category names to DB functionalarea names if needed
  let dbStream = stream;
  if (stream === "MBA") dbStream = "Management";
  if (stream === "MBBS") dbStream = "Medical";
  if (stream === "B.Com") dbStream = "Commerce";
  if (stream === "Humanities") dbStream = "Arts";
  if (stream === "Fashion") dbStream = "Design"; // Fallback as investigated

  try {
    const [rows] = await pool.query(`
      SELECT 
        cp.id, 
        cp.slug, 
        COALESCE(NULLIF(TRIM(u.firstname), ''), cp.slug) AS name,
        COALESCE(cp.registeredSortAddress, '')            AS location,
        cp.bannerimage                                    AS image,
        cp.rating                                         AS rating
      FROM collegeprofile cp
      LEFT JOIN users u ON u.id = cp.users_id
      JOIN collegemaster cm ON cm.collegeprofile_id = cp.id
      JOIN functionalarea f ON f.id = cm.functionalarea_id
      WHERE (f.name LIKE ? OR f.pageslug = ?)
        AND u.firstname NOT LIKE 'Delete%'
      GROUP BY cp.id
      LIMIT 8
    `, [`%${dbStream}%`, stream.toLowerCase()]);

    const universities = (rows as any[]).map((row) => {
      const name = row.name || "University";
      const words = name.split(" ");
      const abbreviation =
        words.length > 1
          ? (words[0][0] + words[1][0]).toUpperCase()
          : name.substring(0, 2).toUpperCase();

      return {
        name,
        location: row.location || "India",
        image: row.image
          ? `https://admin.admissionx.in/uploads/${row.image}`
          : "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600",
        rating: Number(row.rating) || 4.5,
        abbr: abbreviation,
        abbrBg: "bg-primary",
        tags: ["Featured", "Top Ranked"],
        tuition: "View Fees",
        href: `/university/${row.slug || ""}`,
      };
    });

    return NextResponse.json({ success: true, data: universities });
  } catch (error) {
    console.error("Filter API Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
