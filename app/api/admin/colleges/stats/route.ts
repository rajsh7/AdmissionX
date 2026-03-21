import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
function buildImageUrl(raw: string | null): string | null {
    if (!raw) return null;
    if (raw.startsWith("http")) return raw;
    if (raw.startsWith("/")) return `https://admin.admissionx.in${raw}`;
    return `${IMAGE_BASE}${raw}`;
}

export async function GET(req: NextRequest) {
    const sp = new URL(req.url).searchParams;
    const q = (sp.get("q") ?? "").trim();
    const page = Math.max(1, parseInt(sp.get("page") ?? "1"));
    const limit = Math.min(50, Math.max(1, parseInt(sp.get("limit") ?? "20")));
    const offset = (page - 1) * limit;

    try {
        const conditions: string[] = [];
        const params: (string | number)[] = [];

        if (q) {
            conditions.push("(u.firstname LIKE ? OR cp.slug LIKE ? OR cp.registeredSortAddress LIKE ?)");
            const like = `%${q}%`;
            params.push(like, like, like);
        }

        const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

        const [rows] = await pool.query(
            `SELECT 
                cp.id,
                cp.slug,
                COALESCE(u.firstname, 'Unnamed College') as name,
                cp.bannerimage as image,
                cp.rating,
                cp.ranking,
                cp.verified,
                cp.isTopUniversity,
                cp.topUniversityRank,
                cp.universityType,
                c.name as city_name,
                (SELECT COUNT(*) FROM collegemaster WHERE collegeprofile_id = cp.id) as count_courses,
                (SELECT COUNT(*) FROM collegefacilities WHERE collegeprofile_id = cp.id) as count_facilities,
                (SELECT COUNT(*) FROM faculty WHERE collegeprofile_id = cp.id) as count_faculty,
                (SELECT COUNT(*) FROM placement WHERE collegeprofile_id = cp.id) as count_placements,
                (SELECT COUNT(*) FROM college_admission_procedures WHERE collegeprofile_id = cp.id) as count_admissions,
                (SELECT COUNT(*) FROM college_cut_offs WHERE collegeprofile_id = cp.id) as count_cutoffs,
                (SELECT COUNT(*) FROM event WHERE collegeprofile_id = cp.id) as count_events,
                (SELECT COUNT(*) FROM college_faqs WHERE collegeprofile_id = cp.id) as count_faqs,
                (SELECT COUNT(*) FROM college_management_details WHERE collegeprofile_id = cp.id) as count_management,
                (SELECT COUNT(*) FROM college_reviews WHERE collegeprofile_id = cp.id) as count_reviews,
                (SELECT COUNT(*) FROM college_scholarships WHERE collegeprofile_id = cp.id) as count_scholarships,
                (SELECT COUNT(*) FROM college_sports_activities WHERE collegeprofile_id = cp.id) as count_sports
            FROM collegeprofile cp
            JOIN users u ON u.id = cp.users_id
            LEFT JOIN city c ON c.id = cp.registeredAddressCityId
            ${where}
            ORDER BY cp.created_at DESC
            LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        ) as [RowDataPacket[], unknown];

        const [countRow] = await pool.query(
            `SELECT COUNT(*) as total FROM collegeprofile cp JOIN users u ON u.id = cp.users_id ${where}`,
            params
        ) as [RowDataPacket[], unknown];

        const total = countRow[0]?.total ?? 0;

        const colleges = rows.map(r => ({
            ...r,
            image: buildImageUrl(r.image),
            rating: parseFloat(String(r.rating)) || 0,
            ranking: r.ranking ? parseInt(String(r.ranking)) : null,
        }));

        return NextResponse.json({
            success: true,
            colleges,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });

    } catch (err) {
        console.error("[api/admin/colleges]", err);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
