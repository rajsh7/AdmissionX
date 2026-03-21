// v2 – cache bust
"use client";

export default function ContactSection() {
  return (
    <section className="w-full py-16 lg:py-24 bg-[#fdfdfd] overflow-hidden">
      <div className="mx-auto max-w-[1920px] px-6 sm:px-12 lg:px-24">
        <div className="bg-white rounded-[32px] p-8 lg:p-12 shadow-[0_4px_40px_-12px_rgba(0,0,0,0.08)] border border-slate-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">

            {/* ── Left: Contact Form ─────────────────────────────── */}
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-6">Send a message</h3>
              <form className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Email</label>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#008080]/20 focus:border-[#008080] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Your Message</label>
                  <textarea
                    rows={5}
                    placeholder="Tell us about your inquiry..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#008080]/20 focus:border-[#008080] transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#008080] text-white text-sm font-bold hover:bg-[#006666] transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* ── Right: Contact Info ────────────────────────────── */}
            <div className="flex flex-col justify-center">
              <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-3">
                Get in Touch
              </h2>
              <p className="text-slate-500 font-medium leading-relaxed mb-10 max-w-md">
                Get the real story about campus life, professors, and placements from people who&apos;ve actually been there.
              </p>

              <div className="space-y-6">
                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#008080] flex items-center justify-center shrink-0">
                    <span className="material-symbols-rounded text-[20px] text-white">mail</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Email Us</h4>
                    <a href="mailto:supportseg1@sgin.com" className="text-sm text-slate-500 hover:text-[#008080] transition-colors">
                      supportseg1@sgin.com
                    </a>
                    <p className="text-xs text-slate-400 mt-0.5">General Inquiries &amp; support</p>
                  </div>
                </div>

                {/* Call */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#008080] flex items-center justify-center shrink-0">
                    <span className="material-symbols-rounded text-[20px] text-white">call</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Call Us</h4>
                    <p className="text-sm text-slate-500">+91 767-888-9792</p>
                    <p className="text-xs text-slate-400 mt-0.5">Mon to Fri ( 9:00 am to 5:00 pm  IST )</p>
                  </div>
                </div>

                {/* Visit */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#008080] flex items-center justify-center shrink-0">
                    <span className="material-symbols-rounded text-[20px] text-white">location_on</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Visit Us</h4>
                    <p className="text-sm text-slate-500">Lajpat Nagar, Delhi.</p>
                    <p className="text-xs text-slate-400 mt-0.5">Mon to Fri ( 9:00 am to 5:00 pm  IST )</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
