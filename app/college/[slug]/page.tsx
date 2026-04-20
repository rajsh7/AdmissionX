import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";

import AboutTab from "./components/AboutTab";
import TrackCollegeView from "@/app/components/TrackCollegeView";

export const dynamic = "force-dynamic";

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
const DEFAULT_BANNER =
  "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1200";

const MOSAIC_FALLBACKS = [
  "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800&h=400",
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=400&h=260",
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=400&h=260",
];

function buildImageUrl(raw: string | null): string {
  if (!raw) return DEFAULT_BANNER;
  if (raw.startsWith("http")) return raw;
  return `${IMAGE_BASE}${raw}`;
}

function slugToName(slug: string): string {
  return slug.replace(/-\d+$/, "").split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

function toParagraphs(text: string): string[] {
  if (!text) return [];
  const sentences = text.split(/(?<=\.)\s+/);
  const chunks: string[] = [];
  let current = "";
  for (const s of sentences) {
    const candidate = current ? `${current} ${s}` : s;
    if (candidate.length > 350 && current) { chunks.push(current); current = s; }
    else current = candidate;
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

export default async function CollegeOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = rawSlug.trim();

  const db = await getDb();

  // Step 1: Get college profile (fast — indexed slug)
  const cp = await db.collection("collegeprofile").findOne(
    { slug },
    { projection: { _id: 1, users_id: 1, description: 1, totalStudent: 1, registeredSortAddress: 1, registeredAddressCityId: 1, bannerimage: 1, city_name: 1, mosaic1: 1, mosaic2: 1, mosaic3: 1, mosaic4: 1 } }
  );

  if (!cp) notFound();

  const cpId = cp._id;
  const usersId = cp.users_id;

  // Step 2: Get user name (fast — indexed _id)
  const user = usersId
    ? await db.collection("users").findOne({ _id: usersId }, { projection: { firstname: 1, profileimage: 1 } })
    : null;

  // Step 3: Get city name
  const cityDoc = cp.city_name
    ? null
    : await db.collection("city").findOne({ _id: cp.registeredAddressCityId }, { projection: { name: 1 } });

  // Step 4: Parallel fetch of courses, placement, gallery (all fast — indexed collegeprofile_id)
  const [courseRows, placementRow, galleryRows] = await Promise.all([
    db.collection("collegemaster")
      .find({ collegeprofile_id: cpId })
      .limit(100)
      .project({ _id: 1, course_id: 1, degree_id: 1, functionalarea_id: 1, fees: 1, seats: 1, courseduration: 1, twelvemarks: 1, description: 1 })
      .toArray(),

    db.collection("placement").findOne(
      { collegeprofile_id: cpId },
      { projection: { ctcaverage: 1, ctchighest: 1, ctclowest: 1, numberofrecruitingcompany: 1, numberofplacementlastyear: 1 } }
    ),

    db.collection("gallery")
      .find({ users_id: usersId, fullimage: { $exists: true, $ne: "" } })
      .sort({ _id: -1 })
      .limit(3)
      .project({ fullimage: 1 })
      .toArray(),
  ]);

  // Build derived values
  const collegeName = user?.firstname?.trim() || slugToName(slug);
  const location = cp.city_name || cityDoc?.name || cp.registeredSortAddress || "India";

  const totalStudentDisplay = (() => {
    const n = parseInt(cp.totalStudent);
    return isNaN(n) || n === 0 ? "4,450+" : `${n.toLocaleString()}+`;
  })();

  const courseDisplay = courseRows.length > 0 ? `${courseRows.length}+` : "25+";

  const avgCTCDisplay = (() => {
    if (!placementRow?.ctcaverage) return "8 LPA avg";
    const n = parseFloat(String(placementRow.ctcaverage));
    return isNaN(n) || n === 0 ? "8 LPA avg" : `${n} LPA avg`;
  })();

  const descriptionText = stripHtml(cp.description);
  const paragraphs = toParagraphs(descriptionText);
  const aboutPara1 = paragraphs[0] || `${collegeName} is a premier educational institution dedicated to academic excellence, research, and holistic development of students.`;
  const missionText = paragraphs[2] || "To provide quality education that empowers students with knowledge, skills, and values to excel in their professional and personal lives.";
  const visionText = "To become a world-class institution recognized for academic excellence, innovation, and meaningful contribution to society.";

  const mosaicImages = [
    galleryRows[0]?.fullimage ? buildImageUrl(galleryRows[0].fullimage as string) : MOSAIC_FALLBACKS[0],
    galleryRows[1]?.fullimage ? buildImageUrl(galleryRows[1].fullimage as string) : MOSAIC_FALLBACKS[1],
    galleryRows[2]?.fullimage ? buildImageUrl(galleryRows[2].fullimage as string) : MOSAIC_FALLBACKS[2],
  ];

  const stats = [
    { value: totalStudentDisplay, label: "Total student" },
    { value: courseDisplay, label: "Courses offered" },
    { value: avgCTCDisplay, label: "2025 Placement" },
  ];

  return (
    <>
      <TrackCollegeView slug={slug} name={collegeName} />
      <AboutTab
      collegeName={collegeName}
      slug={slug}
      location={location}
      stats={stats}
      mosaicImages={mosaicImages}
      mosaic1={cp.mosaic1}
      mosaic2={cp.mosaic2}
      mosaic3={cp.mosaic3}
      mosaic4={cp.mosaic4}
      bannerimage={cp.bannerimage}
      aboutPara1={aboutPara1}
      aboutPara2={paragraphs[1] || "The institution provides a vibrant campus environment with state-of-the-art facilities, experienced faculty, and strong industry connections."}
      missionText={missionText}
      visionText={visionText}
      descriptionText={descriptionText}
      paragraphs={paragraphs}
    />
    </>
  );
}
