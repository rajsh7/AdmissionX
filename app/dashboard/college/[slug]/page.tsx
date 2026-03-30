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

  const cpRows = await db.collection("collegeprofile").aggregate([
    { $match: { slug } },
    { $lookup: { from: "users", localField: "users_id", foreignField: "id", as: "u" } },
    { $unwind: { path: "$u", preserveNullAndEmptyArrays: true } },
    { $match: { "u.email": { $regex: `^${payload.email}$`, $options: "i" } } },
    { $project: { _id: 1, id: 1, slug: 1, college_name: { $ifNull: [{ $trim: { input: "$u.firstname" } }, "$slug"] } } },
    { $limit: 1 },
  ]).toArray();

  if (cpRows.length) {
    collegeprofile_id = cpRows[0]._id;
    collegeName = cpRows[0].college_name || payload.name;
    collegeSlug = cpRows[0].slug;
  } else {
    // Try to find their actual slug by email
    const ownRows = await db.collection("collegeprofile").aggregate([
      { $lookup: { from: "users", localField: "users_id", foreignField: "id", as: "u" } },
      { $unwind: { path: "$u", preserveNullAndEmptyArrays: true } },
      { $match: { "u.email": { $regex: `^${payload.email}$`, $options: "i" } } },
      { $project: { slug: 1 } },
      { $limit: 1 },
    ]).toArray();
    if (ownRows.length) redirect(`/dashboard/college/${ownRows[0].slug}`);
  }

  const college: CollegeUser = {
    id: payload.id,
    name: collegeName,
    email: payload.email,
    slug: collegeSlug,
    collegeprofile_id,
  };

  return <CollegeDashboardClient college={college} />;
}
