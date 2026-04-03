import pool from "@/lib/db";
import { notFound } from "next/navigation";

import HeroSection from "./components/HeroSection";
import TabsNav from "./components/TabsNav";
import AboutTab from "./components/AboutTab";
import CoursesTab from "./components/CoursesTab";
import PlacementsTab from "./components/PlacementsTab";
import ReviewsTab from "./components/ReviewsTab";

// Enforce strictly dynamic rendering to prevent stale data conflicts
export const dynamic = "force-dynamic";

// ─── Constants ────────────────────────────────────────────────────────────────

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
const DEFAULT_BANNER =
  "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1200";

const MOSAIC_FALLBACKS = [
  "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800&h=400",
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=400&h=260",
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=400&h=260",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

async function safeQuery<T>(
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

/** Split plain text into logical paragraphs (~350 chars each). */
function toParagraphs(text: string): string[] {
  if (!text) return [];
  const sentences = text.split(/(?<=\.)\s+/);
  const chunks: string[] = [];
  let current = "";
  for (const s of sentences) {
    const candidate = current ? `${current} ${s}` : s;
    if (candidate.length > 350 && current) {
      chunks.push(current);
      current = s;
    } else {
      current = candidate;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CollegeRow {
  id: number;
  slug: string;
  college_name: string;
  description: string | null;
  users_id: number;
  totalStudent: string | null;
  registeredSortAddress: string | null;
  logo_url: string | null;
  city_name: string | null;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CollegeOverviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ tab?: string }>;
}) {
  const { slug } = await params;
  const tab = searchParams ? (await searchParams).tab || "about" : "about";

  const [baseRows, courseRows, placementRows, galleryRows] = await Promise.all([
    // Base college info — enhanced with student count + location
    safeQuery<CollegeRow>(
      `SELECT
           cp.id,
           cp.slug,
           cp.users_id,
           cp.description,
           cp.totalStudent,
           cp.registeredSortAddress,
           u.profileimage AS logo_url,
           COALESCE(NULLIF(TRIM(u.firstname), ''), cp.slug) AS college_name,
           c.name AS city_name
         FROM collegeprofile cp
         JOIN users u ON u.id = cp.users_id
         LEFT JOIN city c ON c.id = cp.registeredAddressCityId
         WHERE cp.slug = ?
         LIMIT 1`,
      [slug],
    ),

    // Courses — for count stat
    safeQuery<any>(
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

    // Placement — for avg CTC stat
    safeQuery<any>(
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

    // Gallery — for image mosaic (first 3 used)
    safeQuery<any>(
      `SELECT g.id, g.name, g.fullimage, g.caption
         FROM gallery g
         JOIN collegeprofile cp ON cp.users_id = g.users_id AND cp.slug = ?
         WHERE g.fullimage IS NOT NULL AND g.fullimage != ''
         ORDER BY g.id DESC
         LIMIT 24`,
      [slug],
    ),
  ]);

  const base = baseRows[0];
  if (!base) notFound();

  const collegeName =
    base.college_name && base.college_name !== slug
      ? base.college_name
      : slugToName(slug);

  // ── Derived values ────────────────────────────────────────────────────────
  const location = base.city_name || base.registeredSortAddress || "India";

  const placement = placementRows[0] ?? null;

  const totalStudentDisplay = (() => {
    if (!base.totalStudent) return "4,450+";
    const n = parseInt(base.totalStudent);
    if (isNaN(n) || n === 0) return "4,450+";
    return `${n.toLocaleString()}+`;
  })();

  const courseDisplay = courseRows.length > 0 ? `${courseRows.length}+` : "25+";

  const avgCTCDisplay = (() => {
    if (!placement?.ctcaverage) return "8 LPA avg";
    const n = parseFloat(String(placement.ctcaverage));
    if (isNaN(n) || n === 0) return "8 LPA avg";
    return `${n} LPA avg`;
  })();

  // ── Description ───────────────────────────────────────────────────────────
  const descriptionText = stripHtml(base.description);
  const paragraphs = toParagraphs(descriptionText);
  const aboutPara1 =
    paragraphs[0] ||
    `${collegeName} is a premier educational institution dedicated to academic excellence, research, and holistic development of students across disciplines.`;
  const aboutPara2 =
    paragraphs[1] ||
    `The institution provides a vibrant campus environment with state-of-the-art facilities, experienced faculty, and strong industry connections to ensure the best outcomes for every student.`;
  const missionText =
    paragraphs[2] ||
    "To provide quality education that empowers students with knowledge, skills, and values to excel in their professional and personal lives.";
  const visionText =
    "To become a world-class institution recognized for academic excellence, innovation, and meaningful contribution to society.";

  // ── Gallery mosaic ────────────────────────────────────────────────────────
  const mosaicImages = [
    galleryRows[0]?.fullimage
      ? buildImageUrl(galleryRows[0].fullimage as string)
      : MOSAIC_FALLBACKS[0],
    galleryRows[1]?.fullimage
      ? buildImageUrl(galleryRows[1].fullimage as string)
      : MOSAIC_FALLBACKS[1],
    galleryRows[2]?.fullimage
      ? buildImageUrl(galleryRows[2].fullimage as string)
      : MOSAIC_FALLBACKS[2],
  ];

  // ── Stats config ──────────────────────────────────────────────────────────
  const stats = [
    { value: totalStudentDisplay, label: "Total students" },
    { value: courseDisplay, label: "Courses offered" },
    { value: avgCTCDisplay, label: "Average package" },
    { value: "2025", label: "Placement year" },
  ];

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <HeroSection 
        coverImage={mosaicImages[0] || DEFAULT_BANNER} 
        collegeName={collegeName} 
        logoUrl={base.logo_url ? buildImageUrl(base.logo_url) : null}
      />
      <TabsNav />
      <div className="flex-grow w-full">
        {tab === "about" && (
          <AboutTab 
             collegeName={collegeName} 
             slug={slug} 
             location={location} 
             stats={stats} 
             mosaicImages={mosaicImages} 
             aboutPara1={aboutPara1} 
             aboutPara2={aboutPara2} 
             missionText={missionText} 
             visionText={visionText} 
             descriptionText={descriptionText} 
             paragraphs={paragraphs} 
          />
        )}
        {tab === "courses" && <CoursesTab courses={courseRows as any[]} />}
        {tab === "placements" && (
          <PlacementsTab 
             collegeName={collegeName} 
             location={location}
             avgPackage={avgCTCDisplay} 
             mosaicImage={mosaicImages[0] || DEFAULT_BANNER} 
          />
        )}
        {tab === "reviews" && <ReviewsTab />}
      </div>
    </main>
  );
}
