import { cookies } from "next/headers";
import { verifyCollegeToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import CollegeDashboardClient from "./CollegeDashboardClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface CollegeUser {
  id: string;
  name: string;
  email: string;
  slug: string;
  collegeprofile_id: unknown | null;
  logoimage?: string | null;
}

export default async function CollegeDashboardPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("adx_college")?.value;

  if (!token) redirect(`/login/college?redirect=/dashboard/college/${slug}`);

  const payload = await verifyCollegeToken(token);
  if (!payload) redirect(`/login/college?redirect=/dashboard/college/${slug}`);

  const db = await getDb();
  let collegeprofile_id: unknown = null;
  let collegeName = payload.name;
  let collegeSlug = slug;

  // Look up collegeprofile by email (set during approval flow)
  const profile = await db.collection("collegeprofile").findOne(
    { $or: [
      { email: payload.email.toLowerCase() },
      { slug },
    ]},
    { projection: { _id: 1, id: 1, slug: 1, college_name: 1, logoimage: 1, users_id: 1 } }
  );

  if (profile) {
    collegeprofile_id = profile._id.toString();
    collegeSlug = profile.slug || slug;

    // Get college name: try profile.college_name first, then users.firstname
    if (profile.college_name) {
      collegeName = profile.college_name;
    } else if (profile.users_id) {
      const user = await db.collection("users").findOne(
        { $or: [{ _id: profile.users_id }, { id: profile.users_id }] },
        { projection: { firstname: 1 } }
      );
      if (user?.firstname) collegeName = String(user.firstname).trim();
    }
    if (!collegeName) collegeName = payload.name || collegeSlug;

    if (profile.slug && profile.slug !== slug) {
      redirect(`/dashboard/college/${profile.slug}`);
    }
  }

  const college: CollegeUser = {
    id: payload.id,
    name: collegeName,
    email: payload.email,
    slug: collegeSlug,
    collegeprofile_id,
    logoimage: profile?.logoimage ? String(profile.logoimage) : null,
  };

  return <CollegeDashboardClient college={college} />;
}
