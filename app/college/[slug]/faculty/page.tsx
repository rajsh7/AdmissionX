import pool from "@/lib/db";
import { notFound } from "next/navigation";
import { RowDataPacket } from "mysql2";
import Image from "next/image";

// Cache the fully-rendered page for 5 minutes (same TTL as the layout).
export const revalidate = 300;
import FacultyList from "@/app/components/college/FacultyList";
import type { FacultyData } from "@/app/api/college/[slug]/route";

// ─── Constants ────────────────────────────────────────────────────────────────

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";

function buildFacultyImageUrl(raw: string | null): string | null {
  if (!raw) return null;
  if (raw.startsWith("http")) return raw;
  return `${IMAGE_BASE}${raw}`;
}

function slugToName(slug: string): string {
  return slug
    .replace(/-\d+$/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CollegeRow extends RowDataPacket {
  id: number;
  slug: string;
  college_name: string;
}

interface FacultyRow extends RowDataPacket {
  id: number;
  name: string | null;
  designation: string | null;
  description: string | null;
  imagename: string | null;
  image_original: string | null;
  email: string | null;
  phone: string | null;
  gender: string | null;
  suffix: string | null;
  languageKnown: string | null;
  stream_name: string | null;
}

interface ManagementRow extends RowDataPacket {
  id: number;
  suffix: string | null;
  name: string | null;
  designation: string | null;
  gender: string | null;
  picture: string | null;
  about: string | null;
  emailaddress: string | null;
  phoneno: string | null;
}

// ─── Safe query helper ────────────────────────────────────────────────────────

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[college/[slug]/faculty/page.tsx]", err);
    return [];
  }
}

// ─── Management member card ───────────────────────────────────────────────────

function ManagementCard({ member }: { member: ManagementRow }) {
  const displayName =
    [member.suffix, member.name].filter(Boolean).join(" ") || "Management";
  const imageUrl = buildFacultyImageUrl(member.picture);
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex items-start gap-4 bg-white rounded-2xl border border-neutral-100 hover:border-red-100 hover:shadow-md hover:shadow-red-500/5 transition-all duration-300 p-4">
      {/* Avatar */}
      <div className="flex-shrink-0">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={displayName}
            width={56}
            height={56}
            className="w-14 h-14 rounded-xl object-cover object-top border border-neutral-100"
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-red-700 text-white flex items-center justify-center text-xl font-black shadow-sm">
            {initial}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-neutral-900 leading-snug mb-0.5">
          {displayName}
        </h3>
        {member.designation && (
          <p className="text-xs font-semibold text-red-600 mb-2">
            {member.designation}
          </p>
        )}
        {member.about && (
          <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">
            {member.about.replace(/<[^>]+>/g, " ").trim()}
          </p>
        )}
        <div className="flex flex-wrap gap-2 mt-2">
          {member.emailaddress && (
            <a
              href={`mailto:${member.emailaddress}`}
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span className="material-symbols-outlined text-[12px]">
                mail
              </span>
              {member.emailaddress}
            </a>
          )}
          {member.phoneno && (
            <a
              href={`tel:${member.phoneno}`}
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <span className="material-symbols-outlined text-[12px]">
                call
              </span>
              {member.phoneno}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function FacultyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // ── Fetch base info + faculty + management in one parallel batch ──────────
  // Faculty and management queries JOIN on cp.slug directly — no need to wait
  // for the base row's id before firing them.
  const [baseRows, facultyRows, managementRows] = await Promise.all([
    safeQuery<CollegeRow>(
      `SELECT
         cp.id,
         cp.slug,
         COALESCE(NULLIF(TRIM(u.firstname), ''), cp.slug) AS college_name
       FROM collegeprofile cp
       JOIN users u ON u.id = cp.users_id
       WHERE cp.slug = ?
       LIMIT 1`,
      [slug],
    ),

    safeQuery<FacultyRow>(
      `SELECT
         f.id,
         f.name,
         f.designation,
         f.description,
         f.imagename,
         f.image_original,
         f.email,
         f.phone,
         f.gender,
         f.suffix,
         f.languageKnown,
         dept.stream_name
       FROM faculty f
       JOIN collegeprofile cp ON cp.id = f.collegeprofile_id AND cp.slug = ?
       LEFT JOIN (
         SELECT fd.faculty_id, MAX(fa.name) AS stream_name
         FROM faculty_departments fd
         JOIN functionalarea fa ON fa.id = fd.functionalarea_id
         GROUP BY fd.faculty_id
       ) dept ON dept.faculty_id = f.id
       ORDER BY f.sortorder ASC, f.name ASC
       LIMIT 60`,
      [slug],
    ),

    safeQuery<ManagementRow>(
      `SELECT
         cmd.id,
         cmd.suffix,
         cmd.name,
         cmd.designation,
         cmd.gender,
         cmd.picture,
         cmd.about,
         cmd.emailaddress,
         cmd.phoneno
       FROM college_management_details cmd
       JOIN collegeprofile cp ON cp.id = cmd.collegeprofile_id AND cp.slug = ?
       ORDER BY cmd.id ASC
       LIMIT 10`,
      [slug],
    ),
  ]);

  const base = baseRows[0];
  if (!base) notFound();

  const collegeName =
    base.college_name && base.college_name !== slug
      ? base.college_name
      : slugToName(slug);

  // ── Normalise faculty rows → FacultyData ──────────────────────────────────
  const faculty: FacultyData[] = facultyRows.map((f) => ({
    id: f.id,
    name: f.name,
    designation: f.designation,
    description: f.description,
    image:
      buildFacultyImageUrl(f.imagename) ??
      buildFacultyImageUrl(f.image_original),
    email: f.email,
    phone: f.phone,
    gender: f.gender,
    suffix: f.suffix,
    languageKnown: f.languageKnown,
    stream_name: f.stream_name,
  }));

  const hasManagement = managementRows.length > 0;

  return (
    <div className="space-y-8">
      {/* ── Management / Leadership section ── */}
      {hasManagement && (
        <section>
          {/* Section heading */}
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1 h-6 bg-red-600 rounded-full block flex-shrink-0" />
            <span
              className="material-symbols-outlined text-[20px] text-red-500"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              manage_accounts
            </span>
            <h2 className="text-lg font-black text-neutral-900">
              Leadership & Management
            </h2>
            <span className="ml-auto text-xs font-semibold text-neutral-400 bg-neutral-100 px-2.5 py-1 rounded-full">
              {managementRows.length}{" "}
              {managementRows.length === 1 ? "member" : "members"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {managementRows.map((m) => (
              <ManagementCard key={m.id} member={m} />
            ))}
          </div>
        </section>
      )}

      {/* ── Faculty section ── */}
      <section>
        <FacultyList faculty={faculty} collegeName={collegeName} />
      </section>

      {/* ── Empty state when neither management nor faculty ── */}
      {faculty.length === 0 && !hasManagement && (
        <div className="bg-white rounded-2xl border border-neutral-100 p-16 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-neutral-100 flex items-center justify-center mb-5">
            <span className="material-symbols-outlined text-[36px] text-neutral-300">
              groups
            </span>
          </div>
          <h3 className="text-base font-black text-neutral-700 mb-2">
            Faculty information not available
          </h3>
          <p className="text-sm text-neutral-400 max-w-sm leading-relaxed">
            {collegeName} has not published faculty details yet. Please contact
            the college directly for information about the teaching staff.
          </p>
          <a
            href={`/college/${slug}`}
            className="mt-6 inline-flex items-center gap-2 bg-neutral-900 hover:bg-red-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">
              arrow_back
            </span>
            Back to Overview
          </a>
        </div>
      )}

      {/* ── CTA strip ── */}
      {(faculty.length > 0 || hasManagement) && (
        <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-black text-base mb-1">
              Interested in joining {collegeName}?
            </p>
            <p className="text-neutral-400 text-sm">
              Apply now and connect with the faculty directly after enrollment.
            </p>
          </div>
          <a
            href={`/apply/${slug}`}
            className="flex-shrink-0 inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors shadow-lg shadow-red-600/20 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[17px]">
              edit_document
            </span>
            Apply Now
          </a>
        </div>
      )}
    </div>
  );
}
