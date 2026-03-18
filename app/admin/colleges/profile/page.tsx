import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { revalidatePath } from "next/cache";
import { Suspense } from "react";
import ProfileClient from "./ProfileClient";
import { saveUpload } from "@/lib/upload-utils";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function deleteProfileRow(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM collegeprofile WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/colleges/profile deleteAction]", e);
  }
  revalidatePath("/admin/colleges/profile");
}

async function addProfileRow(formData: FormData) {
  "use server";
  try {
    const bannerFile = formData.get("bannerimage_file") as File;
    let bannerimage = "";

    if (bannerFile && bannerFile.size > 0) {
      const slug = (formData.get("slug") as string) || "college";
      bannerimage = await saveUpload(bannerFile, `college/${slug}`, "banner");
    }

    const data = Object.fromEntries(formData.entries());
    const sql = `
      INSERT INTO collegeprofile (
        users_id, slug, bannerimage, rating, ranking, 
        verified, isTopUniversity, topUniversityRank, 
        universityType, registeredAddressCityId, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    await pool.query(sql, [
      data.users_id, data.slug, bannerimage, data.rating, data.ranking,
      data.verified === "on" ? 1 : 0,
      data.isTopUniversity === "on" ? 1 : 0,
      data.topUniversityRank || null,
      data.universityType,
      data.registeredAddressCityId || null
    ]);
  } catch (e) {
    console.error("[admin/colleges/profile addAction]", e);
  }
  revalidatePath("/admin/colleges/profile");
}

async function updateProfileRow(formData: FormData) {
  "use server";
  try {
    const bannerFile = formData.get("bannerimage_file") as File;
    let bannerimage = formData.get("bannerimage_existing") as string;

    if (bannerFile && bannerFile.size > 0) {
      const slug = (formData.get("slug") as string) || "college";
      bannerimage = await saveUpload(bannerFile, `college/${slug}`, "banner");
    }

    const data = Object.fromEntries(formData.entries());
    const sql = `
      UPDATE collegeprofile SET 
        users_id = ?, slug = ?, bannerimage = ?, rating = ?, ranking = ?, 
        verified = ?, isTopUniversity = ?, topUniversityRank = ?, 
        universityType = ?, registeredAddressCityId = ?, updated_at = NOW()
      WHERE id = ?
    `;
    await pool.query(sql, [
      data.users_id, data.slug, bannerimage, data.rating, data.ranking,
      data.verified === "on" ? 1 : 0,
      data.isTopUniversity === "on" ? 1 : 0,
      data.topUniversityRank || null,
      data.universityType,
      data.registeredAddressCityId || null,
      data.id
    ]);
  } catch (e) {
    console.error("[admin/colleges/profile updateAction]", e);
  }
  revalidatePath("/admin/colleges/profile");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/colleges/profile safeQuery]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileRow extends RowDataPacket {
  id: number;
  users_id: number;
  slug: string;
  name: string;
  bannerimage: string | null;
  rating: number;
  ranking: number | null;
  verified: number;
  isTopUniversity: number;
  topUniversityRank: number | null;
  universityType: string | null;
  registeredAddressCityId: number | null;
  city_name: string | null;
  count_courses: number;
  count_facilities: number;
  count_faculty: number;
  count_placements: number;
  count_admissions: number;
  count_events: number;
  count_faqs: number;
  count_management: number;
  count_reviews: number;
  count_scholarships: number;
  count_sports: number;
}

interface CountRow extends RowDataPacket {
  total: number;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CollegeProfilePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp   = await searchParams;
  const q    = (sp.q ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  // ── Build WHERE clause ─────────────────────────────────────────────────────
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (q) {
    conditions.push(
      "(u.firstname LIKE ? OR cp.slug LIKE ? OR cp.registeredSortAddress LIKE ?)",
    );
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  // ── Query profiles ─────────────────────────────────────────────────────────
  const [profiles, countRows] = await Promise.all([
    safeQuery<ProfileRow>(
      `SELECT 
        cp.id,
        cp.users_id,
        cp.slug,
        COALESCE(u.firstname, 'Unnamed College') as name,
        cp.bannerimage,
        cp.rating,
        cp.ranking,
        cp.verified,
        cp.isTopUniversity,
        cp.topUniversityRank,
        cp.universityType,
        cp.registeredAddressCityId,
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
      [...params, PAGE_SIZE, offset],
    ),
    safeQuery<CountRow>(
      `SELECT COUNT(*) AS total FROM collegeprofile cp JOIN users u ON u.id = cp.users_id ${where}`,
      params,
    ),
  ]);

  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <Suspense fallback={<div className="p-6">Loading profiles...</div>}>
      <ProfileClient 
        profiles={profiles as any}
        total={total}
        page={page}
        totalPages={totalPages}
        offset={offset}
        pageSize={PAGE_SIZE}
        q={q}
        onAdd={addProfileRow}
        onUpdate={updateProfileRow}
        onDelete={deleteProfileRow}
      />
    </Suspense>
  );
}
