import { PlacementData } from "@/app/api/college/[slug]/route";

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

function formatCTC(val: string | null): string {
  if (!val) return "—";
  const n = parseFloat(String(val));
  if (isNaN(n) || n === 0) return "—";
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

interface StatCardProps {
  icon: string;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  sublabel?: string;
}

function StatCard({ icon, iconColor, iconBg, label, value, sublabel }: StatCardProps) {
  return (
    <div className="flex items-start gap-4 bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm">
      <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <span
          className={`material-symbols-outlined text-[22px] ${iconColor}`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
      </div>
      <div>
        <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wide mb-1">
          {label}
        </p>
        <p className="text-xl font-black text-neutral-900 leading-none">
          {value}
        </p>
        {sublabel && (
          <p className="text-xs text-neutral-400 mt-1">{sublabel}</p>
        )}
      </div>
    </div>
  );
}

interface PlacementSectionProps {
  placement: PlacementData;
}

export default function PlacementSection({ placement }: PlacementSectionProps) {
  const {
    numberofrecruitingcompany,
    numberofplacementlastyear,
    ctchighest,
    ctclowest,
    ctcaverage,
    placementinfo,
  } = placement;

  const infoText = stripHtml(placementinfo);

  const hasStats =
    numberofrecruitingcompany ||
    numberofplacementlastyear ||
    ctchighest ||
    ctclowest ||
    ctcaverage;

  if (!hasStats && !infoText) return null;

  const stats: (StatCardProps & { show: boolean })[] = [
    {
      show: !!ctchighest && ctchighest !== "0",
      icon: "trending_up",
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
      label: "Highest CTC",
      value: formatCTC(ctchighest),
      sublabel: "Per annum",
    },
    {
      show: !!ctcaverage && ctcaverage !== "0",
      icon: "bar_chart",
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
      label: "Average CTC",
      value: formatCTC(ctcaverage),
      sublabel: "Per annum",
    },
    {
      show: !!ctclowest && ctclowest !== "0",
      icon: "trending_down",
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
      label: "Lowest CTC",
      value: formatCTC(ctclowest),
      sublabel: "Per annum",
    },
    {
      show: !!numberofrecruitingcompany && numberofrecruitingcompany !== "0",
      icon: "corporate_fare",
      iconColor: "text-violet-600",
      iconBg: "bg-violet-50",
      label: "Recruiting Companies",
      value: `${parseInt(String(numberofrecruitingcompany)).toLocaleString("en-IN")}+`,
      sublabel: "Top recruiters",
    },
    {
      show:
        !!numberofplacementlastyear && numberofplacementlastyear !== "0",
      icon: "how_to_reg",
      iconColor: "text-red-600",
      iconBg: "bg-red-50",
      label: "Placed Last Year",
      value: `${parseInt(String(numberofplacementlastyear)).toLocaleString("en-IN")}`,
      sublabel: "Students placed",
    },
  ];

  const visibleStats = stats.filter((s) => s.show);

  return (
    <section className="bg-white rounded-2xl border border-neutral-100 p-6">
      {/* Section heading */}
      <h2 className="text-lg font-black text-neutral-900 mb-6 flex items-center gap-2">
        <span className="w-1 h-5 bg-red-600 rounded-full block" />
        Placement Statistics
        <span className="ml-2 inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
          <span
            className="material-symbols-outlined text-[12px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            verified
          </span>
          Placement Data Available
        </span>
      </h2>

      {/* Stats grid */}
      {visibleStats.length > 0 && (
        <div
          className={`grid gap-4 mb-6 ${
            visibleStats.length === 1
              ? "grid-cols-1"
              : visibleStats.length === 2
              ? "grid-cols-1 sm:grid-cols-2"
              : visibleStats.length === 3
              ? "grid-cols-1 sm:grid-cols-3"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {visibleStats.map((stat) => (
            <StatCard
              key={stat.label}
              icon={stat.icon}
              iconColor={stat.iconColor}
              iconBg={stat.iconBg}
              label={stat.label}
              value={stat.value}
              sublabel={stat.sublabel}
            />
          ))}
        </div>
      )}

      {/* CTC Range visual bar (when both highest and lowest present) */}
      {ctchighest && ctclowest && ctcaverage && (
        <div className="bg-gradient-to-r from-neutral-50 to-neutral-100 rounded-xl p-4 mb-6 border border-neutral-100">
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-3">
            CTC Range
          </p>
          <div className="relative h-3 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 via-blue-500 to-emerald-500 rounded-full"
              style={{ width: "100%" }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-semibold text-neutral-500">
              Min: {formatCTC(ctclowest)}
            </span>
            <span className="text-xs font-bold text-blue-600">
              Avg: {formatCTC(ctcaverage)}
            </span>
            <span className="text-xs font-semibold text-neutral-500">
              Max: {formatCTC(ctchighest)}
            </span>
          </div>
        </div>
      )}

      {/* Placement info / description */}
      {infoText && (
        <div className="border-t border-neutral-100 pt-4">
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-red-500">
              info
            </span>
            Placement Overview
          </p>
          <p className="text-sm text-neutral-600 leading-relaxed line-clamp-6">
            {infoText}
          </p>
        </div>
      )}
    </section>
  );
}
