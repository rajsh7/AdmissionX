import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [newStudents, newColleges, newQueries, newContactQueries] = await Promise.all([
      db.collection("next_student_signups")
        .find({ created_at: { $gte: since } }, { projection: { name: 1, email: 1, created_at: 1 } })
        .sort({ created_at: -1 }).limit(10).toArray(),
      db.collection("next_college_signups")
        .find({ created_at: { $gte: since } }, { projection: { college_name: 1, email: 1, created_at: 1 } })
        .sort({ created_at: -1 }).limit(10).toArray(),
      db.collection("student_queries")
        .find({ created_at: { $gte: since } }, { projection: { student_name: 1, subject: 1, created_at: 1 } })
        .sort({ created_at: -1 }).limit(10).toArray(),
      db.collection("contact_queries")
        .find({ created_at: { $gte: since } }, { projection: { name: 1, subject: 1, created_at: 1 } })
        .sort({ created_at: -1 }).limit(10).toArray(),
    ]);

    const bells = [
      ...newStudents.map(s => ({
        id:    s._id.toString(),
        type:  "student",
        title: s.name || "New Student",
        desc:  s.email || "",
        time:  s.created_at ? new Date(s.created_at).toISOString() : new Date().toISOString(),
        href:  "/admin/members/registrations",
      })),
      ...newColleges.map(c => ({
        id:    c._id.toString(),
        type:  "college",
        title: c.college_name || "New College",
        desc:  c.email || "",
        time:  c.created_at ? new Date(c.created_at).toISOString() : new Date().toISOString(),
        href:  "/admin/members/registrations",
      })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 15);

    const messages = [
      ...newQueries.map(q => ({
        id:    q._id.toString(),
        type:  "query",
        title: q.student_name || "New Query",
        desc:  q.subject || "Student query",
        time:  q.created_at ? new Date(q.created_at).toISOString() : new Date().toISOString(),
        href:  "/admin/queries/college-student",
      })),
      ...newContactQueries.map(q => ({
        id:    q._id.toString(),
        type:  "contact",
        title: q.name || "Contact Query",
        desc:  q.subject || "Contact us message",
        time:  q.created_at ? new Date(q.created_at).toISOString() : new Date().toISOString(),
        href:  "/admin/queries/contact",
      })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 15);

    return NextResponse.json({ bells, messages });
  } catch {
    return NextResponse.json({ bells: [], messages: [] });
  }
}
