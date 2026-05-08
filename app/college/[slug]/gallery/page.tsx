import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";
import CollegeGallery from "@/app/components/college/CollegeGallery";

export const dynamic = "force-dynamic";

function slugToName(slug: string) {
  return slug.replace(/-\d+$/, "").split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default async function GalleryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();

  const cp = await db.collection("collegeprofile").findOne({ slug }, { projection: { _id: 1, users_id: 1 } });
  if (!cp) notFound();

  const user = cp.users_id
    ? await db.collection("users").findOne({ _id: cp.users_id }, { projection: { firstname: 1 } })
    : null;

  const collegeName = user?.firstname?.trim() || slugToName(slug);

  return (
    <div className="max-w-[1920px] mx-auto px-4 md:px-10 lg:px-12 py-10">
      <div className="mb-8">
        <h1 className="text-[28px] font-black text-slate-900">Campus Gallery</h1>
        <p className="text-slate-500 text-sm mt-1">{collegeName} — photos from campus</p>
      </div>
      <CollegeGallery slug={slug} />
    </div>
  );
}
