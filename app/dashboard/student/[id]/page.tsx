import { cookies } from "next/headers";
import { verifyStudentToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import StudentDashboardClient from "../StudentDashboardClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentDashboardPage({ params }: PageProps) {
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

  const user = {
    id: payload.id,
    name: payload.name,
    email: payload.email,
  };

  return <StudentDashboardClient user={user} />;
}
