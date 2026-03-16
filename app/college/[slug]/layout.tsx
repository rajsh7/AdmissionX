import pool from "@/lib/db";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import { RowDataPacket } from "mysql2";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import CollegeHero from "@/app/components/college/CollegeHero";
import CollegeTabs from "@/app/components/college/CollegeTabs";
import type { CollegeHeroData } from "@/app/components/college/CollegeHero";

// ── Route-segment cache ───────────────────────────────────────────────────────
// Caches the fully-rendered layout shell (hero + tabs + sidebar) for 5 minutes.
// Sub-page children (page.tsx, courses/page.tsx …) each export their own
// revalidate so they can have independent TTLs if needed.
export const revalidate = 300;

// ─── Constants ────────────────────────────────────────────────────────────────

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
const DEFAULT_BANNER =
  "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1200";

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

// ─── DB queries ───────────────────────────────────────────────────────────────

interface CollegeLayoutRow extends RowDataPacket {
  id: number;
  slug: string;
  college_name: string;
  description: string | null;
  estyear: string | null;
  website: string | null;
  collegecode: string | null;
  contactpersonname: string | null;
  contactpersonemail: string | null;
  contactpersonnumber: string | null;
  rating: string | null;
  totalRatingUser: string | null;
  verified: number;
  bannerimage: string | null;
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
  users_id: number;
  city_name: string | null;
  college_type_name: string | null;
}

interface CountRow extends RowDataPacket {
  courses: number;
  faculty: number;
  reviews: number;
  admissionProcedures: number;
  faqs: number;
}

async function fetchCollegeBase(
  slug: string,
): Promise<CollegeLayoutRow | null> {
  try {
    const [rows] = (await pool.query(
      `SELECT
         cp.id,
         cp.slug,
         COALESCE(NULLIF(TRIM(u.firstname), ''), cp.slug) AS college_name,
         cp.description,
         cp.estyear,
         cp.website,
         cp.collegecode,
         cp.contactpersonname,
         cp.contactpersonemail,
         cp.contactpersonnumber,
         cp.rating,
         cp.totalRatingUser,
         cp.verified,
         cp.bannerimage,
         cp.registeredSortAddress,
         cp.registeredFullAddress,
         cp.campusSortAddress,
         cp.campusFullAddress,
         cp.mediumOfInstruction,
         cp.studyForm,
         cp.admissionStart,
         cp.admissionEnd,
         cp.totalStudent,
         cp.universityType,
         cp.ranking,
         cp.isTopUniversity,
         cp.topUniversityRank,
         cp.facebookurl,
         cp.twitterurl,
         cp.CCTVSurveillance,
         cp.ACCampus,
         cp.users_id,
         c.name  AS city_name,
         ct.name AS college_type_name
       FROM collegeprofile cp
       JOIN users u ON u.id = cp.users_id
       LEFT JOIN city c ON c.id = cp.registeredAddressCityId
       LEFT JOIN collegetype ct ON ct.id = cp.collegetype_id
       WHERE cp.slug = ?
       LIMIT 1`,
      [slug],
    )) as [CollegeLayoutRow[], unknown];
    return rows[0] ?? null;
  } catch (err) {
    console.error("[college/[slug]/layout.tsx] fetchCollegeBase:", err);
    return null;
  }
}

// Accept slug directly so this function can run in parallel with fetchCollegeBase
// (no need to wait for the collegeId from a prior DB round-trip).
async function fetchTabCounts(slug: string): Promise<CountRow | null> {
  try {
    const [rows] = (await pool.query(
      `SELECT
         (SELECT COUNT(*) FROM collegemaster    WHERE collegeprofile_id = cp.id) AS courses,
         (SELECT COUNT(*) FROM faculty          WHERE collegeprofile_id = cp.id) AS faculty,
         (SELECT COUNT(*) FROM college_reviews  WHERE collegeprofile_id = cp.id AND description IS NOT NULL AND description != '') AS reviews,
         (SELECT COUNT(*) FROM college_admission_procedures WHERE collegeprofile_id = cp.id) AS admissionProcedures,
         (SELECT COUNT(*) FROM college_faqs     WHERE collegeprofile_id = cp.id) AS faqs
       FROM collegeprofile cp
       WHERE cp.slug = ?
       LIMIT 1`,
      [slug],
    )) as [CountRow[], unknown];
    return rows[0] ?? null;
  } catch (err) {
    console.error("[college/[slug]/layout.tsx] fetchTabCounts:", err);
    return null;
  }
}

// ── Cached wrappers ───────────────────────────────────────────────────────────
// Both generateMetadata and CollegeLayout call these functions.
// Without caching, each call hits the DB independently (2× the same query per
// request).  unstable_cache deduplicates them: the first caller fetches from
// MySQL; the second caller within the same 5-minute window gets the in-memory
// result instantly — zero extra DB round-trips.
const getCachedCollegeBase = unstable_cache(
  (slug: string) => fetchCollegeBase(slug),
  ["college-base"],
  { revalidate: 300 },
);

const getCachedTabCounts = unstable_cache(
  (slug: string) => fetchTabCounts(slug),
  ["college-tab-counts"],
  { revalidate: 300 },
);

// ─── generateMetadata ─────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  // Use the cached version — if CollegeLayout already ran (or vice versa),
  // this is a cache hit and costs zero DB round-trips.
  const raw = await getCachedCollegeBase(slug);

  if (!raw) {
    return { title: "College Not Found | AdmissionX" };
  }

  const name =
    raw.college_name && raw.college_name !== slug
      ? raw.college_name
      : slugToName(slug);

  const location = raw.registeredSortAddress || raw.city_name || "India";

  return {
    title: `${name} — Fees, Courses, Reviews 2025 | AdmissionX`,
    description: `Explore ${name} in ${location}. Get details on courses, fees, faculty, placement stats, cut-offs, scholarships, and student reviews. Apply now on AdmissionX.`,
    openGraph: {
      title: `${name} | AdmissionX`,
      description: `Courses, fees, placements and reviews for ${name}.`,
      images: raw.bannerimage ? [buildImageUrl(raw.bannerimage)] : [],
    },
  };
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ college }: { college: CollegeLayoutRow }) {
  const {
    slug,
    admissionStart,
    admissionEnd,
    collegecode,
    registeredFullAddress,
    studyForm,
    contactpersonnumber,
    contactpersonemail,
    website,
    facebookurl,
    twitterurl,
    CCTVSurveillance,
    ACCampus,
  } = college;

  const cleanAddress = registeredFullAddress
    ? registeredFullAddress
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 120)
    : null;

  const detailItems: {
    icon: string;
    label: string;
    value: string;
    href?: string;
    isExternal?: boolean;
  }[] = [
    ...(collegecode
      ? [{ icon: "tag", label: "College Code", value: collegecode }]
      : []),
    ...(cleanAddress
      ? [{ icon: "location_on", label: "Address", value: cleanAddress }]
      : []),
    ...(studyForm
      ? [{ icon: "schedule", label: "Study Mode", value: studyForm }]
      : []),
    ...(CCTVSurveillance
      ? [{ icon: "videocam", label: "CCTV", value: "Campus Surveillance" }]
      : []),
    ...(ACCampus
      ? [{ icon: "ac_unit", label: "AC Campus", value: "Air Conditioned" }]
      : []),
    ...(contactpersonnumber
      ? [
          {
            icon: "call",
            label: "Phone",
            value: contactpersonnumber,
            href: `tel:${contactpersonnumber}`,
          },
        ]
      : []),
    ...(contactpersonemail
      ? [
          {
            icon: "mail",
            label: "Email",
            value: contactpersonemail,
            href: `mailto:${contactpersonemail}`,
          },
        ]
      : []),
    ...(website
      ? [
          {
            icon: "language",
            label: "Website",
            value: website
              .replace(/^https?:\/\//, "")
              .replace(/\/$/, "")
              .slice(0, 36),
            href: website.startsWith("http") ? website : `https://${website}`,
            isExternal: true,
          },
        ]
      : []),
  ];

  return (
    <div className="sticky top-20 space-y-4">
      {/* ── Apply card ── */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5">
        <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-red-500">
            edit_document
          </span>
          Apply & Enquire
        </h3>

        <div className="space-y-2 mb-4">
          <a
            href={`/apply/${slug}`}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm py-3 rounded-xl transition-colors shadow-md shadow-red-500/20"
          >
            <span className="material-symbols-outlined text-[17px]">
              edit_document
            </span>
            Apply Now
          </a>
          <a
            href={`#contact`}
            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-bold text-sm py-3 rounded-xl border border-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[17px]">call</span>
            Contact College
          </a>
        </div>

        {/* Admission window */}
        {(admissionStart || admissionEnd) && (
          <div className="border-t border-white/10 pt-4 space-y-2">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">
                event
              </span>
              Admission Window
            </p>
            {admissionStart && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Opens</span>
                <span className="font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                  {admissionStart}
                </span>
              </div>
            )}
            {admissionEnd && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Closes</span>
                <span className="font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-md">
                  {admissionEnd}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── College details ── */}
      {detailItems.length > 0 && (
        <div
          className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5"
          id="contact"
        >
          <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-red-500">
              info
            </span>
            College Details
          </h3>
          <ul className="space-y-3">
            {detailItems.map((item) => (
              <li key={item.label} className="flex items-start gap-2.5 text-xs">
                <span className="material-symbols-outlined text-[14px] text-red-400 flex-shrink-0 mt-0.5">
                  {item.icon}
                </span>
                <div className="min-w-0">
                  <span className="text-neutral-400 block text-[10px] uppercase tracking-wide font-semibold mb-0.5">
                    {item.label}
                  </span>
                  {item.href ? (
                    <a
                      href={item.href}
                      target={item.isExternal ? "_blank" : undefined}
                      rel={item.isExternal ? "noopener noreferrer" : undefined}
                      className="font-semibold text-red-600 hover:text-red-700 transition-colors truncate block"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <span className="font-semibold text-white leading-snug">
                      {item.value}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Social media ── */}
      {(facebookurl || twitterurl) && (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5">
          <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-red-500">
              share
            </span>
            Social Media
          </h3>
          <div className="flex flex-wrap gap-2">
            {facebookurl && (
              <a
                href={facebookurl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3.5 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold text-xs rounded-xl border border-blue-500/20 transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
                Facebook
              </a>
            )}
            {twitterurl && (
              <a
                href={twitterurl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3.5 py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 font-bold text-xs rounded-xl border border-sky-500/20 transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
                Twitter
              </a>
            )}
          </div>
        </div>
      )}

      {/* ── Back to search ── */}
      <Link
        href="/search"
        className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-neutral-300 font-bold text-sm py-3 rounded-2xl border border-white/10 transition-colors w-full"
      >
        <span className="material-symbols-outlined text-[17px]">
          arrow_back
        </span>
        Back to Search
      </Link>
    </div>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default async function CollegeLayout({
  params,
  children,
}: {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}) {
  const { slug } = await params;

  // ── True parallel fetch ───────────────────────────────────────────────────
  // fetchTabCounts now accepts slug directly (no longer needs the college id),
  // so both queries run at the same time — no waterfall.
  // Both are also wrapped in unstable_cache, so generateMetadata (which runs
  // before the layout) won't trigger a second DB hit for the same slug.
  const [raw, tabCounts] = await Promise.all([
    getCachedCollegeBase(slug),
    getCachedTabCounts(slug),
  ]);

  if (!raw) notFound();

  const collegeName =
    raw.college_name && raw.college_name !== slug
      ? raw.college_name
      : slugToName(slug);

  // Build the hero data object
  const heroData: CollegeHeroData = {
    id: raw.id,
    slug: raw.slug,
    college_name: collegeName,
    image: buildImageUrl(raw.bannerimage),
    description: raw.description,
    estyear: raw.estyear,
    website: raw.website,
    collegecode: raw.collegecode,
    contactpersonname: raw.contactpersonname,
    contactpersonemail: raw.contactpersonemail,
    contactpersonnumber: raw.contactpersonnumber,
    rating: parseFloat(String(raw.rating)) || 0,
    totalRatingUser: parseInt(String(raw.totalRatingUser)) || 0,
    verified: raw.verified,
    registeredSortAddress: raw.registeredSortAddress,
    registeredFullAddress: raw.registeredFullAddress,
    campusSortAddress: raw.campusSortAddress,
    campusFullAddress: raw.campusFullAddress,
    mediumOfInstruction: raw.mediumOfInstruction,
    studyForm: raw.studyForm,
    admissionStart: raw.admissionStart,
    admissionEnd: raw.admissionEnd,
    totalStudent: raw.totalStudent,
    universityType: raw.universityType,
    ranking: raw.ranking,
    isTopUniversity: raw.isTopUniversity,
    topUniversityRank: raw.topUniversityRank,
    facebookurl: raw.facebookurl,
    twitterurl: raw.twitterurl,
    CCTVSurveillance: raw.CCTVSurveillance,
    ACCampus: raw.ACCampus,
    city_name: raw.city_name,
    college_type_name: raw.college_type_name,
  };

  return (
    <div className="min-h-screen relative">
      {/* ── Full Page Background ── */}
      <div className="fixed inset-0 z-0 text-[0px] font-[0] leading-[0]">
        <Image
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=2000"
          alt="Campus Background"
          fill
          priority
          sizes="100vw"
          quality={80}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10">
        <Header />

      {/* ── Hero banner + quick stats ── */}
      <CollegeHero college={heroData} />

      {/* ── Sticky tab navigation ── */}
      <CollegeTabs
        slug={slug}
        counts={{
          courses: tabCounts?.courses ?? 0,
          faculty: tabCounts?.faculty ?? 0,
          reviews: tabCounts?.reviews ?? 0,
          admissionProcedures: tabCounts?.admissionProcedures ?? 0,
          faqs: tabCounts?.faqs ?? 0,
        }}
      />

      {/* ── Main body ── */}
      <div className="w-full px-0 py-8">
        <div className="flex gap-6 lg:gap-8 items-start">
          {/* Main column — page content goes here */}
          <main className="flex-1 min-w-0">{children}</main>

          {/* Sidebar — shown on large screens only */}
          <aside className="hidden lg:block w-72 xl:w-80 flex-shrink-0">
            <Sidebar college={raw} />
          </aside>
        </div>
      </div>

      <Footer />
      </div>
    </div>
  );
}
