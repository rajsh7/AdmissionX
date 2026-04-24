import { cookies } from "next/headers";
import { verifyStudentToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import StudentDashboardClient from "../StudentDashboardClient";
import { Suspense } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ activated?: string }>;
}

export default async function StudentDashboardPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("adx_student")?.value;

  // No token → send to login
  if (!token) {
    redirect(`/login/student?redirect=/dashboard/student/${id}`);
  }

  const payload = await verifyStudentToken(token);

  // Invalid / expired token → send to login
  if (!payload) {
    redirect(`/login/student?redirect=/dashboard/student/${id}`);
  }

  // If the ID in the URL doesn't match the token, redirect to the correct one
  if (String(payload.id) !== id) {
    redirect(`/dashboard/student/${payload.id}`);
  }

  const { activated } = await searchParams;

  // Fetch avatar from DB (for Google users)
  let avatar = "";
  try {
    const db = await getDb();
    const student = await db.collection("next_student_signups").findOne(
      { _id: new ObjectId(id) },
      { projection: { avatar: 1 } }
    );
    avatar = student?.avatar || "";
  } catch {}

  const user = {
    id: payload.id,
    name: payload.name,
    email: payload.email,
    avatar,
  };

  return (
    <Suspense fallback={null}>
      <StudentDashboardClient user={user} activated={activated === "1"} />
    </Suspense>
  );
}
