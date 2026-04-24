import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";
import ReviewsTab from "../components/ReviewsTab";

export const dynamic = "force-dynamic";

export default async function ReviewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();

  const cp = await db.collection("collegeprofile").findOne({ slug }, { projection: { _id: 1 } });
  if (!cp) notFound();

  // Fetch reviews
  const reviewDocs = await db.collection("college_reviews")
    .find({ collegeprofile_id: cp._id, description: { $exists: true, $ne: "" } })
    .sort({ created_at: -1 })
    .limit(50)
    .toArray();

  // Fetch reviewer names
  const userIds = [...new Set(reviewDocs.map(r => r.users_id).filter(Boolean))];
  const userDocs = userIds.length
    ? await db.collection("users").find(
        { $or: [{ _id: { $in: userIds } }, { id: { $in: userIds } }] },
        { projection: { _id: 1, id: 1, firstname: 1 } }
      ).toArray()
    : [];
  const userMap = Object.fromEntries([
    ...userDocs.map(u => [String(u._id), u.firstname]),
    ...userDocs.map(u => [String(u.id), u.firstname]),
  ]);

  const reviews = reviewDocs.map(r => ({
    id: String(r._id),
    name: userMap[String(r.users_id)] || "Anonymous Student",
    text: String(r.description || ""),
    rating: Math.min(5, Math.max(1, Math.round(
      ([r.academic, r.accommodation, r.faculty, r.infrastructure, r.placement, r.social]
        .filter((v): v is number => typeof v === "number" && v > 0)
        .reduce((a, b) => a + b, 0) /
      Math.max(1, [r.academic, r.accommodation, r.faculty, r.infrastructure, r.placement, r.social]
        .filter((v): v is number => typeof v === "number" && v > 0).length)
      ) / 2  // scores are 0-10, convert to 0-5
    ))),
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=60&w=150&h=150",
    role: "Student",
  }));

  return <ReviewsTab reviews={reviews} />;
}
