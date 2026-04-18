import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import CollegeHero from "@/app/components/college/CollegeHero";
import CollegeTabs from "@/app/components/college/CollegeTabs";
import type { CollegeHeroData } from "@/app/components/college/CollegeHero";
import { ObjectId } from "mongodb";

interface CollegeBase {
  _id: ObjectId;
  slug: string;
  description: string | null;
  estyear: number | null;
  website: string | null;
  collegecode: string | null;
  contactpersonname: string | null;
  contactpersonemail: string | null;
  contactpersonnumber: string | null;
  rating: number | null;
  totalRatingUser: number | null;
  verified: boolean | null;
  bannerimage: string | null;
  registeredSortAddress: string | null;
  registeredFullAddress: string | null;
  campusSortAddress: string | null;
  campusFullAddress: string | null;
  mediumOfInstruction: string | null;
  studyForm: string | null;
  admissionStart: string | null;
  admissionEnd: string | null;
  totalStudent: number | null;
  universityType: string | null;
  ranking: number | null;
  isTopUniversity: boolean | null;
  topUniversityRank: number | null;
  facebookurl: string | null;
  twitterurl: string | null;
  CCTVSurveillance: boolean | null;
  ACCampus: boolean | null;
  users_id: ObjectId | null;
  registeredAddressCityId: ObjectId | null;
  collegetype_id: ObjectId | null;
  college_name: string;
  city_name: string | null;
  college_type_name: string | null;
}

export const revalidate = 300;

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
const DEFAULT_BANNER = "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1200";

function buildImageUrl(raw: string | null | undefined): string {
  if (!raw || String(raw).toLowerCase() === "null") return DEFAULT_BANNER;
  if (typeof raw === "string" && (raw.startsWith("http") || raw.startsWith("/"))) return raw;
  return `${IMAGE_BASE}${raw}`;
}

function slugToName(slug: string): string {
  return slug.replace(/-\d+$/, "").split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

async function fetchCollegeBase(slug: string) {
  try {
    const db = await getDb();

    // Fast: find by slug (indexed)
    const cp = await db.collection("collegeprofile").findOne(
      { slug },
      {
        projection: {
          _id: 1, slug: 1, description: 1, estyear: 1, website: 1, collegecode: 1,
          contactpersonname: 1, contactpersonemail: 1, contactpersonnumber: 1,
          rating: 1, totalRatingUser: 1, verified: 1, bannerimage: 1,
          registeredSortAddress: 1, registeredFullAddress: 1,
          campusSortAddress: 1, campusFullAddress: 1,
          mediumOfInstruction: 1, studyForm: 1, admissionStart: 1, admissionEnd: 1,
          totalStudent: 1, universityType: 1, ranking: 1, isTopUniversity: 1,
          topUniversityRank: 1, facebookurl: 1, twitterurl: 1,
          CCTVSurveillance: 1, ACCampus: 1, users_id: 1,
          registeredAddressCityId: 1, collegetype_id: 1,
        },
      }
    );
    if (!cp) return null;

    // Fast: lookup user, city, collegetype by _id (all indexed)
    const [user, city, ct] = await Promise.all([
      cp.users_id ? db.collection("users").findOne({ _id: cp.users_id }, { projection: { firstname: 1, profileimage: 1 } }) : null,
      cp.registeredAddressCityId ? db.collection("city").findOne({ _id: cp.registeredAddressCityId }, { projection: { name: 1 } }) : null,
      cp.collegetype_id ? db.collection("collegetype").findOne({ _id: cp.collegetype_id }, { projection: { name: 1 } }) : null,
    ]);

    return {
      ...cp,
      college_name: user?.firstname?.trim() || cp.slug,
      logo: user?.profileimage || null,
      city_name: city?.name || null,
      college_type_name: ct?.name || null,
    } as CollegeBase;
  } catch (err) {
    console.error("[college/layout] fetchCollegeBase:", err);
    return null;
  }
}

async function fetchTabCounts(slug: string) {
  try {
    const db = await getDb();
    const cp = await db.collection("collegeprofile").findOne({ slug }, { projection: { _id: 1 } });
    if (!cp) return null;
    const cpId = cp._id;

    const [courses, faculty, reviews, admissionProcedures, faqs] = await Promise.all([
      db.collection("collegemaster").countDocuments({ collegeprofile_id: cpId }),
      db.collection("faculty").countDocuments({ collegeprofile_id: cpId }),
      db.collection("college_reviews").countDocuments({ collegeprofile_id: cpId, description: { $exists: true, $ne: "" } }),
      db.collection("college_admission_procedures").countDocuments({ collegeprofile_id: cpId }),
      db.collection("college_faqs").countDocuments({ collegeprofile_id: cpId }),
    ]);

    return { courses, faculty, reviews, admissionProcedures, faqs };
  } catch (err) {
    console.error("[college/layout] fetchTabCounts:", err);
    return null;
  }
}

const getCachedCollegeBase = unstable_cache(
  (slug: string) => fetchCollegeBase(slug),
  ["college-base-mongo"],
  { revalidate: 60 }
);

const getCachedTabCounts = unstable_cache(
  (slug: string) => fetchTabCounts(slug),
  ["college-tab-counts-mongo"],
  { revalidate: 300 }
);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = rawSlug.trim();
  const raw = await getCachedCollegeBase(slug);
  if (!raw) return { title: "College Not Found | AdmissionX" };

  const name = raw.college_name && raw.college_name !== slug ? raw.college_name : slugToName(slug);
  const location = raw.registeredSortAddress || raw.city_name || "India";

  return {
    title: `${name} — Fees, Courses, Reviews 2025 | AdmissionX`,
    description: `Explore ${name} in ${location}. Get details on courses, fees, faculty, placement stats, cut-offs, scholarships, and student reviews.`,
    openGraph: {
      title: `${name} | AdmissionX`,
      description: `Courses, fees, placements and reviews for ${name}.`,
      images: raw.bannerimage ? [buildImageUrl(raw.bannerimage)] : [],
    },
  };
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ college }: { college: Record<string, unknown> }) {
  const {
    slug, admissionStart, admissionEnd, collegecode,
    registeredFullAddress, studyForm, contactpersonnumber,
    contactpersonemail, website, facebookurl, twitterurl,
    CCTVSurveillance, ACCampus,
  } = college as Record<string, string | number | null>;

  const cleanAddress = registeredFullAddress
    ? String(registeredFullAddress).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 120)
    : null;

  const detailItems = [
    ...(collegecode ? [{ icon: "tag", label: "College Code", value: String(collegecode) }] : []),
    ...(cleanAddress ? [{ icon: "location_on", label: "Address", value: cleanAddress }] : []),
    ...(studyForm ? [{ icon: "schedule", label: "Study Mode", value: String(studyForm) }] : []),
    ...(CCTVSurveillance ? [{ icon: "videocam", label: "CCTV", value: "Campus Surveillance" }] : []),
    ...(ACCampus ? [{ icon: "ac_unit", label: "AC Campus", value: "Air Conditioned" }] : []),
    ...(contactpersonnumber ? [{ icon: "call", label: "Phone", value: String(contactpersonnumber), href: `tel:${contactpersonnumber}` }] : []),
    ...(contactpersonemail ? [{ icon: "mail", label: "Email", value: String(contactpersonemail), href: `mailto:${contactpersonemail}` }] : []),
    ...(website ? [{
      icon: "language", label: "Website",
      value: String(website).replace(/^https?:\/\//, "").replace(/\/$/, "").slice(0, 36),
      href: String(website).startsWith("http") ? String(website) : `https://${website}`,
      isExternal: true,
    }] : []),
  ];

  return (
    <div className="sticky top-20 space-y-4">
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5">
        <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-red-500">edit_document</span>
          Apply & Enquire
        </h3>
        <div className="space-y-2 mb-4">
          <a href={`/apply/${slug}`} className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm py-3 rounded-xl transition-colors shadow-md shadow-red-500/20">
            <span className="material-symbols-outlined text-[17px]">edit_document</span>
            Apply Now
          </a>
          <a href="#contact" className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-bold text-sm py-3 rounded-xl border border-white/10 transition-colors">
            <span className="material-symbols-outlined text-[17px]">call</span>
            Contact College
          </a>
        </div>
        {(admissionStart || admissionEnd) && (
          <div className="border-t border-white/10 pt-4 space-y-2">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">event</span>
              Admission Window
            </p>
            {admissionStart && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Opens</span>
                <span className="font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">{String(admissionStart)}</span>
              </div>
            )}
            {admissionEnd && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Closes</span>
                <span className="font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-md">{String(admissionEnd)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {detailItems.length > 0 && (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5" id="contact">
          <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-red-500">info</span>
            College Details
          </h3>
          <ul className="space-y-3">
            {detailItems.map((item) => (
              <li key={item.label} className="flex items-start gap-2.5 text-xs">
                <span className="material-symbols-outlined text-[14px] text-red-400 flex-shrink-0 mt-0.5">{item.icon}</span>
                <div className="min-w-0">
                  <span className="text-neutral-400 block text-[10px] uppercase tracking-wide font-semibold mb-0.5">{item.label}</span>
                  {item.href ? (
                    <a href={item.href} target={item.isExternal ? "_blank" : undefined} rel={item.isExternal ? "noopener noreferrer" : undefined}
                      className="font-semibold text-red-600 hover:text-red-700 transition-colors truncate block">{item.value}</a>
                  ) : (
                    <span className="font-semibold text-white leading-snug">{item.value}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(facebookurl || twitterurl) && (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5">
          <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-red-500">share</span>
            Social Media
          </h3>
          <div className="flex flex-wrap gap-2">
            {facebookurl && (
              <a href={String(facebookurl)} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-3.5 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold text-xs rounded-xl border border-blue-500/20 transition-colors">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>
                Facebook
              </a>
            )}
            {twitterurl && (
              <a href={String(twitterurl)} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-3.5 py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 font-bold text-xs rounded-xl border border-sky-500/20 transition-colors">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" /></svg>
                Twitter
              </a>
            )}
          </div>
        </div>
      )}

      <Link href="/search" className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-neutral-300 font-bold text-sm py-3 rounded-2xl border border-white/10 transition-colors w-full">
        <span className="material-symbols-outlined text-[17px]">arrow_back</span>
        Back to Search
      </Link>
    </div>
  );
}

// ── Layout ────────────────────────────────────────────────────────────────────
export default async function CollegeLayout({
  params,
  children,
}: {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}) {
  const { slug: rawSlug } = await params;
  const slug = rawSlug.trim();

  const [raw, tabCounts] = await Promise.all([
    getCachedCollegeBase(slug),
    getCachedTabCounts(slug),
  ]);

  if (!raw) notFound();

  const collegeName = raw.college_name && raw.college_name !== slug ? raw.college_name : slugToName(slug);

  const heroData: CollegeHeroData = {
    id: raw._id,
    slug: raw.slug,
    college_name: collegeName,
    image: buildImageUrl(raw.bannerimage),
    description: raw.description,
    estyear: raw.estyear ? String(raw.estyear) : null,
    website: raw.website,
    collegecode: raw.collegecode,
    contactpersonname: raw.contactpersonname,
    contactpersonemail: raw.contactpersonemail,
    contactpersonnumber: raw.contactpersonnumber,
    rating: parseFloat(String(raw.rating)) || 0,
    totalRatingUser: parseInt(String(raw.totalRatingUser)) || 0,
    verified: raw.verified ? 1 : 0,
    registeredSortAddress: raw.registeredSortAddress,
    registeredFullAddress: raw.registeredFullAddress,
    campusSortAddress: raw.campusSortAddress,
    campusFullAddress: raw.campusFullAddress,
    mediumOfInstruction: raw.mediumOfInstruction,
    studyForm: raw.studyForm,
    admissionStart: raw.admissionStart,
    admissionEnd: raw.admissionEnd,
    totalStudent: raw.totalStudent ? String(raw.totalStudent) : null,
    universityType: raw.universityType,
    ranking: raw.ranking ? String(raw.ranking) : null,
    isTopUniversity: raw.isTopUniversity ? 1 : 0,
    topUniversityRank: raw.topUniversityRank ? String(raw.topUniversityRank) : null,
    facebookurl: raw.facebookurl,
    twitterurl: raw.twitterurl,
    CCTVSurveillance: raw.CCTVSurveillance ? 1 : 0,
    ACCampus: raw.ACCampus ? 1 : 0,
    city_name: raw.city_name,
    college_type_name: raw.college_type_name,
    logo: buildImageUrl((raw as any).logo),
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <CollegeHero college={heroData} />
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
      <main className="w-full bg-white">{children}</main>
      <Footer />
    </div>
  );
}
