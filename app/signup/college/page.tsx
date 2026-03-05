"use client";

import Header from "../../components/Header";
import { AuthBackgroundSlider } from "../../components/AuthBackgroundSlider";
import { useRouter } from "next/navigation";

export default function CollegeSignupPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col font-display relative">
      <AuthBackgroundSlider />
      <Header onLoginClick={() => {}} onRegisterClick={() => {}} />

      {/* Main Content */}
      <main className="relative flex-1 flex flex-col items-center justify-center px-4 pt-32 pb-12 overflow-hidden">
        {/* Decorations */}
        <div className="absolute top-20 left-10 opacity-10 pointer-events-none">
          <span className="material-symbols-outlined text-9xl">apartment</span>
        </div>
        <div className="absolute bottom-10 right-10 opacity-10 pointer-events-none">
          <span className="material-symbols-outlined text-[12rem]">
            workspace_premium
          </span>
        </div>

        {/* Signup Card */}
        <div className="w-full max-w-[520px] bg-white dark:bg-slate-900 rounded-xl shadow-xl shadow-primary/5 p-8 border border-slate-100 dark:border-slate-800 z-10">
          <div className="text-center mb-8">
            <h1 className="text-slate-900 dark:text-slate-100 text-3xl font-bold mb-2">
              College Signup
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Register your institution to receive verified leads and manage
              applications on AdmissionX.
            </p>
          </div>

          <form
            className="space-y-5"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget as HTMLFormElement;
              const formData = new FormData(form);
              const body = {
                collegeName: String(formData.get("collegeName") || ""),
                email: String(formData.get("email") || ""),
                contactName: String(formData.get("contactName") || ""),
                phone: String(formData.get("phone") || ""),
                captchaOk: formData.get("captcha") === "on",
              };
              const res = await fetch("/api/signup/college", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
              });
              if (res.ok) {
                router.push("/signup/college/success");
              } else {
                const data = await res.json();
                alert(data.error || "Signup failed");
              }
            }}
          >
            {/* College Name */}
            <div className="flex flex-col gap-2">
              <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">
                College / University Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                  corporate_fare
                </span>
                <input
                  name="collegeName"
                  type="text"
                  placeholder="Enter Your College/University Name"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Official Email */}
            <div className="flex flex-col gap-2">
              <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">
                Official Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                  mail
                </span>
                <input
                  name="email"
                  type="email"
                  placeholder="Enter Your Email Address"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Contact Person */}
            <div className="flex flex-col gap-2">
              <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">
                Contact Person Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                  person
                </span>
                <input
                  name="contactName"
                  type="text"
                  placeholder="Admissions Head / Counsellor"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-2">
              <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">
                Phone Number
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                  call
                </span>
                <input
                  name="phone"
                  type="tel"
                  placeholder="Enter Your Phone Number"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Simple Captcha */}
            <div className="flex items-center gap-2">
              <input
                id="college-captcha"
                name="captcha"
                type="checkbox"
                className="h-4 w-4 rounded border-primary/30 text-primary focus:ring-primary"
              />
              <label
                htmlFor="college-captcha"
                className="text-xs text-slate-600 dark:text-slate-400"
              >
                I&apos;m not a robot
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all transform active:scale-[0.98] mt-2"
            >
              Submit College Request
            </button>
          </form>

          <p className="mt-8 text-center text-slate-600 dark:text-slate-400 text-sm">
            Already onboarded?
            <br />
            <a
              href="/login/college"
              className="text-primary font-bold hover:underline"
            >
              College Login
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
