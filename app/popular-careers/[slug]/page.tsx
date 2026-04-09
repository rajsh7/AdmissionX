import { getDb } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

// --- Constants ----------------------------------------------------------------

const IMAGE_BASE = "https://admin.admissionx.in/uploads/";
const DEFAULT_CAREER_IMAGE =
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1200";

// --- Helpers ------------------------------------------------------------------

function buildImageUrl(raw: string | null | undefined): string {
  if (!raw || raw.trim() === "") return DEFAULT_CAREER_IMAGE;
  if (raw.startsWith("http")) return raw;
  return `${IMAGE_BASE}${raw}`;
}

function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function parseBulletList(raw: string | null | undefined): string[] {
  if (!raw) return [];
  const stripped = stripHtml(raw);
  return stripped
    .split(/[\n\r]+/)
    .flatMap((line) => line.split(/\s*;\s*/))
    .map((s) => s.replace(/^[-–•*\d]+[.)]\s*/, "").trim())
    .filter((s) => s.length > 1);
}

function renderParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}


// --- Types --------------------------------------------------------------------

interface CareerDetailRow {
  id: number;
  title: string;
  description: string | null;
  image: string | null;
  jobProfileDesc: string | null;
  totalLikes: number;
  pros: string | null;
  cons: string | null;
  futureGrowthPurpose: string | null;
  employeeOpportunities: string | null;
  studyMaterial: string | null;
  whereToStudy: string | null;
  slug: string;
  purpose_desc: string | null;
  eligibility: string | null;
  qualification: string | null;
  other_details: string | null;
  functionalarea_id: number | null;
  stream_name: string | null;
  stream_slug: string | null;
}

interface JobRoleRow {
  id: number;
  title: string;
  avgSalery: string | null;
  topCompany: string | null;
}

interface SkillRow {
  id: number;
  title: string;
}

interface WhereToStudyRow {
  id: number;
  instituteName: string | null;
  instituteUrl: string | null;
  city: string | null;
  programmeFees: string | null;
}

interface RelatedCareerRow {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  image: string | null;
  stream_name: string | null;
  stream_slug: string | null;
}

// --- Skill chip colour palette ------------------------------------------------

const SKILL_COLORS = [
  "text-blue-700 bg-blue-50 border-blue-200",
  "text-indigo-700 bg-indigo-50 border-indigo-200",
  "text-purple-700 bg-purple-50 border-purple-200",
  "text-teal-700 bg-teal-50 border-teal-200",
  "text-cyan-700 bg-cyan-50 border-cyan-200",
  "text-emerald-700 bg-emerald-50 border-emerald-200",
  "text-amber-700 bg-amber-50 border-amber-200",
  "text-rose-700 bg-rose-50 border-rose-200",
];

// --- Metadata -----------------------------------------------------------------

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const db = await getDb();
  const career = await db.collection("counseling_career_details").findOne({ slug, status: 1 }, { projection: { title: 1, description: 1, jobProfileDesc: 1, functionalarea_id: 1 } });
  if (!career) return { title: "Career Not Found — AdmissionX" };
  const fa = career.functionalarea_id ? await db.collection("functionalarea").findOne({ id: career.functionalarea_id }, { projection: { name: 1 } }) : null;
  const desc = stripHtml(career.description || career.jobProfileDesc).slice(0, 160);
  const stream = fa?.name ? ` in ${fa.name}` : "";
  return {
    title: `${career.title} — Career Profile | AdmissionX`,
    description: desc || `Explore the ${career.title} career path${stream}.`,
    openGraph: { title: `${career.title} | AdmissionX`, description: desc },
  };
}
export default async function CareerDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();

  const careerDoc = await db.collection("counseling_career_details").findOne({ slug, status: 1 });
  if (!careerDoc) notFound();

  const fa = careerDoc.functionalarea_id
    ? await db.collection("functionalarea").findOne({ id: careerDoc.functionalarea_id }, { projection: { id: 1, name: 1, pageslug: 1 } })
    : null;

  const [jobRoleDocs, skillDocs, whereToStudyDocs, relatedDocs] = await Promise.all([
    db.collection("counseling_career_job_role_saleries").find({ careerDetailsId: careerDoc.id }).sort({ id: 1 }).toArray(),
    db.collection("counseling_career_skill_requirements").find({ careerDetailsId: careerDoc.id }).sort({ id: 1 }).toArray(),
    db.collection("counseling_career_where_to_studies").find({ careerDetailsId: careerDoc.id }).sort({ id: 1 }).toArray(),
    careerDoc.functionalarea_id
      ? db.collection("counseling_career_details").find({ functionalarea_id: careerDoc.functionalarea_id, id: { $ne: careerDoc.id }, status: 1 }).sort({ totalLikes: -1 }).limit(4).toArray()
      : Promise.resolve([]),
  ]);

  const career: CareerDetailRow = {
    id: careerDoc.id, title: careerDoc.title, description: careerDoc.description ?? null,
    image: careerDoc.image ?? null, jobProfileDesc: careerDoc.jobProfileDesc ?? null,
    totalLikes: Number(careerDoc.totalLikes) || 0, pros: careerDoc.pros ?? null, cons: careerDoc.cons ?? null,
    futureGrowthPurpose: careerDoc.futureGrowthPurpose ?? null, employeeOpportunities: careerDoc.employeeOpportunities ?? null,
    studyMaterial: careerDoc.studyMaterial ?? null, whereToStudy: careerDoc.whereToStudy ?? null, slug: careerDoc.slug,
    purpose_desc: careerDoc.purpose_desc ?? null, eligibility: careerDoc.eligibility ?? null,
    qualification: careerDoc.qualification ?? null, other_details: careerDoc.other_details ?? null,
    functionalarea_id: careerDoc.functionalarea_id ?? null,
    stream_name: fa?.name ?? null, stream_slug: fa?.pageslug ?? null,
  };
  const jobRoles: JobRoleRow[] = jobRoleDocs.map((r) => ({ id: r.id, title: r.title, avgSalery: r.avgSalery ?? null, topCompany: r.topCompany ?? null }));
  const skills: SkillRow[] = skillDocs.map((r) => ({ id: r.id, title: r.title }));
  const whereToStudies: WhereToStudyRow[] = whereToStudyDocs.map((r) => ({ id: r.id, instituteName: r.instituteName ?? null, instituteUrl: r.instituteUrl ?? null, city: r.city ?? null, programmeFees: r.programmeFees ?? null }));
  const relatedCareers: RelatedCareerRow[] = relatedDocs.map((r) => ({ id: r.id, title: r.title, slug: r.slug, description: r.description ?? null, image: r.image ?? null, stream_name: fa?.name ?? null, stream_slug: fa?.pageslug ?? null }));

  // -- Derived data ----------------------------------------------------------
  const imgUrl = buildImageUrl(career.image);
  const prosList = parseBulletList(career.pros);
  const consList = parseBulletList(career.cons);

  const aboutRaw = stripHtml(career.description || career.jobProfileDesc);
  const growthRaw = stripHtml(career.futureGrowthPurpose || career.purpose_desc);
  const opportunitiesRaw = stripHtml(career.employeeOpportunities);
  const eligibilityRaw = stripHtml(career.eligibility || career.qualification);
  const otherRaw = stripHtml(career.other_details);

  const streamName = career.stream_name ?? "General";
  const streamHref = `/careers/opportunities/${career.stream_slug ?? streamName.toLowerCase().replace(/\s+/g, "-")}`;

  // -- Section visibility ----------------------------------------------------
  const hasAbout = !!aboutRaw;
  const hasJobRoles = jobRoles.length > 0;
  const hasSkills = skills.length > 0;
  const hasProscons = prosList.length > 0 || consList.length > 0;
  const hasGrowth = !!growthRaw || !!opportunitiesRaw;
  const hasEligibility = !!eligibilityRaw;
  const hasWhereToStudy = whereToStudies.length > 0;
  const hasOther = !!otherRaw;

  const jumpItems = [
    { id: "about",          label: "About",              icon: "info",        show: hasAbout },
    { id: "job-roles",      label: "Job Roles & Salary", icon: "work",        show: hasJobRoles },
    { id: "skills",         label: "Skills Required",    icon: "psychology",  show: hasSkills },
    { id: "pros-cons",      label: "Pros & Cons",        icon: "balance",     show: hasProscons },
    { id: "growth",         label: "Growth Insights",    icon: "trending_up", show: hasGrowth },
    { id: "eligibility",    label: "Eligibility",        icon: "verified",    show: hasEligibility },
    { id: "where-to-study", label: "Where to Study",     icon: "school",      show: hasWhereToStudy },
  ].filter((j) => j.show);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      {/* -- Hero ----------------------------------------------------------- */}
      <div className="relative bg-neutral-900 pt-24 pb-12 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={imgUrl}
            alt={career.title}
            fill
            className="object-cover opacity-[0.18]"
            unoptimized={imgUrl.startsWith("http") && !imgUrl.includes("unsplash")}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/70 via-neutral-900/80 to-neutral-900" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-6 flex-wrap">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <Link href="/popular-careers" className="hover:text-white transition-colors">Popular Careers</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-neutral-300 truncate max-w-[200px]">{career.title}</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-2xl">
              {/* Stream badge */}
              {career.stream_name && (
                <div className="mb-4">
                  <Link
                    href={streamHref}
                    className="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide hover:bg-red-500/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[13px]">work</span>
                    {career.stream_name}
                  </Link>
                </div>
              )}

              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-5">
                {career.title}
              </h1>

              {/* Meta pills */}
              <div className="flex flex-wrap items-center gap-2.5">
                {career.totalLikes > 0 && (
                  <div className="flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-full px-3 py-1.5">
                    <span
                      className="material-symbols-outlined text-[14px] text-red-400"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      favorite
                    </span>
                    <span className="text-xs font-bold text-white">
                      {career.totalLikes.toLocaleString()} likes
                    </span>
                  </div>
                )}
                {hasJobRoles && (
                  <div className="flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-full px-3 py-1.5">
                    <span className="material-symbols-outlined text-[14px] text-emerald-400">payments</span>
                    <span className="text-xs font-bold text-white">
                      {jobRoles.length} Job Role{jobRoles.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
                {hasSkills && (
                  <div className="flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-full px-3 py-1.5">
                    <span className="material-symbols-outlined text-[14px] text-blue-400">psychology</span>
                    <span className="text-xs font-bold text-white">
                      {skills.length} Skill{skills.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
                {hasWhereToStudy && (
                  <div className="flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-full px-3 py-1.5">
                    <span className="material-symbols-outlined text-[14px] text-amber-400">school</span>
                    <span className="text-xs font-bold text-white">
                      {whereToStudies.length} Institute{whereToStudies.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail — desktop only */}
            <div className="hidden lg:block flex-shrink-0">
              <div className="w-52 h-36 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <Image
                  src={imgUrl}
                  alt={career.title}
                  width={208}
                  height={144}
                  className="w-full h-full object-cover"
                  unoptimized={imgUrl.startsWith("http") && !imgUrl.includes("unsplash")}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* -- Jump navigation ------------------------------------------------- */}
      {jumpItems.length > 1 && (
        <div className="bg-white border-b border-neutral-100 shadow-sm sticky top-0 z-30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <nav
              className="flex items-center overflow-x-auto scrollbar-hide"
              aria-label="Career sections"
            >
              {jumpItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="flex items-center gap-1.5 px-4 py-4 text-xs font-bold text-neutral-500 hover:text-red-600 whitespace-nowrap transition-colors shrink-0 border-b-2 border-transparent hover:border-red-300 -mb-px"
                >
                  <span className="material-symbols-outlined text-[15px]">{item.icon}</span>
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* -- Main layout ----------------------------------------------------- */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* -- LEFT / MAIN COLUMN ------------------------------------------ */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* About */}
            {hasAbout && (
              <section
                id="about"
                className="bg-white rounded-2xl border border-neutral-100 p-6 scroll-mt-20"
              >
                <SectionTitle icon="info" title={`About ${career.title}`} />
                <div className="mt-3 text-sm text-neutral-600 leading-relaxed space-y-3">
                  {renderParagraphs(aboutRaw).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </section>
            )}

            {/* Job Roles & Salary */}
            {hasJobRoles && (
              <section
                id="job-roles"
                className="bg-white rounded-2xl border border-neutral-100 overflow-hidden scroll-mt-20"
              >
                <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                  <SectionTitle icon="work" title="Job Roles & Salary" />
                  <span className="text-xs font-semibold text-neutral-400">
                    {jobRoles.length} role{jobRoles.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-neutral-50 text-left">
                        <th className="px-6 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider w-[40%]">
                          Job Role
                        </th>
                        <th className="px-6 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider w-[25%]">
                          Avg. Salary
                        </th>
                        <th className="px-6 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                          Top Companies
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50">
                      {jobRoles.map((role) => (
                        <tr key={role.id} className="hover:bg-neutral-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-[14px] text-red-500">
                                  badge
                                </span>
                              </div>
                              <span className="font-semibold text-neutral-800 text-xs leading-snug">
                                {role.title || "—"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {role.avgSalery ? (
                              <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                                <span className="material-symbols-outlined text-[12px]">payments</span>
                                {role.avgSalery}
                              </span>
                            ) : (
                              <span className="text-xs text-neutral-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-xs text-neutral-600 max-w-[220px]">
                            {role.topCompany || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Skills Required */}
            {hasSkills && (
              <section
                id="skills"
                className="bg-white rounded-2xl border border-neutral-100 p-6 scroll-mt-20"
              >
                <SectionTitle icon="psychology" title="Skills Required" />
                <div className="flex flex-wrap gap-2 mt-4">
                  {skills.map((skill, i) => {
                    const colorCls = SKILL_COLORS[i % SKILL_COLORS.length];
                    return (
                      <span
                        key={skill.id}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${colorCls}`}
                      >
                        <span className="material-symbols-outlined text-[12px]">
                          check_circle
                        </span>
                        {skill.title}
                      </span>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Pros & Cons */}
            {hasProscons && (
              <section
                id="pros-cons"
                className="bg-white rounded-2xl border border-neutral-100 overflow-hidden scroll-mt-20"
              >
                <div className="px-6 py-4 border-b border-neutral-100">
                  <SectionTitle icon="balance" title="Pros & Cons" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-neutral-100">
                  {/* Pros */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <span
                          className="material-symbols-outlined text-[16px] text-emerald-600"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          thumb_up
                        </span>
                      </div>
                      <span className="text-sm font-black text-emerald-700">Pros</span>
                      <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                        {prosList.length}
                      </span>
                    </div>
                    {prosList.length > 0 ? (
                      <ul className="space-y-2.5">
                        {prosList.map((pro, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className="material-symbols-outlined text-[14px] text-emerald-500 mt-0.5 flex-shrink-0">
                              check_circle
                            </span>
                            <span className="text-xs text-neutral-700 leading-relaxed">{pro}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-neutral-400 italic">No pros listed.</p>
                    )}
                  </div>

                  {/* Cons */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                        <span
                          className="material-symbols-outlined text-[16px] text-red-500"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          thumb_down
                        </span>
                      </div>
                      <span className="text-sm font-black text-red-600">Cons</span>
                      <span className="ml-auto text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                        {consList.length}
                      </span>
                    </div>
                    {consList.length > 0 ? (
                      <ul className="space-y-2.5">
                        {consList.map((con, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className="material-symbols-outlined text-[14px] text-red-400 mt-0.5 flex-shrink-0">
                              cancel
                            </span>
                            <span className="text-xs text-neutral-700 leading-relaxed">{con}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-neutral-400 italic">No cons listed.</p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Growth Insights */}
            {hasGrowth && (
              <section
                id="growth"
                className="bg-white rounded-2xl border border-neutral-100 p-6 scroll-mt-20"
              >
                <SectionTitle icon="trending_up" title="Growth Insights" />
                <div className="mt-3 space-y-5">
                  {growthRaw && (
                    <div>
                      <h4 className="flex items-center gap-1.5 text-xs font-black text-indigo-700 uppercase tracking-widest mb-2">
                        <span className="material-symbols-outlined text-[14px]">rocket_launch</span>
                        Future Growth
                      </h4>
                      <div className="text-sm text-neutral-600 leading-relaxed space-y-2">
                        {renderParagraphs(growthRaw).map((para, i) => (
                          <p key={i}>{para}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  {opportunitiesRaw && (
                    <div className={growthRaw ? "pt-5 border-t border-neutral-100" : ""}>
                      <h4 className="flex items-center gap-1.5 text-xs font-black text-amber-700 uppercase tracking-widest mb-2">
                        <span className="material-symbols-outlined text-[14px]">apartment</span>
                        Employee Opportunities
                      </h4>
                      <div className="text-sm text-neutral-600 leading-relaxed space-y-2">
                        {renderParagraphs(opportunitiesRaw).map((para, i) => (
                          <p key={i}>{para}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Eligibility & Qualification */}
            {hasEligibility && (
              <section
                id="eligibility"
                className="bg-white rounded-2xl border border-neutral-100 p-6 scroll-mt-20"
              >
                <SectionTitle icon="verified" title="Eligibility & Qualification" />
                <div className="mt-3 text-sm text-neutral-600 leading-relaxed space-y-2">
                  {renderParagraphs(eligibilityRaw).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </section>
            )}

            {/* Where to Study */}
            {hasWhereToStudy && (
              <section
                id="where-to-study"
                className="bg-white rounded-2xl border border-neutral-100 overflow-hidden scroll-mt-20"
              >
                <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                  <SectionTitle icon="school" title="Where to Study" />
                  <span className="text-xs font-semibold text-neutral-400">
                    {whereToStudies.length} institute{whereToStudies.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-neutral-50 text-left">
                        <th className="px-6 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider w-[35%]">
                          Institute
                        </th>
                        <th className="px-6 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                          City
                        </th>
                        <th className="px-6 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                          Programme Fees
                        </th>
                        <th className="px-6 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider w-20">
                          Link
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50">
                      {whereToStudies.map((inst) => (
                        <tr key={inst.id} className="hover:bg-neutral-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-[14px] text-amber-600">
                                  school
                                </span>
                              </div>
                              <span className="text-xs font-semibold text-neutral-800 leading-snug">
                                {inst.instituteName || "—"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-neutral-600">{inst.city || "—"}</td>
                          <td className="px-6 py-4">
                            {inst.programmeFees ? (
                              <span className="text-xs font-black text-indigo-700">
                                {inst.programmeFees}
                              </span>
                            ) : (
                              <span className="text-xs text-neutral-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {inst.instituteUrl ? (
                              <a
                                href={
                                  inst.instituteUrl.startsWith("http")
                                    ? inst.instituteUrl
                                    : `https://${inst.instituteUrl}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 transition-colors"
                              >
                                Visit
                                <span className="material-symbols-outlined text-[13px]">
                                  open_in_new
                                </span>
                              </a>
                            ) : (
                              <span className="text-xs text-neutral-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Other Details */}
            {hasOther && (
              <section className="bg-white rounded-2xl border border-neutral-100 p-6">
                <SectionTitle icon="info" title="Additional Details" />
                <div className="mt-3 text-sm text-neutral-600 leading-relaxed space-y-2">
                  {renderParagraphs(otherRaw).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* -- RIGHT / SIDEBAR --------------------------------------------- */}
          <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0 space-y-5">

            {/* Quick Facts */}
            <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-neutral-100 flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-[18px] text-red-500"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  fact_check
                </span>
                <h3 className="text-sm font-black text-neutral-800">Quick Facts</h3>
              </div>
              <div className="divide-y divide-neutral-50">
                {[
                  {
                    icon: "work",
                    label: "Stream",
                    value: career.stream_name ?? "General",
                  },
                  {
                    icon: "favorite",
                    label: "Popularity",
                    value:
                      career.totalLikes > 0
                        ? `${career.totalLikes.toLocaleString()} likes`
                        : "N/A",
                  },
                  {
                    icon: "badge",
                    label: "Job Roles",
                    value:
                      jobRoles.length > 0
                        ? `${jobRoles.length} roles listed`
                        : "See job market",
                  },
                  {
                    icon: "school",
                    label: "Institutes",
                    value:
                      whereToStudies.length > 0
                        ? `${whereToStudies.length} listed`
                        : "Multiple options",
                  },
                  {
                    icon: "psychology",
                    label: "Key Skills",
                    value: skills.length > 0 ? `${skills.length} skills` : "Varies",
                  },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="px-5 py-3.5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[15px] text-red-500">
                        {icon}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        {label}
                      </p>
                      <p className="text-xs font-bold text-neutral-700 mt-0.5 truncate">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stream CTA */}
            {career.stream_name && (
              <Link
                href={streamHref}
                className="block bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-5 group hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <span
                      className="material-symbols-outlined text-[20px] text-white"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      work
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-red-200 uppercase tracking-widest">
                      Explore Stream
                    </p>
                    <p className="text-sm font-black text-white">{career.stream_name}</p>
                  </div>
                </div>
                <p className="text-xs text-red-100 leading-relaxed mb-4">
                  Discover more career opportunities in {career.stream_name} — salaries,
                  job roles and top institutes.
                </p>
                <div className="flex items-center gap-1 text-xs font-black text-white group-hover:gap-2 transition-all">
                  View all {career.stream_name} careers
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </div>
              </Link>
            )}

            {/* Related Careers */}
            {relatedCareers.length > 0 && (
              <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-neutral-100 flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-[18px] text-indigo-500"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    auto_awesome
                  </span>
                  <h3 className="text-sm font-black text-neutral-800">Related Careers</h3>
                </div>
                <div className="divide-y divide-neutral-50">
                  {relatedCareers.map((rc) => {
                    const rcImg = buildImageUrl(rc.image);
                    const rcDesc = stripHtml(rc.description);
                    return (
                      <Link
                        key={rc.id}
                        href={`/popular-careers/${rc.slug}`}
                        className="flex items-start gap-3 px-5 py-4 hover:bg-neutral-50 transition-colors group"
                      >
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100">
                          <Image
                            src={rcImg}
                            alt={rc.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            unoptimized={
                              rcImg.startsWith("http") && !rcImg.includes("unsplash")
                            }
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black text-neutral-800 group-hover:text-red-600 transition-colors leading-snug line-clamp-2 mb-1">
                            {rc.title}
                          </p>
                          {rcDesc && (
                            <p className="text-[10px] text-neutral-400 leading-relaxed line-clamp-2">
                              {rcDesc.slice(0, 90)}
                            </p>
                          )}
                        </div>
                        <span className="material-symbols-outlined text-[16px] text-neutral-300 group-hover:text-red-400 transition-colors flex-shrink-0 mt-0.5">
                          arrow_forward_ios
                        </span>
                      </Link>
                    );
                  })}
                </div>
                <div className="px-5 py-4 border-t border-neutral-50">
                  <Link
                    href="/popular-careers"
                    className="flex items-center justify-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
                  >
                    View all careers
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Browse more CTA */}
            <div className="bg-neutral-900 rounded-2xl p-5">
              <h3 className="text-sm font-black text-white mb-2">Explore More Careers</h3>
              <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                Browse all popular career profiles, compare salaries and discover
                the right path for you.
              </p>
              <Link
                href="/popular-careers"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors w-full justify-center"
              >
                <span className="material-symbols-outlined text-[16px]">explore</span>
                Browse All Careers
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* -- Bottom CTA banner ---------------------------------------------------- */}
      <div className="bg-gradient-to-r from-red-600 to-rose-600 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-white font-black text-xl mb-1">
                Ready to start your {career.title} journey?
              </h3>
              <p className="text-red-100 text-sm leading-relaxed max-w-lg">
                Explore top colleges, compare courses, and find the right path for you.
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Link
                href="/popular-careers"
                className="inline-flex items-center gap-2 bg-white text-red-600 hover:bg-red-50 font-bold text-sm px-5 py-3 rounded-xl transition-colors whitespace-nowrap shadow-sm"
              >
                <span className="material-symbols-outlined text-[17px]">work</span>
                All Careers
              </Link>
              <Link
                href="/colleges"
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[17px]">account_balance</span>
                Top Colleges
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// --- SectionTitle -----------------------------------------------------------------------------

function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
        <span
          className="material-symbols-outlined text-[15px] text-red-500"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
      </div>
      <h2 className="text-base font-black text-neutral-800">{title}</h2>
    </div>
  );
}