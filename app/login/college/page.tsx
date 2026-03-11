 "use client";

import { AuthBackgroundSlider } from "../../components/AuthBackgroundSlider";
import Header from "../../components/Header";

export default function CollegeLoginPage() {
  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 font-display relative overflow-hidden">
      <AuthBackgroundSlider />
      <Header onLoginClick={() => {}} onRegisterClick={() => {}} />

      <main className="relative flex-1 flex flex-col items-center justify-center px-4 pt-50 pb-12 md:pb-20 overflow-hidden">
        {/* Background icons */}
        <div className="absolute top-16 left-8 opacity-10 pointer-events-none select-none">
          <span className="material-symbols-outlined text-9xl">apartment</span>
        </div>
        <div className="absolute bottom-24 right-10 opacity-10 pointer-events-none select-none">
          <span className="material-symbols-outlined text-9xl">groups</span>
        </div>

        {/* College Login Card */}
        <div className="w-full max-w-[520px] min-h-[460px] md:min-h-[520px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none p-8 md:p-12 relative z-10 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              College Login
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Sign in to manage your college profile, applications, and enquiries.
            </p>
          </div>

          <form
            className="space-y-5"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget as HTMLFormElement;
              const formData = new FormData(form);
              const body = {
                email: String(formData.get("email") || ""),
                password: String(formData.get("password") || ""),
              };
              const res = await fetch("/api/login/college", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
              });
              const data = await res.json();
              if (res.ok) {
                alert("College login successful (DB verified).");
              } else {
                alert(data.error || "Login failed");
              }
            }}
          >
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Official Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  mail
                </span>
                <input
                  name="email"
                  type="email"
                  placeholder="admissions@college.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <a
                  href="#"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  lock
                </span>
                <input
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white placeholder:text-slate-400"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    visibility_off
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-college"
                type="checkbox"
                className="h-4 w-4 rounded border-primary/30 text-primary focus:ring-primary"
              />
              <label
                htmlFor="remember-college"
                className="ml-2 block text-sm text-slate-600 dark:text-slate-400"
              >
                Keep me logged in
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-200 dark:shadow-none transition-all transform active:scale-[0.98] mt-2"
            >
              Sign in as College
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500 dark:text-slate-400 text-sm">
            Not on AdmissionX yet?
            <a
              href="/signup/college"
              className="text-primary font-bold hover:underline ml-1"
            >
              Request college onboarding
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}

