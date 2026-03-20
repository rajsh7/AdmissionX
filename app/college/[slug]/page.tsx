import pool from "@/lib/db";
import { notFound } from "next/navigation";
import { RowDataPacket } from "mysql2";

// Enforce strictly dynamic rendering to prevent stale data conflicts
export const dynamic = "force-dynamic";
import CourseList from "@/app/components/college/CourseList";
import PlacementSection from "@/app/components/college/PlacementSection";
import GallerySection from "@/app/components/college/GallerySection";
import CutOffTable from "@/app/components/college/CutOffTable";
import ScholarshipSection from "@/app/components/college/ScholarshipSection";
import type {
  CourseData,
  PlacementData,
  GalleryData,
  CutoffData,
  ScholarshipData,
} from "@/app/api/college/[slug]/route";

// ─── Constants ────────────────────────────────────────────────────────────────

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
const DEFAULT_BANNER =
  "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1200";

function buildImageUrl(raw: string | null): string {
  if (!raw) return DEFAULT_BANNER;
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

async function safeQuery<T extends RowDataPacket>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[college/[slug]/page.tsx]", err);
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CollegeRow extends RowDataPacket {
  id: number;
  slug: string;
  college_name: string;
  description: string | null;
  users_id: number;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CollegeOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // ── Fetch base info + all overview data in one parallel batch ─────────────
  // All secondary queries JOIN on cp.slug directly, so there is no need to
  // wait for the base row (and its id) before firing the rest.
  const [
    baseRows,
    courseRows,
    placementRows,
    galleryRows,
    cutoffRows,
    scholarshipRows,
  ] = await Promise.all([
    // Base college info
    safeQuery<CollegeRow>(
      `SELECT
           cp.id,
           cp.slug,
           cp.users_id,
           cp.description,
           COALESCE(NULLIF(TRIM(u.firstname), ''), cp.slug) AS college_name
         FROM collegeprofile cp
         JOIN users u ON u.id = cp.users_id
         WHERE cp.slug = ?
         LIMIT 1`,
      [slug],
    ),

    // Courses
    safeQuery<RowDataPacket>(
      `SELECT
           cm.id,
           co.name  AS course_name,
           d.name   AS degree_name,
           fa.name  AS stream_name,
           cm.fees,
           cm.seats,
           cm.courseduration,
           cm.twelvemarks,
           cm.description AS course_description
         FROM collegemaster cm
         JOIN collegeprofile cp ON cp.id = cm.collegeprofile_id AND cp.slug = ?
         LEFT JOIN course        co ON co.id = cm.course_id
         LEFT JOIN degree        d  ON d.id  = cm.degree_id
         LEFT JOIN functionalarea fa ON fa.id = cm.functionalarea_id
         ORDER BY fa.name ASC, d.name ASC, co.name ASC
         LIMIT 100`,
      [slug],
    ),

    // Placement
    safeQuery<RowDataPacket>(
      `SELECT
           p.id,
           p.numberofrecruitingcompany,
           p.numberofplacementlastyear,
           p.ctchighest,
           p.ctclowest,
           p.ctcaverage,
           p.placementinfo
         FROM placement p
         JOIN collegeprofile cp ON cp.id = p.collegeprofile_id AND cp.slug = ?
         LIMIT 1`,
      [slug],
    ),

    // Gallery
    safeQuery<RowDataPacket>(
      `SELECT g.id, g.name, g.fullimage, g.caption
         FROM gallery g
         JOIN collegeprofile cp ON cp.users_id = g.users_id AND cp.slug = ?
         WHERE g.fullimage IS NOT NULL AND g.fullimage != ''
         ORDER BY g.id DESC
         LIMIT 24`,
      [slug],
    ),

    // Cut-offs
    safeQuery<RowDataPacket>(
      `SELECT
           cc.id,
           cc.title,
           cc.description,
           d.name  AS degree_name,
           co.name AS course_name,
           fa.name AS stream_name
         FROM college_cut_offs cc
         JOIN collegeprofile cp ON cp.id = cc.collegeprofile_id AND cp.slug = ?
         LEFT JOIN degree        d  ON d.id  = cc.degree_id
         LEFT JOIN course        co ON co.id = cc.course_id
         LEFT JOIN functionalarea fa ON fa.id = cc.functionalarea_id
         ORDER BY cc.id ASC
         LIMIT 30`,
      [slug],
    ),

    // Scholarships
    safeQuery<RowDataPacket>(
      `SELECT cs.id, cs.title, cs.description
         FROM college_scholarships cs
         JOIN collegeprofile cp ON cp.id = cs.collegeprofile_id AND cp.slug = ?
         ORDER BY cs.id ASC
         LIMIT 20`,
      [slug],
    ),
  ]);

  const base = baseRows[0];
  if (!base) notFound();

  const collegeName =
    base.college_name && base.college_name !== slug
      ? base.college_name
      : slugToName(slug);

  // ── Normalise gallery ─────────────────────────────────────────────────────
  const gallery: GalleryData[] = galleryRows.map((g) => ({
    id: g.id as number,
    name: g.name as string | null,
    image: buildImageUrl(g.fullimage as string | null),
    caption: g.caption as string | null,
  }));

  const descriptionText = stripHtml(base.description);

  // ── Quick-link highlight counts ───────────────────────────────────────────
  const courseCount = courseRows.length;
  const hasPlacement = placementRows.length > 0;
  const hasCutoffs = cutoffRows.length > 0;
  const hasScholarships = scholarshipRows.length > 0;
  const hasGallery = gallery.length > 0;

  return (
    <div className="space-y-6">
      {/* ── Jump navigation ── */}
      {(courseCount > 0 ||
        hasPlacement ||
        hasCutoffs ||
        hasScholarships ||
        hasGallery) && (
        <nav className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 px-5 py-3 flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mr-1">
            On this page:
          </span>
          {descriptionText && (
            <a
              href="#about"
              className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-300 hover:text-white transition-colors px-2.5 py-1 rounded-lg hover:bg-white/5"
            >
              <span className="material-symbols-outlined text-[13px]">
                info
              </span>
              About
            </a>
          )}
          {courseCount > 0 && (
            <a
              href="#courses"
              className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-300 hover:text-white transition-colors px-2.5 py-1 rounded-lg hover:bg-white/5"
            >
              <span className="material-symbols-outlined text-[13px]">
                menu_book
              </span>
              Courses ({courseCount})
            </a>
          )}
          {hasPlacement && (
            <a
              href="#placement"
              className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-300 hover:text-white transition-colors px-2.5 py-1 rounded-lg hover:bg-white/5"
            >
              <span className="material-symbols-outlined text-[13px]">
                trending_up
              </span>
              Placements
            </a>
          )}
          {hasCutoffs && (
            <a
              href="#cutoffs"
              className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-300 hover:text-white transition-colors px-2.5 py-1 rounded-lg hover:bg-white/5"
            >
              <span className="material-symbols-outlined text-[13px]">
                bar_chart_4_bars
              </span>
              Cut-offs
            </a>
          )}
          {hasScholarships && (
            <a
              href="#scholarships"
              className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-300 hover:text-white transition-colors px-2.5 py-1 rounded-lg hover:bg-white/5"
            >
              <span className="material-symbols-outlined text-[13px]">
                school
              </span>
              Scholarships
            </a>
          )}
          {hasGallery && (
            <a
              href="#gallery"
              className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-300 hover:text-white transition-colors px-2.5 py-1 rounded-lg hover:bg-white/5"
            >
              <span className="material-symbols-outlined text-[13px]">
                photo_library
              </span>
              Gallery
            </a>
          )}
        </nav>
      )}

      {/* ── About section ── */}
      {descriptionText && (
        <section
          id="about"
          className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 scroll-mt-24"
        >
          <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-red-500 rounded-full block" />
            About {collegeName}
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            {descriptionText}
          </p>
        </section>
      )}

      {/* ── Courses ── */}
      <div id="courses" className="scroll-mt-24">
        <CourseList
          courses={courseRows as CourseData[]}
          collegeName={collegeName}
        />
      </div>

      {/* ── Placement ── */}
      {hasPlacement && (
        <div id="placement" className="scroll-mt-24">
          <PlacementSection placement={placementRows[0] as PlacementData} />
        </div>
      )}

      {/* ── Cut-offs ── */}
      <div id="cutoffs" className="scroll-mt-24">
        <CutOffTable
          cutoffs={cutoffRows as CutoffData[]}
          collegeName={collegeName}
        />
      </div>

      {/* ── Scholarships ── */}
      <div id="scholarships" className="scroll-mt-24">
        <ScholarshipSection
          scholarships={scholarshipRows as ScholarshipData[]}
          collegeName={collegeName}
        />
      </div>

      {/* ── Gallery ── */}
      {hasGallery && (
        <div id="gallery" className="scroll-mt-24">
          <GallerySection gallery={gallery} collegeName={collegeName} />
        </div>
      )}

      {/* ── Mobile CTA strip (visible only on small screens, sidebar hidden) ── */}
      <div className="lg:hidden bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4 flex gap-3">
        <a
          href={`/apply/${slug}`}
          className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm py-3 rounded-xl transition-colors shadow-lg shadow-red-500/20"
        >
          <span className="material-symbols-outlined text-[17px]">
            edit_document
          </span>
          Apply Now
        </a>
        <a
          href="#contact"
          className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-bold text-sm py-3 rounded-xl border border-white/10 transition-colors"
        >
          <span className="material-symbols-outlined text-[17px]">call</span>
          Contact
        </a>
      </div>
    </div>
  );
}
