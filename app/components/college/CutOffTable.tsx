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
      className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
        index % 2 === 0 ? "bg-white/5" : "bg-transparent"
      }`}
    >
      {/* # */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/5 text-neutral-400 text-[11px] font-bold">
          {index + 1}
        </span>
      </td>

      {/* Stream */}
      <td className="px-4 py-3">
        {cutoff.stream_name ? (
          <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-300 border border-red-500/20 text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide">
            {cutoff.stream_name}
          </span>
        ) : (
          <span className="text-neutral-300 text-xs">—</span>
        )}
      </td>

      {/* Degree */}
      <td className="px-4 py-3">
        {cutoff.degree_name ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 text-[11px] font-semibold border border-blue-500/20">
            {cutoff.degree_name}
          </span>
        ) : (
          <span className="text-neutral-300 text-xs">—</span>
        )}
      </td>

      {/* Course */}
      <td className="px-4 py-3">
        <span className="text-sm font-semibold text-white">
          {cutoff.course_name ?? "—"}
        </span>
      </td>

      {/* Title / Cut-off value */}
      <td className="px-4 py-3">
        {title ? (
          <span className="text-sm font-bold text-white">{title}</span>
        ) : (
          <span className="text-neutral-500 text-xs">—</span>
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
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-[28px] text-neutral-500">
          bar_chart_4_bars
        </span>
      </div>
      <p className="text-sm font-semibold text-neutral-400 mb-1">
        Cut-off data not available
      </p>
      <p className="text-xs text-neutral-500 max-w-xs">
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
      <section className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 scroll-mt-24" id="cutoffs">
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
    "bg-red-500/10 text-red-300 border-red-500/20",
    "bg-blue-500/10 text-blue-300 border-blue-500/20",
    "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    "bg-amber-500/10 text-amber-300 border-amber-500/20",
    "bg-purple-500/10 text-purple-300 border-purple-500/20",
    "bg-pink-500/10 text-pink-300 border-pink-500/20",
  ];
  uniqueStreams.forEach((s, i) => {
    streamColors[s] = palette[i % palette.length];
  });

  return (
    <section className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden scroll-mt-24" id="cutoffs">
      {/* ── Section header ── */}
      <div className="px-6 pt-6 pb-4 border-b border-white/10">
        <Header count={cutoffs.length} />

        {/* Disclaimer */}
        <div className="mt-3 flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
          <span
            className="material-symbols-outlined text-[16px] text-amber-400 flex-shrink-0 mt-0.5"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            warning
          </span>
          <p className="text-xs text-amber-200 leading-relaxed">
            Cut-off data is indicative and may vary by category (General / OBC / SC / ST).
            Always verify with the official college prospectus.
          </p>
        </div>
      </div>

      {/* ── Stream legend ── */}
      {uniqueStreams.length > 0 && (
        <div className="px-6 py-3 flex flex-wrap gap-2 bg-white/5 border-b border-white/10">
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
            <tr className="bg-white/5 border-b border-white/10">
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
      <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex items-center justify-between gap-4">
        <p className="text-[11px] text-neutral-400 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[13px]">info</span>
          Showing {cutoffs.length} cut-off record{cutoffs.length !== 1 ? "s" : ""} for{" "}
          <span className="font-semibold text-neutral-300">{collegeName}</span>
        </p>
        <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wide">
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
      <span className="w-1 h-5 bg-red-500 rounded-full block flex-shrink-0" />
      <span
        className="material-symbols-outlined text-[20px] text-red-400"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        bar_chart_4_bars
      </span>
      <h2 className="text-lg font-black text-white">Cut-off Data</h2>
      {count > 0 && (
        <span className="ml-auto text-xs font-semibold text-neutral-300 bg-white/5 px-2.5 py-1 rounded-full flex-shrink-0">
          {count} {count === 1 ? "record" : "records"}
        </span>
      )}
    </div>
  );
}
