import type { ScholarshipData } from "@/app/api/college/[slug]/route";

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

// ─── Scholarship Card ─────────────────────────────────────────────────────────

const CARD_ACCENT_COLORS = [
  {
    border: "border-red-100",
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    badge: "bg-red-50 text-red-700 border-red-200",
    stripe: "bg-red-600",
  },
  {
    border: "border-blue-100",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    stripe: "bg-blue-600",
  },
  {
    border: "border-emerald-100",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    stripe: "bg-emerald-600",
  },
  {
    border: "border-violet-100",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-500",
    badge: "bg-violet-50 text-violet-700 border-violet-200",
    stripe: "bg-violet-600",
  },
  {
    border: "border-amber-100",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    stripe: "bg-amber-600",
  },
  {
    border: "border-pink-100",
    iconBg: "bg-pink-50",
    iconColor: "text-pink-500",
    badge: "bg-pink-50 text-pink-700 border-pink-200",
    stripe: "bg-pink-600",
  },
];

function ScholarshipCard({
  scholarship,
  index,
}: {
  scholarship: ScholarshipData;
  index: number;
}) {
  const accent = CARD_ACCENT_COLORS[index % CARD_ACCENT_COLORS.length];
  const title = stripHtml(scholarship.title) || "Scholarship";
  const description = stripHtml(scholarship.description);

  // Try to detect keywords in the description for metadata badges
  const descLower = description.toLowerCase();
  const isNeedBased =
    descLower.includes("need") ||
    descLower.includes("income") ||
    descLower.includes("financial");
  const isMeritBased =
    descLower.includes("merit") ||
    descLower.includes("topper") ||
    descLower.includes("rank") ||
    descLower.includes("percentage") ||
    descLower.includes("%");
  const isSportsBased =
    descLower.includes("sport") ||
    descLower.includes("athlete") ||
    descLower.includes("ncc");
  const isMinority =
    descLower.includes("sc") ||
    descLower.includes("st") ||
    descLower.includes("obc") ||
    descLower.includes("minority");

  const detectedTags: string[] = [];
  if (isMeritBased) detectedTags.push("Merit-based");
  if (isNeedBased) detectedTags.push("Need-based");
  if (isSportsBased) detectedTags.push("Sports");
  if (isMinority) detectedTags.push("Reserved Category");

  return (
    <div
      className={`relative bg-white rounded-2xl border ${accent.border} hover:shadow-lg hover:shadow-black/5 transition-all duration-300 overflow-hidden group`}
    >
      {/* Left colour stripe */}
      <div
        className={`absolute left-0 inset-y-0 w-1 ${accent.stripe} rounded-l-2xl`}
      />

      <div className="p-5 pl-6">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-3">
          {/* Icon */}
          <div
            className={`w-10 h-10 rounded-xl ${accent.iconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${accent.iconColor}`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              school
            </span>
          </div>

          {/* Title + index */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
                #{String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <h3 className="text-sm font-bold text-neutral-900 leading-snug mt-0.5 group-hover:text-red-600 transition-colors">
              {title}
            </h3>
          </div>
        </div>

        {/* Auto-detected tags */}
        {detectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {detectedTags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${accent.badge}`}
              >
                <span className="material-symbols-outlined text-[10px]">
                  label
                </span>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="text-sm text-neutral-600 leading-relaxed line-clamp-4">
            {description}
          </p>
        )}

        {/* Footer CTA */}
        <div className="mt-4 pt-3 border-t border-neutral-50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <span
              className="material-symbols-outlined text-[13px] text-emerald-500"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
            College-offered scholarship
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 group-hover:gap-2 transition-all">
            Learn more
            <span className="material-symbols-outlined text-[14px]">
              arrow_forward
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Summary stats strip ──────────────────────────────────────────────────────

function SummaryStrip({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {[
        {
          icon: "school",
          label: "Total Scholarships",
          value: String(count),
          iconBg: "bg-red-50",
          iconColor: "text-red-500",
        },
        {
          icon: "how_to_reg",
          label: "Eligibility",
          value: "Merit & Need",
          iconBg: "bg-blue-50",
          iconColor: "text-blue-500",
        },
        {
          icon: "event",
          label: "Application",
          value: "During Admission",
          iconBg: "bg-emerald-50",
          iconColor: "text-emerald-500",
        },
      ].map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-3 bg-white rounded-xl border border-neutral-100 px-4 py-3"
        >
          <div
            className={`w-9 h-9 rounded-lg ${item.iconBg} flex items-center justify-center flex-shrink-0`}
          >
            <span
              className={`material-symbols-outlined text-[18px] ${item.iconColor}`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {item.icon}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wide leading-none">
              {item.label}
            </p>
            <p className="text-sm font-black text-neutral-800 leading-snug mt-0.5 truncate">
              {item.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── General eligibility tips ─────────────────────────────────────────────────

function EligibilityTips() {
  const tips = [
    {
      icon: "star",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
      title: "Academic Merit",
      desc: "Most scholarships require a minimum percentage (usually 60–80%) in qualifying exams.",
    },
    {
      icon: "family_restroom",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      title: "Family Income",
      desc: "Need-based scholarships consider annual family income, usually below ₹2–8 LPA.",
    },
    {
      icon: "assignment",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
      title: "Application Process",
      desc: "Apply along with admission form. Carry income certificate, mark-sheets, and ID proof.",
    },
    {
      icon: "schedule",
      iconBg: "bg-violet-50",
      iconColor: "text-violet-500",
      title: "Renewal Criteria",
      desc: "Scholarships may require annual renewal based on academic performance in the previous year.",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-neutral-50 to-white rounded-2xl border border-neutral-100 p-5">
      <h3 className="text-sm font-black text-neutral-700 mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-[16px] text-red-500">
          lightbulb
        </span>
        General Eligibility Guidelines
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tips.map((tip) => (
          <div key={tip.title} className="flex gap-3">
            <div
              className={`w-8 h-8 rounded-lg ${tip.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}
            >
              <span
                className={`material-symbols-outlined text-[15px] ${tip.iconColor}`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {tip.icon}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-800 mb-0.5">
                {tip.title}
              </p>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {tip.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ collegeName }: { collegeName: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-[28px] text-neutral-300">
          school
        </span>
      </div>
      <p className="text-sm font-bold text-neutral-700 mb-1">
        No scholarships listed
      </p>
      <p className="text-xs text-neutral-400 max-w-xs">
        {collegeName} has not published scholarship details yet. Contact the
        admissions office for information on financial aid.
      </p>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface ScholarshipSectionProps {
  scholarships: ScholarshipData[];
  collegeName: string;
}

export default function ScholarshipSection({
  scholarships,
  collegeName,
}: ScholarshipSectionProps) {
  return (
    <section className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
      {/* ── Section header ── */}
      <div className="px-6 pt-6 pb-4 border-b border-neutral-100 flex items-center justify-between gap-3">
        <h2 className="text-lg font-black text-neutral-900 flex items-center gap-2">
          <span className="w-1 h-5 bg-red-600 rounded-full block flex-shrink-0" />
          Scholarships & Financial Aid
        </h2>
        {scholarships.length > 0 && (
          <span className="text-xs font-semibold text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full flex-shrink-0">
            {scholarships.length}{" "}
            {scholarships.length === 1 ? "scholarship" : "scholarships"}
          </span>
        )}
      </div>

      <div className="p-6">
        {scholarships.length === 0 ? (
          <EmptyState collegeName={collegeName} />
        ) : (
          <>
            {/* Summary strip */}
            <SummaryStrip count={scholarships.length} />

            {/* Scholarship cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {scholarships.map((s, i) => (
                <ScholarshipCard key={s.id} scholarship={s} index={i} />
              ))}
            </div>

            {/* Eligibility tips */}
            <EligibilityTips />
          </>
        )}
      </div>

      {/* ── Footer CTA ── */}
      <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 border-t border-red-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2">
          <span
            className="material-symbols-outlined text-[16px] text-red-500 flex-shrink-0 mt-0.5"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            info
          </span>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Scholarship availability and amounts are subject to change each academic
            year. Verify details directly with the{" "}
            <span className="font-semibold text-neutral-800">
              {collegeName}
            </span>{" "}
            admissions office.
          </p>
        </div>
        <a
          href="/login/student"
          className="flex-shrink-0 inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-red-500/20 whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[14px]">
            edit_document
          </span>
          Apply for Scholarship
        </a>
      </div>
    </section>
  );
}
