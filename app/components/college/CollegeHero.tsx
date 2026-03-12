import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CollegeHeroData {
  id: number;
  slug: string;
  college_name: string;
  image: string;
  description: string | null;
  estyear: string | null;
  website: string | null;
  collegecode: string | null;
  contactpersonname: string | null;
  contactpersonemail: string | null;
  contactpersonnumber: string | null;
  rating: number;
  totalRatingUser: number;
  verified: number;
  registeredSortAddress: string | null;
  registeredFullAddress: string | null;
  campusSortAddress: string | null;
  campusFullAddress: string | null;
  mediumOfInstruction: string | null;
  studyForm: string | null;
  admissionStart: string | null;
  admissionEnd: string | null;
  totalStudent: string | null;
  universityType: string | null;
  ranking: string | null;
  isTopUniversity: number;
  topUniversityRank: string | null;
  facebookurl: string | null;
  twitterurl: string | null;
  CCTVSurveillance: number;
  ACCampus: number;
  city_name: string | null;
  college_type_name: string | null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRating({ rating, count }: { rating: number; count: number }) {
  const filled = Math.min(5, Math.round(rating));
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <svg
            key={s}
            className={`w-4 h-4 ${s <= filled ? "text-amber-400" : "text-white/20"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-sm font-bold text-white">
        {rating > 0 ? rating.toFixed(1) : "N/A"}
      </span>
      {count > 0 && (
        <span className="text-xs text-white/60">({count} reviews)</span>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CollegeHero({ college }: { college: CollegeHeroData }) {
  const {
    slug,
    college_name,
    image,
    rating,
    totalRatingUser,
    verified,
    isTopUniversity,
    universityType,
    topUniversityRank,
    ranking,
    estyear,
    totalStudent,
    mediumOfInstruction,
    website,
    city_name,
    registeredSortAddress,
    campusSortAddress,
  } = college;

  const location = registeredSortAddress || campusSortAddress || city_name || "India";
  const displayRank = topUniversityRank ?? ranking;

  const isGovt =
    universityType
      ? universityType.toLowerCase().includes("govt") ||
        universityType.toLowerCase().includes("government") ||
        universityType.toLowerCase().includes("public")
      : false;

  const quickStats: { icon: string; label: string; value: string }[] = [
    ...(displayRank
      ? [{ icon: "emoji_events", label: "Rank", value: `#${displayRank}` }]
      : []),
    ...(estyear
      ? [{ icon: "calendar_month", label: "Established", value: estyear }]
      : []),
    ...(totalStudent
      ? [
          {
            icon: "groups",
            label: "Students",
            value: `${parseInt(String(totalStudent)).toLocaleString("en-IN")}+`,
          },
        ]
      : []),
    ...(universityType
      ? [{ icon: "account_balance", label: "Type", value: universityType }]
      : []),
    ...(mediumOfInstruction
      ? [{ icon: "translate", label: "Medium", value: mediumOfInstruction }]
      : []),
  ];

  return (
    <div>
      {/* ── Hero Banner ── */}
      <div className="relative h-64 sm:h-80 lg:h-[380px] overflow-hidden bg-neutral-900">
        {/* Background image */}
        <img
          src={image}
          alt={college_name}
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          onError={undefined}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900/60 to-transparent" />

        {/* Breadcrumb */}
        <div className="absolute top-20 left-0 right-0 z-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <nav className="flex items-center gap-2 text-xs text-neutral-400" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span className="text-neutral-600">›</span>
              <Link href="/search" className="hover:text-white transition-colors">
                Colleges
              </Link>
              <span className="text-neutral-600">›</span>
              <span className="text-neutral-300 truncate max-w-[240px]">
                {college_name}
              </span>
            </nav>
          </div>
        </div>

        {/* College identity block (bottom of banner) */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-5">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {verified ? (
                <span className="inline-flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Verified
                </span>
              ) : null}

              {isTopUniversity ? (
                <span className="inline-flex items-center gap-1 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                  <span
                    className="material-symbols-outlined text-[11px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    workspace_premium
                  </span>
                  Top University
                </span>
              ) : null}

              {universityType ? (
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide border ${
                    isGovt
                      ? "bg-blue-500/20 border-blue-500/30 text-blue-300"
                      : "bg-purple-500/20 border-purple-500/30 text-purple-300"
                  }`}
                >
                  <span className="material-symbols-outlined text-[11px]">
                    account_balance
                  </span>
                  {isGovt ? "Government" : "Private"}
                </span>
              ) : null}

              {displayRank ? (
                <span className="inline-flex items-center gap-1 bg-red-600/80 border border-red-500/40 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                  <span className="material-symbols-outlined text-[11px]">
                    emoji_events
                  </span>
                  Rank #{displayRank}
                </span>
              ) : null}
            </div>

            {/* College Name */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-3 drop-shadow-lg">
              {college_name}
            </h1>

            {/* Location + Rating row */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5 text-neutral-300 text-sm">
                <span className="material-symbols-outlined text-[16px] text-red-400">
                  location_on
                </span>
                <span>{location}</span>
              </div>

              <StarRating rating={rating} count={totalRatingUser} />

              {website && (
                <a
                  href={website.startsWith("http") ? website : `https://${website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-white/70 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    open_in_new
                  </span>
                  {website.replace(/^https?:\/\//, "").replace(/\/$/, "").slice(0, 32)}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Stats Bar ── */}
      {quickStats.length > 0 && (
        <div className="bg-white border-b border-neutral-100 shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex items-center gap-0 overflow-x-auto py-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {quickStats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`flex items-center gap-2 flex-shrink-0 px-5 py-1 ${
                    i > 0 ? "border-l border-neutral-100" : ""
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px] text-red-500 flex-shrink-0">
                    {stat.icon}
                  </span>
                  <div>
                    <p className="text-[10px] text-neutral-400 leading-none uppercase tracking-wide font-semibold">
                      {stat.label}
                    </p>
                    <p className="text-sm font-bold text-neutral-800 leading-snug mt-0.5">
                      {stat.value}
                    </p>
                  </div>
                </div>
              ))}

              {/* Apply Now CTA on the right */}
              <div className="ml-auto flex-shrink-0 pl-5 border-l border-neutral-100">
                <a
                  href={`/apply/${slug}`}
                  className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm shadow-red-500/20"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    edit_document
                  </span>
                  Apply Now
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
