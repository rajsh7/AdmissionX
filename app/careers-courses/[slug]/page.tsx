import { getDb } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Star, ChevronRight, Download, ArrowRight } from "lucide-react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

const DEFAULT_BANNER = "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2532&auto=format&fit=crop";
const STUDENT_IMAGE = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2670&auto=format&fit=crop";

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();
  
  const career = await db.collection("counseling_career_details").findOne({ slug, status: 1 });
  
  // If no career found, we still show the template for the UI task
  const title = career?.title || "B.Tech in Computer Science";
  const description = career?.description || "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.";

  return (
    <main className="min-h-screen bg-[#F8F9FB]">
      <Header />
      
      {/* --- Hero Section -------------------------------------------------------- */}
      <section className="pt-24 pb-12 px-6 sm:px-12 lg:px-24">
        <div className="max-w-[1920px] mx-auto">
          <div className="bg-white rounded-[24px] p-8 lg:p-12 shadow-sm border border-slate-100 overflow-hidden relative group">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Side Content */}
              <div className="lg:col-span-6 flex flex-col gap-6">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-slate-400 font-medium">
                  <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                  <ChevronRight className="w-4 h-4" />
                  <Link href="/courses" className="hover:text-primary transition-colors">Search</Link>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-slate-900 truncate max-w-[200px]">{title}</span>
                </nav>

                <h1 className="text-[40px] lg:text-[56px] font-bold text-slate-900 leading-[1.1] tracking-tight">
                  {title}
                </h1>

                {/* Metadata Badges */}
                <div className="flex flex-wrap gap-3">
                  {["Undergraduate", "4 Years", "Full-Time"].map((tag) => (
                    <span key={tag} className="px-4 py-2 rounded-lg bg-slate-50 text-slate-600 text-sm font-semibold border border-slate-100">
                      {tag}
                    </span>
                  ))}
                  <div className="flex items-center gap-1 px-4 py-2 rounded-lg bg-slate-50 border border-slate-100">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-4 mt-6">
                  <button className="px-10 py-4 bg-[#FF3C3C] text-white rounded-xl font-bold text-lg hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-red-200">
                    Apply Now
                  </button>
                  <button className="px-10 py-4 bg-white border-2 border-[#FF3C3C] text-[#FF3C3C] rounded-xl font-bold text-lg hover:bg-red-50 transition-all active:scale-95 flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Download Brochure
                  </button>
                </div>
              </div>

              {/* Right Side Image */}
              <div className="lg:col-span-6">
                <div className="relative aspect-[16/9] lg:aspect-[4/2.5] rounded-3xl overflow-hidden shadow-2xl skew-y-1 lg:skew-y-0 lg:rotate-2 group-hover:rotate-0 transition-transform duration-700">
                  <Image 
                    src={career?.image ? (career.image.startsWith('http') ? career.image : `https://admin.admissionx.in/uploads/${career.image}`) : DEFAULT_BANNER}
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
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 grid grid-cols-2 lg:grid-cols-4 gap-8 divide-x divide-slate-100">
            <StatItem label="Duration" value="4 Years" />
            <StatItem label="Fees" value="1,45,000" suffix="/year" />
            <StatItem label="Placement Rate" value="98%" />
            <StatItem label="Median Salary" value="8.5 LPA" />
          </div>
        </div>
      </section>

      {/* --- Course Overview ---------------------------------------------------- */}
      <section className="pb-24 px-6 sm:px-12 lg:px-24">
        <div className="max-w-[1920px] mx-auto">
          <div className="bg-white rounded-[32px] p-8 lg:p-12 shadow-xl shadow-black/5 border border-slate-100 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              {/* Image with overlay */}
              <div className="lg:col-span-5 relative">
                <div className="aspect-[4/4.5] rounded-2xl overflow-hidden relative">
                  <Image 
                    src={STUDENT_IMAGE}
                    alt="Student Overview"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                </div>
                {/* Visual Accent */}
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#FF3C3C] opacity-10 blur-3xl animate-pulse" />
              </div>

              {/* Text Content */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <h2 className="text-[32px] lg:text-[42px] font-bold text-slate-900 leading-tight">
                  Course Overview
                </h2>
                <div className="space-y-4">
                  <p className="text-xl text-slate-500 leading-relaxed font-medium">
                    {description.length > 400 ? description.substring(0, 400) + '...' : description}
                  </p>
                  <button className="text-[#3B82F6] font-bold text-lg flex items-center gap-2 hover:gap-3 transition-all">
                    Read more <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Specializations Grid ----------------------------------------------- */}
      <section className="pb-32 px-6 sm:px-12 lg:px-24">
        <div className="max-w-[1920px] mx-auto">
          <h2 className="text-[32px] lg:text-[42px] font-bold text-slate-900 mb-12">
            Specializations in course
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="group cursor-pointer">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-6">
                    <Image 
                      src={DEFAULT_BANNER}
                      alt="Artifcial Intelligence"
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                  </div>
                  <h3 className="text-xl lg:text-2xl font-bold text-slate-700 group-hover:text-[#FF3C3C] transition-colors text-center px-4">
                    Artificial Intelligence
                  </h3>
                </div>
              </div>
            ))}
          </div>
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
        <span className="text-[32px] lg:text-[44px] font-extrabold text-[#2D2D2D] leading-tight">
          {value}
        </span>
        {suffix && <span className="text-slate-400 font-semibold">{suffix}</span>}
      </div>
      <span className="text-slate-400 font-medium text-lg lg:text-xl uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}
