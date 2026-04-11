"use client";
import { useState } from "react";

export default function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setStatus(data.success ? "success" : "error");
      if (data.success) setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="w-full py-24 lg:py-32 overflow-hidden" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="mx-auto max-w-[1920px] px-6 sm:px-12 lg:px-24">
        <div className="bg-white p-2 sm:p-4 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

            {/* ── Left: Contact Info ────────────────────────────── */}
            <div className="flex flex-col justify-center">
              <h2 className="tracking-tight leading-[1.1] mb-4" style={{ fontSize: '50px', fontWeight: '700', color: '#3E3E3E' }}>
                Get in Touch
              </h2>
              <p className="tracking-relaxed mb-12 max-w-xl" style={{ fontSize: '20px', fontWeight: '500', color: '#3E3E3E' }}>
                Get the real story about campus life, professors, and placements from people who've actually been there.
              </p>
              <div className="space-y-8">
                {/* Email */}
                <div className="flex items-start gap-4 group">
                  <div className="w-[35px] h-[35px] rounded-[6px] bg-[#FF3C3C40] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-primary/5">
                    <span className="material-symbols-rounded text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-0.5" style={{ fontSize: '20px', fontWeight: '700', color: '#222222' }}>Email Us</h4>
                    <p className="font-medium leading-tight mb-0.5" style={{ fontSize: '16px', color: '#6C6C6C' }}>support@admissionx.com</p>
                    <p className="font-normal" style={{ fontSize: '16px', color: '#6C6C6C' }}>General inquiries & support</p>
                  </div>
                </div>

                {/* Call */}
                <div className="flex items-start gap-4 group">
                  <div className="w-[35px] h-[35px] rounded-[6px] bg-[#FF3C3C40] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-primary/5">
                    <span className="material-symbols-rounded text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>call</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-0.5" style={{ fontSize: '20px', fontWeight: '700', color: '#222222' }}>Call Us</h4>
                    <p className="font-medium leading-tight mb-0.5" style={{ fontSize: '16px', color: '#6C6C6C' }}>+91 767-888-9792</p>
                    <p className="font-normal" style={{ fontSize: '16px', color: '#6C6C6C' }}>Mon to Fri (9:00 am to 5:00 pm IST)</p>
                  </div>
                </div>

                {/* Visit */}
                <div className="flex items-start gap-4 group">
                  <div className="w-[35px] h-[35px] rounded-[6px] bg-[#FF3C3C40] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-primary/5">
                    <span className="material-symbols-rounded text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-0.5" style={{ fontSize: '20px', fontWeight: '700', color: '#222222' }}>Visit Us</h4>
                    <p className="font-medium leading-tight mb-0.5" style={{ fontSize: '16px', color: '#6C6C6C' }}>Lajpat Nagar, Delhi.</p>
                    <p className="font-normal" style={{ fontSize: '16px', color: '#6C6C6C' }}>Mon to Fri (9:00 am to 5:00 pm IST)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right: Contact Form ─────────────────────────────── */}
            <div className="bg-white rounded-[5px] p-10 lg:p-12 border border-slate-200/60 relative" style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
              <h3 className="font-bold mb-10 tracking-tight" style={{ fontSize: '30px', fontWeight: '700', color: '#6C6C6C' }}>Send a message</h3>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-2 px-1" style={{ fontSize: '18px', fontWeight: '700', color: '#6C6C6C' }}>Name</label>
                    <input
                      type="text"
                      placeholder="Your name"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full h-14 px-6 rounded-[5px] border border-slate-200 bg-[#F9FAFB] text-base text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 px-1" style={{ fontSize: '18px', fontWeight: '700', color: '#6C6C6C' }}>Email</label>
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full h-14 px-6 rounded-[5px] border border-slate-200 bg-[#F9FAFB] text-base text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium shadow-sm"
                    />
                  </div>
                </div>
 
                <div>
                  <label className="block mb-2 px-1" style={{ fontSize: '18px', fontWeight: '700', color: '#6C6C6C' }}>Subject</label>
                  <input
                    type="text"
                    placeholder="How can we help you?"
                    value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    className="w-full h-14 px-6 rounded-[5px] border border-slate-200 bg-[#F9FAFB] text-base text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium shadow-sm"
                  />
                </div>
 
                <div>
                  <label className="block mb-2 px-1" style={{ fontSize: '18px', fontWeight: '700', color: '#6C6C6C' }}>Message</label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about your inquiry..."
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full px-6 py-5 rounded-[5px] border border-slate-200 bg-[#F9FAFB] text-base text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none font-medium shadow-sm"
                  />
                </div>
 
                <div className="flex justify-center pt-4">
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="h-14 rounded-[5px] bg-primary text-white tracking-wider hover:brightness-105 transition-all shadow-xl shadow-primary/20 disabled:opacity-60"
                    style={{ width: '317.86px', fontSize: '24px', fontWeight: '700' }}
                  >
                    {status === "loading" ? "Sending..." : "Send Message"}
                  </button>
                </div>

                {status === "success" && (
                  <p className="text-center text-emerald-600 font-semibold text-sm">✓ Message sent successfully!</p>
                )}
                {status === "error" && (
                  <p className="text-center text-red-500 font-semibold text-sm">Something went wrong. Please try again.</p>
                )}
              </form>
 

            </div>

          </div>
        </div>
      </div>
    </section>
  );
}




