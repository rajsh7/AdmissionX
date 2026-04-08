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

  const $set: Record<string, unknown> = {
    ...(bannerimage ? { bannerimage } : {}),
    ...(logoimage   ? { logoimage }   : {}),
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
  revalidatePath(`/college/${slug}`, "page");
  revalidatePath("/top-colleges", "page");
  revalidatePath("/top-university", "page");
  redirect("/admin/colleges/profile");
}

// ─── Style helpers ─────────────────────────────────────────────────────────────

const inputCls =
  "w-full h-10 px-4 border border-slate-200 rounded-xl text-sm font-medium bg-white " +
  "focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/10 transition-all " +
  "placeholder:text-slate-300 text-slate-700";

const textareaCls =
  "w-full min-h-[120px] px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium bg-white " +
  "focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/10 transition-all " +
  "resize-none placeholder:text-slate-300 text-slate-700";

const labelCls =
  "text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block";

// ─── Sub-components ────────────────────────────────────────────────────────────

function buildImageUrl(raw: string | null | undefined): string {
  if (!raw) return "";
  if (typeof raw === "string" && (raw.startsWith("http") || raw.startsWith("/")))
    return raw;
  return `${IMAGE_BASE}${raw}`;
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}

function SectionHeading({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <span className="w-1 h-4 bg-[#008080] rounded-full block flex-shrink-0" />
      <span
        className="material-symbols-outlined text-[18px] text-[#008080]"
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
        <div className="w-10 h-5 bg-slate-200 rounded-full peer-checked:bg-[#008080] transition-colors duration-200" />
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
    city_name:              cityName,
  };

  const bannerUrl = college.bannerimage ? buildImageUrl(college.bannerimage) : null;

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-8">
      <form action={updateCollegeProfile} encType="multipart/form-data">
        <input type="hidden" name="slug" value={college.slug} />

        {/* ── Header ── */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/admin/colleges/profile"
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all text-slate-500 hover:text-slate-700 flex-shrink-0"
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              chevron_left
            </span>
          </Link>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-slate-800 leading-tight tracking-tight">
              Edit College Profile
            </h1>
            <p className="text-sm text-slate-400 font-medium mt-0.5 truncate">
              {college.college_name}
            </p>
          </div>

          <button
            type="submit"
            className="h-10 px-6 rounded-xl bg-[#008080] text-white text-sm font-black hover:bg-[#006666] active:bg-[#005555] transition-colors shadow-md shadow-[#008080]/25 flex items-center gap-2 flex-shrink-0"
          >
            <span
              className="material-symbols-outlined text-[17px]"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 20" }}
            >
              save
            </span>
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
                  <input
                    type="url"
                    name="facebookurl"
                    defaultValue={college.facebookurl ?? ""}
                    className={inputCls}
                    placeholder="https://facebook.com/collegepage"
                  />
                </div>
                <div>
                  <label className={labelCls}>Twitter / X URL</label>
                  <input
                    type="url"
                    name="twitterurl"
                    defaultValue={college.twitterurl ?? ""}
                    className={inputCls}
                    placeholder="https://twitter.com/collegepage"
                  />
                </div>
              </div>
            </Card>

          </div>

          {/* ── Right column (sticky) ── */}
          <div className="w-full xl:w-96 flex-shrink-0 space-y-5 xl:sticky xl:top-6">

            <Card>
              <SectionHeading icon="tune" title="Profile Settings" />

              {/* Banner image upload */}
              <div className="mb-4">
                <ImageUpload
                  name="bannerimage_file"
                  label="Banner / Background Image"
                  initialImage={bannerUrl || null}
                  existingName="bannerimage_existing"
                />
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
              className="w-full h-11 rounded-xl bg-[#008080] text-white text-sm font-black hover:bg-[#006666] active:bg-[#005555] transition-colors shadow-md shadow-[#008080]/25 flex items-center justify-center gap-2"
            >
              <span
                className="material-symbols-outlined text-[17px]"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 20" }}
              >
                save
              </span>
              Save Changes
            </button>

          </div>
        </div>
      </form>
    </div>
  );
}
