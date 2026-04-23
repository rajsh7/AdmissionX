import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";
import PlacementsTab from "../components/PlacementsTab";

export const dynamic = "force-dynamic";

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
const DEFAULT_BANNER = "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1200";

function buildImageUrl(raw: string | null | undefined): string {
  if (!raw) return DEFAULT_BANNER;
  if (raw.startsWith("http") || raw.startsWith("/")) return raw;
  return `${IMAGE_BASE}${raw}`;
}

function slugToName(slug: string): string {
  return slug.replace(/-\d+$/, "").split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function fmt(v: unknown, suffix = "", fallback = ""): string {
  if (!v) return fallback;
  const n = parseFloat(String(v));
  return isNaN(n) || n === 0 ? fallback : `${n}${suffix}`;
}

export default async function PlacementsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();

  const cp = await db.collection("collegeprofile").findOne(
    { slug },
    { projection: { _id: 1, id: 1, users_id: 1, bannerimage: 1, registeredSortAddress: 1, city_name: 1, registeredAddressCityId: 1 } }
  );
  if (!cp) notFound();

  // Same id resolution as dashboard API
  const collegeprofile_id = cp.id ? Number(cp.id) : cp._id.toString();

  const [user, placement, cityDoc] = await Promise.all([
    cp.users_id
      ? db.collection("users").findOne(
          { $or: [{ _id: cp.users_id }, { id: cp.users_id }] },
          { projection: { firstname: 1 } }
        )
      : null,

    // Try both numeric id and ObjectId
    db.collection("placement").findOne(
      { $or: [{ collegeprofile_id }, { collegeprofile_id: cp._id }] },
      { projection: { ctcaverage: 1, ctchighest: 1, ctclowest: 1, numberofrecruitingcompany: 1, numberofplacementlastyear: 1, placementinfo: 1 } }
    ),

    cp.registeredAddressCityId
      ? db.collection("city").findOne(
          { $or: [{ _id: cp.registeredAddressCityId }, { id: cp.registeredAddressCityId }] },
          { projection: { name: 1 } }
        )
      : null,
  ]);

  const collegeName = user?.firstname?.trim() || slugToName(slug);
  const location = cp.city_name || cityDoc?.name || cp.registeredSortAddress || "India";
  const bannerUrl = buildImageUrl(cp.bannerimage as string | null);

  return (
    <PlacementsTab
      collegeName={collegeName}
      location={location}
      placementRatio={fmt(placement?.numberofplacementlastyear, "%", "—")}
      avgPackage={fmt(placement?.ctcaverage, " LPA", "—")}
      highPackage={fmt(placement?.ctchighest, " LPA", "—")}
      lowPackage={fmt(placement?.ctclowest, " LPA", "—")}
      recruitersCount={fmt(placement?.numberofrecruitingcompany, "+", "—")}
      placementInfo={placement?.placementinfo ? String(placement.placementinfo) : null}
      hasData={!!placement}
      mosaicImage={bannerUrl}
    />
  );
}
