import { getDb } from "@/lib/db";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Star, Download, ArrowRight } from "lucide-react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

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

  // Fetch the course by pageslug
  const course = await db.collection("course").findOne({ pageslug: slug });
  if (!course) notFound();

  // Fetch degree and stream in parallel
  const [degree, stream, cmRows] = await Promise.all([
    course.degree_id ? db.collection("degree").findOne({ id: course.degree_id }, { projection: { name: 1 } }) : null,
    course.functionalarea_id ? db.collection("functionalarea").findOne({ id: course.functionalarea_id }, { projection: { name: 1 } }) : null,
    // Get collegemaster rows for this course to derive stats
    db.collection("collegemaster")
      .find({ functionalarea_id: course.functionalarea_id, degree_id: course.degree_id })
      .limit(200)
      .project({ fees: 1, courseduration: 1 })
      .toArray(),
  ]);

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
    .find({
      functionalarea_id: course.functionalarea_id,
      pageslug: { $ne: slug, $exists: true, $ne: "" },
    })
    .limit(6)
    .project({ name: 1, pageslug: 1, logoimage: 1, bannerimage: 1 })
    .toArray();

  return (
    <main className="min-h-screen bg-[#F8F9FB]">
      <Header />

      {/* --- Hero Section -------------------------------------------------------- */}
      <section className="pt-24 pb-12 px-6 sm:px-12 lg:px-24">
        <div className="max-w-[1920px] mx-auto">
          <div
            className="rounded-[5px] p-8 lg:p-12 border border-slate-100 overflow-hidden relative"
            style={{
              backgroundImage: "url('/Background-images/f0b10acfd1d98e25c40741fa92c81454f3557e55.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

              {/* Left Side Content */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <h1 className="text-[32px] font-bold text-slate-900 leading-[1.1] tracking-tight">
                  {title}
                </h1>

                {/* Metadata Badges + CTA — same width column */}
                <div className="flex flex-col gap-4 w-fit">
                  {/* Metadata Badges */}
                  <div className="flex items-center gap-5 px-6 py-3.5 rounded-[5px] bg-white/80 border border-slate-100">
                    {[degreeLevel, duration, streamName].filter(Boolean).map((tag, i, arr) => (
                      <span key={tag} className="flex items-center gap-5 text-[16px] font-semibold" style={{ color: "rgba(0, 81, 68, 0.75)" }}>
                        {tag}
                        {i < arr.length - 1 && <span className="w-px h-5 bg-slate-300" />}
                      </span>
                    ))}
                    <span className="w-px h-5 bg-slate-300" />
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex gap-4">
                    <button className="flex-1 py-2.5 bg-[#FF3C3C] text-white rounded-[5px] font-bold text-base hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-red-200">
                      Apply Now
                    </button>
                    <button className="flex-1 py-2.5 bg-white border-2 border-[#FF3C3C] text-[#FF3C3C] rounded-[5px] font-bold text-base hover:bg-red-50 transition-all active:scale-95 flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Download Brochure
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Side Image */}
              <div className="lg:col-span-7">
                <div className="relative aspect-[16/9] rounded-[5px] overflow-hidden" style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}>
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
          </div>
        </div>
      </section>

      {/* --- Stats Bar ---------------------------------------------------------- */}
      <section className="pb-16 px-6 sm:px-12 lg:px-24">
        <div className="max-w-[1920px] mx-auto">
          <div className="bg-white rounded-[5px] border border-slate-100 p-8 grid grid-cols-2 lg:grid-cols-4 gap-8 divide-x divide-slate-100" style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}>
            <StatItem label="Duration" value={duration} />
            <StatItem label="Fees" value={avgFees ? formatFees(avgFees) : "—"} suffix={avgFees ? "/year" : undefined} />
            <StatItem label="Placement Rate" value="94%" />
            <StatItem label="Median Salary" value="8.5 LPA" />
          </div>
        </div>
      </section>

      {/* --- Course Overview ---------------------------------------------------- */}
      {description && (
        <section className="pb-24 px-6 sm:px-12 lg:px-24">
          <div className="max-w-[1920px] mx-auto">
            <div className="bg-white rounded-[5px] p-8 lg:p-12 border border-slate-100 overflow-hidden" style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                {/* Image */}
                <div className="lg:col-span-5 relative">
                  <div className="aspect-[4/4.5] rounded-[5px] overflow-hidden relative">
                    <Image
                      src={STUDENT_IMAGE}
                      alt="Student Overview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  </div>
                  <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#FF3C3C] opacity-10 blur-3xl animate-pulse" />
                </div>

                {/* Text Content */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                  <h2 className="text-[32px] font-bold text-slate-900 leading-tight">
                    Course Overview
                  </h2>
                  <div className="space-y-4">
                    <p className="text-[20px] font-medium leading-relaxed" style={{ color: "rgba(62, 62, 62, 0.71)" }}>
                      {description.length > 400 ? description.substring(0, 400) + "..." : description}
                    </p>
                    {description.length > 400 && (
                      <button className="text-[#1CB098] font-bold text-lg flex items-center gap-2 hover:gap-3 transition-all">
                        Read more <ArrowRight className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --- Related Courses / Specializations ---------------------------------- */}
      {relatedCourses.length > 0 && (
        <section className="pb-32 px-6 sm:px-12 lg:px-24">
          <div className="max-w-[1920px] mx-auto">
            <h2 className="text-[32px] font-bold text-slate-900 mb-12">
              Specializations in course
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedCourses.map((c) => (
                <div key={String(c._id)} className="group cursor-pointer h-full">
                  <div className="bg-white rounded-[5px] p-6 border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden h-full flex flex-col" style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}>
                    <div className="relative aspect-[16/10] rounded-[5px] overflow-hidden mb-6">
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
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}

function StatItem({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-4">
      <div className="flex items-baseline gap-1">
        <span className="text-[32px] font-medium text-[#3e3e3e] leading-tight">
          {value}
        </span>
        {suffix && <span className="text-slate-400 font-semibold">{suffix}</span>}
      </div>
      <span className="text-[20px] font-medium uppercase tracking-wide" style={{ color: "rgba(62, 62, 62, 0.71)" }}>
        {label}
      </span>
    </div>
  );
}
