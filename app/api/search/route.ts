import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

interface SuggestionRow {
  name: string;
  location: string | null;
  slug: string | null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const like = `%${q}%`;

  try {
    const conn = await pool.getConnection();

    let rows: SuggestionRow[] = [];

    try {
      // Primary: search by college name stored in users.firstname (old Laravel schema)
      const [primary] = (await conn.query(
        `SELECT DISTINCT
           u.firstname                    AS name,
           cp.registeredSortAddress       AS location,
           cp.slug                        AS slug
         FROM collegeprofile cp
         JOIN users u ON cp.users_id = u.id
         WHERE u.firstname LIKE ?
            OR u.firstname LIKE ?
         ORDER BY
           CASE WHEN u.firstname LIKE ? THEN 0 ELSE 1 END,
           u.firstname
         LIMIT 8`,
        [like, `${q}%`, `${q}%`],
      )) as [SuggestionRow[], unknown];

      rows = primary;
    } catch {
      // users table JOIN failed — fall back to slug-based search
    }

    // Fallback or supplement: search by slug if primary returned nothing
    if (rows.length === 0) {
      try {
        const slugLike = `%${q.toLowerCase().replace(/\s+/g, "-")}%`;

        const [bySlug] = (await conn.query(
          `SELECT DISTINCT
             cp.slug                        AS name,
             cp.registeredSortAddress       AS location,
             cp.slug                        AS slug
           FROM collegeprofile cp
           WHERE cp.slug LIKE ?
           ORDER BY cp.slug
           LIMIT 8`,
          [slugLike],
        )) as [SuggestionRow[], unknown];

        rows = bySlug;
      } catch {
        // slug fallback also failed — return empty
      }
    }

    conn.release();

    const suggestions = rows.map((r) => ({
      name: r.name
        ? r.name
            .split("-")
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ")
        : "College",
      location:
        (r.location ?? "India")
          .replace(/<[^>]+>/g, "")
          .trim()
          .slice(0, 60) || "India",
      slug: r.slug ?? "",
    }));

    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error("[search]", err);
    return NextResponse.json({ suggestions: [] });
  }
}
