import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { fetchCollegeOptions } from "../_components/college-options";
import CollegeFilterBar from "../_components/CollegeFilterBar";
import ReviewsListClient from "./ReviewsListClient";

// --- Server Actions -----------------------------------------------------------

function parseNumber(formData: FormData, key: string) {
  const v = formData.get(key) as string;
  const num = Number(v);
  return Number.isFinite(num) ? num : 0;
}

async function createReview(formData: FormData) {
  "use server";
  const collegeprofile_id = formData.get("collegeprofile_id") as string;
  const title = String(formData.get("title") || "").trim();
  if (!collegeprofile_id || !title) return;

  if (!ObjectId.isValid(collegeprofile_id)) return;

  try {
    const db = await getDb();
    await db.collection("college_reviews").insertOne({
      collegeprofile_id: new ObjectId(collegeprofile_id),
      title,
      description: String(formData.get("description") || "").trim(),
      academic: parseNumber(formData, "academic"),
      infrastructure: parseNumber(formData, "infrastructure"),
      faculty: parseNumber(formData, "faculty"),
      accommodation: parseNumber(formData, "accommodation"),
      placement: parseNumber(formData, "placement"),
      social: parseNumber(formData, "social"),
      users_id: null,
      votes: 0,
      created_at: new Date(),
      updated_at: new Date(),
    });
  } catch (e) {
    console.error("[admin/colleges/reviews createReview]", e);
  }
  revalidatePath("/admin/colleges/reviews");
}

async function updateReview(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  const collegeprofile_id = formData.get("collegeprofile_id") as string;
  const title = String(formData.get("title") || "").trim();
  if (!id || !collegeprofile_id || !title) return;

  if (!ObjectId.isValid(id) || !ObjectId.isValid(collegeprofile_id)) return;
  const reviewId = new ObjectId(id);

  try {
    const db = await getDb();
    await db.collection("college_reviews").updateOne({ _id: reviewId }, {
      $set: {
        collegeprofile_id: new ObjectId(collegeprofile_id),
        title,
        description: String(formData.get("description") || "").trim(),
        academic: parseNumber(formData, "academic"),
        infrastructure: parseNumber(formData, "infrastructure"),
        faculty: parseNumber(formData, "faculty"),
        accommodation: parseNumber(formData, "accommodation"),
        placement: parseNumber(formData, "placement"),
        social: parseNumber(formData, "social"),
        updated_at: new Date(),
      },
    });
  } catch (e) {
    console.error("[admin/colleges/reviews updateReview]", e);
  }
  revalidatePath("/admin/colleges/reviews");
}

async function deleteReview(id: string) {
  "use server";
  if (!ObjectId.isValid(id)) return;
  try {
    const db = await getDb();
    await db.collection("college_reviews").deleteOne({ _id: new ObjectId(id) });
  } catch (e) {
    console.error("[admin/colleges/reviews deleteReview]", e);
  }
  revalidatePath("/admin/colleges/reviews");
}

const PAGE_SIZE = 25;

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

interface ReviewRow {
  id: string;
  collegeprofile_id: string;
  college_slug: string | null;
  college_name: string;
  title: string;
  description: string;
  academic: number;
  accommodation: number;
  faculty: number;
  infrastructure: number;
  placement: number;
  social: number;
  student_name: string;
  student_email: string | null;
  created_at: string | null;
  updated_at: string | null;
  vote: number;
}

interface CollegeOption {
  id: string;
  name: string;
}

// --- Page ---------------------------------------------------------------------

export default async function CollegeReviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const collegeName = (sp.collegeName ?? "").trim();
  const studentName = (sp.studentName ?? "").trim();
  const page        = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset      = (page - 1) * PAGE_SIZE;

  const db = await getDb();

  const pipeline: Record<string, unknown>[] = [];
  if (q) {
    pipeline.push({
      $match: {
        $or: [
          { title: { $regex: escapeRegex(q), $options: "i" } },
          { description: { $regex: escapeRegex(q), $options: "i" } },
        ],
      },
    });
  }

  pipeline.push(
    {
      $lookup: {
        from: "collegeprofile",
        localField: "collegeprofile_id",
        foreignField: "_id",
        as: "cp",
      },
    },
    { $unwind: { path: "$cp", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "users",
        localField: "cp.users_id",
        foreignField: "_id",
        as: "cpUser",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "users_id",
        foreignField: "_id",
        as: "studentUser",
      },
    },
    {
      $addFields: {
        college_name: {
          $ifNull: [
            { $arrayElemAt: ["$cpUser.firstname", 0] },
            { $ifNull: ["$cp.contactpersonname", "$cp.slug"] },
            "Unnamed College",
          ],
        },
        college_slug: { $ifNull: ["$cp.slug", null] },
        student_name: {
          $ifNull: [{ $arrayElemAt: ["$studentUser.firstname", 0] }, "Anonymous Student"],
        },
        student_email: { $arrayElemAt: ["$studentUser.email", 0] },
      },
    },
  );

  if (collegeName) {
    pipeline.push({
      $match: {
        college_name: { $regex: escapeRegex(collegeName), $options: "i" },
      },
    });
  }

  if (studentName) {
    pipeline.push({
      $match: {
        student_name: { $regex: escapeRegex(studentName), $options: "i" },
      },
    });
  }

  pipeline.push({ $sort: { created_at: -1 } });

  const facetStage = {
    $facet: {
      data: [
        { $skip: offset },
        { $limit: PAGE_SIZE },
        {
          $project: {
            _id: 0,
            id: { $toString: "$_id" },
            collegeprofile_id: { $toString: "$collegeprofile_id" },
            college_slug: 1,
            college_name: 1,
            title: 1,
            description: 1,
            academic: 1,
            accommodation: 1,
            faculty: 1,
            infrastructure: 1,
            placement: 1,
            social: 1,
            student_name: 1,
            student_email: 1,
            votes: 1,
            created_at: 1,
            updated_at: 1,
          },
        },
      ],
      total: [{ $count: "count" }],
    },
  };

  const aggResult = await db.collection("college_reviews").aggregate([...pipeline, facetStage]).toArray();
  const view = aggResult[0] ?? { data: [], total: [] };
  const reviewDocs = (view.data ?? []) as ReviewRow[];
  const total = Number(view.total?.[0]?.count ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const collegeDocs = await db
    .collection("collegeprofile")
    .find({}, { projection: { _id: 1, slug: 1, contactpersonname: 1, users_id: 1 } })
    .sort({ slug: 1 })
    .toArray();

  const userIds = [
    ...new Set(
      collegeDocs
        .map((doc) => doc.users_id)
        .filter((id) => id !== null && id !== undefined),
    ),
  ];

  const userDocs = userIds.length
    ? await db.collection("users").find({ _id: { $in: userIds } }, { projection: { _id: 1, firstname: 1 } }).toArray()
    : [];

  const userMap: Record<string, string> = Object.fromEntries(
    userDocs.map((u) => [String(u._id), String(u.firstname ?? "")]),
  );

  const colleges = collegeDocs.map((cp) => ({
    id: String(cp._id),
    name: userMap[String(cp.users_id)] || String(cp.contactpersonname ?? cp.slug ?? "Unnamed College"),
  }));

  const cleanReviews = reviewDocs.map((r) => ({
    id: String(r.id),
    collegeprofile_id: String(r.collegeprofile_id),
    college_slug: String(r.college_slug ?? ""),
    college_name: String(r.college_name || "Unnamed College"),
    title: String(r.title || ""),
    description: String(r.description || ""),
    academic: Number(r.academic || 0),
    accommodation: Number(r.accommodation || 0),
    faculty: Number(r.faculty || 0),
    infrastructure: Number(r.infrastructure || 0),
    placement: Number(r.placement || 0),
    social: Number(r.social || 0),
    student_name: String(r.student_name || "Anonymous Student"),
    student_email: r.student_email ? String(r.student_email) : null,
    created_at: r.created_at ? String(r.created_at) : null,
    updated_at: r.updated_at ? String(r.updated_at) : null,
    vote: Number(r.vote || 0),
  }));

  return (
    <div className="p-6 space-y-6 w-full overflow-x-hidden">
      <ReviewsListClient
        reviews={cleanReviews}
        colleges={colleges}
        total={total}
        page={page}
        totalPages={totalPages}
        offset={offset}
        pageSize={PAGE_SIZE}
        q={q}
        collegeName={collegeName}
        studentName={studentName}
        createReview={createReview}
        updateReview={updateReview}
        deleteReview={deleteReview}
      />
    </div>
  );
}
