export default function ContactSection() {
  return (
    <section className="w-full py-24 lg:py-32 bg-white overflow-hidden">
      <div className="mx-auto max-w-[1920px] px-6 sm:px-12 lg:px-24">
        <div className="bg-white rounded-[10px] p-12 lg:p-24 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.08)] border border-slate-50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

            {/* ── Left: Contact Info ────────────────────────────── */}
            <div className="flex flex-col justify-center">
              <h2 className="text-[40px] lg:text-[56px] font-normal text-slate-900 tracking-tight leading-[1.1] mb-8">
                Get in <span className="text-primary">Touch</span>
              </h2>
              <p className="text-[22px] text-slate-500 font-normal leading-relaxed mb-12 max-w-xl">
                Get the real story about campus life, professors, and placements from people who've actually been there.
              </p>

              <div className="space-y-10">
                {/* Email */}
                <div className="flex items-start gap-8 group">
                  <div className="w-16 h-16 rounded-[10px] bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                    <span className="material-symbols-rounded text-[28px] text-white">mail</span>
                  </div>
                  <div>
                    <h4 className="font-normal text-slate-900 text-[18px] mb-1">Email Us</h4>
                    <a href="mailto:support@admissionx.com" className="text-base text-slate-500 hover:text-primary transition-colors font-normal">
                      support@admissionx.com
                    </a>
                  </div>
                </div>

                {/* Call */}
                <div className="flex items-start gap-8 group">
                  <div className="w-16 h-16 rounded-[10px] bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                    <span className="material-symbols-rounded text-[28px] text-white">call</span>
                  </div>
                  <div>
                    <h4 className="font-normal text-slate-900 text-[18px] mb-1">Call Us</h4>
                    <p className="text-base text-slate-500 font-normal">+91 767-888-9792</p>
                    <p className="text-sm text-slate-400 mt-1 font-normal">Mon-Fri (9:00 AM - 6:00 PM IST)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right: Contact Form ─────────────────────────────── */}
            <div className="bg-[#f8fafc] rounded-[10px] p-10 lg:p-14 border border-slate-50">
              <h3 className="text-2xl font-normal text-slate-900 mb-10 uppercase tracking-tight">Send a message</h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-normal text-slate-400 uppercase tracking-widest mb-2">Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full h-16 px-6 rounded-[10px] border border-slate-100 bg-white text-base text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-primary/30 transition-all font-normal"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-normal text-slate-400 uppercase tracking-widest mb-2">Email</label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      className="w-full h-16 px-6 rounded-[10px] border border-slate-100 bg-white text-base text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-primary/30 transition-all font-normal"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-normal text-slate-400 uppercase tracking-widest mb-2">Subject</label>
                  <input
                    type="text"
                    placeholder="General Inquiry"
                    className="w-full h-16 px-6 rounded-[10px] border border-slate-100 bg-white text-base text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-primary/30 transition-all font-normal"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-normal text-slate-400 uppercase tracking-widest mb-2">Message</label>
                  <textarea
                    rows={4}
                    placeholder="How can we help you?"
                    className="w-full px-6 py-5 rounded-[10px] border border-slate-100 bg-white text-base text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-primary/30 transition-all resize-none font-normal"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-16 rounded-[10px] bg-primary text-white text-[15px] font-normal uppercase tracking-widest hover:brightness-105 transition-all shadow-xl shadow-primary/20"
                >
                  Send Message
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}




