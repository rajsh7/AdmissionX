import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminToken } from "@/lib/auth";
import AdminShell from "./_components/AdminShell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Panel | AdmissionX",
  description: "AdmissionX administration panel",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("adx_admin")?.value;

  if (!token) {
    redirect("/login?redirect=/admin/dashboard");
  }

  const payload = await verifyAdminToken(token);

  if (!payload) {
    redirect("/login?redirect=/admin/dashboard");
  }

  return (
    <AdminShell
      admin={{
        id: payload.id,
        name: payload.name,
        email: payload.email,
      }}
    >
      {children}
    </AdminShell>
  );
}
