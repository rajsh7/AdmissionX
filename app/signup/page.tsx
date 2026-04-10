import Image from "next/image";
import Header from "../components/Header";
import { AuthBackgroundSlider } from "../components/AuthBackgroundSlider";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col font-display relative">
      <AuthBackgroundSlider />
      <Header />

      {/* Main Content */}
      <main className="relative flex-1 flex flex-col items-center justify-center px-4 pt-32 pb-12 overflow-hidden">
        {/* Abstract Decorations */}
        <div className="absolute top-20 left-10 opacity-10 pointer-events-none">
          <span className="material-symbols-outlined text-9xl">menu_book</span>
        </div>
        <div className="absolute bottom-10 right-10 opacity-10 pointer-events-none">
          <span className="material-symbols-outlined text-[12rem]">history_edu</span>
        </div>

        {/* Signup Card */}
        <div className="w-full max-w-[480px] bg-white dark:bg-slate-900 rounded-xl shadow-xl shadow-primary/5 p-8 border border-slate-100 dark:border-slate-800 z-10">
          <div className="text-center mb-8">
            <h1 className="text-slate-900 dark:text-slate-100 text-3xl font-bold mb-2">
              Create your Account
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Join thousands of students and reps today.
            </p>
          </div>

          {/* Role Selection */}
          <div className="flex gap-3 mb-8 bg-background-light dark:bg-slate-800 p-1.5 rounded-xl">
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 text-primary font-semibold text-sm">
              <span className="material-symbols-outlined text-lg">person</span>
              Student
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-slate-500 dark:text-slate-400 font-medium text-sm hover:bg-slate-200/50 transition-colors">
              <span className="material-symbols-outlined text-lg">
                corporate_fare
              </span>
              Representative
            </button>
          </div>

          <form className="space-y-5">
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
                  type="text"
                  placeholder="John Doe"
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
                  type="email"
                  placeholder="name@university.com"
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
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-2">
              <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">
                Confirm Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                  shield_lock
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all transform active:scale-[0.98] mt-2"
            >
              Create Account
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-4 text-slate-500 font-medium">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyQiMZtuFFQwIDjUsQfRo4KB5XpFm9G1IKo_Vz6OL6nOUrNlNdPjNbL3iaR6wOroBYMqmtbARjPAg9NsQOm7iR4QPbrTHlsF4ujVKz-oiRnoRjpOgzR5mzcJhz5RGmJxIu0IgQAXb6UwXd5NRCckGhCTi6TS8JrAjuuwAqnNpj984px2UgCxoSwpCjN3fk8E8rosg6vzoq4zoYs3-49MHorEsnlbNL6Bh4OYiG1j5WEifhdvjVTMP59vANCykiSnw-8Lbchd5bXqU"
                alt="Google Logo"
                width={20}
                height={20}
                className="size-5"
              />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Google
              </span>
            </button>
            <button className="flex items-center justify-center gap-2 py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaVuxU1BhG2vwHEVnoIGKtrUwhU2EdvqI2ZxILM264kVq1sShoIqUiJkcygcMrFIQYZm7EL4iBMCSLNIDZTIoVJRsuQiQflTYBxXkOjS9LdcbhtU7J8ZHn667IQLL--OXbkrX5CHU3Y1SCMDddjAjtdY5ijN1lBmPbTljHpXrjoiGKnts6FzIOcKOs1HWO260qCQ0jODVqmONPogwlY3DcZxfsgXWS4_Qk27J5QsbzvA5-YeB1WnlHlrk42mJLX2U9XOd42XosNl8"
                alt="LinkedIn Logo"
                width={20}
                height={20}
                className="size-5"
              />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                LinkedIn
              </span>
            </button>
          </div>

          {/* Sign In Link */}
          <p className="mt-8 text-center text-slate-600 dark:text-slate-400 text-sm">
            Already have an account?
            <a href="/login" className="text-primary font-bold hover:underline">
              Sign In
            </a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 px-6 text-center text-slate-400 text-xs max-w-7xl mx-auto">
        <p>
          © 2024 AdmissionX Inc. All rights reserved.
          <a href="#" className="hover:text-primary mx-2">
            Privacy Policy
          </a>
          •
          <a href="#" className="hover:text-primary mx-2">
            Terms of Service
          </a>
        </p>
      </footer>
    </div>
  );
}





