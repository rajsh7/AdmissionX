"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface Props {
  slug: string;
  collegeName: string;
  renderTrigger?: (onClick: (e: React.MouseEvent) => void) => React.ReactNode;
  autoOpen?: boolean;
}

export default function AskQueryModal({ slug, collegeName, renderTrigger, autoOpen }: Props) {
  const [open, setOpen] = useState(!!autoOpen);
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { setMounted(true); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/college/${slug}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit");
      setSuccess(true);
      setName(""); setEmail(""); setPhone(""); setSubject(""); setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setSuccess(false);
    setError("");
  }

  const INPUT = "w-full px-4 py-3 bg-white border border-slate-200 rounded-[5px] text-[15px] font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#FF3C3C] focus:ring-2 focus:ring-[#FF3C3C]/10 transition-all";

  return (
    <>
      {/* Trigger Button */}
      {renderTrigger ? (
        renderTrigger((e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        })
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="w-full sm:w-auto px-6 py-3 bg-[#FF3C3C66] hover:bg-[#FF3C3C]/80 backdrop-blur-sm text-white font-bold text-[15px] sm:text-[18px] rounded-[5px] transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          Ask Query
        </button>
      )}

      {/* Modal via Portal — renders directly into document.body */}
      {open && mounted && createPortal(
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          {/* Overlay */}
          <div
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
            onClick={handleClose}
          />

          {/* Modal */}
          <div
            style={{ position: 'relative', zIndex: 100000, width: '100%', maxWidth: '32rem', maxHeight: '90vh', overflowY: 'auto', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}
          >

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h2 className="text-[20px] font-black text-slate-800">Ask a Query</h2>
                <p className="text-[13px] text-slate-400 font-medium mt-0.5">{collegeName}</p>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-6">
              {success ? (
                /* Success state */
                <div className="flex flex-col items-center text-center py-8 gap-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-[18px] font-black text-slate-800">Query Submitted!</h3>
                    <p className="text-[14px] text-slate-500 mt-1 max-w-xs">
                      Your query has been sent to {collegeName}. They will respond to your email shortly.
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="mt-2 px-8 py-3 bg-[#FF3C3C] text-white font-bold rounded-[5px] hover:bg-red-700 transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-[5px] text-red-600 text-[13px] font-semibold">
                      <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                        Full Name <span className="text-[#FF3C3C]">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Your full name"
                        required
                        className={INPUT}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className={INPUT}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                      Email Address <span className="text-[#FF3C3C]">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className={INPUT}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                      Subject <span className="text-[#FF3C3C]">*</span>
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      placeholder="e.g. Admission process for B.Tech CSE"
                      required
                      maxLength={200}
                      className={INPUT}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                      Message <span className="text-[#FF3C3C]">*</span>
                    </label>
                    <textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Write your question or query here..."
                      required
                      rows={4}
                      maxLength={1000}
                      className={INPUT + " resize-none"}
                    />
                    <p className="text-[11px] text-slate-400 text-right mt-1">{message.length}/1000</p>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 bg-[#FF3C3C] hover:bg-red-700 text-white font-black text-[15px] rounded-[5px] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Submit Query
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-slate-400 text-center">
                    Your query will be sent directly to {collegeName} and they will respond to your email.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
