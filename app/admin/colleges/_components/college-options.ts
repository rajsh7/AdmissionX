import { getDb } from "@/lib/db";
import pool from "@/lib/db";

export interface CollegeOption { id: number; name: string; slug: string; }

/** Fetch all colleges with id, name, slug for filter dropdowns */
export async function fetchCollegeOptions(): Promise<CollegeOption[]> {
  try {
    // Try MongoDB first (getDb)
    const db = await getDb();
    const rows = await db.collection("collegeprofile")
      .aggregate([
        { $lookup: { from: "users", localField: "users_id", foreignField: "id", as: "user" } },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        { $project: { _id: 0, id: 1, slug: 1, name: { $ifNull: ["$user.firstname", "$slug"] } } },
        { $sort: { name: 1 } },
        { $limit: 2000 },
      ])
      .toArray();

    return rows.map(r => ({
      id:   Number(r.id)   || 0,
      name: String(r.name  || r.slug || "").trim(),
      slug: String(r.slug  || "").trim(),
    })).filter(r => r.id > 0);
  } catch {
    // Fallback to SQL shim
    try {
      const [rows] = await pool.query(
        "SELECT cp.id, cp.slug, COALESCE(u.firstname, cp.slug) AS name FROM collegeprofile cp JOIN users u ON u.id = cp.users_id ORDER BY u.firstname ASC LIMIT 2000"
      ) as [any[], unknown];
      return (rows as any[]).map(r => ({
        id:   Number(r.id),
        name: String(r.name || ""),
        slug: String(r.slug || ""),
      }));
    } catch {
      return [];
    }
  }
}
