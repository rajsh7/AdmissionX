import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";
import CoursesTab from "../components/CoursesTab";

export const dynamic = "force-dynamic";

export default async function CoursesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();

  // Find college by slug
  const cp = await db.collection("collegeprofile").findOne({ slug }, { projection: { _id: 1 } });
  if (!cp) notFound();

  // Fetch courses from collegemaster
  const courseDocs = await db.collection("collegemaster")
    .find({ collegeprofile_id: cp._id })
    .limit(100)
    .toArray();

  // Fetch course names, degree names, stream names in parallel
  const courseIds = [...new Set(courseDocs.map(c => c.course_id).filter(Boolean))];
  const degreeIds = [...new Set(courseDocs.map(c => c.degree_id).filter(Boolean))];
  const streamIds = [...new Set(courseDocs.map(c => c.functionalarea_id).filter(Boolean))];

  const [courses, degrees, streams] = await Promise.all([
    courseIds.length
      ? db.collection("course").find(
          { $or: [{ _id: { $in: courseIds } }, { id: { $in: courseIds } }] },
          { projection: { _id: 1, id: 1, name: 1 } }
        ).toArray()
      : [],
    degreeIds.length
      ? db.collection("degree").find(
          { $or: [{ _id: { $in: degreeIds } }, { id: { $in: degreeIds } }] },
          { projection: { _id: 1, id: 1, name: 1 } }
        ).toArray()
      : [],
    streamIds.length
      ? db.collection("functionalarea").find(
          { $or: [{ _id: { $in: streamIds } }, { id: { $in: streamIds } }] },
          { projection: { _id: 1, id: 1, name: 1 } }
        ).toArray()
      : [],
  ]);

  // Build lookup maps
  const courseMap = Object.fromEntries([
    ...courses.map(c => [String(c._id), c.name]),
    ...courses.map(c => [String(c.id), c.name]),
  ]);
  const degreeMap = Object.fromEntries([
    ...degrees.map(d => [String(d._id), d.name]),
    ...degrees.map(d => [String(d.id), d.name]),
  ]);
  const streamMap = Object.fromEntries([
    ...streams.map(s => [String(s._id), s.name]),
    ...streams.map(s => [String(s.id), s.name]),
  ]);

  // Shape data for CoursesTab
  const courseRows = courseDocs.map(c => ({
    course_name:    courseMap[String(c.course_id)] || "Course",
    degree_name:    degreeMap[String(c.degree_id)] || null,
    stream_name:    streamMap[String(c.functionalarea_id)] || null,
    fees:           c.fees ? String(c.fees) : null,
    seats:          c.seats ? String(c.seats) : null,
    courseduration: c.courseduration ? String(c.courseduration) : null,
    twelvemarks:    c.twelvemarks ? String(c.twelvemarks) : null,
    description:    c.description ? String(c.description) : null,
  }));

  return <CoursesTab courses={courseRows} />;
}
