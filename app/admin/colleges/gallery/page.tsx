import { getDb } from "@/lib/db";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function deleteGalleryImage(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  if (!id) return;
  try {
    const db = await getDb();
    await db.collection("gallery").deleteOne({ id });
  } catch (e) {
    console.error("[admin/colleges/gallery] delete error:", e);
  }
  revalidatePath("/admin/colleges/gallery");
}

export default async function AdminCollegeGalleryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const slug = (sp.slug ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const PAGE_SIZE = 24;
  const offset = (page - 1) * PAGE_SIZE;

  const db = await getDb();

  // Get all colleges for filter dropdown
  const colleges = await db.collection("collegeprofile")
    .find({}, { projection: { slug: 1, college_name: 1, users_id: 1 } })
    .sort({ college_name: 1 })
    .limit(500)
    .toArray();

  // Find users_id for selected slug
  let usersId: number | null = null;
  let selectedCollege = "";
  if (slug) {
    const cp = colleges.find((c: any) => c.slug === slug);
    if (cp) {
      usersId = Number(cp.users_id);
      selectedCollege = String(cp.college_name || cp.slug || "");
    }
  }

  // Build filter
  const filter: Record<string, unknown> = {
    fullimage: { $exists: true, $ne: "" },
  };
  if (usersId) filter.users_id = usersId;

  const [images, total] = await Promise.all([
    db.collection("gallery")
      .find(filter)
      .sort({ id: -1 })
      .skip(offset)
      .limit(PAGE_SIZE)
      .toArray(),
    db.collection("gallery").countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function buildUrl(img: string) {
    if (!img) return "";
    if (img.startsWith("http") || img.startsWith("/")) return img;
    return `https://admin.admissionx.in/uploads/${img}`;
  }

  return (
    <div className="p-6 space-y-6 w-full">
      {/* Header */}
      <div>
        <h1 className="text-lg font-black text-slate-800">College Gallery</h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">
          View and manage gallery images uploaded by colleges
        </p>
      </div>

      {/* Filter */}
      <form method="GET" action="/admin/colleges/gallery" className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 block mb-2">
              Filter by College
            </label>
            <select
              name="slug"
              defaultValue={slug}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Colleges</option>
              {colleges.map((c: any) => (
                <option key={c.slug} value={c.slug}>
                  {c.college_name || c.slug}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all">
              Apply
            </button>
            <Link href="/admin/colleges/gallery" className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all">
              Clear
            </Link>
          </div>
        </div>
      </form>

      {/* Stats */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm px-6 py-3">
        <p className="text-sm text-slate-500 font-medium">
          {total > 0 ? (
            <>
              Showing <span className="font-bold text-slate-800">{offset + 1}–{Math.min(offset + images.length, total)}</span> of{" "}
              <span className="font-bold text-slate-800">{total.toLocaleString()}</span> images
              {selectedCollege && <> for <span className="font-bold text-slate-800">{selectedCollege}</span></>}
            </>
          ) : "No images found"}
        </p>
      </div>

      {/* Gallery Grid */}
      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-100">
          <span className="material-symbols-outlined text-[48px] text-slate-200 mb-3">photo_library</span>
          <p className="text-slate-500 font-semibold text-sm">No gallery images found</p>
          <p className="text-slate-400 text-xs mt-1">Select a college to view their gallery</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {images.map((img: any) => (
            <div key={img._id?.toString() || img.id} className="group relative aspect-square rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
              <img
                src={buildUrl(String(img.fullimage || ""))}
                alt={String(img.name || "Gallery image")}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                <p className="text-white text-[10px] font-semibold text-center truncate w-full px-1">
                  {String(img.name || "Untitled")}
                </p>
                <a
                  href={buildUrl(String(img.fullimage || ""))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold rounded-lg transition-colors"
                >
                  View
                </a>
                <form action={deleteGalleryImage}>
                  <input type="hidden" name="id" value={img.id} />
                  <button
                    type="submit"
                    className="px-3 py-1 bg-red-500/80 hover:bg-red-600 text-white text-[10px] font-bold rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {page > 1 && (
            <Link
              href={`/admin/colleges/gallery?${new URLSearchParams({ ...(slug ? { slug } : {}), page: String(page - 1) })}`}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50"
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-slate-500 font-medium">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link
              href={`/admin/colleges/gallery?${new URLSearchParams({ ...(slug ? { slug } : {}), page: String(page + 1) })}`}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
