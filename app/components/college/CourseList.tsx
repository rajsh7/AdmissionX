import { CourseData } from "@/app/api/college/[slug]/route";

// --- Helpers ------------------------------------------------------------------

function formatFees(fees: string | null): string {
  if (!fees) return "—";
  const n = parseInt(fees);
  if (isNaN(n) || n === 0) return "—";
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L / yr`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K / yr`;
  return `₹${n} / yr`;
}

function EligibilityBadge({ marks }: { marks: string | null }) {
  if (!marks) return null;
  const n = parseInt(marks);
  if (isNaN(n) || n === 0) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
      {n}% min
    </span>
  );
}

// --- Main Component -----------------------------------------------------------

interface CourseListProps {
  courses: CourseData[];
  collegeName: string;
}

export default function CourseList({ courses, collegeName }: CourseListProps) {
  if (courses.length === 0) {
    return (
      <section className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-12 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[28px] text-neutral-500">
            school
          </span>
        </div>
        <p className="text-sm font-bold text-white mb-1">
          No courses listed yet
        </p>
        <p className="text-xs text-neutral-400">
          Course details for {collegeName} will be updated soon.
        </p>
      </section>
    );
  }

  // Group courses by stream
  const coursesByStream: Record<string, CourseData[]> = {};
  for (const course of courses) {
    const key = course.stream_name ?? "Other";
    if (!coursesByStream[key]) coursesByStream[key] = [];
    coursesByStream[key].push(course);
  }

  const streamEntries = Object.entries(coursesByStream);

  // Stream colour palette (cycles if more than palette length)
  const streamColors = [
    { dot: "bg-red-500",    badge: "bg-red-500/10 text-red-300 border-red-500/20" },
    { dot: "bg-blue-500",   badge: "bg-blue-500/10 text-blue-300 border-blue-500/20" },
    { dot: "bg-emerald-500",badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" },
    { dot: "bg-amber-500",  badge: "bg-amber-500/10 text-amber-300 border-amber-500/20" },
    { dot: "bg-purple-500", badge: "bg-purple-500/10 text-purple-300 border-purple-500/20" },
    { dot: "bg-pink-500",   badge: "bg-pink-500/10 text-pink-300 border-pink-500/20" },
  ];

  return (
    <section className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-white/10 flex items-center justify-between gap-3">
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          <span className="w-1 h-5 bg-red-500 rounded-full block flex-shrink-0" />
          Courses Offered
        </h2>
        <span className="text-xs font-semibold text-neutral-300 bg-white/5 px-3 py-1 rounded-full flex-shrink-0">
          {courses.length} {courses.length === 1 ? "course" : "courses"}
        </span>
      </div>

      {/* Stream tabs summary */}
      <div className="px-6 py-3 flex flex-wrap gap-2 border-b border-white/5">
        {streamEntries.map(([streamName, cs], idx) => {
          const color = streamColors[idx % streamColors.length];
          return (
            <a
              key={streamName}
              href={`#stream-${streamName.toLowerCase().replace(/\s+/g, "-")}`}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-opacity hover:opacity-80 ${color.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${color.dot}`} />
              {streamName}
              <span className="opacity-60">({cs.length})</span>
            </a>
          );
        })}
      </div>

      {/* Stream sections */}
      <div className="divide-y divide-white/5">
        {streamEntries.map(([streamName, cs], idx) => {
          const color = streamColors[idx % streamColors.length];
          return (
            <div
              key={streamName}
              id={`stream-${streamName.toLowerCase().replace(/\s+/g, "-")}`}
              className="px-6 py-5"
            >
              {/* Stream heading */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color.dot}`} />
                <h3 className="text-sm font-black text-neutral-300 uppercase tracking-wider">
                  {streamName}
                </h3>
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-[11px] font-semibold text-neutral-400">
                  {cs.length} {cs.length === 1 ? "course" : "courses"}
                </span>
              </div>

              {/* Course table — scrollable on mobile */}
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-sm min-w-[560px]">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="text-left px-4 py-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wide">
                        Course
                      </th>
                      <th className="text-left px-4 py-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wide">
                        Degree
                      </th>
                      <th className="text-left px-4 py-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wide">
                        Duration
                      </th>
                      <th className="text-left px-4 py-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wide">
                        Fees / yr
                      </th>
                      <th className="text-left px-4 py-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wide">
                        Seats
                      </th>
                      <th className="text-left px-4 py-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wide">
                        Eligibility
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cs.map((course, i) => (
                      <tr
                        key={course.id}
                        className={`transition-colors hover:bg-red-50/30 ${
                          i < cs.length - 1 ? "border-b border-neutral-50" : ""
                        }`}
                      >
                        {/* Course name */}
                        <td className="px-4 py-3">
                          <span className="font-semibold text-white text-sm">
                            {course.course_name ?? "—"}
                          </span>
                        </td>

                        {/* Degree */}
                        <td className="px-4 py-3">
                          {course.degree_name ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/5 text-neutral-300 text-xs font-semibold">
                              {course.degree_name}
                            </span>
                          ) : (
                            <span className="text-neutral-500 text-xs">—</span>
                          )}
                        </td>

                        {/* Duration */}
                        <td className="px-4 py-3 text-neutral-400 text-sm">
                          {course.courseduration
                            ? `${course.courseduration} yr${parseFloat(course.courseduration) !== 1 ? "s" : ""}`
                            : "—"}
                        </td>

                        {/* Fees */}
                        <td className="px-4 py-3">
                          <span className="font-bold text-white text-sm">
                            {formatFees(course.fees)}
                          </span>
                        </td>

                        {/* Seats */}
                        <td className="px-4 py-3">
                          {course.seats ? (
                            <span className="inline-flex items-center gap-1 text-sm font-semibold text-neutral-300">
                              <span className="material-symbols-outlined text-[13px] text-neutral-500">
                                chair
                              </span>
                              {course.seats}
                            </span>
                          ) : (
                            <span className="text-neutral-500 text-xs">—</span>
                          )}
                        </td>

                        {/* Eligibility */}
                        <td className="px-4 py-3">
                          <EligibilityBadge marks={course.twelvemarks} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex items-center gap-2">
        <span className="material-symbols-outlined text-[15px] text-neutral-500">
          info
        </span>
        <p className="text-[11px] text-neutral-500">
          Fees and seats are indicative. Please contact the college for the latest information.
        </p>
      </div>
    </section>
  );
}




