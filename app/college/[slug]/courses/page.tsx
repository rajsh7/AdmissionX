import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";
import CoursesTab from "../components/CoursesTab";

export const dynamic = "force-dynamic";

export default async function CoursesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();

  // Find college — same projection as dashboard API
  const cp = await db.collection("collegeprofile").findOne(
    { slug },
    { projection: { _id: 1, id: 1 } }
  );
  if (!cp) notFound();

  // Use exact same id resolution as dashboard courses API
  const collegeprofile_id = cp.id ? Number(cp.id) : cp._id.toString();

  // Fetch all options + courses in parallel — same as dashboard API
  const [courseRows, courseOptions, degreeOptions, streamOptions] = await Promise.all([
    db.collection("collegemaster")
      .find({ collegeprofile_id })
      .sort({ functionalarea_id: 1, degree_id: 1, course_id: 1 })
      .toArray(),
    db.collection("course").find({}, { projection: { id: 1, name: 1, _id: 0 } }).sort({ name: 1 }).limit(500).toArray(),
    db.collection("degree").find({}, { projection: { id: 1, name: 1, _id: 0 } }).sort({ name: 1 }).limit(200).toArray(),
    db.collection("functionalarea").find({}, { projection: { id: 1, name: 1, _id: 0 } }).sort({ name: 1 }).limit(100).toArray(),
  ]);

  // Build maps using Number keys — same as dashboard API
  const courseMap = new Map(courseOptions.map((c: any) => [Number(c.id), String(c.name)]));
  const degreeMap = new Map(degreeOptions.map((d: any) => [Number(d.id), String(d.name)]));
  const streamMap = new Map(streamOptions.map((s: any) => [Number(s.id), String(s.name)]));

  const courses = courseRows.map((cm: any) => ({
    course_name:     cm.course_id        ? (courseMap.get(Number(cm.course_id))  ?? "Course") : "Course",
    degree_name:     cm.degree_id        ? (degreeMap.get(Number(cm.degree_id))  ?? null)     : null,
    stream_name:     cm.functionalarea_id? (streamMap.get(Number(cm.functionalarea_id)) ?? null) : null,
    fees:            cm.fees    != null  ? String(cm.fees)    : null,
    seats:           cm.seats   != null  ? String(cm.seats)   : null,
    courseduration:  cm.courseduration   ? String(cm.courseduration) : null,
    twelvemarks:     cm.twelvemarks != null ? String(cm.twelvemarks) : null,
    description:     cm.description      ? String(cm.description)    : null,
    admission_start: cm.admission_start  ? new Date(cm.admission_start).toISOString().split("T")[0] : null,
    admission_end:   cm.admission_end    ? new Date(cm.admission_end).toISOString().split("T")[0]   : null,
    last_date:       cm.last_date        ? new Date(cm.last_date).toISOString().split("T")[0]       : null,
  }));

  return <CoursesTab courses={courses} slug={slug} />;
}
