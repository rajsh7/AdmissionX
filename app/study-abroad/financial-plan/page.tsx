import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import pool from "@/lib/db";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ExploreCards from "@/app/components/ExploreCards";

export const metadata: Metadata = {
  title: "Study Abroad Financial Plan | AdmissionX",
  description:
    "Request a detailed study abroad financial plan with destination-wise cost estimates, scholarships, and funding guidance.",
};

function formatInr(value: string): string {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return "TBD";
  return `INR ${parsed.toLocaleString("en-IN")}`;
}

async function submitFinancialPlan(formData: FormData): Promise<void> {
  "use server";

  const fullname = (formData.get("fullname") as string ?? "").trim();
  const emailaddress = (formData.get("emailaddress") as string ?? "").trim();
  const mobilenumber = (formData.get("mobilenumber") as string ?? "").trim();
  const destination = (formData.get("destination") as string ?? "").trim();
  const degree = (formData.get("degree") as string ?? "").trim();
  const duration = (formData.get("duration") as string ?? "").trim();
  const budget = (formData.get("budget") as string ?? "").trim();
  const funding = (formData.get("funding") as string ?? "").trim();
  const intake = (formData.get("intake") as string ?? "").trim();
  const total = (formData.get("total") as string ?? "").trim();
  const message = (formData.get("message") as string ?? "").trim();

  if (!fullname || !emailaddress || !destination || !degree || !message) {
    redirect(
      `/study-abroad/financial-plan?error=missing&destination=${encodeURIComponent(destination)}&degree=${encodeURIComponent(degree)}&duration=${encodeURIComponent(duration)}&total=${encodeURIComponent(total)}`
    );
  }

  const subject = "Study Abroad Financial Plan";
  const detailedMessage = [
    `Student message: ${message}`,
    `Destination: ${destination}`,
    `Degree level: ${degree}`,
    `Course duration: ${duration || "Not shared"} year(s)`,
    `Estimated total: ${formatInr(total)}`,
    `Budget comfort: ${budget || "Not shared"}`,
    `Funding preference: ${funding || "Not shared"}`,
    `Preferred intake: ${intake || "Not shared"}`,
  ].join("\n");

  try {
    await pool.query(
      `INSERT INTO landing_page_query_forms
         (fullname, emailaddress, mobilenumber, subject, message, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [fullname, emailaddress, mobilenumber, subject, detailedMessage],
    );
  } catch (error) {
    console.error("[study-abroad financial plan submit]", error);
    redirect(
      `/study-abroad/financial-plan?error=server&destination=${encodeURIComponent(destination)}&degree=${encodeURIComponent(degree)}&duration=${encodeURIComponent(duration)}&total=${encodeURIComponent(total)}`
    );
  }

  redirect("/study-abroad/financial-plan?sent=1");
}

export default async function StudyAbroadFinancialPlanPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const getString = (key: string, fallback = "") =>
    typeof sp[key] === "string" ? (sp[key] as string) : fallback;

  const destination = getString("destination", "Australia");
  const degree = getString("degree", "Bachelors");
  const duration = getString("duration", "2");
  const total = getString("total");
  const tuition = getString("tuition");
  const living = getString("living");
  const scholarship = getString("scholarship");
  const salary = getString("salary");
  const sent = getString("sent") === "1";
  const error = getString("error");

  const summaryItems = [
    { label: "Destination", value: destination },
    { label: "Degree", value: degree },
    { label: "Duration", value: `${duration || "2"} year(s)` },
    { label: "Net estimate", value: formatInr(total) },
    { label: "Tuition", value: formatInr(tuition) },
    { label: "Living", value: formatInr(living) },
    { label: "Scholarship", value: scholarship ? `- ${formatInr(scholarship)}` : "TBD" },
    { label: "Avg. salary", value: salary ? `${formatInr(salary)} / yr` : "TBD" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />

      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-slate-500">
            <Link href="/" className="transition-colors hover:text-slate-800">
              Home
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <Link href="/study-abroad" className="transition-colors hover:text-slate-800">
              Study Abroad
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-slate-700">Financial Plan</span>
          </nav>

          <section className="overflow-hidden rounded-[5px] border border-slate-200 bg-[linear-gradient(135deg,#082f49_0%,#0f766e_55%,#ecfeff_160%)]">
            <div className="grid gap-10 px-6 py-10 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-10">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-white/85 backdrop-blur-md">
                  <span className="material-symbols-outlined text-[15px]">calculate</span>
                  Financial Planning
                </span>
                <h1 className="mt-5 text-3xl font-black leading-tight text-white sm:text-5xl">
                  Get your detailed study abroad financial plan
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-7 text-cyan-50/85 sm:text-base">
                  Share your destination, budget comfort, and intake preference. Our team will prepare a clearer funding roadmap with fee planning, scholarship guidance, and next-step advice.
                </p>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {[
                    "Destination-wise tuition planning",
                    "Scholarship and funding suggestions",
                    "Living cost and total budget estimate",
                    "One-on-one AdmissionX follow-up",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-[5px] border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white/90 backdrop-blur-sm"
                    >
                      <span className="material-symbols-outlined text-[18px] text-cyan-100">check_circle</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <aside className="rounded-[5px] border border-white/15 bg-white/10 p-5 backdrop-blur-md">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-100/90">
                  Your Calculator Snapshot
                </p>
                <div className="mt-5 space-y-3">
                  {summaryItems.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-4 rounded-[5px] border border-white/10 bg-slate-950/15 px-4 py-3"
                    >
                      <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-100/70">
                        {item.label}
                      </span>
                      <span className="text-right text-sm font-bold text-white">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </section>

          <section className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[5px] border border-slate-200 bg-white shadow-[0_20px_60px_-24px_rgba(15,23,42,0.18)]">
              <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
                <h2 className="text-xl font-black text-slate-900">Tell us about your plan</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Fill this once and we&apos;ll prepare a more personalized estimate.
                </p>
              </div>

              <div className="px-6 py-6 sm:px-8">
                {sent && (
                  <div className="mb-6 rounded-[5px] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                    <p className="font-bold">Your request has been sent.</p>
                    <p className="mt-1 text-emerald-700">
                      Our study abroad team will review it and get back to you soon.
                    </p>
                  </div>
                )}

                {error && (
                  <div className="mb-6 rounded-[5px] border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800">
                    {error === "missing"
                      ? "Please complete the required fields before submitting."
                      : "Something went wrong while sending your request. Please try again."}
                  </div>
                )}

                {!sent && (
                  <form action={submitFinancialPlan} className="space-y-5">
                    <input type="hidden" name="destination" value={destination} />
                    <input type="hidden" name="degree" value={degree} />
                    <input type="hidden" name="duration" value={duration} />
                    <input type="hidden" name="total" value={total} />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="fullname" className="mb-1.5 block text-xs font-bold text-slate-600">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="fullname"
                          name="fullname"
                          type="text"
                          required
                          placeholder="e.g. Aditi Sharma"
                          className="w-full rounded-[5px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="emailaddress" className="mb-1.5 block text-xs font-bold text-slate-600">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="emailaddress"
                          name="emailaddress"
                          type="email"
                          required
                          placeholder="you@example.com"
                          className="w-full rounded-[5px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="mobilenumber" className="mb-1.5 block text-xs font-bold text-slate-600">
                          Phone Number
                        </label>
                        <input
                          id="mobilenumber"
                          name="mobilenumber"
                          type="tel"
                          placeholder="+91 98765 43210"
                          className="w-full rounded-[5px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="intake" className="mb-1.5 block text-xs font-bold text-slate-600">
                          Preferred Intake
                        </label>
                        <select
                          id="intake"
                          name="intake"
                          defaultValue=""
                          className="w-full rounded-[5px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:bg-white"
                        >
                          <option value="">Select intake</option>
                          <option value="Fall 2026">Fall 2026</option>
                          <option value="Spring 2027">Spring 2027</option>
                          <option value="Fall 2027">Fall 2027</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="budget" className="mb-1.5 block text-xs font-bold text-slate-600">
                          Budget Comfort
                        </label>
                        <select
                          id="budget"
                          name="budget"
                          defaultValue=""
                          className="w-full rounded-[5px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:bg-white"
                        >
                          <option value="">Select your budget</option>
                          <option value="Under INR 15 Lakhs">Under INR 15 Lakhs</option>
                          <option value="INR 15-25 Lakhs">INR 15-25 Lakhs</option>
                          <option value="INR 25-40 Lakhs">INR 25-40 Lakhs</option>
                          <option value="Above INR 40 Lakhs">Above INR 40 Lakhs</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="funding" className="mb-1.5 block text-xs font-bold text-slate-600">
                          Funding Preference
                        </label>
                        <select
                          id="funding"
                          name="funding"
                          defaultValue=""
                          className="w-full rounded-[5px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:bg-white"
                        >
                          <option value="">Select funding plan</option>
                          <option value="Self-funded">Self-funded</option>
                          <option value="Scholarship-focused">Scholarship-focused</option>
                          <option value="Education loan">Education loan</option>
                          <option value="Need help deciding">Need help deciding</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="mb-1.5 block text-xs font-bold text-slate-600">
                        What kind of help do you need? <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        placeholder="Tell us your target course, destination goals, scholarship expectations, or any specific concerns."
                        className="w-full resize-none rounded-[5px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:bg-white"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-2">
                      <p className="text-xs text-slate-400">
                        <span className="text-red-500">*</span> Required fields
                      </p>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-[5px] bg-[#0f766e] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#115e59]"
                      >
                        Submit Plan Request
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </button>
                    </div>
                  </form>
                )}

                {sent && (
                  <div className="pt-2">
                    <Link
                      href="/study-abroad/financial-plan"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 transition hover:text-teal-800"
                    >
                      <span className="material-symbols-outlined text-[18px]">refresh</span>
                      Send another request
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[5px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.18)]">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
                  What You&apos;ll Receive
                </p>
                <div className="mt-5 space-y-4">
                  {[
                    {
                      title: "Fee breakdown",
                      body: "A clearer split of tuition, living cost, and scholarship assumptions for your target destination.",
                    },
                    {
                      title: "Funding direction",
                      body: "Practical guidance on self-funding, scholarships, and education-loan readiness.",
                    },
                    {
                      title: "Next steps",
                      body: "Recommended follow-up actions around admissions, timelines, and financial preparation.",
                    },
                  ].map((item) => (
                    <div key={item.title} className="rounded-[5px] bg-slate-50 px-4 py-4">
                      <h3 className="text-sm font-black text-slate-800">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-500">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[5px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.18)]">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
                  Need to revise estimates?
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  You can go back to the calculator, change the destination or duration, and request a fresh plan with updated numbers.
                </p>
                <Link
                  href="/study-abroad"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#0f766e] transition hover:text-[#115e59]"
                >
                  Back to Study Abroad Calculator
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          </section>

          <div className="mt-14">
            <ExploreCards />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
