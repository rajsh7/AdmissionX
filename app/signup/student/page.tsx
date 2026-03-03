 "use client";

import Header from "../../components/Header";
import { AuthBackgroundSlider } from "../../components/AuthBackgroundSlider";

export default function StudentSignupPage() {
  return (
    <div className="min-h-screen flex flex-col font-display relative">
      <AuthBackgroundSlider />
      <Header onLoginClick={() => {}} onRegisterClick={() => {}} />

      {/* Main Content */}
      <main className="relative flex-1 flex flex-col items-center justify-center px-4 pt-32 pb-12 overflow-hidden">
        {/* Decorations */}
        <div className="absolute top-20 left-10 opacity-10 pointer-events-none">
          <span className="material-symbols-outlined text-9xl">school</span>
        </div>
        <div className="absolute bottom-10 right-10 opacity-10 pointer-events-none">
          <span className="material-symbols-outlined text-[12rem]">history_edu</span>
        </div>

        {/* Signup Card */}
        <div className="w-full max-w-[480px] bg-white dark:bg-slate-900 rounded-xl shadow-xl shadow-primary/5 p-8 border border-slate-100 dark:border-slate-800 z-10">
          <div className="text-center mb-8">
            <h1 className="text-slate-900 dark:text-slate-100 text-3xl font-bold mb-2">
              Student Signup
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Create your student profile to apply and track admissions.
            </p>
          </div>

          <form
            className="space-y-5"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget as HTMLFormElement;
              const formData = new FormData(form);
              const body = {
                name: String(formData.get("name") || ""),
                email: String(formData.get("email") || ""),
                phone: String(formData.get("phone") || ""),
                password: String(formData.get("password") || ""),
                captchaOk: formData.get("captcha") === "on",
              };
              const res = await fetch("/api/signup/student", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
              });
              if (res.ok) {
                alert("Student signup saved to database.");
                form.reset();
              } else {
                const data = await res.json();
                alert(data.error || "Signup failed");
              }
            }}
          >
            {/* Name */}
            <div className="flex flex-col gap-2">
              <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">
                Full Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                  person_outline
                </span>
                <input
                  name="name"
                  type="text"
                  placeholder="Enter Your Full Name"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">
                Email Address
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

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                  lock
                </span>
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div className="flex flex-col gap-2">
              <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">
                Mobile Number
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
                id="student-captcha"
                name="captcha"
                type="checkbox"
                className="h-4 w-4 rounded border-primary/30 text-primary focus:ring-primary"
              />
              <label
                htmlFor="student-captcha"
                className="text-xs text-slate-600 dark:text-slate-400"
              >
                I&apos;m not a robot
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all transform active:scale-[0.98] mt-2"
            >
              Create Student Account
            </button>
          </form>

          <p className="mt-8 text-center text-slate-600 dark:text-slate-400 text-sm">
            Already registered?<br />
            <a href="/login/student" className="text-primary font-bold hover:underline">
              Student Login
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}

