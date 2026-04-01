import type { ReviewData } from "@/app/api/college/[slug]/route";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function computeReviewRating(review: ReviewData): number {
  const vals = [
    review.academic,
    review.accommodation,
    review.faculty_rating,
    review.infrastructure,
    review.placement_rating,
    review.social,
  ].filter((v): v is number => v !== null && v !== undefined && v > 0);
  if (vals.length === 0) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
    });
  } catch {
    return "";
  }
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0).toUpperCase() +
    parts[parts.length - 1].charAt(0).toUpperCase()
  );
}

function getAvatarColor(name: string): string {
  const palette = [
    "bg-red-600",
    "bg-blue-600",
    "bg-emerald-600",
    "bg-violet-600",
    "bg-amber-600",
    "bg-pink-600",
    "bg-cyan-600",
    "bg-indigo-600",
  ];
  const idx =
    name.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0) %
    palette.length;
  return palette[idx];
}

// ─── Star row ─────────────────────────────────────────────────────────────────

function StarRow({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "lg";
}) {
  const filled = Math.min(5, Math.round(rating));
  const px = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`${px} ${s <= filled ? "text-amber-400" : "text-neutral-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// ─── Rating bar ───────────────────────────────────────────────────────────────

function RatingBar({
  label,
  value,
  max = 10,
}: {
  label: string;
  value: number | null;
  max?: number;
}) {
  const v = value ?? 0;
  const pct = Math.min(100, (v / max) * 100);
  const displayVal = v > 0 ? v.toFixed(1) : "—";

  const barColor =
    pct >= 70
      ? "bg-emerald-500"
      : pct >= 45
      ? "bg-amber-400"
      : "bg-red-400";

  return (
    <div className="flex items-center gap-3">
      <span className="w-28 text-xs font-semibold text-neutral-500 flex-shrink-0 capitalize">
        {label}
      </span>
      <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs font-bold text-neutral-700 flex-shrink-0">
        {displayVal}
      </span>
    </div>
  );
}

// ─── Overall score circle ─────────────────────────────────────────────────────

function ScoreCircle({
  rating,
  count,
}: {
  rating: number;
  count: number;
}) {
  const pct = (rating / 10) * 100;
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
          <circle
            cx="36"
            cy="36"
            r={r}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="7"
          />
          <circle
            cx="36"
            cy="36"
            r={r}
            fill="none"
            stroke="#ef4444"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black text-neutral-900 leading-none">
            {rating > 0 ? rating.toFixed(1) : "—"}
          </span>
          <span className="text-[9px] text-neutral-400 font-semibold">/ 10</span>
        </div>
      </div>
      <p className="text-xs text-neutral-500 font-semibold text-center">
        {count > 0 ? `${count} review${count > 1 ? "s" : ""}` : "No reviews yet"}
      </p>
    </div>
  );
}

// ─── Individual review card ───────────────────────────────────────────────────

function ReviewCard({ review }: { review: ReviewData }) {
  const overallRating = computeReviewRating(review);
  const initials = getInitials(review.reviewer_name || "S");
  const avatarBg = getAvatarColor(review.reviewer_name || "Student");
  const reviewText = stripHtml(review.review);
  const date = formatDate(review.created_at);

  const hasSubRatings =
    review.academic ||
    review.accommodation ||
    review.faculty_rating ||
    review.infrastructure ||
    review.placement_rating ||
    review.social;

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 hover:border-red-100 hover:shadow-md hover:shadow-red-500/5 transition-all duration-300 p-5">
      {/* Reviewer row */}
      <div className="flex items-start gap-3 mb-4">
        {/* Avatar */}
        <div
          className={`w-10 h-10 rounded-full ${avatarBg} text-white flex items-center justify-center text-sm font-black flex-shrink-0 shadow-sm`}
        >
          {initials}
        </div>

        {/* Name + date */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-sm font-bold text-neutral-900 truncate">
              {review.reviewer_name || "Anonymous Student"}
            </span>
            {date && (
              <span className="text-[11px] text-neutral-400 flex-shrink-0">
                {date}
              </span>
            )}
          </div>

          {/* Stars + score */}
          <div className="flex items-center gap-2 mt-0.5">
            <StarRow rating={Math.min(5, overallRating / 2)} />
            {overallRating > 0 && (
              <span className="text-xs font-bold text-neutral-600">
                {overallRating.toFixed(1)}
                <span className="text-neutral-400 font-normal">/10</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Title */}
      {review.title && (
        <p className="text-sm font-bold text-neutral-800 mb-2 line-clamp-1">
          {review.title}
        </p>
      )}

      {/* Review text */}
      {reviewText && (
        <p className="text-sm text-neutral-600 leading-relaxed line-clamp-4 mb-4">
          {reviewText}
        </p>
      )}

      {/* Sub-rating pills */}
      {hasSubRatings && (
        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-neutral-50">
          {[
            { label: "Academic",    value: review.academic },
            { label: "Faculty",     value: review.faculty_rating },
            { label: "Placement",   value: review.placement_rating },
            { label: "Infra",       value: review.infrastructure },
            { label: "Social",      value: review.social },
            { label: "Hostel",      value: review.accommodation },
          ]
            .filter((item) => item.value !== null && item.value !== undefined && Number(item.value) > 0)
            .map((item) => {
              const v = Number(item.value);
              const color =
                v >= 7
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : v >= 4
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-red-50 text-red-700 border-red-200";
              return (
                <span
                  key={item.label}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${color}`}
                >
                  {item.label}
                  <span className="opacity-75">{v.toFixed(1)}</span>
                </span>
              );
            })}
        </div>
      )}

      {/* Votes */}
      {review.votes !== null && review.votes !== undefined && Number(review.votes) > 0 && (
        <div className="mt-3 flex items-center gap-1 text-[11px] text-neutral-400">
          <span className="material-symbols-outlined text-[13px]">thumb_up</span>
          {review.votes} found helpful
        </div>
      )}
    </div>
  );
}

// ─── Rating breakdown panel ───────────────────────────────────────────────────

function RatingBreakdown({
  reviews,
  overallRating,
}: {
  reviews: ReviewData[];
  overallRating: number;
}) {
  const count = reviews.length;
  if (count === 0) return null;

  const avg = (key: keyof ReviewData) => {
    const vals = reviews
      .map((r) => r[key])
      .filter((v): v is number => v !== null && v !== undefined && Number(v) > 0)
      .map(Number);
    if (vals.length === 0) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };

  const categories: { label: string; key: keyof ReviewData }[] = [
    { label: "Academic",        key: "academic" },
    { label: "Faculty",         key: "faculty_rating" },
    { label: "Placement",       key: "placement_rating" },
    { label: "Infrastructure",  key: "infrastructure" },
    { label: "Social Life",     key: "social" },
    { label: "Accommodation",   key: "accommodation" },
  ];

  const ratingDist = [5, 4, 3, 2, 1].map((star) => {
    const threshold = (star / 5) * 10;
    const lower = ((star - 1) / 5) * 10;
    const n = reviews.filter((r) => {
      const v = computeReviewRating(r);
      return v >= lower && v < threshold + (star === 5 ? 0.01 : 0);
    }).length;
    return { star, count: n, pct: count > 0 ? (n / count) * 100 : 0 };
  });

  return (
    <div className="bg-gradient-to-br from-neutral-50 to-white rounded-2xl border border-neutral-100 p-6 space-y-5">
      <h3 className="text-sm font-black text-neutral-700 uppercase tracking-wide flex items-center gap-2">
        <span className="w-1 h-4 bg-red-600 rounded-full block" />
        Ratings Overview
      </h3>

      {/* Score + distribution */}
      <div className="flex items-start gap-6">
        <ScoreCircle rating={overallRating} count={count} />

        {/* Star distribution */}
        <div className="flex-1 space-y-1.5">
          {ratingDist.map(({ star, count: n, pct }) => (
            <div key={star} className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-neutral-500 w-4 flex-shrink-0">
                {star}
              </span>
              <svg className="w-3 h-3 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-[10px] text-neutral-400 w-6 text-right flex-shrink-0">
                {n}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Category breakdown */}
      <div className="space-y-2.5 pt-2 border-t border-neutral-100">
        {categories.map(({ label, key }) => {
          const val = avg(key);
          if (val === null) return null;
          return <RatingBar key={label} label={label} value={val} max={10} />;
        })}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface ReviewSectionProps {
  reviews: ReviewData[];
  collegeName: string;
  overallRating?: number;
}

export default function ReviewSection({
  reviews,
  collegeName,
  overallRating = 0,
}: ReviewSectionProps) {
  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-100 p-12 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[28px] text-neutral-300">
            star
          </span>
        </div>
        <p className="text-sm font-bold text-neutral-700 mb-1">No reviews yet</p>
        <p className="text-xs text-neutral-400">
          Be the first to review {collegeName}.
        </p>
      </div>
    );
  }

  // Compute overall avg from reviews if not provided
  const computedOverall =
    overallRating > 0
      ? overallRating
      : (() => {
          const ratings = reviews
            .map(computeReviewRating)
            .filter((v) => v > 0);
          return ratings.length > 0
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
            : 0;
        })();

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex items-center gap-3">
        <span className="w-1 h-6 bg-red-600 rounded-full block" />
        <h1 className="text-xl font-black text-neutral-900">
          Student Reviews
        </h1>
        <span className="ml-auto text-xs font-semibold text-neutral-400 bg-neutral-100 px-3 py-1 rounded-full">
          {reviews.length} review{reviews.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Rating breakdown sidebar-style card */}
      <RatingBreakdown reviews={reviews} overallRating={computedOverall} />

      {/* Review cards grid */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-neutral-800 mb-0.5">
            Studied or studying at {collegeName}?
          </p>
          <p className="text-xs text-neutral-500">
            Share your experience to help future students make informed decisions.
          </p>
        </div>
        <a
          href="/login/student"
          className="flex-shrink-0 inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-red-500/20 whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[16px]">edit</span>
          Write a Review
        </a>
      </div>
    </div>
  );
}




