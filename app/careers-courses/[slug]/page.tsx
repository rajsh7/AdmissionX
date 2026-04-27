import { getDb } from "@/lib/db";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Star, Download, ArrowRight } from "lucide-react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ExploreCards from "@/app/components/ExploreCards";

const DEFAULT_BANNER = "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2532&auto=format&fit=crop";
const STUDENT_IMAGE = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2670&auto=format&fit=crop";

function buildImageUrl(raw: string | null | undefined): string {
  if (!raw || !raw.trim()) return DEFAULT_BANNER;
  if (raw.startsWith("http") || raw.startsWith("/")) return raw;
  return `https://admin.admissionx.in/uploads/${raw}`;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function formatFees(val: number | null): string {
  if (!val || val === 0) return "—";
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
  return `₹${val}`;
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();

  // Fetch the course by pageslug — check course collection first, then degree
  let course = await db.collection("course").findOne({ pageslug: slug });
  let isDegreePage = false;

  if (!course) {
    // Try degree collection (e.g. MBBS, BE/B.Tech)
    const degree = await db.collection("degree").findOne({ pageslug: slug });
    if (!degree) notFound();
    // Build a synthetic course object from degree data
    course = {
      ...degree,
      name: degree.name,
      pagetitle: degree.name,
      pagedescription: degree.pagedescription || degree.description || "",
      degree_id: degree.id,
      functionalarea_id: degree.functionalarea_id || null,
      bannerimage: degree.bannerimage || degree.logoimage || null,
      logoimage: degree.logoimage || null,
    };
    isDegreePage = true;
  }

  // Fetch degree and stream in parallel
  const [degreeDoc, stream, cmRows] = await Promise.all([
    course.degree_id ? db.collection("degree").findOne({ id: course.degree_id }, { projection: { name: 1 } }) : null,
    course.functionalarea_id ? db.collection("functionalarea").findOne({ id: course.functionalarea_id }, { projection: { name: 1 } }) : null,
    db.collection("collegemaster")
      .find(isDegreePage
        ? { degree_id: course.degree_id }
        : { functionalarea_id: course.functionalarea_id, degree_id: course.degree_id }
      )
      .limit(200)
      .project({ fees: 1, courseduration: 1 })
      .toArray(),
  ]);

  const degree = isDegreePage ? course : degreeDoc;

  // Derive stats from collegemaster
  const fees = cmRows.map((r) => Number(r.fees)).filter((f) => f > 0);
  const avgFees = fees.length ? Math.round(fees.reduce((a, b) => a + b, 0) / fees.length) : null;
  const durations = cmRows.map((r) => String(r.courseduration || "").trim()).filter(Boolean);
  const duration = durations[0] || "—";

  const title = course.name || course.pagetitle || "Course";
  const rawDescription = course.pagedescription || "";
  const description = stripHtml(rawDescription);
  const heroImage = buildImageUrl(course.bannerimage || course.logoimage);
  const degreeLevel = degree?.name || "Undergraduate";
  const streamName = stream?.name || "";

  // Fetch related courses in the same stream (specializations)
  const relatedCourses = await db.collection("course")
    .find(isDegreePage
      ? { degree_id: course.degree_id, pageslug: { $exists: true, $ne: "" } }
      : {
          functionalarea_id: course.functionalarea_id,
          pageslug: { $nin: [slug, ""], $exists: true },
        }
    )
    .limit(6)
    .project({ name: 1, pageslug: 1, logoimage: 1, bannerimage: 1 })
    .toArray();

  return (
    <main className="min-h-screen bg-[#F8F9FB]">
      <Header />
      {/* --- Hero Section -------------------------------------------------------- */}
      <section className="pt-24 pb-12 px-4 sm:px-8 lg:px-12">
        <div className="max-w-[1920px] mx-auto">
          <div
            style={{
              backgroundImage: "url('/Background-images/f0b10acfd1d98e25c40741fa92c81454f3557e55.png')",
              backgroundSize: "cover",
              backgroundPosition: "right",
              minHeight: "400px"
            }}
            className="rounded-[5px] border border-slate-100 overflow-hidden relative flex flex-col lg:flex-row lg:items-stretch shadow-sm"
          >
            {/* Left Side Content */}
            <div className="flex-1 p-8 lg:p-12 xl:p-16 flex flex-col justify-center relative z-10">
              <div className="flex flex-col gap-6">
                <h1 className="text-[45px] font-bold text-slate-900 leading-[1.1] tracking-tight">
                  {title}
                </h1>

                {/* Metadata Badges + CTA — same width column */}
                <div className="flex flex-col gap-4 w-fit">
                  {/* Metadata Badges */}
                  <div className="flex items-center gap-5 px-6 py-3.5 rounded-[5px] bg-white/80 border border-slate-100 shadow-sm">
                    {[degreeLevel, duration, streamName].filter(Boolean).map((tag, i, arr) => (
                      <span key={tag} className="flex items-center gap-5 text-[16px] font-semibold" style={{ color: "rgba(0, 81, 68, 0.75)" }}>
                        {tag}
                        <span className="w-px h-5 bg-slate-300" />
                      </span>
                    ))}
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex gap-4">
                    <button className="flex-1 py-3 px-8 bg-[#FF3C3C] text-white rounded-[5px] font-bold text-base hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-red-500/20">
                      Apply Now
                    </button>
                    <button className="flex-1 py-3 px-8 bg-white border-2 border-[#FF3C3C] text-[#FF3C3C] rounded-[5px] font-bold text-base hover:bg-red-50 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm">
                      <Download className="w-4 h-4" />
                      Download Brochure
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side Image */}
            <div className="w-full lg:w-[45%] min-h-[300px] lg:min-h-full relative">
              <Image
                src={heroImage}
                alt={title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
            </div>

          </div>
        </div>
      </section>

      {/* ─── Stats Bar ────────────────────────────────────────────────────────── */}
      <section className="pb-16 px-4 sm:px-8 lg:px-12">
        <div className="max-w-[1920px] mx-auto">
          <div className="bg-white rounded-[5px] border border-neutral-200 p-8 grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 divide-x lg:divide-y-0 divide-y divide-neutral-400 shadow-xl shadow-slate-200/60">
            <StatItem label="Duration" value={duration} />
            <StatItem label="Fees" value={avgFees ? formatFees(avgFees) : "—"} suffix={avgFees ? "/year" : undefined} />
            <StatItem label="Placement Rate" value="94%" />
            <StatItem label="Median Salary" value="8.5 LPA" />
          </div>
        </div>
      </section>

      {/* --- Course Overview ---------------------------------------------------- */}
      {description && (
        <section className="pb-24 px-4 sm:px-8 lg:px-12">
          <div className="max-w-[1920px] mx-auto">
            <div className="bg-white rounded-[5px] p-4 lg:p-6 border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/60">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* Image */}
                <div className="lg:col-span-4 relative">
                  <div className="aspect-[16/10] rounded-[5px] overflow-hidden relative">
                    <Image
                      src={STUDENT_IMAGE}
                      alt="Student Overview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  </div>
                </div>

                {/* Text Content */}
                <div className="lg:col-span-8 flex flex-col gap-4">
                  <h2 className="text-[45px] font-bold text-slate-900 leading-tight">
                    Course Overview
                  </h2>
                  <div className="space-y-4">
                    <p className="text-[17px] font-normal leading-relaxed" style={{ color: "rgba(62, 62, 62, 1)" }}>
                      {description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --- Related Courses / Specializations ---------------------------------- */}
      {relatedCourses.length > 0 && (
        <section className="pb-32 px-4 sm:px-8 lg:px-12">
          <div className="max-w-[1920px] mx-auto">
            <h2 className="text-[32px] font-bold text-slate-900 mb-12">
              Specializations in course
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedCourses.map((c) => (
                <Link key={String(c._id)} href={`/careers-courses/${c.pageslug}`} className="group h-full">
                  <div className="bg-white rounded-[5px] p-2 pb-3 border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden h-full flex flex-col shadow-xl shadow-slate-200/60">
                    <div className="relative aspect-[16/10] rounded-[5px] overflow-hidden mb-2">
                      <Image
                        src={buildImageUrl(c.bannerimage || c.logoimage)}
                        alt={c.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                    </div>
                    <h3 className="text-[20px] font-medium text-center px-4" style={{ color: "rgba(62, 62, 62, 0.71)" }}>
                      {c.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Explore Cards */}
      <section className="pb-16 px-4 sm:px-8 lg:px-12">
        <div className="max-w-[1920px] mx-auto">
          <ExploreCards />
        </div>
      </section>

      <Footer />
    </main>
  );
}

function StatItem({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-4">
      <div className="flex items-baseline gap-1">
        <span className="text-[28px] font-bold text-[#3e3e3e] leading-tight">
          {value}
        </span>
        {suffix && <span className="text-slate-400 font-semibold">{suffix}</span>}
      </div>
      <span className="text-[20px] font-semibold uppercase tracking-wide" style={{ color: "rgba(62, 62, 62, 0.71)" }}>
        {label}
      </span>
    </div>
  );
}
