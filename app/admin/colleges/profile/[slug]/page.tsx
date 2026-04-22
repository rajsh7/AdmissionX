import { getDb } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import type { ReactNode } from "react";
import { saveUpload } from "@/lib/upload-utils";
import ImageUpload from "@/app/admin/_components/ImageUpload";

export const dynamic = "force-dynamic";

// ─── Constants ────────────────────────────────────────────────────────────────

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";

// ─── Server Action ─────────────────────────────────────────────────────────────

async function updateCollegeProfile(formData: FormData) {
  "use server";

  const slug = (formData.get("slug") as string) || "";

  const str = (key: string) => {
    const v = (formData.get(key) as string | null)?.trim() || null;
    return v;
  };
  const num = (key: string) => {
    const v = (formData.get(key) as string | null)?.trim();
    if (!v) return null;
    const n = parseInt(v, 10);
    return isNaN(n) ? null : n;
  };
  const bool = (key: string) => (formData.get(key) === "on" ? 1 : 0);

  // ── Handle image uploads ──────────────────────────────────────────────────
  const bannerFile = formData.get("bannerimage_file") as File | null;
  const logoFile   = formData.get("logoimage_file") as File | null;
  let bannerimage  = (formData.get("bannerimage_existing") as string) || "";
  let logoimage    = (formData.get("logoimage_existing") as string) || "";

  if (bannerFile && bannerFile.size > 0)
    bannerimage = await saveUpload(bannerFile, `college/${slug}`, "banner");
  if (logoFile && logoFile.size > 0)
    logoimage = await saveUpload(logoFile, `college/${slug}`, "logo");

  // Multi-image mosaic
  const mosaic1File = formData.get("mosaic1_file") as File | null;
  const mosaic2File = formData.get("mosaic2_file") as File | null;
  const mosaic3File = formData.get("mosaic3_file") as File | null;
  const mosaic4File = formData.get("mosaic4_file") as File | null;

  let mosaic1 = (formData.get("mosaic1_existing") as string) || "";
  let mosaic2 = (formData.get("mosaic2_existing") as string) || "";
  let mosaic3 = (formData.get("mosaic3_existing") as string) || "";
  let mosaic4 = (formData.get("mosaic4_existing") as string) || "";

  if (mosaic1File && mosaic1File.size > 0)
    mosaic1 = await saveUpload(mosaic1File, `college/${slug}/mosaic`, "m1");
  if (mosaic2File && mosaic2File.size > 0)
    mosaic2 = await saveUpload(mosaic2File, `college/${slug}/mosaic`, "m2");
  if (mosaic3File && mosaic3File.size > 0)
    mosaic3 = await saveUpload(mosaic3File, `college/${slug}/mosaic`, "m3");
  if (mosaic4File && mosaic4File.size > 0)
    mosaic4 = await saveUpload(mosaic4File, `college/${slug}/mosaic`, "m4");

  const $set: Record<string, unknown> = {
    ...(bannerimage ? { bannerimage } : {}),
    ...(logoimage   ? { logoimage }   : {}),
    ...(mosaic1     ? { mosaic1 }     : {}),
    ...(mosaic2     ? { mosaic2 }     : {}),
    ...(mosaic3     ? { mosaic3 }     : {}),
    ...(mosaic4     ? { mosaic4 }     : {}),
    description:            str("description"),
    estyear:                str("estyear"),
    website:                str("website"),
    collegecode:            str("collegecode"),
    contactpersonname:      str("contactpersonname"),
    contactpersonemail:     str("contactpersonemail"),
    contactpersonnumber:    str("contactpersonnumber"),
    universityType:         str("universityType"),
    mediumOfInstruction:    str("mediumOfInstruction"),
    studyForm:              str("studyForm"),
    registeredSortAddress:  str("registeredSortAddress"),
    registeredFullAddress:  str("registeredFullAddress"),
    campusSortAddress:      str("campusSortAddress"),
    campusFullAddress:      str("campusFullAddress"),
    admissionStart:         str("admissionStart"),
    admissionEnd:           str("admissionEnd"),
    facebookurl:            str("facebookurl"),
    twitterurl:             str("twitterurl"),
    totalStudent:           num("totalStudent"),
    ranking:                num("ranking"),
    topUniversityRank:      num("topUniversityRank"),
    verified:               bool("verified"),
    isTopUniversity:        bool("isTopUniversity"),
    isShowOnHome:           bool("isShowOnHome"),
    isShowOnTop:            bool("isShowOnTop"),
    CCTVSurveillance:       bool("CCTVSurveillance"),
    ACCampus:               bool("ACCampus"),
    updated_at:             new Date(),
  };

  try {
    const db = await getDb();
    await db.collection("collegeprofile").updateOne({ slug }, { $set });
  } catch (e) {
    console.error("[admin/colleges/profile/[slug]] update error:", e);
  }

  revalidatePath("/admin/colleges/profile");
  revalidatePath(`/college/${slug}`);
  revalidatePath("/top-colleges");
  revalidatePath("/top-university", "page");
  redirect("/admin/colleges/profile");
}

// ─── Style helpers ─────────────────────────────────────────────────────────────

const inputCls =
  "w-full h-10 px-4 border border-slate-200 rounded-[5px] text-sm font-medium bg-white " +
  "focus:outline-none focus:border-[#FF3C3C] focus:ring-2 focus:ring-[#FF3C3C]/10 transition-all " +
  "placeholder:text-slate-300 text-slate-700";

const textareaCls =
  "w-full min-h-[120px] px-4 py-3 border border-slate-200 rounded-[5px] text-sm font-medium bg-white " +
  "focus:outline-none focus:border-[#FF3C3C] focus:ring-2 focus:ring-[#FF3C3C]/10 transition-all " +
  "resize-none placeholder:text-slate-300 text-slate-700";

const labelCls = "block text-[11px] font-black text-[#4B5E7E] uppercase tracking-wider mb-2";

// ─── Sub-components ────────────────────────────────────────────────────────────

function buildImageUrl(raw: string | null | undefined): string {
  if (!raw) return "";
  if (typeof raw === "string" && (raw.startsWith("http") || raw.startsWith("/")))
    return raw;
  return `${IMAGE_BASE}${raw}`;
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-[5px] shadow-sm border border-slate-200 p-6 ${className}`}>
      {children}
    </div>
  );
}

function SectionHeading({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <span className="w-1 h-4 bg-[#FF3C3C] rounded-full block flex-shrink-0" />
      <span
        className="material-symbols-outlined text-[18px] text-[#FF3C3C]"
        style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20" }}
      >
        {icon}
      </span>
      <h2 className="text-sm font-black text-slate-700">{title}</h2>
    </div>
  );
}

function ToggleRow({
  name,
  label,
  checked,
}: {
  name: string;
  label: string;
  checked: boolean;
}) {
  return (
    <label className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <div className="relative flex-shrink-0">
        <input
          type="checkbox"
          name={name}
          defaultChecked={checked}
          className="sr-only peer"
        />
        <div className="w-10 h-5 bg-slate-200 rounded-full peer-checked:bg-[#FF3C3C] transition-colors duration-200" />
        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 peer-checked:translate-x-5" />
      </div>
    </label>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function EditCollegeProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // ── Fetch directly from MongoDB using getDb() ──────────────────────────────
  const db = await getDb();
  const cp = await db.collection("collegeprofile").findOne({ slug });
  if (!cp) notFound();

  // Fetch related user (for name/email) and city (for display)
  const [user, city] = await Promise.all([
    cp.users_id != null
      ? db
          .collection("users")
          .findOne(
            { $or: [{ _id: cp.users_id }, { id: cp.users_id }] },
            { projection: { firstname: 1, email: 1 } },
          )
      : Promise.resolve(null),
    cp.registeredAddressCityId != null
      ? db
          .collection("city")
          .findOne(
            {
              $or: [
                { _id: cp.registeredAddressCityId },
                { id: cp.registeredAddressCityId },
              ],
            },
            { projection: { name: 1 } },
          )
      : Promise.resolve(null),
  ]);

  const collegeName =
    (user?.firstname as string | null)?.trim() || (cp.slug as string);
  const email = (user?.email as string | null) ?? null;
  const cityName = (city?.name as string | null) ?? null;

  // Helper to coerce stored values safely
  const s = (v: unknown) => (v != null && String(v).toUpperCase() !== "NULL" ? String(v) : "");
  const n = (v: unknown) => {
    const parsed = parseInt(String(v ?? ""), 10);
    return isNaN(parsed) ? null : parsed;
  };
  const b = (v: unknown) => Boolean(v && v !== 0 && v !== "0" && v !== false);

  const college = {
    slug:                   s(cp.slug),
    college_name:           collegeName,
    email,
    bannerimage:            s(cp.bannerimage) || null,
    logoimage:              s(cp.logoimage) || null,
    description:            s(cp.description) || null,
    estyear:                s(cp.estyear) || null,
    website:                s(cp.website) || null,
    collegecode:            s(cp.collegecode) || null,
    contactpersonname:      s(cp.contactpersonname) || null,
    contactpersonemail:     s(cp.contactpersonemail) || null,
    contactpersonnumber:    s(cp.contactpersonnumber) || null,
    rating:                 n(cp.rating),
    totalRatingUser:        n(cp.totalRatingUser),
    verified:               b(cp.verified),
    isTopUniversity:        b(cp.isTopUniversity),
    isShowOnHome:           b(cp.isShowOnHome),
    isShowOnTop:            b(cp.isShowOnTop),
    CCTVSurveillance:       b(cp.CCTVSurveillance),
    ACCampus:               b(cp.ACCampus),
    ranking:                n(cp.ranking),
    topUniversityRank:      n(cp.topUniversityRank),
    universityType:         s(cp.universityType) || null,
    registeredSortAddress:  s(cp.registeredSortAddress) || null,
    registeredFullAddress:  s(cp.registeredFullAddress) || null,
    campusSortAddress:      s(cp.campusSortAddress) || null,
    campusFullAddress:      s(cp.campusFullAddress) || null,
    mediumOfInstruction:    s(cp.mediumOfInstruction) || null,
    studyForm:              s(cp.studyForm) || null,
    admissionStart:         s(cp.admissionStart) || null,
    admissionEnd:           s(cp.admissionEnd) || null,
    totalStudent:           n(cp.totalStudent),
    facebookurl:            s(cp.facebookurl) || null,
    twitterurl:             s(cp.twitterurl) || null,
    mosaic1:                s(cp.mosaic1) || null,
    mosaic2:                s(cp.mosaic2) || null,
    mosaic3:                s(cp.mosaic3) || null,
    mosaic4:                s(cp.mosaic4) || null,
    city_name:              cityName,
  };

  const bannerUrl = college.bannerimage ? buildImageUrl(college.bannerimage) : null;

  // Fetch gallery images for this college
  const [galleryImages, achievementsList, coursesList, facilitiesList, eventsList, scholarshipsList, placementData, lettersList, sportsList, cutoffsList, facultyList, transactionsList, faqsList] = await Promise.all([
    db.collection("gallery")
      .find({
        $or: [
          { college_slug: slug },
          ...(cp.users_id ? [{ users_id: Number(cp.users_id) }] : []),
        ],
        fullimage: { $exists: true, $ne: "" },
        $expr: { $gt: [{ $strLenCP: { $trim: { input: "$fullimage" } } }, 0] },
      })
      .sort({ id: -1 })
      .limit(20)
      .toArray(),
    db.collection("college_achievements")
      .find({ college_slug: slug })
      .sort({ year: -1, _id: -1 })
      .toArray(),
    (async () => {
      const cpId = cp.id ? Number(cp.id) : cp._id.toString();
      const rows = await db.collection("collegemaster")
        .find({ collegeprofile_id: cpId })
        .sort({ _id: -1 })
        .toArray();
      const courseIds = [...new Set(rows.map((r: any) => Number(r.course_id)).filter(Boolean))];
      const degreeIds = [...new Set(rows.map((r: any) => Number(r.degree_id)).filter(Boolean))];
      const streamIds = [...new Set(rows.map((r: any) => Number(r.functionalarea_id)).filter(Boolean))];
      const [courses, degrees, streams] = await Promise.all([
        courseIds.length ? db.collection("course").find({ id: { $in: courseIds } }, { projection: { id: 1, name: 1, _id: 0 } }).toArray() : [],
        degreeIds.length ? db.collection("degree").find({ id: { $in: degreeIds } }, { projection: { id: 1, name: 1, _id: 0 } }).toArray() : [],
        streamIds.length ? db.collection("functionalarea").find({ id: { $in: streamIds } }, { projection: { id: 1, name: 1, _id: 0 } }).toArray() : [],
      ]);
      const cMap = new Map(courses.map((c: any) => [Number(c.id), c.name]));
      const dMap = new Map(degrees.map((d: any) => [Number(d.id), d.name]));
      const sMap = new Map(streams.map((s: any) => [Number(s.id), s.name]));
      return rows.map((r: any) => ({
        id: r.id,
        course_name: cMap.get(Number(r.course_id)) ?? null,
        degree_name: dMap.get(Number(r.degree_id)) ?? null,
        stream_name: sMap.get(Number(r.functionalarea_id)) ?? null,
        fees: r.fees ?? null,
        seats: r.seats ?? null,
        courseduration: r.courseduration ?? null,
      }));
    })(),
    // Facilities
    (async () => {
      const cpId = cp.id ? Number(cp.id) : cp._id.toString();
      const enabled = await db.collection("collegefacilities")
        .find({ collegeprofile_id: cpId })
        .toArray();
      const fIds = enabled.map((f: any) => Number(f.facilities_id)).filter(Boolean);
      if (!fIds.length) return [];
      const refs = await db.collection("facilities")
        .find({ id: { $in: fIds } }, { projection: { id: 1, name: 1, _id: 0 } })
        .toArray();
      const refMap = new Map(refs.map((r: any) => [Number(r.id), String(r.name ?? "").trim()]));
      return enabled.map((f: any) => ({
        id: Number(f.facilities_id),
        name: refMap.get(Number(f.facilities_id)) ?? "Unknown",
        description: f.description ?? null,
      }));
    })(),
    // Events
    (async () => {
      const cpId = cp.id ? Number(cp.id) : cp._id.toString();
      const rows = await db.collection("event")
        .find({ collegeprofile_id: cpId })
        .sort({ datetime: -1 })
        .limit(5)
        .toArray();
      return rows.map((e: any) => ({
        id: e._id.toString(),
        name: String(e.name ?? ""),
        datetime: String(e.datetime ?? ""),
        venue: String(e.venue ?? ""),
      }));
    })(),
    // Scholarships
    (async () => {
      const cpId = cp.id ? Number(cp.id) : cp._id.toString();
      const rows = await db.collection("college_scholarships")
        .find({ collegeprofile_id: cpId })
        .sort({ id: 1 })
        .limit(5)
        .toArray();
      return rows.map((r: any) => ({
        id: r.id,
        title: String(r.title ?? ""),
        description: String(r.description ?? ""),
      }));
    })(),
    // Placement
    (async () => {
      const cpId = cp.id ? Number(cp.id) : cp._id.toString();
      return await db.collection("placement").findOne({ collegeprofile_id: cpId }) ?? null;
    })(),
    // Letters
    db.collection("college_letters")
      .find({ college_slug: slug })
      .sort({ created_at: -1 })
      .limit(5)
      .toArray(),
    // Sports
    (async () => {
      const cpId = cp.id ? Number(cp.id) : cp._id.toString();
      const rows = await db.collection("college_sports_activities")
        .find({ collegeprofile_id: cpId })
        .sort({ typeOfActivity: 1, name: 1 })
        .toArray();
      return rows.map((r: any) => ({ id: r.id, name: String(r.name ?? ""), typeOfActivity: String(r.typeOfActivity ?? "Sports") }));
    })(),
    // Cut Offs
    (async () => {
      const cpId = cp.id ? Number(cp.id) : cp._id.toString();
      const rows = await db.collection("college_cut_offs")
        .find({ collegeprofile_id: cpId })
        .sort({ id: 1 })
        .limit(5)
        .toArray();
      return rows.map((r: any) => ({ id: r.id, title: String(r.title ?? "") }));
    })(),
    // Faculty
    (async () => {
      const cpId = cp.id ? Number(cp.id) : cp._id.toString();
      return await db.collection("faculty")
        .find({ collegeprofile_id: Number(cpId) })
        .sort({ sortorder: 1, name: 1 })
        .limit(5)
        .toArray();
    })(),
    // Transactions
    (async () => {
      const cpId = cp.id ? Number(cp.id) : cp._id.toString();
      const rows = await db.collection("next_student_applications")
        .aggregate([
          { $match: { collegeprofile_id: cpId, payment_status: "paid" } },
          { $lookup: { from: "next_student_signups", localField: "student_id", foreignField: "_id", as: "s" } },
          { $unwind: { path: "$s", preserveNullAndEmptyArrays: true } },
          { $project: { application_ref: 1, amount_paid: 1, transaction_id: 1, student_name: "$s.name", updated_at: 1 } },
          { $sort: { updated_at: -1 } },
          { $limit: 5 }
        ])
        .toArray();
      return rows;
    })(),
    // FAQs — match both ObjectId and numeric id since dashboard stores ObjectId, admin stores Number
    (async () => {
      const cpObjectId = cp._id;
      const cpNumId = cp.id ? Number(cp.id) : null;
      const filter = cpNumId
        ? { $or: [{ collegeprofile_id: cpObjectId }, { collegeprofile_id: cpNumId }] }
        : { collegeprofile_id: cpObjectId };
      return db.collection("college_faqs").find(filter).sort({ created_at: -1 }).toArray();
    })(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-8">
      <form action={updateCollegeProfile}>
        <input type="hidden" name="slug" value={college.slug} />

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/colleges/profile"
              className="flex items-center gap-2 bg-white text-slate-900 border border-slate-200 px-4 py-2 rounded-[5px] text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </Link>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-none">Edit College Profile</h1>
              <p className="text-sm text-slate-500 mt-1 font-medium">{college.college_name}</p>
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 bg-[#0F172A] text-white px-6 py-2.5 rounded-[5px] text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            Save Changes
          </button>
        </div>

        {/* ── Two-column layout ── */}
        <div className="flex flex-col xl:flex-row gap-6 items-start">

          {/* ── Left column ── */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* Section 1 — Basic Information */}
            <Card>
              <SectionHeading icon="info" title="Basic Information" />
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea
                    name="description"
                    rows={4}
                    defaultValue={college.description ?? ""}
                    className={textareaCls}
                    placeholder="Describe the college, its history, culture, and key highlights…"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Est. Year</label>
                    <input
                      type="text"
                      name="estyear"
                      defaultValue={college.estyear ?? ""}
                      className={inputCls}
                      placeholder="e.g. 1992"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Website</label>
                    <input
                      type="url"
                      name="website"
                      defaultValue={college.website ?? ""}
                      className={inputCls}
                      placeholder="https://www.college.edu.in"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>College Code</label>
                  <input
                    type="text"
                    name="collegecode"
                    defaultValue={college.collegecode ?? ""}
                    className={inputCls}
                    placeholder="e.g. IIT-B, DU-SOL"
                  />
                </div>
              </div>
            </Card>

            {/* Section 2 — Contact Details */}
            <Card>
              <SectionHeading icon="contact_page" title="Contact Details" />
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Contact Person Name</label>
                  <input
                    type="text"
                    name="contactpersonname"
                    defaultValue={college.contactpersonname ?? ""}
                    className={inputCls}
                    placeholder="Admission Officer / Registrar"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Contact Email</label>
                    <input
                      type="email"
                      name="contactpersonemail"
                      defaultValue={college.contactpersonemail ?? ""}
                      className={inputCls}
                      placeholder="admissions@college.edu.in"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Contact Number</label>
                    <input
                      type="tel"
                      name="contactpersonnumber"
                      defaultValue={college.contactpersonnumber ?? ""}
                      className={inputCls}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
                {/* Registered email (read-only from users table) */}
                {email && (
                  <div>
                    <label className={labelCls}>Registered Email (Account)</label>
                    <div className="w-full h-10 px-4 flex items-center border border-slate-100 rounded-xl bg-slate-50 text-sm text-slate-500">
                      {email}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Section 3 — Location & Address */}
            <Card>
              <SectionHeading icon="location_on" title="Location & Address" />
              {college.city_name && (
                <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-[#008080]/5 border border-[#008080]/20 rounded-xl">
                  <span
                    className="material-symbols-outlined text-[16px] text-[#008080]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    location_on
                  </span>
                  <span className="text-sm font-semibold text-[#008080]">
                    Current city: {college.city_name}
                  </span>
                </div>
              )}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Registered Short Address</label>
                    <input
                      type="text"
                      name="registeredSortAddress"
                      defaultValue={college.registeredSortAddress ?? ""}
                      className={inputCls}
                      placeholder="e.g. Powai, Mumbai"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Campus Short Address</label>
                    <input
                      type="text"
                      name="campusSortAddress"
                      defaultValue={college.campusSortAddress ?? ""}
                      className={inputCls}
                      placeholder="e.g. Andheri East, Mumbai"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Registered Full Address</label>
                  <textarea
                    name="registeredFullAddress"
                    rows={2}
                    defaultValue={college.registeredFullAddress ?? ""}
                    className={textareaCls}
                    placeholder="Full registered address…"
                  />
                </div>
                <div>
                  <label className={labelCls}>Campus Full Address</label>
                  <textarea
                    name="campusFullAddress"
                    rows={2}
                    defaultValue={college.campusFullAddress ?? ""}
                    className={textareaCls}
                    placeholder="Full campus address…"
                  />
                </div>
              </div>
            </Card>

            {/* Section 4 — Academic Info */}
            <Card>
              <SectionHeading icon="school" title="Academic Info" />
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>University Type</label>
                    <input
                      type="text"
                      name="universityType"
                      defaultValue={college.universityType ?? ""}
                      className={inputCls}
                      placeholder="e.g. Private, Government, Deemed"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Medium of Instruction</label>
                    <input
                      type="text"
                      name="mediumOfInstruction"
                      defaultValue={college.mediumOfInstruction ?? ""}
                      className={inputCls}
                      placeholder="e.g. English, Hindi"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Study Form</label>
                    <input
                      type="text"
                      name="studyForm"
                      defaultValue={college.studyForm ?? ""}
                      className={inputCls}
                      placeholder="e.g. Full Time, Part Time"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Total Students</label>
                    <input
                      type="number"
                      name="totalStudent"
                      defaultValue={college.totalStudent ?? ""}
                      className={inputCls}
                      placeholder="e.g. 5000"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Section 5 — Admission Window */}
            <Card>
              <SectionHeading icon="event" title="Admission Window" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Admission Start</label>
                  <input
                    type="text"
                    name="admissionStart"
                    defaultValue={college.admissionStart ?? ""}
                    className={inputCls}
                    placeholder="e.g. 01 Jun 2025"
                  />
                </div>
                <div>
                  <label className={labelCls}>Admission End</label>
                  <input
                    type="text"
                    name="admissionEnd"
                    defaultValue={college.admissionEnd ?? ""}
                    className={inputCls}
                    placeholder="e.g. 31 Aug 2025"
                  />
                </div>
              </div>
            </Card>

            {/* Section 6 — Social Media */}
            <Card>
              <SectionHeading icon="share" title="Social Media" />
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Facebook URL</label>
                  <input type="url" name="facebookurl" defaultValue={college.facebookurl ?? ""} className={inputCls} placeholder="https://facebook.com/collegepage" />
                </div>
                <div>
                  <label className={labelCls}>Twitter / X URL</label>
                  <input type="url" name="twitterurl" defaultValue={college.twitterurl ?? ""} className={inputCls} placeholder="https://twitter.com/collegepage" />
                </div>
              </div>
            </Card>

            {/* Section 7 — Achievements */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <SectionHeading icon="emoji_events" title={`Achievements (${achievementsList.length})`} />
                <Link
                  href={`/admin/colleges/achievements?slug=${college.slug}`}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  Manage
                </Link>
              </div>
              {achievementsList.length === 0 ? (
                <p className="text-sm text-slate-400">No achievements added yet. <Link href={`/admin/colleges/achievements?slug=${college.slug}`} className="text-blue-600 font-semibold hover:underline">Add one →</Link></p>
              ) : (
                <div className="space-y-3">
                  {achievementsList.map((a: any) => (
                    <div key={a._id.toString()} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50">
                      <span className="material-symbols-outlined text-yellow-500 text-[20px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-700 truncate">{a.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-semibold text-slate-400">{a.category}</span>
                          {a.year && <span className="text-[11px] text-slate-400">{a.year}</span>}
                        </div>
                        {a.description && <p className="text-[12px] text-slate-500 mt-1 line-clamp-2">{a.description}</p>}
                      </div>
                    </div>
                  ))}
                  <Link href={`/admin/colleges/achievements?slug=${college.slug}`} className="block text-center text-xs font-bold text-blue-600 hover:text-blue-700 pt-1 transition-colors">
                    Manage all achievements →
                  </Link>
                </div>
              )}
            </Card>

            {/* Section 8 — Courses */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <SectionHeading icon="menu_book" title={`Courses (${coursesList.length})`} />
                <Link
                  href={`/admin/colleges/courses?collegeId=${cp.id || cp._id.toString()}`}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  Manage
                </Link>
              </div>
              {coursesList.length === 0 ? (
                <p className="text-sm text-slate-400">No courses added yet.</p>
              ) : (
                <div className="space-y-2">
                  {coursesList.slice(0, 5).map((c: any) => (
                    <div key={c.id} className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 bg-slate-50">
                      <span className="material-symbols-outlined text-blue-500 text-[16px] shrink-0">menu_book</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-slate-700 truncate">{c.course_name || "—"}</p>
                        <p className="text-[11px] text-slate-400">{c.degree_name || "—"} · {c.stream_name || "—"}</p>
                      </div>
                      {c.fees && <span className="text-[11px] font-semibold text-slate-500 shrink-0">₹{Number(c.fees).toLocaleString()}</span>}
                    </div>
                  ))}
                  {coursesList.length > 5 && (
                    <p className="text-[11px] text-slate-400 text-center pt-1">+ {coursesList.length - 5} more</p>
                  )}
                  <Link href={`/admin/colleges/courses?collegeId=${cp.id || cp._id.toString()}`} className="block text-center text-xs font-bold text-blue-600 hover:text-blue-700 pt-2 transition-colors">
                    Manage all courses →
                  </Link>
                </div>
              )}
            </Card>

            {/* Section 9 — Facilities */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <SectionHeading icon="apartment" title={`Facilities (${facilitiesList.length})`} />
                <Link
                  href={`/admin/colleges/facilities?collegeId=${cp.id || cp._id.toString()}`}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  Manage
                </Link>
              </div>
              {facilitiesList.length === 0 ? (
                <p className="text-sm text-slate-400">No facilities added yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {facilitiesList.map((f: any) => (
                    <span key={f.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-[12px] font-semibold text-slate-700">
                      <span className="material-symbols-outlined text-[#FF3C3C] text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      {f.name}
                    </span>
                  ))}
                </div>
              )}
            </Card>

            {/* Section 10 — Events */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <SectionHeading icon="event" title={`Events (${eventsList.length})`} />
                <Link
                  href={`/admin/colleges/events?collegeId=${cp.id || cp._id.toString()}`}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  Manage
                </Link>
              </div>
              {eventsList.length === 0 ? (
                <p className="text-sm text-slate-400">No events added yet.</p>
              ) : (
                <div className="space-y-2">
                  {eventsList.map((e: any) => (
                    <div key={e.id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50">
                      <span className="material-symbols-outlined text-[#FF3C3C] text-[18px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>event</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-700 truncate">{e.name}</p>
                        <div className="flex flex-wrap gap-2 mt-0.5">
                          {e.datetime && <span className="text-[11px] text-slate-400">{new Date(e.datetime).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>}
                          {e.venue && <span className="text-[11px] text-slate-400">{e.venue}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                  <Link href={`/admin/colleges/events?collegeId=${cp.id || cp._id.toString()}`} className="block text-center text-xs font-bold text-blue-600 hover:text-blue-700 pt-1 transition-colors">
                    Manage all events →
                  </Link>
                </div>
              )}
            </Card>

            {/* Section 11 — Scholarships */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <SectionHeading icon="payments" title={`Scholarships (${scholarshipsList.length})`} />
                <Link
                  href={`/admin/colleges/scholarships?collegeId=${cp.id || cp._id.toString()}`}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  Manage
                </Link>
              </div>
              {scholarshipsList.length === 0 ? (
                <p className="text-sm text-slate-400">No scholarships added yet.</p>
              ) : (
                <div className="space-y-2">
                  {scholarshipsList.map((s: any) => (
                    <div key={s.id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50">
                      <span className="material-symbols-outlined text-green-600 text-[18px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-700 truncate">{s.title}</p>
                        {s.description && <p className="text-[12px] text-slate-400 mt-0.5 line-clamp-1">{s.description}</p>}
                      </div>
                    </div>
                  ))}
                  <Link href={`/admin/colleges/scholarships?collegeId=${cp.id || cp._id.toString()}`} className="block text-center text-xs font-bold text-blue-600 hover:text-blue-700 pt-1 transition-colors">
                    Manage all scholarships →
                  </Link>
                </div>
              )}
            </Card>

            {/* Section 12 — Placements */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <SectionHeading icon="work" title="Placements" />
                <Link
                  href={`/admin/colleges/placements?collegeId=${cp.id || cp._id.toString()}`}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  Manage
                </Link>
              </div>
              {!placementData ? (
                <p className="text-sm text-slate-400">No placement data added yet.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Recruiting Companies", value: placementData.numberofrecruitingcompany },
                    { label: "Placements Last Year", value: placementData.numberofplacementlastyear },
                    { label: "Highest CTC", value: placementData.ctchighest },
                    { label: "Lowest CTC", value: placementData.ctclowest },
                    { label: "Average CTC", value: placementData.ctcaverage },
                  ].map(({ label, value }) => value ? (
                    <div key={label} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                      <p className="text-sm font-bold text-slate-700 mt-0.5">{String(value)}</p>
                    </div>
                  ) : null)}
                </div>
              )}
            </Card>

            {/* Section 13 — Letters */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <SectionHeading icon="description" title={`Letters & Accreditations (${lettersList.length})`} />
              </div>
              {lettersList.length === 0 ? (
                <p className="text-sm text-slate-400">No letters uploaded yet.</p>
              ) : (
                <div className="space-y-2">
                  {lettersList.map((l: any) => {
                    const isPdf = l.file_type === "application/pdf";
                    const url = String(l.file_url ?? "");
                    return (
                      <div key={l._id?.toString()} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50">
                        <span className="material-symbols-outlined text-[18px] shrink-0" style={{ color: isPdf ? "#FF3C3C" : "#4A6CF7", fontVariationSettings: "'FILL' 1" }}>
                          {isPdf ? "picture_as_pdf" : "image"}
                        </span>
                        <p className="text-sm font-bold text-slate-700 flex-1 truncate">{l.title}</p>
                        {url && (
                          <a href={url} target="_blank" rel="noopener noreferrer"
                            className="text-[11px] font-bold text-blue-600 hover:underline shrink-0">View</a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Section 14 — Sports & Activities */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <SectionHeading icon="sports_soccer" title={`Sports & Activities (${sportsList.length})`} />
                <Link
                  href={`/admin/colleges/sports?collegeId=${cp.id || cp._id.toString()}`}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  Manage
                </Link>
              </div>
              {sportsList.length === 0 ? (
                <p className="text-sm text-slate-400">No activities added yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {sportsList.map((a: any) => (
                    <span key={a.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-[12px] font-semibold text-slate-700">
                      <span className="text-[10px] text-slate-400">{a.typeOfActivity}</span>
                      <span className="text-slate-300">·</span>
                      {a.name}
                    </span>
                  ))}
                </div>
              )}
            </Card>

            {/* Section 15 — Cut Offs */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <SectionHeading icon="assignment" title={`Cut Offs (${cutoffsList.length})`} />
                <Link
                  href={`/admin/colleges/cut-offs?collegeId=${cp.id || cp._id.toString()}`}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  Manage
                </Link>
              </div>
              {cutoffsList.length === 0 ? (
                <p className="text-sm text-slate-400">No cut-off entries added yet.</p>
              ) : (
                <div className="space-y-2">
                  {cutoffsList.map((c: any) => (
                    <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50">
                      <span className="material-symbols-outlined text-orange-500 text-[18px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>assignment</span>
                      <p className="text-sm font-bold text-slate-700 truncate">{c.title}</p>
                    </div>
                  ))}
                  <Link href={`/admin/colleges/cut-offs?collegeId=${cp.id || cp._id.toString()}`} className="block text-center text-xs font-bold text-blue-600 hover:text-blue-700 pt-1 transition-colors">
                    Manage all cut-offs →
                  </Link>
                </div>
              )}
            </Card>

            {/* Section 16 — Faculties */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <SectionHeading icon="groups" title={`Faculties (${facultyList.length})`} />
                <Link
                  href={`/admin/colleges/faculty?collegeId=${cp.id || cp._id.toString()}`}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  Manage
                </Link>
              </div>
              {facultyList.length === 0 ? (
                <p className="text-sm text-slate-400">No faculty members added yet.</p>
              ) : (
                <div className="space-y-3">
                  {facultyList.map((f: any) => (
                    <div key={f.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                      <div className="w-10 h-10 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0">
                        {f.imagename ? (
                          <img 
                            src={f.imagename.startsWith("http") ? f.imagename : `${IMAGE_BASE}${f.imagename}`} 
                            alt={f.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-red-100 text-red-600 font-bold text-xs">
                            {String(f.name || "F").charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-slate-700 truncate">
                          {f.suffix ? `${f.suffix} ` : ""}{f.name}
                        </p>
                        <p className="text-[11px] text-red-600 font-semibold truncate">{f.designation || "Faculty"}</p>
                      </div>
                    </div>
                  ))}
                  <Link href={`/admin/colleges/faculty?collegeId=${cp.id || cp._id.toString()}`} className="block text-center text-xs font-bold text-blue-600 hover:text-blue-700 pt-1 transition-colors">
                    Manage all faculties →
                  </Link>
                </div>
              )}
            </Card>

            {/* Section 17 — FAQs */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <SectionHeading icon="quiz" title={`FAQs (${faqsList.length})`} />
                <Link
                  href={`/admin/colleges/faqs?collegeId=${cp.id || cp._id.toString()}`}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  Manage
                </Link>
              </div>
              {faqsList.length === 0 ? (
                <p className="text-sm text-slate-400">No FAQs added yet. <Link href={`/admin/colleges/faqs?collegeId=${cp.id || cp._id.toString()}`} className="text-blue-600 font-semibold hover:underline">Add one →</Link></p>
              ) : (
                <div className="space-y-2">
                  {faqsList.slice(0, 5).map((f: any) => (
                    <div key={f._id.toString()} className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                      <p className="text-[13px] font-bold text-slate-700 leading-snug">{f.question}</p>
                      {f.answer && <p className="text-[12px] text-slate-400 mt-1 line-clamp-2">{f.answer}</p>}
                    </div>
                  ))}
                  {faqsList.length > 5 && (
                    <p className="text-[11px] text-slate-400 text-center pt-1">+ {faqsList.length - 5} more</p>
                  )}
                  <Link href={`/admin/colleges/faqs?collegeId=${cp.id || cp._id.toString()}`} className="block text-center text-xs font-bold text-blue-600 hover:text-blue-700 pt-1 transition-colors">
                    Manage all FAQs →
                  </Link>
                </div>
              )}
            </Card>

          </div>
          <div className="w-full xl:w-96 flex-shrink-0 space-y-5 xl:sticky xl:top-6">

            <Card>
              <SectionHeading icon="tune" title="Profile Settings" />

              {/* Hero Banner Section */}
              <div className="mb-4">
                <ImageUpload
                  name="bannerimage_file"
                  label="Hero Banner Image"
                  initialImage={bannerUrl || null}
                  existingName="bannerimage_existing"
                />
              </div>

              {/* Stats Section Background */}
              <div className="mb-4">
                <ImageUpload
                  name="mosaic1_file"
                  label="Stats Section Background"
                  initialImage={college.mosaic1 ? buildImageUrl(college.mosaic1) : null}
                  existingName="mosaic1_existing"
                />
              </div>

              {/* About Us Mosaic Section */}
              <div className="pt-2 border-t border-white/5 space-y-3 mb-4">
                <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">About Us Images (3 Units)</p>
                <div className="space-y-3">
                  <ImageUpload
                    name="mosaic2_file"
                    label="About Image 1 (Large - Vertical)"
                    initialImage={college.mosaic2 ? buildImageUrl(college.mosaic2) : null}
                    existingName="mosaic2_existing"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <ImageUpload
                      name="mosaic3_file"
                      label="About Image 2"
                      initialImage={college.mosaic3 ? buildImageUrl(college.mosaic3) : null}
                      existingName="mosaic3_existing"
                    />
                    <ImageUpload
                      name="mosaic4_file"
                      label="About Image 3"
                      initialImage={college.mosaic4 ? buildImageUrl(college.mosaic4) : null}
                      existingName="mosaic4_existing"
                    />
                  </div>
                </div>
              </div>

              {/* Logo image upload */}
              <div className="mb-5">
                <ImageUpload
                  name="logoimage_file"
                  label="Logo Image"
                  initialImage={college.logoimage ? buildImageUrl(college.logoimage) : null}
                  existingName="logoimage_existing"
                />
              </div>

              {/* Gallery */}
              {galleryImages.length > 0 && (
                <div className="mb-5 pt-3 border-t border-slate-100">
                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3">
                    Gallery ({galleryImages.length} photos)
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {galleryImages.map((img: any, idx: number) => {
                      const src = String(img.fullimage ?? "");
                      const url = src.startsWith("http") || src.startsWith("/") ? src : `${IMAGE_BASE}${src}`;
                      return (
                        <a key={img.id ?? idx} href={url} target="_blank" rel="noopener noreferrer" className="block aspect-square rounded-lg overflow-hidden border border-slate-100 hover:opacity-80 transition-opacity">
                          <img src={url} alt={String(img.name ?? "")} className="w-full h-full object-cover" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
              {galleryImages.length === 0 && (
                <div className="mb-5 pt-3 border-t border-slate-100">
                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">Gallery</p>
                  <p className="text-xs text-slate-400">No gallery images uploaded yet.</p>
                </div>
              )}

              {/* Read-only identity */}
              <div className="px-3 py-3 bg-slate-50 rounded-xl border border-slate-100 mb-5 space-y-1">
                <p className="text-sm font-black text-slate-800 truncate">
                  {college.college_name}
                </p>
                <p className="text-[11px] text-[#008080] font-mono truncate">
                  /{college.slug}
                </p>
                {email && (
                  <p className="text-[11px] text-slate-400 truncate">{email}</p>
                )}
                {(college.rating ?? 0) > 0 && (
                  <p className="text-[11px] text-amber-600 font-bold">
                    ★ {Number(college.rating).toFixed(1)} ({college.totalRatingUser ?? 0} reviews)
                  </p>
                )}
              </div>

              {/* Ranking */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div>
                  <label className={labelCls}>Ranking</label>
                  <input
                    type="number"
                    name="ranking"
                    defaultValue={college.ranking ?? ""}
                    className={inputCls}
                    placeholder="e.g. 42"
                  />
                </div>
                <div>
                  <label className={labelCls}>Top Univ. Rank</label>
                  <input
                    type="number"
                    name="topUniversityRank"
                    defaultValue={college.topUniversityRank ?? ""}
                    className={inputCls}
                    placeholder="e.g. 5"
                  />
                </div>
              </div>

              {/* Toggle flags */}
              <div className="space-y-2">
                <ToggleRow name="verified"        label="Verified"          checked={college.verified} />
                <ToggleRow name="isTopUniversity" label="Top University"    checked={college.isTopUniversity} />
                <ToggleRow name="isShowOnHome"    label="Show on Home"      checked={college.isShowOnHome} />
                <ToggleRow name="isShowOnTop"     label="Show on Top"       checked={college.isShowOnTop} />
                <ToggleRow name="CCTVSurveillance" label="CCTV Surveillance" checked={college.CCTVSurveillance} />
                <ToggleRow name="ACCampus"        label="AC Campus"         checked={college.ACCampus} />
              </div>
            </Card>

            {/* Bottom save */}
            <button
              type="submit"
              className="w-full h-11 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-black hover:bg-slate-100 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <span
                className="material-symbols-outlined text-[17px]"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 20" }}
              >
                save
              </span>
              Save Changes
            </button>

            {/* Section 12 — Recent Transactions */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <SectionHeading icon="payments" title={`Recent Transactions (${transactionsList.length}+)`} />
                <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">Payments</span>
              </div>
              {transactionsList.length === 0 ? (
                <p className="text-sm text-slate-400">No successful transactions found for this college.</p>
              ) : (
                <div className="space-y-3">
                  {transactionsList.map((txn: any) => (
                    <div key={txn._id.toString()} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 group hover:border-emerald-200 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-slate-700 truncate">{txn.student_name || "Unknown Student"}</p>
                          <p className="text-[11px] text-slate-400 font-medium font-mono">{txn.transaction_id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-emerald-600">₹{Number(txn.amount_paid).toLocaleString()}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(txn.updated_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                  <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest pt-1">Showing last 5 payments</p>
                </div>
              )}
            </Card>

          </div>
        </div>
      </form>
    </div>
  );
}
