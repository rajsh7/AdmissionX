import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import FacultyList from "@/app/components/college/FacultyList";
import type { FacultyData } from "@/app/api/college/[slug]/route";

export const revalidate = 300;

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";

function buildImageUrl(raw: string | null): string | null {
  if (!raw) return null;
  if (raw.startsWith("http") || raw.startsWith("/")) return raw;
  return `${IMAGE_BASE}${raw}`;
}

function slugToName(slug: string): string {
  return slug.replace(/-\d+$/, "").split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function ManagementCard({ member }: { member: any }) {
  const displayName = [member.suffix, member.name].filter(Boolean).join(" ") || "Management";
  const imageUrl = buildImageUrl(member.picture);

  return (
    <div className="flex items-start gap-4 bg-white rounded-2xl border border-neutral-100 hover:border-red-100 hover:shadow-md transition-all duration-300 p-4">
      <div className="flex-shrink-0">
        {imageUrl ? (
          <Image src={imageUrl} alt={displayName} width={56} height={56}
            className="w-14 h-14 rounded-xl object-cover object-top border border-neutral-100" />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-red-700 text-white flex items-center justify-center text-xl font-black shadow-sm">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-neutral-900 leading-snug mb-0.5">{displayName}</h3>
        {member.designation && <p className="text-xs font-semibold text-red-600 mb-2">{member.designation}</p>}
        {member.about && (
          <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">
            {String(member.about).replace(/<[^>]+>/g, " ").trim()}
          </p>
        )}
        <div className="flex flex-wrap gap-2 mt-2">
          {member.emailaddress && (
            <a href={`mailto:${member.emailaddress}`} className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-700">
              <span className="material-symbols-outlined text-[12px]">mail</span>{member.emailaddress}
            </a>
          )}
          {member.phoneno && (
            <a href={`tel:${member.phoneno}`} className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 hover:text-emerald-700">
              <span className="material-symbols-outlined text-[12px]">call</span>{member.phoneno}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function FacultyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();

  const cp = await db.collection("collegeprofile").findOne(
    { slug },
    { projection: { _id: 1, id: 1, users_id: 1 } }
  );
  if (!cp) notFound();

  const cpId = cp.id ? Number(cp.id) : cp._id.toString();

  const [user, facultyDocs, managementDocs] = await Promise.all([
    cp.users_id
      ? db.collection("users").findOne({ _id: cp.users_id }, { projection: { firstname: 1 } })
      : null,
    db.collection("faculty")
      .find({ collegeprofile_id: cpId })
      .sort({ sortorder: 1, name: 1 })
      .limit(60)
      .toArray(),
    db.collection("college_management_details")
      .find({ collegeprofile_id: cpId })
      .sort({ _id: 1 })
      .limit(10)
      .toArray(),
  ]);

  const collegeName = user?.firstname?.trim() || slugToName(slug);

  const faculty: FacultyData[] = facultyDocs.map((f: any) => ({
    id: f.id ?? String(f._id),
    name: f.name ?? null,
    designation: f.designation ?? null,
    description: f.description ?? null,
    image: buildImageUrl(f.imagename) ?? buildImageUrl(f.image_original),
    email: f.email ?? null,
    phone: f.phone ?? null,
    gender: f.gender ?? null,
    suffix: f.suffix ?? null,
    languageKnown: f.languageKnown ?? null,
    stream_name: f.stream_name ?? null,
  }));

  const hasManagement = managementDocs.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 space-y-8">
      {hasManagement && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1 h-6 bg-red-600 rounded-full block flex-shrink-0" />
            <span className="material-symbols-outlined text-[20px] text-red-500" style={{ fontVariationSettings: "'FILL' 1" }}>manage_accounts</span>
            <h2 className="text-lg font-black text-neutral-900">Leadership & Management</h2>
            <span className="ml-auto text-xs font-semibold text-neutral-400 bg-neutral-100 px-2.5 py-1 rounded-full">
              {managementDocs.length} {managementDocs.length === 1 ? "member" : "members"}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {managementDocs.map((m: any) => (
              <ManagementCard key={String(m._id)} member={m} />
            ))}
          </div>
        </section>
      )}

      <section>
        <FacultyList faculty={faculty} collegeName={collegeName} />
      </section>

      {(faculty.length > 0 || hasManagement) && (
        <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-black text-base mb-1">Interested in joining {collegeName}?</p>
            <p className="text-neutral-400 text-sm">Apply now and connect with the faculty directly after enrollment.</p>
          </div>
          <a href={`/apply/${slug}`}
            className="flex-shrink-0 inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors shadow-lg shadow-red-600/20 whitespace-nowrap">
            <span className="material-symbols-outlined text-[17px]">edit_document</span>
            Apply Now
          </a>
        </div>
      )}
    </div>
  );
}
