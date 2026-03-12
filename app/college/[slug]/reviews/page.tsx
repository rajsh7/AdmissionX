import pool from "@/lib/db";
import { notFound } from "next/navigation";
import { RowDataPacket } from "mysql2";
import ReviewSection from "@/app/components/college/ReviewSection";
import type { ReviewData } from "@/app/api/college/[slug]/route";

// Cache the fully-rendered page for 5 minutes (same TTL as the layout).
export const revalidate = 300;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugToName(slug: string): string {
  return slug
    .replace(/-\d+$/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[college/[slug]/reviews/page.tsx]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CollegeBaseRow extends RowDataPacket {
  id: number;
  slug: string;
  college_name: string;
  rating: string | null;
  totalRatingUser: string | null;
}

interface ReviewRow extends RowDataPacket {
  id: number;
  title: string | null;
  review: string | null;
  academic: number | null;
  accommodation: number | null;
  faculty_rating: number | null;
  infrastructure: number | null;
  placement_rating: number | null;
  social: number | null;
  votes: number | null;
  created_at: string;
  reviewer_name: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CollegeReviewsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // ── Fetch college base + all reviews in parallel ──────────────────────────
  const [baseRows, reviewRows] = await Promise.all([
    safeQuery<CollegeBaseRow>(
      `SELECT
         cp.id,
         cp.slug,
         COALESCE(NULLIF(TRIM(u.firstname), ''), cp.slug) AS college_name,
         cp.rating,
         cp.totalRatingUser
       FROM collegeprofile cp
       JOIN users u ON u.id = cp.users_id
       WHERE cp.slug = ?
       LIMIT 1`,
      [slug],
    ),

    safeQuery<ReviewRow>(
      `SELECT
         cr.id,
         cr.title,
         cr.description        AS review,
         cr.academic,
         cr.accommodation,
         cr.faculty            AS faculty_rating,
         cr.infrastructure,
         cr.placement          AS placement_rating,
         cr.social,
         cr.votes,
         cr.created_at,
         COALESCE(NULLIF(TRIM(u.firstname), ''), 'Anonymous Student') AS reviewer_name
       FROM college_reviews cr
       JOIN collegeprofile cp ON cp.id = cr.collegeprofile_id AND cp.slug = ?
       LEFT JOIN users u ON u.id = cr.users_id
       WHERE cr.description IS NOT NULL AND cr.description != ''
       ORDER BY cr.created_at DESC
       LIMIT 100`,
      [slug],
    ),
  ]);

  const base = baseRows[0];
  if (!base) notFound();

  const collegeName =
    base.college_name && base.college_name !== slug
      ? base.college_name
      : slugToName(slug);

  const overallRating = parseFloat(String(base.rating)) || 0;

  // ── Rating distribution for meta display ─────────────────────────────────
  const totalReviews = reviewRows.length;
  const avgScore =
    totalReviews > 0
      ? (() => {
          const subRatings = reviewRows.flatMap((r) =>
            [
              r.academic,
              r.accommodation,
              r.faculty_rating,
              r.infrastructure,
              r.placement_rating,
              r.social,
            ]
              .filter(
                (v): v is number =>
                  v !== null && v !== undefined && Number(v) > 0,
              )
              .map(Number),
          );
          return subRatings.length > 0
            ? subRatings.reduce((a, b) => a + b, 0) / subRatings.length
            : 0;
        })()
      : 0;

  const displayRating = overallRating > 0 ? overallRating : avgScore;

  return (
    <div className="space-y-6">
      {/* ── Page meta banner ── */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Big score */}
          <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white border border-amber-200 shadow-sm flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-neutral-900 leading-none">
              {displayRating > 0 ? displayRating.toFixed(1) : "—"}
            </span>
            <span className="text-[9px] text-neutral-400 font-semibold mt-0.5">
              / 10
            </span>
          </div>

          <div>
            <h1 className="text-base font-black text-neutral-900 leading-snug">
              Student Reviews
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">{collegeName}</p>
            <div className="flex items-center gap-2 mt-1.5">
              {/* Stars (scale 0-10 → 0-5) */}
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => {
                  const filled = Math.round((displayRating / 10) * 5);
                  return (
                    <svg
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= filled ? "text-amber-400" : "text-neutral-200"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  );
                })}
              </div>
              <span className="text-xs font-semibold text-neutral-600">
                {totalReviews > 0
                  ? `Based on ${totalReviews} review${totalReviews > 1 ? "s" : ""}`
                  : "No reviews yet"}
              </span>
            </div>
          </div>
        </div>

        {/* Write review CTA */}
        <a
          href="/login/student"
          className="flex-shrink-0 inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-red-500/20 whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[17px]">
            rate_review
          </span>
          Write a Review
        </a>
      </div>

      {/* ── Review section with breakdown ── */}
      <ReviewSection
        reviews={reviewRows as ReviewData[]}
        collegeName={collegeName}
        overallRating={displayRating}
      />
    </div>
  );
}
