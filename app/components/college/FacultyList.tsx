import type { FacultyData } from "@/app/api/college/[slug]/route";
import Image from "next/image";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string | null): string {
  if (!name) return "F";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0).toUpperCase() +
    parts[parts.length - 1].charAt(0).toUpperCase()
  );
}

function getAvatarColor(name: string | null): string {
  const colors = [
    "bg-red-600",
    "bg-blue-600",
    "bg-emerald-600",
    "bg-violet-600",
    "bg-amber-600",
    "bg-pink-600",
    "bg-cyan-600",
    "bg-indigo-600",
  ];
  if (!name) return colors[0];
  const idx =
    name.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0) %
    colors.length;
  return colors[idx];
}

// ─── Faculty Card ─────────────────────────────────────────────────────────────

function FacultyCard({ faculty }: { faculty: FacultyData }) {
  const { name, designation, description, image, suffix, stream_name, gender } =
    faculty;

  const displayName = [suffix, name].filter(Boolean).join(" ") || "Faculty Member";
  const initials = getInitials(name);
  const avatarColor = getAvatarColor(name);

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 hover:border-red-200 hover:shadow-lg hover:shadow-red-500/5 transition-all duration-300 overflow-hidden group">
      {/* Photo area */}
      <div className="relative h-40 bg-gradient-to-br from-neutral-100 to-neutral-200 overflow-hidden flex items-center justify-center">
        {image ? (
          <>
            <Image
              src={image}
              alt={displayName}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 250px"
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
            />
            {/* subtle gradient at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </>
        ) : (
          <div
            className={`w-20 h-20 rounded-full ${avatarColor} text-white flex items-center justify-center text-2xl font-black shadow-lg`}
          >
            {initials}
          </div>
        )}

        {/* Gender badge */}
        {gender && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center gap-0.5 bg-white/90 backdrop-blur-sm text-neutral-600 text-[9px] font-bold px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[10px]">
                {gender.toLowerCase() === "female" ? "female" : "male"}
              </span>
              {gender}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-sm font-bold text-neutral-900 leading-snug mb-1 group-hover:text-red-600 transition-colors">
          {displayName}
        </h3>

        {designation && (
          <p className="text-xs font-semibold text-red-600 mb-2">{designation}</p>
        )}

        {stream_name && (
          <span className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide">
            <span className="material-symbols-outlined text-[11px]">school</span>
            {stream_name}
          </span>
        )}

        {description && !stream_name && (
          <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2 mt-1">
            {description.replace(/<[^>]+>/g, " ").trim()}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyFaculty() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-[28px] text-neutral-300">
          groups
        </span>
      </div>
      <p className="text-sm font-semibold text-neutral-500 mb-1">
        Faculty details not available
      </p>
      <p className="text-xs text-neutral-400">
        Contact the college directly for faculty information.
      </p>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface FacultyListProps {
  faculty: FacultyData[];
  collegeName: string;
}

export default function FacultyList({ faculty, collegeName }: FacultyListProps) {
  if (faculty.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <SectionHeading
          title={`Faculty at ${collegeName}`}
          count={0}
          icon="groups"
        />
        <EmptyFaculty />
      </div>
    );
  }

  // Group by stream / department
  const grouped: Record<string, FacultyData[]> = {};
  for (const f of faculty) {
    const key = f.stream_name ?? "General";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(f);
  }

  const hasMultipleDepts = Object.keys(grouped).length > 1;

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <SectionHeading
          title={`Faculty at ${collegeName}`}
          count={faculty.length}
          icon="groups"
        />

        {/* Summary chips */}
        <div className="flex flex-wrap gap-2 mt-4">
          {Object.entries(grouped).map(([dept, members]) => (
            <span
              key={dept}
              className="inline-flex items-center gap-1.5 bg-red-50 border border-red-100 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-xl"
            >
              <span className="material-symbols-outlined text-[13px]">
                school
              </span>
              {dept}
              <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-0.5">
                {members.length}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Faculty grid — grouped by department */}
      {hasMultipleDepts
        ? Object.entries(grouped).map(([dept, members]) => (
            <section key={dept}>
              <div className="flex items-center gap-2 mb-4 px-1">
                <span className="material-symbols-outlined text-[16px] text-red-500">
                  school
                </span>
                <h2 className="text-sm font-black text-neutral-700 uppercase tracking-wide">
                  {dept}
                </h2>
                <div className="flex-1 h-px bg-neutral-200" />
                <span className="text-xs text-neutral-400 font-semibold">
                  {members.length} member{members.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {members.map((f) => (
                  <FacultyCard key={f.id} faculty={f} />
                ))}
              </div>
            </section>
          ))
        : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {faculty.map((f) => (
              <FacultyCard key={f.id} faculty={f} />
            ))}
          </div>
        )}
    </div>
  );
}

// ─── Reusable heading ─────────────────────────────────────────────────────────

function SectionHeading({
  title,
  count,
  icon,
}: {
  title: string;
  count: number;
  icon: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-1 h-6 bg-red-600 rounded-full block flex-shrink-0" />
      <span
        className="material-symbols-outlined text-[20px] text-red-500"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {icon}
      </span>
      <h2 className="text-lg font-black text-neutral-900">{title}</h2>
      {count > 0 && (
        <span className="ml-auto text-xs font-semibold text-neutral-400 bg-neutral-100 px-2.5 py-1 rounded-full">
          {count} member{count > 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}
