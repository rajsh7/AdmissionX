import type { CutoffData } from "@/app/api/college/[slug]/route";

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

// ─── Row Component ────────────────────────────────────────────────────────────

function CutoffRow({
  cutoff,
  index,
}: {
  cutoff: CutoffData;
  index: number;
}) {
  const title = stripHtml(cutoff.title);
  const description = stripHtml(cutoff.description);

  return (
    <tr
      className={`border-b border-neutral-50 hover:bg-red-50/30 transition-colors ${
        index % 2 === 0 ? "bg-white" : "bg-neutral-50/40"
      }`}
    >
      {/* # */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-neutral-100 text-neutral-500 text-[11px] font-bold">
          {index + 1}
        </span>
      </td>

      {/* Stream */}
      <td className="px-4 py-3">
        {cutoff.stream_name ? (
          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-100 text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide">
            {cutoff.stream_name}
          </span>
        ) : (
          <span className="text-neutral-300 text-xs">—</span>
        )}
      </td>

      {/* Degree */}
      <td className="px-4 py-3">
        {cutoff.degree_name ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-100">
            {cutoff.degree_name}
          </span>
        ) : (
          <span className="text-neutral-300 text-xs">—</span>
        )}
      </td>

      {/* Course */}
      <td className="px-4 py-3">
        <span className="text-sm font-semibold text-neutral-800">
          {cutoff.course_name ?? "—"}
        </span>
      </td>

      {/* Title / Cut-off value */}
      <td className="px-4 py-3">
        {title ? (
          <span className="text-sm font-bold text-neutral-900">{title}</span>
        ) : (
          <span className="text-neutral-400 text-xs">—</span>
        )}
      </td>

      {/* Description */}
      <td className="px-4 py-3 max-w-xs">
        {description ? (
          <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">
            {description}
          </p>
        ) : (
          <span className="text-neutral-300 text-xs">—</span>
        )}
      </td>
    </tr>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyCutoffs() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-[28px] text-neutral-300">
          bar_chart_4_bars
        </span>
      </div>
      <p className="text-sm font-semibold text-neutral-500 mb-1">
        Cut-off data not available
      </p>
      <p className="text-xs text-neutral-400 max-w-xs">
        Cut-off details will be updated after admission rounds are announced.
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface CutOffTableProps {
  cutoffs: CutoffData[];
  collegeName: string;
}

export default function CutOffTable({ cutoffs, collegeName }: CutOffTableProps) {
  if (cutoffs.length === 0) {
    return (
      <section className="bg-white rounded-2xl border border-neutral-100 p-6">
        <Header count={0} />
        <EmptyCutoffs />
      </section>
    );
  }

  // Collect unique streams for the legend
  const uniqueStreams = Array.from(
    new Set(cutoffs.map((c) => c.stream_name).filter(Boolean))
  ) as string[];

  const streamColors: Record<string, string> = {};
  const palette = [
    "bg-red-50 text-red-700 border-red-100",
    "bg-blue-50 text-blue-700 border-blue-100",
    "bg-emerald-50 text-emerald-700 border-emerald-100",
    "bg-amber-50 text-amber-700 border-amber-100",
    "bg-purple-50 text-purple-700 border-purple-100",
    "bg-pink-50 text-pink-700 border-pink-100",
  ];
  uniqueStreams.forEach((s, i) => {
    streamColors[s] = palette[i % palette.length];
  });

  return (
    <section className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
      {/* ── Section header ── */}
      <div className="px-6 pt-6 pb-4 border-b border-neutral-100">
        <Header count={cutoffs.length} />

        {/* Disclaimer */}
        <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          <span
            className="material-symbols-outlined text-[16px] text-amber-500 flex-shrink-0 mt-0.5"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            warning
          </span>
          <p className="text-xs text-amber-700 leading-relaxed">
            Cut-off data is indicative and may vary by category (General / OBC / SC / ST).
            Always verify with the official college prospectus.
          </p>
        </div>
      </div>

      {/* ── Stream legend ── */}
      {uniqueStreams.length > 0 && (
        <div className="px-6 py-3 flex flex-wrap gap-2 bg-neutral-50 border-b border-neutral-100">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide self-center mr-1">
            Streams:
          </span>
          {uniqueStreams.map((s) => (
            <span
              key={s}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${streamColors[s]}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 flex-shrink-0" />
              {s}
            </span>
          ))}
        </div>
      )}

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-100">
              <th className="px-4 py-3 text-center text-[11px] font-bold text-neutral-400 uppercase tracking-wide w-10">
                #
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-bold text-neutral-400 uppercase tracking-wide">
                Stream
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-bold text-neutral-400 uppercase tracking-wide">
                Degree
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-bold text-neutral-400 uppercase tracking-wide">
                Course
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-bold text-neutral-400 uppercase tracking-wide">
                Cut-off
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-bold text-neutral-400 uppercase tracking-wide">
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            {cutoffs.map((cutoff, i) => (
              <CutoffRow key={cutoff.id} cutoff={cutoff} index={i} />
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Footer ── */}
      <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between gap-4">
        <p className="text-[11px] text-neutral-400 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[13px]">info</span>
          Showing {cutoffs.length} cut-off record{cutoffs.length !== 1 ? "s" : ""} for{" "}
          <span className="font-semibold text-neutral-600">{collegeName}</span>
        </p>
        <span className="text-[10px] text-neutral-300 font-semibold uppercase tracking-wide">
          Last updated by college
        </span>
      </div>
    </section>
  );
}

// ─── Reusable Header ──────────────────────────────────────────────────────────

function Header({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-1 h-5 bg-red-600 rounded-full block flex-shrink-0" />
      <span
        className="material-symbols-outlined text-[20px] text-red-500"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        bar_chart_4_bars
      </span>
      <h2 className="text-lg font-black text-neutral-900">Cut-off Data</h2>
      {count > 0 && (
        <span className="ml-auto text-xs font-semibold text-neutral-400 bg-neutral-100 px-2.5 py-1 rounded-full flex-shrink-0">
          {count} {count === 1 ? "record" : "records"}
        </span>
      )}
    </div>
  );
}
