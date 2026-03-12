import { cookies } from "next/headers";
import { verifyCollegeToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import CollegeDashboardClient from "./CollegeDashboardClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CollegeDashboardPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("adx_college")?.value;

  if (!token) {
    redirect(`/login/college?redirect=/dashboard/college/${slug}`);
  }

  const payload = await verifyCollegeToken(token);
  if (!payload) {
    redirect(`/login/college?redirect=/dashboard/college/${slug}`);
  }

  // Look up the collegeprofile matching this slug + the logged-in college's email
  const conn = await pool.getConnection();
  let collegeprofile_id: number | null = null;
  let collegeName = payload.name;
  let collegeSlug = slug;

  try {
    const [rows] = await conn.query(
      `SELECT cp.id, cp.slug, COALESCE(NULLIF(TRIM(u.firstname), ''), cp.slug) AS college_name
       FROM collegeprofile cp
       JOIN users u ON u.id = cp.users_id
       WHERE cp.slug = ? AND TRIM(LOWER(u.email)) = LOWER(?)
       LIMIT 1`,
      [slug, payload.email],
    );
    const list = rows as { id: number; slug: string; college_name: string }[];

    if (list.length) {
      collegeprofile_id = list[0].id;
      collegeName = list[0].college_name || payload.name;
      collegeSlug = list[0].slug;
    } else {
      // Email didn't match — this college doesn't own this slug.
      // Try to find their actual slug by email and redirect.
      const [own] = await conn.query(
        `SELECT cp.slug
         FROM collegeprofile cp
         JOIN users u ON u.id = cp.users_id
         WHERE TRIM(LOWER(u.email)) = LOWER(?)
         LIMIT 1`,
        [payload.email],
      );
      const ownList = own as { slug: string }[];
      if (ownList.length) {
        redirect(`/dashboard/college/${ownList[0].slug}`);
      }
      // No profile found — they're a pending new signup.
      // Fall through with collegeprofile_id = null so the UI shows the pending state.
    }
  } finally {
    conn.release();
  }

  const college = {
    id: payload.id,
    name: collegeName,
    email: payload.email,
    slug: collegeSlug,
    collegeprofile_id,
  };

  return <CollegeDashboardClient college={college} />;
}
