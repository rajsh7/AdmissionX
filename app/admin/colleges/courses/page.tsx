import pool, { getDb } from "@/lib/db";
import Link from "next/link";
import { revalidatePath, unstable_cache } from "next/cache";
import CourseListClient from "./CourseListClient";

async function createCourse(formData: FormData) {
  "use server";
  const collegeprofile_id = formData.get("collegeprofile_id");
  const course_id = formData.get("course_id") || null;
  const degree_id = formData.get("degree_id") || null;
  const functionalarea_id = formData.get("functionalarea_id") || null;
  const fees = formData.get("fees") || null;
  const seats = formData.get("seats") || null;
  const courseduration = formData.get("courseduration") || null;

  try {
    await pool.query(
      `INSERT INTO collegemaster
        (collegeprofile_id, course_id, degree_id, functionalarea_id, fees, seats, courseduration, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [collegeprofile_id, course_id, degree_id, functionalarea_id, fees, seats, courseduration],
    );
  } catch (e) {
    console.error("[admin/colleges/courses createAction]", e);
  }
  revalidatePath("/admin/colleges/courses");
  revalidatePath("/", "layout");
}

async function deleteCourse(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM collegemaster WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/colleges/courses deleteAction]", e);
  }
  revalidatePath("/admin/colleges/courses");
  revalidatePath("/", "layout");
}

const PAGE_SIZE = 45;

interface CourseRow {
  id: number;
  collegeprofile_id: number;
  course_id: number | null;
  degree_id: number | null;
  functionalarea_id: number | null;
  college_name: string;
  course_name: string | null;
  degree_name: string | null;
  stream_name: string | null;
  fees: string | null;
  seats: string | null;
  courseduration: string | null;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toStringOrNull(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const parsed = String(value).trim();
  return parsed ? parsed : null;
}

// Cached option loaders
const getCachedCourseOptions = unstable_cache(
  async (): Promise<Array<{ id: number; name: string }>> => {
    const db = await getDb();
    return db.collection<{ id: number; name: string }>("course")
      .find({}, { projection: { id: 1, name: 1, _id: 0 } })
      .sort({ name: 1 })
      .toArray();
  },
  ["admin-colleges-courses-options"],
  { revalidate: 300 } // Cache for 5 minutes
);

const getCachedDegreeOptions = unstable_cache(
  async (): Promise<Array<{ id: number; name: string }>> => {
    const db = await getDb();
    return db.collection<{ id: number; name: string }>("degree")
      .find({}, { projection: { id: 1, name: 1, _id: 0 } })
      .sort({ name: 1 })
      .toArray();
  },
  ["admin-colleges-degrees-options"],
  { revalidate: 300 }
);

const getCachedStreamOptions = unstable_cache(
  async (): Promise<Array<{ id: number; name: string }>> => {
    const db = await getDb();
    return db.collection<{ id: number; name: string }>("functionalarea")
      .find({}, { projection: { id: 1, name: 1, _id: 0 } })
      .sort({ name: 1 })
      .toArray();
  },
  ["admin-colleges-streams-options"],
  { revalidate: 300 }
);

const getCachedCollegeOptions = unstable_cache(
  async (): Promise<Array<{ id: number; name: string }>> => {
    const db = await getDb();
    return db.collection("collegeprofile").aggregate<{
      id: number;
      name: string;
    }>([
      {
        $lookup: {
          from: "users",
          localField: "users_id",
          foreignField: "id",
          as: "userDoc",
        },
      },
      { $unwind: { path: "$userDoc", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          id: 1,
          name: { $ifNull: ["$userDoc.firstname", "Unnamed College"] },
        },
      },
      { $sort: { name: 1 } },
    ]).toArray();
  },
  ["admin-colleges-college-options"],
  { revalidate: 300 }
);

export default async function CollegeCoursesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const collegeId = sp.collegeId ?? "";
  const courseId = sp.courseId ?? "";
  const degreeId = sp.degreeId ?? "";
  const streamId = sp.streamId ?? "";
  const fees = (sp.fees ?? "").trim();
  const seats = (sp.seats ?? "").trim();
  const duration = (sp.duration ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const db = await getDb();
  const courseCollection = db.collection("collegemaster");

  // Build match conditions
  const match: any = {};
  if (collegeId) match.collegeprofile_id = Number(collegeId);
  if (courseId) match.course_id = Number(courseId);
  if (degreeId) match.degree_id = Number(degreeId);
  if (streamId) match.functionalarea_id = Number(streamId);
  if (fees) match.fees = { $regex: new RegExp(escapeRegex(fees), "i") };
  if (seats) match.seats = { $regex: new RegExp(escapeRegex(seats), "i") };
  if (duration) match.courseduration = { $regex: new RegExp(escapeRegex(duration), "i") };

  // Get total count first (fast operation)
  const total = await courseCollection.countDocuments(match);

  // Get paginated courses with minimal data first
  const courses = await courseCollection
    .find(match, {
      projection: {
        id: 1,
        collegeprofile_id: 1,
        course_id: 1,
        degree_id: 1,
        functionalarea_id: 1,
        fees: 1,
        seats: 1,
        courseduration: 1,
      }
    })
    .sort({ created_at: -1, id: -1 })
    .skip(offset)
    .limit(PAGE_SIZE)
    .toArray();

  // Get all required IDs for batch lookups
  const collegeIds = [...new Set(courses.map(c => c.collegeprofile_id).filter(Boolean))];
  const courseIds = [...new Set(courses.map(c => c.course_id).filter(Boolean))];
  const degreeIds = [...new Set(courses.map(c => c.degree_id).filter(Boolean))];
  const streamIds = [...new Set(courses.map(c => c.functionalarea_id).filter(Boolean))];

  // Batch lookup all related data
  const [colleges, courseData, degrees, streams] = await Promise.all([
    collegeIds.length > 0 ? db.collection("collegeprofile").aggregate([
      { $match: { id: { $in: collegeIds } } },
      {
        $lookup: {
          from: "users",
          localField: "users_id",
          foreignField: "id",
          as: "userDoc",
        },
      },
      { $unwind: { path: "$userDoc", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          id: 1,
          name: { $ifNull: ["$userDoc.firstname", "Unnamed College"] },
        },
      },
    ]).toArray() : Promise.resolve([]),
    courseIds.length > 0 ? db.collection("course").find(
      { id: { $in: courseIds } },
      { projection: { id: 1, name: 1, _id: 0 } }
    ).toArray() : Promise.resolve([]),
    degreeIds.length > 0 ? db.collection("degree").find(
      { id: { $in: degreeIds } },
      { projection: { id: 1, name: 1, _id: 0 } }
    ).toArray() : Promise.resolve([]),
    streamIds.length > 0 ? db.collection("functionalarea").find(
      { id: { $in: streamIds } },
      { projection: { id: 1, name: 1, _id: 0 } }
    ).toArray() : Promise.resolve([]),
  ]);

  // Create lookup maps for fast access
  const collegeMap = new Map(colleges.map(c => [c.id, c.name]));
  const courseMap = new Map(courseData.map(c => [c.id, c.name]));
  const degreeMap = new Map(degrees.map(d => [d.id, d.name]));
  const streamMap = new Map(streams.map(s => [s.id, s.name]));

  // Enrich courses with lookup data
  const cleanCourses: CourseRow[] = courses.map((course, idx) => ({
    id: Number(course.id) || idx + 1,
    collegeprofile_id: Number(course.collegeprofile_id) || 0,
    course_id: toNumberOrNull(course.course_id),
    degree_id: toNumberOrNull(course.degree_id),
    functionalarea_id: toNumberOrNull(course.functionalarea_id),
    college_name: collegeMap.get(course.collegeprofile_id) ?? "Unnamed College",
    course_name: course.course_id ? courseMap.get(course.course_id) ?? null : null,
    degree_name: course.degree_id ? degreeMap.get(course.degree_id) ?? null : null,
    stream_name: course.functionalarea_id ? streamMap.get(course.functionalarea_id) ?? null : null,
    fees: toStringOrNull(course.fees),
    seats: toStringOrNull(course.seats),
    courseduration: toStringOrNull(course.courseduration),
  }));

  // Handle search query separately (more complex but less frequent)
  let finalCourses = cleanCourses;
  let finalTotal = total;

  if (q) {
    const regex = new RegExp(escapeRegex(q), "i");

    // Filter already fetched courses
    const filteredCourses = cleanCourses.filter(course =>
      regex.test(course.college_name) ||
      regex.test(course.course_name || "") ||
      regex.test(course.degree_name || "") ||
      regex.test(course.stream_name || "") ||
      regex.test(course.fees || "") ||
      regex.test(course.seats || "") ||
      regex.test(course.courseduration || "")
    );

    // If we have enough filtered results, use them
    if (filteredCourses.length >= PAGE_SIZE) {
      finalCourses = filteredCourses.slice(0, PAGE_SIZE);
      finalTotal = filteredCourses.length; // Approximate total
    } else {
      // Need to search all data for accurate results
      const allCourses = await courseCollection
        .find(match, {
          projection: {
            id: 1,
            collegeprofile_id: 1,
            course_id: 1,
            degree_id: 1,
            functionalarea_id: 1,
            fees: 1,
            seats: 1,
            courseduration: 1,
          }
        })
        .toArray();

      // Get all IDs for comprehensive lookup
      const allCollegeIds = [...new Set(allCourses.map(c => c.collegeprofile_id).filter(Boolean))];
      const allCourseIds = [...new Set(allCourses.map(c => c.course_id).filter(Boolean))];
      const allDegreeIds = [...new Set(allCourses.map(c => c.degree_id).filter(Boolean))];
      const allStreamIds = [...new Set(allCourses.map(c => c.functionalarea_id).filter(Boolean))];

      const [allColleges, allCourseData, allDegrees, allStreams] = await Promise.all([
        allCollegeIds.length > 0 ? db.collection("collegeprofile").aggregate([
          { $match: { id: { $in: allCollegeIds } } },
          {
            $lookup: {
              from: "users",
              localField: "users_id",
              foreignField: "id",
              as: "userDoc",
            },
          },
          { $unwind: { path: "$userDoc", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 0,
              id: 1,
              name: { $ifNull: ["$userDoc.firstname", "Unnamed College"] },
            },
          },
        ]).toArray() : Promise.resolve([]),
        allCourseIds.length > 0 ? db.collection("course").find(
          { id: { $in: allCourseIds } },
          { projection: { id: 1, name: 1, _id: 0 } }
        ).toArray() : Promise.resolve([]),
        allDegreeIds.length > 0 ? db.collection("degree").find(
          { id: { $in: allDegreeIds } },
          { projection: { id: 1, name: 1, _id: 0 } }
        ).toArray() : Promise.resolve([]),
        allStreamIds.length > 0 ? db.collection("functionalarea").find(
          { id: { $in: allStreamIds } },
          { projection: { id: 1, name: 1, _id: 0 } }
        ).toArray() : Promise.resolve([]),
      ]);

      const allCollegeMap = new Map(allColleges.map(c => [c.id, c.name]));
      const allCourseMap = new Map(allCourseData.map(c => [c.id, c.name]));
      const allDegreeMap = new Map(allDegrees.map(d => [d.id, d.name]));
      const allStreamMap = new Map(allStreams.map(s => [s.id, s.name]));

      const enrichedAllCourses = allCourses.map((course, idx) => ({
        id: Number(course.id) || idx + 1,
        collegeprofile_id: Number(course.collegeprofile_id) || 0,
        course_id: toNumberOrNull(course.course_id),
        degree_id: toNumberOrNull(course.degree_id),
        functionalarea_id: toNumberOrNull(course.functionalarea_id),
        college_name: allCollegeMap.get(course.collegeprofile_id) ?? "Unnamed College",
        course_name: course.course_id ? allCourseMap.get(course.course_id) ?? null : null,
        degree_name: course.degree_id ? allDegreeMap.get(course.degree_id) ?? null : null,
        stream_name: course.functionalarea_id ? allStreamMap.get(course.functionalarea_id) ?? null : null,
        fees: toStringOrNull(course.fees),
        seats: toStringOrNull(course.seats),
        courseduration: toStringOrNull(course.courseduration),
      }));

      const searchedCourses = enrichedAllCourses.filter(course =>
        regex.test(course.college_name) ||
        regex.test(course.course_name || "") ||
        regex.test(course.degree_name || "") ||
        regex.test(course.stream_name || "") ||
        regex.test(course.fees || "") ||
        regex.test(course.seats || "") ||
        regex.test(course.courseduration || "")
      );

      finalCourses = searchedCourses.slice(offset, offset + PAGE_SIZE);
      finalTotal = searchedCourses.length;
    }
  }

  const [courseOptions, degreeOptions, streamOptions, collegeOptions] = await Promise.all([
    getCachedCourseOptions(),
    getCachedDegreeOptions(),
    getCachedStreamOptions(),
    getCachedCollegeOptions(),
  ]);

  const totalPages = Math.ceil(finalTotal / PAGE_SIZE);

  return (
    <div className="p-6 space-y-6 w-full">
      <CourseListClient
        courses={finalCourses}
        total={finalTotal}
        pageSize={PAGE_SIZE}
        offset={offset}
        page={page}
        totalPages={totalPages}
        searchQuery={q}
        selectedCollegeId={collegeId}
        selectedCourseId={courseId}
        selectedDegreeId={degreeId}
        selectedStreamId={streamId}
        selectedFees={fees}
        selectedSeats={seats}
        selectedDuration={duration}
        courseOptions={courseOptions}
        degreeOptions={degreeOptions}
        streamOptions={streamOptions}
        collegeOptions={collegeOptions}
        onAdd={createCourse}
        onDelete={deleteCourse}
      />
    </div>
  );
}
