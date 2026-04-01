import { cookies } from "next/headers";
import { verifyStudentToken } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function StudentDashboardRedirect() {
  const cookieStore = await cookies();
  const token = cookieStore.get("adx_student")?.value;

  if (token) {
    const payload = await verifyStudentToken(token);
    if (payload) {
      redirect(`/dashboard/student/${payload.id}`);
    }
  }

  // No valid token — send to login
  redirect("/login/student");
}




