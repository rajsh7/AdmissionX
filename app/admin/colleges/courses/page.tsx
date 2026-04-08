import pool, { getDb } from "@/lib/db";
import Link from "next/link";
import { revalidatePath } from "next/cache";
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

const PAGE_SIZE = 25;

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

export default async function CollegeCoursesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const db = await getDb();
  const courseCollection = db.collection("collegemaster");

  const enrichmentPipeline = [
    {
      $lookup: {
        from: "course",
        localField: "course_id",
        foreignField: "id",
        as: "courseDoc",
      },
    },
    { $unwind: { path: "$courseDoc", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "degree",
        localField: "degree_id",
        foreignField: "id",
        as: "degreeDoc",
      },
    },
    { $unwind: { path: "$degreeDoc", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "functionalarea",
        localField: "functionalarea_id",
        foreignField: "id",
        as: "streamDoc",
      },
    },
    { $unwind: { path: "$streamDoc", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "collegeprofile",
        localField: "collegeprofile_id",
        foreignField: "id",
        as: "collegeDoc",
      },
    },
    { $unwind: { path: "$collegeDoc", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "users",
        localField: "collegeDoc.users_id",
        foreignField: "id",
        as: "userDoc",
      },
    },
    { $unwind: { path: "$userDoc", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        college_name: { $ifNull: ["$userDoc.firstname", "Unnamed College"] },
        course_name: "$courseDoc.name",
        degree_name: "$degreeDoc.name",
        stream_name: "$streamDoc.name",
      },
    },
  ];

  const projectStage = {
    $project: {
      _id: 0,
      id: 1,
      collegeprofile_id: 1,
      course_id: 1,
      degree_id: 1,
      functionalarea_id: 1,
      college_name: 1,
      course_name: 1,
      degree_name: 1,
      stream_name: 1,
      fees: 1,
      seats: 1,
      courseduration: 1,
    },
  };

  let total = 0;
  let rawCourses: Array<Record<string, unknown>> = [];

  if (q) {
    const regex = new RegExp(escapeRegex(q), "i");
    const searchablePipeline = [
      ...enrichmentPipeline,
      {
        $match: {
          $or: [
            { college_name: regex },
            { course_name: regex },
            { degree_name: regex },
            { stream_name: regex },
          ],
        },
      },
    ];

    const [countRows, rows] = await Promise.all([
      courseCollection.aggregate([...searchablePipeline, { $count: "total" }]).toArray(),
      courseCollection
        .aggregate([
          ...searchablePipeline,
          { $sort: { created_at: -1, id: -1 } },
          { $skip: offset },
          { $limit: PAGE_SIZE },
          projectStage,
        ])
        .toArray(),
    ]);

    total = Number(countRows[0]?.total ?? 0);
    rawCourses = rows as Array<Record<string, unknown>>;
  } else {
    const [count, rows] = await Promise.all([
      courseCollection.countDocuments(),
      courseCollection
        .aggregate([
          { $sort: { created_at: -1, id: -1 } },
          { $skip: offset },
          { $limit: PAGE_SIZE },
          ...enrichmentPipeline,
          projectStage,
        ])
        .toArray(),
    ]);

    total = count;
    rawCourses = rows as Array<Record<string, unknown>>;
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const cleanCourses: CourseRow[] = rawCourses.map((course, idx) => ({
    id: Number(course.id) || idx + 1,
    collegeprofile_id: Number(course.collegeprofile_id) || 0,
    course_id: toNumberOrNull(course.course_id),
    degree_id: toNumberOrNull(course.degree_id),
    functionalarea_id: toNumberOrNull(course.functionalarea_id),
    college_name: toStringOrNull(course.college_name) ?? "Unnamed College",
    course_name: toStringOrNull(course.course_name),
    degree_name: toStringOrNull(course.degree_name),
    stream_name: toStringOrNull(course.stream_name),
    fees: toStringOrNull(course.fees),
    seats: toStringOrNull(course.seats),
    courseduration: toStringOrNull(course.courseduration),
  }));

  return (
    <div className="p-6 space-y-6 w-full">
      <CourseListClient
        courses={cleanCourses}
        total={total}
        pageSize={PAGE_SIZE}
        offset={offset}
        onAdd={createCourse}
        onDelete={deleteCourse}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <p className="text-xs text-slate-500">
            Showing <strong>{offset + 1}-{Math.min(offset + PAGE_SIZE, total)}</strong> of{" "}
            <strong>{total.toLocaleString()}</strong> courses
          </p>
          <div className="flex items-center gap-1">
            {page > 1 ? (
              <Link
                href={`/admin/colleges/courses?page=${page - 1}${q ? `&q=${q}` : ""}`}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Prev
              </Link>
            ) : (
              <span className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">
                Prev
              </span>
            )}
            <span className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-blue-50 border border-blue-100 rounded-lg">
              {page} / {totalPages}
            </span>
            {page < totalPages ? (
              <Link
                href={`/admin/colleges/courses?page=${page + 1}${q ? `&q=${q}` : ""}`}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Next
              </Link>
            ) : (
              <span className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">
                Next
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
