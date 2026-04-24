import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { getDb } from "@/lib/db";
import ApplyCollegeForm from "./ApplyCollegeForm";

interface ApplyCollegeData {
  slug: string;
  collegeName: string;
  location: string;
  logo: string | null;
}

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";

function buildImageUrl(raw: string | null | undefined): string | null {
  if (!raw || String(raw).toLowerCase() === "null") return null;
  if (raw.startsWith("http") || raw.startsWith("/")) return raw;
  return `${IMAGE_BASE}${raw}`;
}

function slugToName(slug: string): string {
  return slug
    .replace(/-\d+$/, "")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

async function fetchApplyCollegeData(slug: string): Promise<ApplyCollegeData | null> {
  try {
    const db = await getDb();
    const college = await db.collection("collegeprofile").findOne(
      { slug },
      {
        projection: {
          slug: 1,
          users_id: 1,
          city_name: 1,
          registeredSortAddress: 1,
          registeredAddressCityId: 1,
        },
      },
    );

    if (!college) return null;

    const [user, city] = await Promise.all([
      college.users_id
        ? db.collection("users").findOne(
            { _id: college.users_id },
            { projection: { firstname: 1, profileimage: 1 } },
          )
        : null,
      college.registeredAddressCityId
        ? db.collection("city").findOne(
            { _id: college.registeredAddressCityId },
            { projection: { name: 1 } },
          )
        : null,
    ]);

    return {
      slug,
      collegeName: user?.firstname?.trim() || slugToName(slug),
      location:
        college.registeredSortAddress || college.city_name || city?.name || "India",
      logo: buildImageUrl(user?.profileimage),
    };
  } catch (error) {
    console.error("[apply/[slug]/page] fetchApplyCollegeData:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const college = await fetchApplyCollegeData(slug);
  const collegeName = college?.collegeName || slugToName(slug);

  return {
    title: `Apply to ${collegeName} | AdmissionX`,
    description: `Start your application for ${collegeName} on AdmissionX.`,
  };
}

export default async function ApplyCollegePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const college = await fetchApplyCollegeData(slug);

  if (!college) notFound();

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Header />
      <main className="mt-8 pb-10 pt-6 md:mt-10 md:pb-12 md:pt-8 lg:mt-12">
        <div className="mx-auto w-full max-w-6xl px-4">
          <ApplyCollegeForm college={college} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
